import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { CreateCategoryDto } from "./dto/create-category.dto.js";
import type { UpdateCategoryDto } from "./dto/update-category.dto.js";
import type { CategoryEntity } from "./entities/category.entity.js";
import type {
	CategoryFilters,
	PaginatedResult,
} from "./interfaces/category-filters.interface.js";

@Injectable()
export class CategoriesService {
	constructor(private readonly prisma: PrismaService) {}

	private toCategoryEntity(row: {
		id: string;
		name: string;
		description: string | null;
		status: boolean;
		createdAt: Date;
		updatedAt: Date;
		_count?: { products: number };
	}): CategoryEntity {
		return {
			id: row.id,
			name: row.name,
			description: row.description,
			status: row.status,
			productCount: row._count?.products ?? 0,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
		};
	}

	private async assertNameUnique(
		name: string,
		excludeId?: string,
	): Promise<void> {
		const existing = await this.prisma.category.findFirst({
			where: {
				name: { equals: name, mode: "insensitive" },
				...(excludeId ? { id: { not: excludeId } } : {}),
			},
		});
		if (existing) {
			throw new ConflictException(
				`Ya existe una categoría con el nombre "${name}".`,
			);
		}
	}

	async findAll(
		filters: CategoryFilters,
	): Promise<PaginatedResult<CategoryEntity>> {
		const page = Math.max(1, filters.page ?? 1);
		const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
		const skip = (page - 1) * limit;

		const where: {
			OR?: { name?: object; description?: object }[];
			status?: boolean;
		} = {};

		if (filters.search) {
			where.OR = [
				{ name: { contains: filters.search, mode: "insensitive" } },
				{ description: { contains: filters.search, mode: "insensitive" } },
			];
		}

		if (filters.status && filters.status !== "ALL") {
			where.status = filters.status === "true";
		}

		const [rows, total] = await Promise.all([
			this.prisma.category.findMany({
				where,
				skip,
				take: limit,
				orderBy: { name: "asc" },
				include: {
					_count: { select: { products: true } },
				},
			}),
			this.prisma.category.count({ where }),
		]);

		return {
			data: rows.map((r) => this.toCategoryEntity(r)),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async findOne(id: string): Promise<CategoryEntity> {
		const row = await this.prisma.category.findUnique({
			where: { id },
			include: {
				_count: { select: { products: true } },
			},
		});
		if (!row)
			throw new NotFoundException(`Categoría con id "${id}" no encontrada.`);
		return this.toCategoryEntity(row);
	}

	async create(
		dto: CreateCategoryDto,
		actorId: string,
	): Promise<CategoryEntity> {
		await this.assertNameUnique(dto.name);

		const category = await this.prisma.category.create({
			data: {
				name: dto.name,
				description: dto.description ?? null,
				status: true,
			},
			include: {
				_count: { select: { products: true } },
			},
		});

		await this.prisma.userAuditLog.create({
			data: {
				userId: actorId,
				actorId,
				action: "CATEGORY_CREATED",
				details: { categoryId: category.id, name: category.name },
			},
		});

		return this.toCategoryEntity(category);
	}

	async update(
		id: string,
		dto: UpdateCategoryDto,
		actorId: string,
	): Promise<CategoryEntity> {
		const existing = await this.prisma.category.findUnique({ where: { id } });
		if (!existing)
			throw new NotFoundException(`Categoría con id "${id}" no encontrada.`);

		const newName = dto.name ?? existing.name;
		if (dto.name !== undefined && dto.name !== existing.name) {
			await this.assertNameUnique(newName, id);
		}

		const updated = await this.prisma.category.update({
			where: { id },
			data: {
				...(dto.name !== undefined ? { name: dto.name } : {}),
				...(dto.description !== undefined
					? { description: dto.description }
					: {}),
			},
			include: {
				_count: { select: { products: true } },
			},
		});

		await this.prisma.userAuditLog.create({
			data: {
				userId: actorId,
				actorId,
				action: "CATEGORY_UPDATED",
				details: {
					categoryId: id,
					name: dto.name,
					description: dto.description,
				},
			},
		});

		return this.toCategoryEntity(updated);
	}

	async deactivate(id: string, actorId: string): Promise<CategoryEntity> {
		const existing = await this.prisma.category.findUnique({
			where: { id },
			include: { _count: { select: { products: true } } },
		});
		if (!existing)
			throw new NotFoundException(`Categoría con id "${id}" no encontrada.`);

		if (!existing.status) {
			throw new BadRequestException("La categoría ya está inactiva.");
		}

		if (existing._count.products > 0) {
			throw new ConflictException(
				`No se puede desactivar: la categoría tiene ${existing._count.products} producto(s) asociado(s). Reasigna o elimina los productos primero.`,
			);
		}

		const updated = await this.prisma.category.update({
			where: { id },
			data: { status: false },
			include: {
				_count: { select: { products: true } },
			},
		});

		await this.prisma.userAuditLog.create({
			data: {
				userId: actorId,
				actorId,
				action: "CATEGORY_DEACTIVATED",
				details: { categoryId: id },
			},
		});

		return this.toCategoryEntity(updated);
	}

	async reactivate(id: string, actorId: string): Promise<CategoryEntity> {
		const existing = await this.prisma.category.findUnique({
			where: { id },
			include: {
				_count: { select: { products: true } },
			},
		});
		if (!existing)
			throw new NotFoundException(`Categoría con id "${id}" no encontrada.`);

		if (existing.status) {
			throw new BadRequestException("La categoría ya está activa.");
		}

		const updated = await this.prisma.category.update({
			where: { id },
			data: { status: true },
			include: {
				_count: { select: { products: true } },
			},
		});

		await this.prisma.userAuditLog.create({
			data: {
				userId: actorId,
				actorId,
				action: "CATEGORY_REACTIVATED",
				details: { categoryId: id },
			},
		});

		return this.toCategoryEntity(updated);
	}
}
