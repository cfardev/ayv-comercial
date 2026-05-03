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

const MAX_DEPTH = 2; // 0 = root, 1 = sub, 2 = sub-sub

@Injectable()
export class CategoriesService {
	constructor(private readonly prisma: PrismaService) {}

	// ─── Mappers ─────────────────────────────────────────────────────────────

	private toCategoryEntity(row: {
		id: string;
		name: string;
		description: string | null;
		status: boolean;
		parentId: string | null;
		depth: number;
		createdAt: Date;
		updatedAt: Date;
		parent?: { id: string; name: string } | null;
		_count?: { products: number; children: number };
	}): CategoryEntity {
		return {
			id: row.id,
			name: row.name,
			description: row.description,
			status: row.status,
			parentId: row.parentId,
			depth: row.depth,
			productCount: row._count?.products ?? 0,
			childrenCount: row._count?.children ?? 0,
			parent: row.parent ?? null,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
		};
	}

	// ─── Validation helpers ──────────────────────────────────────────────────

	/** Ensure name is unique at the given hierarchy level (same parentId). */
	private async assertNameUniqueAtLevel(
		name: string,
		parentId: string | null,
		excludeId?: string,
	): Promise<void> {
		const existing = await this.prisma.category.findFirst({
			where: {
				name: { equals: name, mode: "insensitive" },
				parentId: parentId ?? null,
				...(excludeId ? { id: { not: excludeId } } : {}),
			},
		});
		if (existing) {
			throw new ConflictException(
				`Ya existe una categoría con el nombre "${name}" en este nivel de jerarquía.`,
			);
		}
	}

	/** Walk up the tree to check if targetId is an ancestor of sourceId. */
	private async isDescendant(
		sourceId: string,
		targetId: string,
	): Promise<boolean> {
		let currentId: string | null = sourceId;
		const visited = new Set<string>();
		while (currentId) {
			if (visited.has(currentId)) break; // cycle guard
			visited.add(currentId);
			const cat: { parentId: string | null } | null =
				await this.prisma.category.findUnique({
					where: { id: currentId },
					select: { parentId: true },
				});
			if (!cat) break;
			if (cat.parentId === targetId) return true;
			currentId = cat.parentId;
		}
		return false;
	}

	/** Recursively deactivate children of a category. */
	private async deactivateChildren(parentId: string): Promise<void> {
		const children = await this.prisma.category.findMany({
			where: { parentId },
			select: { id: true },
		});
		for (const child of children) {
			await this.prisma.category.update({
				where: { id: child.id },
				data: { status: false },
			});
			await this.deactivateChildren(child.id);
		}
	}

	// ─── CRUD ────────────────────────────────────────────────────────────────

	async findAll(
		filters: CategoryFilters,
	): Promise<PaginatedResult<CategoryEntity>> {
		const page = Math.max(1, filters.page ?? 1);
		const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
		const skip = (page - 1) * limit;

		const where: {
			OR?: { name?: object; description?: object }[];
			parentId?: string | null;
			status?: boolean;
		} = {};

		if (filters.search) {
			where.OR = [
				{ name: { contains: filters.search, mode: "insensitive" } },
				{ description: { contains: filters.search, mode: "insensitive" } },
			];
		}

		if (filters.parentId !== undefined) {
			where.parentId = filters.parentId === "null" ? null : filters.parentId;
		}

		if (filters.status && filters.status !== "ALL") {
			where.status = filters.status === "true";
		}

		const [rows, total] = await Promise.all([
			this.prisma.category.findMany({
				where,
				skip,
				take: limit,
				orderBy: [{ depth: "asc" }, { name: "asc" }],
				include: {
					parent: { select: { id: true, name: true } },
					_count: { select: { products: true, children: true } },
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
				parent: { select: { id: true, name: true } },
				_count: { select: { products: true, children: true } },
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
		let depth = 0;
		const parentId: string | null = dto.parentId ?? null;

		if (parentId) {
			const parent = await this.prisma.category.findUnique({
				where: { id: parentId },
			});
			if (!parent)
				throw new NotFoundException(
					`Categoría padre con id "${parentId}" no encontrada.`,
				);
			if (!parent.status) {
				throw new BadRequestException(
					"La categoría padre está inactiva. Actívala primero antes de crear una subcategoría.",
				);
			}
			if (parent.depth >= MAX_DEPTH) {
				throw new BadRequestException(
					`Se superó el límite de ${MAX_DEPTH + 1} niveles de jerarquía permitidos.`,
				);
			}
			depth = parent.depth + 1;
		}

		await this.assertNameUniqueAtLevel(dto.name, parentId);

		const category = await this.prisma.category.create({
			data: {
				name: dto.name,
				description: dto.description ?? null,
				parentId,
				depth,
				status: true,
			},
			include: {
				parent: { select: { id: true, name: true } },
				_count: { select: { products: true, children: true } },
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

		// Circular reference check: new parentId must not be self or a descendant
		if (dto.parentId !== undefined && dto.parentId !== null) {
			if (dto.parentId === id) {
				throw new BadRequestException(
					"Una categoría no puede ser su propio padre.",
				);
			}
			const circular = await this.isDescendant(dto.parentId, id);
			if (circular) {
				throw new BadRequestException(
					"Referencia circular: la categoría padre seleccionada es descendiente de esta categoría.",
				);
			}
		}

		// Determine new depth
		let newDepth = existing.depth;
		let newParentId: string | null = existing.parentId;

		if (dto.parentId !== undefined) {
			newParentId = dto.parentId;
			if (newParentId) {
				const parent = await this.prisma.category.findUnique({
					where: { id: newParentId },
				});
				if (!parent)
					throw new NotFoundException(
						`Categoría padre con id "${newParentId}" no encontrada.`,
					);
				if (parent.depth >= MAX_DEPTH) {
					throw new BadRequestException(
						`Se superó el límite de ${MAX_DEPTH + 1} niveles de jerarquía permitidos.`,
					);
				}
				newDepth = parent.depth + 1;
			} else {
				newDepth = 0;
			}
		}

		const newName = dto.name ?? existing.name;
		const levelParentId =
			dto.parentId !== undefined ? newParentId : existing.parentId;

		if (dto.name && dto.name !== existing.name) {
			await this.assertNameUniqueAtLevel(newName, levelParentId, id);
		} else if (dto.parentId !== undefined) {
			await this.assertNameUniqueAtLevel(newName, levelParentId, id);
		}

		const updated = await this.prisma.category.update({
			where: { id },
			data: {
				...(dto.name !== undefined ? { name: dto.name } : {}),
				...(dto.description !== undefined
					? { description: dto.description }
					: {}),
				...(dto.parentId !== undefined
					? { parentId: newParentId, depth: newDepth }
					: {}),
			},
			include: {
				parent: { select: { id: true, name: true } },
				_count: { select: { products: true, children: true } },
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
					parentId: dto.parentId,
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

		// Cascade deactivate children
		await this.deactivateChildren(id);

		const updated = await this.prisma.category.update({
			where: { id },
			data: { status: false },
			include: {
				parent: { select: { id: true, name: true } },
				_count: { select: { products: true, children: true } },
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
				parent: { select: { id: true, status: true, name: true } },
				_count: { select: { products: true, children: true } },
			},
		});
		if (!existing)
			throw new NotFoundException(`Categoría con id "${id}" no encontrada.`);

		if (existing.status) {
			throw new BadRequestException("La categoría ya está activa.");
		}

		if (existing.parent && !existing.parent.status) {
			throw new BadRequestException(
				`La categoría padre "${existing.parent.name}" está inactiva. Actívala primero.`,
			);
		}

		const updated = await this.prisma.category.update({
			where: { id },
			data: { status: true },
			include: {
				parent: { select: { id: true, name: true } },
				_count: { select: { products: true, children: true } },
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
