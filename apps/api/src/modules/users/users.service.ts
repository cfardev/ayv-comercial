import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import bcrypt from "bcryptjs";
import { UserRole, UserStatus } from "../../../generated/prisma/client.js";
import { userRoleToResponse } from "../../common/constants/user-role-labels.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { CreateUserDto } from "./dto/create-user.dto.js";
import type { UpdateUserDto } from "./dto/update-user.dto.js";
import type { UserEntity } from "./entities/user.entity.js";
import type {
	PaginatedResult,
	UserFilters,
} from "./interfaces/user-filters.interface.js";

const BCRYPT_ROUNDS = 12;

type UserRow = {
	id: string;
	fullName: string;
	email: string;
	status: UserStatus;
	role: UserRole;
	failedAttempts: number;
	lockoutUntil: Date | null;
	createdAt: Date;
	updatedAt: Date;
};

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

	private toUserEntity(user: UserRow): UserEntity {
		return {
			...user,
			role: userRoleToResponse(user.role),
		};
	}

	async create(dto: CreateUserDto, actorId: string): Promise<UserEntity> {
		const existingEmail = await this.prisma.user.findUnique({
			where: { email: dto.email },
		});

		if (existingEmail) {
			throw new BadRequestException("El correo electrónico ya está en uso");
		}

		const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

		const user = await this.prisma.user.create({
			data: {
				fullName: dto.fullName,
				email: dto.email,
				password: hashedPassword,
				role: dto.role,
				status: "ACTIVE" as UserStatus,
			},
		});

		await this.prisma.userAuditLog.create({
			data: {
				userId: user.id,
				actorId,
				action: "CREATE",
				details: {
					email: user.email,
					role: dto.role,
				},
			},
		});

		return this.toUserEntity(user);
	}

	async findAll(filters: UserFilters): Promise<PaginatedResult<UserEntity>> {
		const { search, status, role, page, limit } = filters;

		const where: Record<string, unknown> = {};

		if (search) {
			where.OR = [
				{ fullName: { contains: search, mode: "insensitive" } },
				{ email: { contains: search, mode: "insensitive" } },
			];
		}

		if (status && status !== "ALL") {
			where.status = status;
		}

		if (role) {
			where.role = role;
		}

		const [data, total] = await Promise.all([
			this.prisma.user.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.user.count({ where }),
		]);

		return {
			data: data.map((u) => this.toUserEntity(u)),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async findOne(id: string): Promise<UserEntity> {
		const user = await this.prisma.user.findUnique({
			where: { id },
		});

		if (!user) {
			throw new NotFoundException("Usuario no encontrado");
		}

		return this.toUserEntity(user);
	}

	async update(
		id: string,
		dto: UpdateUserDto,
		actorId: string,
	): Promise<UserEntity> {
		const user = await this.prisma.user.findUnique({
			where: { id },
		});

		if (!user) {
			throw new NotFoundException("Usuario no encontrado");
		}

		if (dto.email && dto.email !== user.email) {
			const existingEmail = await this.prisma.user.findUnique({
				where: { email: dto.email },
			});
			if (existingEmail) {
				throw new BadRequestException("El correo electrónico ya está en uso");
			}
		}

		const updatedUser = await this.prisma.user.update({
			where: { id },
			data: {
				...(dto.fullName && { fullName: dto.fullName }),
				...(dto.email && { email: dto.email }),
				...(dto.role !== undefined && { role: dto.role }),
			},
		});

		await this.prisma.userAuditLog.create({
			data: {
				userId: id,
				actorId,
				action: "UPDATE",
				details: JSON.parse(JSON.stringify({ changes: dto })),
			},
		});

		return this.toUserEntity(updatedUser);
	}

	async deactivate(id: string, actorId: string): Promise<UserEntity> {
		if (id === actorId) {
			throw new ForbiddenException("No puedes desactivarte a ti mismo");
		}

		const user = await this.prisma.user.findUnique({
			where: { id },
		});

		if (!user) {
			throw new NotFoundException("Usuario no encontrado");
		}

		if (user.status === "INACTIVE") {
			throw new BadRequestException("El usuario ya está inactivo");
		}

		if (user.role === UserRole.ADMIN) {
			throw new ForbiddenException(
				"No se puede desactivar un usuario administrador",
			);
		}

		const deactivatedUser = await this.prisma.user.update({
			where: { id },
			data: { status: "INACTIVE" as UserStatus },
		});

		await this.prisma.userAuditLog.create({
			data: {
				userId: id,
				actorId,
				action: "DEACTIVATE",
				details: { previousStatus: user.status },
			},
		});

		return this.toUserEntity(deactivatedUser);
	}

	async reactivate(id: string, actorId: string): Promise<UserEntity> {
		const user = await this.prisma.user.findUnique({
			where: { id },
		});

		if (!user) {
			throw new NotFoundException("Usuario no encontrado");
		}

		if (user.status === "ACTIVE") {
			throw new BadRequestException("El usuario ya está activo");
		}

		const reactivatedUser = await this.prisma.user.update({
			where: { id },
			data: { status: "ACTIVE" as UserStatus },
		});

		await this.prisma.userAuditLog.create({
			data: {
				userId: id,
				actorId,
				action: "REACTIVATE",
				details: { previousStatus: user.status },
			},
		});

		return this.toUserEntity(reactivatedUser);
	}

	async canHardDelete(id: string): Promise<boolean> {
		const user = await this.prisma.user.findUnique({
			where: { id },
			include: {
				sales: true,
				inventoryMovements: true,
				performedActions: true,
			},
		});

		if (!user) return false;
		if (user.status !== "INACTIVE") return false;

		const hasSales = user.sales.length > 0;
		const hasInventoryMovements = user.inventoryMovements.length > 0;
		const hasPerformedActions = user.performedActions.length > 0;

		return !hasSales && !hasInventoryMovements && !hasPerformedActions;
	}

	async hardDelete(id: string, actorId: string): Promise<void> {
		const user = await this.prisma.user.findUnique({
			where: { id },
		});

		if (!user) {
			throw new NotFoundException("Usuario no encontrado");
		}

		if (user.role === UserRole.ADMIN) {
			throw new ForbiddenException(
				"No se puede eliminar permanentemente un usuario administrador",
			);
		}

		if (user.status !== "INACTIVE") {
			throw new BadRequestException(
				"Solo usuarios inactivos pueden ser eliminados permanentemente",
			);
		}

		const canDelete = await this.canHardDelete(id);
		if (!canDelete) {
			throw new BadRequestException(
				"El usuario tiene registros asociados y no puede ser eliminado",
			);
		}

		await this.prisma.userAuditLog.create({
			data: {
				userId: id,
				actorId,
				action: "HARD_DELETE",
				details: { email: user.email },
			},
		});

		await this.prisma.userAuditLog.deleteMany({ where: { userId: id } });

		await this.prisma.user.delete({ where: { id } });
	}
}
