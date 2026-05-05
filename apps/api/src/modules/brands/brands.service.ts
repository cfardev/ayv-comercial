import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { Prisma } from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { CreateBrandDto } from "./dto/create-brand.dto.js";
import type { UpdateBrandDto } from "./dto/update-brand.dto.js";
import type { BrandEntity } from "./entities/brand.entity.js";
import type { BrandSummaryEntity } from "./entities/brand-summary.entity.js";
import type {
	BrandAdminFilters,
	PaginatedResult,
} from "./interfaces/brand-filters.interface.js";

const PICKER_DEFAULT_LIMIT = 50;

@Injectable()
export class BrandsService {
	constructor(private readonly prisma: PrismaService) {}

	private toBrandEntity(row: {
		id: string;
		name: string;
		description: string | null;
		status: boolean;
		logoUrl: string | null;
		createdAt: Date;
		updatedAt: Date;
		_count?: { products: number };
	}): BrandEntity {
		return {
			id: row.id,
			name: row.name,
			description: row.description,
			status: row.status,
			logoUrl: row.logoUrl,
			productCount: row._count?.products ?? 0,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
		};
	}

	private async assertNameUnique(
		name: string,
		excludeId?: string,
	): Promise<void> {
		const existing = await this.prisma.brand.findFirst({
			where: {
				name: { equals: name, mode: "insensitive" },
				...(excludeId ? { id: { not: excludeId } } : {}),
			},
		});
		if (existing) {
			throw new ConflictException(
				`Ya existe una marca con el nombre "${name}".`,
			);
		}
	}

	async findForPicker(query: {
		search?: string;
		limit?: number;
	}): Promise<BrandSummaryEntity[]> {
		const limit = Math.min(
			100,
			Math.max(1, query.limit ?? PICKER_DEFAULT_LIMIT),
		);
		const where: Prisma.BrandWhereInput = {
			status: true,
		};

		if (query.search?.trim()) {
			const term = query.search.trim();
			where.OR = [
				{ name: { contains: term, mode: "insensitive" } },
				{ description: { contains: term, mode: "insensitive" } },
			];
		}

		const rows = await this.prisma.brand.findMany({
			where,
			orderBy: { name: "asc" },
			take: limit,
			select: { id: true, name: true },
		});

		return rows.map((row) => ({ id: row.id, name: row.name }));
	}

	async findAllAdmin(
		filters: BrandAdminFilters,
	): Promise<PaginatedResult<BrandEntity>> {
		const page = Math.max(1, filters.page ?? 1);
		const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
		const skip = (page - 1) * limit;

		const rawStatus = filters.status ?? "true";
		const where: Prisma.BrandWhereInput = {};

		if (filters.search?.trim()) {
			const term = filters.search.trim();
			where.OR = [
				{ name: { contains: term, mode: "insensitive" } },
				{ description: { contains: term, mode: "insensitive" } },
			];
		}

		if (rawStatus !== "ALL") {
			where.status = rawStatus === "true";
		}

		const [rows, total] = await Promise.all([
			this.prisma.brand.findMany({
				where,
				skip,
				take: limit,
				orderBy: { name: "asc" },
				include: {
					_count: { select: { products: true } },
				},
			}),
			this.prisma.brand.count({ where }),
		]);

		return {
			data: rows.map((r) => this.toBrandEntity(r)),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async findOne(id: string): Promise<BrandEntity> {
		const row = await this.prisma.brand.findUnique({
			where: { id },
			include: {
				_count: { select: { products: true } },
			},
		});
		if (!row)
			throw new NotFoundException(`Marca con id "${id}" no encontrada.`);
		return this.toBrandEntity(row);
	}

	async create(dto: CreateBrandDto, actorId: string): Promise<BrandEntity> {
		await this.assertNameUnique(dto.name.trim());

		const brand = await this.prisma.brand.create({
			data: {
				name: dto.name.trim(),
				description: dto.description?.trim() || null,
				status: true,
				logoUrl: dto.logoUrl?.trim() || null,
			},
			include: {
				_count: { select: { products: true } },
			},
		});

		await this.prisma.userAuditLog.create({
			data: {
				userId: actorId,
				actorId,
				action: "BRAND_CREATED",
				details: { brandId: brand.id, name: brand.name },
			},
		});

		return this.toBrandEntity(brand);
	}

	async update(
		id: string,
		dto: UpdateBrandDto,
		actorId: string,
	): Promise<BrandEntity> {
		const existing = await this.prisma.brand.findUnique({ where: { id } });
		if (!existing)
			throw new NotFoundException(`Marca con id "${id}" no encontrada.`);

		const newName = dto.name !== undefined ? dto.name.trim() : existing.name;
		if (dto.name !== undefined && dto.name.trim() !== existing.name) {
			await this.assertNameUnique(newName, id);
		}

		const logoPatch =
			dto.logoUrl === undefined
				? {}
				: { logoUrl: dto.logoUrl === null ? null : dto.logoUrl.trim() || null };

		const updated = await this.prisma.brand.update({
			where: { id },
			data: {
				...(dto.name !== undefined ? { name: newName } : {}),
				...(dto.description !== undefined
					? { description: dto.description.trim() || null }
					: {}),
				...logoPatch,
			},
			include: {
				_count: { select: { products: true } },
			},
		});

		await this.prisma.userAuditLog.create({
			data: {
				userId: actorId,
				actorId,
				action: "BRAND_UPDATED",
				details: {
					brandId: id,
					name: dto.name,
					description: dto.description,
					logoUrl: dto.logoUrl,
				},
			},
		});

		return this.toBrandEntity(updated);
	}

	async deactivate(id: string, actorId: string): Promise<BrandEntity> {
		const existing = await this.prisma.brand.findUnique({
			where: { id },
			include: {
				_count: { select: { products: true } },
			},
		});
		if (!existing)
			throw new NotFoundException(`Marca con id "${id}" no encontrada.`);

		if (!existing.status) {
			throw new BadRequestException("La marca ya está inactiva.");
		}

		const activeProductCount = await this.prisma.product.count({
			where: { brandId: id, status: true },
		});

		if (activeProductCount > 0) {
			throw new ConflictException(
				`No se puede desactivar: la marca tiene ${activeProductCount} producto(s) activo(s) asociado(s). Reasigna o desactiva esos productos primero.`,
			);
		}

		const updated = await this.prisma.brand.update({
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
				action: "BRAND_DEACTIVATED",
				details: { brandId: id },
			},
		});

		return this.toBrandEntity(updated);
	}

	async reactivate(id: string, actorId: string): Promise<BrandEntity> {
		const existing = await this.prisma.brand.findUnique({
			where: { id },
			include: {
				_count: { select: { products: true } },
			},
		});
		if (!existing)
			throw new NotFoundException(`Marca con id "${id}" no encontrada.`);

		if (existing.status) {
			throw new BadRequestException("La marca ya está activa.");
		}

		const updated = await this.prisma.brand.update({
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
				action: "BRAND_REACTIVATED",
				details: { brandId: id },
			},
		});

		return this.toBrandEntity(updated);
	}
}
