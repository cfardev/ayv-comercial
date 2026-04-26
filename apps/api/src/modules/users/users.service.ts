import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import bcrypt from "bcryptjs";
import type { UserStatus } from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { CreateUserDto } from "./dto/create-user.dto.js";
import type { UpdateUserDto } from "./dto/update-user.dto.js";
import type { UserEntity } from "./entities/user.entity.js";
import type {
	PaginatedResult,
	UserFilters,
} from "./interfaces/user-filters.interface.js";

const BCRYPT_ROUNDS = 12;

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateUserDto, actorId: string): Promise<UserEntity> {
		const existingEmail = await this.prisma.user.findUnique({
			where: { email: dto.email },
		});

		if (existingEmail) {
			throw new BadRequestException("El correo electrónico ya está en uso");
		}

		const role = await this.prisma.role.findUnique({
			where: { id: dto.roleId },
		});
		if (!role) {
			throw new BadRequestException("El rol especificado no existe");
		}

		const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

		const user = await this.prisma.user.create({
			data: {
				fullName: dto.fullName,
				email: dto.email,
				password: hashedPassword,
				roleId: dto.roleId,
				status: "ACTIVE" as UserStatus,
			},
			include: { role: true },
		});

		await this.prisma.userAuditLog.create({
			data: {
				userId: user.id,
				actorId,
				action: "CREATE",
				details: {
					email: user.email,
					roleName: role.name,
				},
			},
		});

		return user as UserEntity;
	}

	async findAll(filters: UserFilters): Promise<PaginatedResult<UserEntity>> {
		const { search, status, roleId, page, limit } = filters;

		const where: Record<string, unknown> = {};

		if (search) {
			where.OR = [
				{ name: { contains: search, mode: "insensitive" } },
				{ email: { contains: search, mode: "insensitive" } },
			];
		}

		if (status && status !== "ALL") {
			where.status = status;
		}

		if (roleId) {
			where.roleId = roleId;
		}

		const [data, total] = await Promise.all([
			this.prisma.user.findMany({
				where,
				include: { role: true },
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.user.count({ where }),
		]);

		return {
			data: data as UserEntity[],
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async findOne(id: string): Promise<UserEntity> {
		const user = await this.prisma.user.findUnique({
			where: { id },
			include: { role: true },
		});

		if (!user) {
			throw new NotFoundException("Usuario no encontrado");
		}

		return user as UserEntity;
	}

	async update(
		id: string,
		dto: UpdateUserDto,
		actorId: string,
	): Promise<UserEntity> {
		const user = await this.prisma.user.findUnique({
			where: { id },
			include: { role: true },
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

		if (dto.roleId) {
			const role = await this.prisma.role.findUnique({
				where: { id: dto.roleId },
			});
			if (!role) {
				throw new BadRequestException("El rol especificado no existe");
			}
		}

		const updatedUser = await this.prisma.user.update({
			where: { id },
			data: {
				...(dto.fullName && { fullName: dto.fullName }),
				...(dto.email && { email: dto.email }),
				...(dto.roleId && { roleId: dto.roleId }),
			},
			include: { role: true },
		});

		await this.prisma.userAuditLog.create({
			data: {
				userId: id,
				actorId,
				action: "UPDATE",
				details: JSON.parse(JSON.stringify({ changes: dto })),
			},
		});

		return updatedUser as UserEntity;
	}

	async deactivate(id: string, actorId: string): Promise<UserEntity> {
		if (id === actorId) {
			throw new ForbiddenException("No puedes desactivarte a ti mismo");
		}

		const user = await this.prisma.user.findUnique({
			where: { id },
			include: { role: true },
		});

		if (!user) {
			throw new NotFoundException("Usuario no encontrado");
		}

		if (user.status === "INACTIVE") {
			throw new BadRequestException("El usuario ya está inactivo");
		}

		if (user.role.name === "ADMIN") {
			throw new ForbiddenException(
				"No se puede desactivar un usuario administrador",
			);
		}

		const deactivatedUser = await this.prisma.user.update({
			where: { id },
			data: { status: "INACTIVE" as UserStatus },
			include: { role: true },
		});

		await this.prisma.userAuditLog.create({
			data: {
				userId: id,
				actorId,
				action: "DEACTIVATE",
				details: { previousStatus: user.status },
			},
		});

		return deactivatedUser as UserEntity;
	}

	async reactivate(id: string, actorId: string): Promise<UserEntity> {
		const user = await this.prisma.user.findUnique({
			where: { id },
			include: { role: true },
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
			include: { role: true },
		});

		await this.prisma.userAuditLog.create({
			data: {
				userId: id,
				actorId,
				action: "REACTIVATE",
				details: { previousStatus: user.status },
			},
		});

		return reactivatedUser as UserEntity;
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
