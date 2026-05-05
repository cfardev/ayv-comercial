import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { Prisma } from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { CreateProductDto } from "./dto/create-product.dto.js";
import type { UpdateProductDto } from "./dto/update-product.dto.js";
import type { ProductEntity } from "./entities/product.entity.js";
import type {
	PaginatedResult,
	ProductFilters,
} from "./interfaces/product-filters.interface.js";

@Injectable()
export class ProductsService {
	constructor(private readonly prisma: PrismaService) {}

	private toProductEntity(row: {
		id: string;
		name: string;
		description: string | null;
		cost: Prisma.Decimal;
		price: Prisma.Decimal;
		status: boolean;
		categoryId: string;
		brandId: string | null;
		createdAt: Date;
		updatedAt: Date;
		category: { name: string };
		brand: { name: string } | null;
		images: {
			id: string;
			url: string;
			fileKey: string | null;
			sortOrder: number;
			createdAt: Date;
		}[];
	}): ProductEntity {
		const sortedImages = [...row.images].sort(
			(a, b) => a.sortOrder - b.sortOrder,
		);
		return {
			id: row.id,
			name: row.name,
			description: row.description,
			cost: row.cost.toString(),
			price: row.price.toString(),
			status: row.status,
			categoryId: row.categoryId,
			categoryName: row.category.name,
			brandId: row.brandId,
			brandName: row.brand?.name ?? null,
			images: sortedImages.map((img) => ({
				id: img.id,
				url: img.url,
				fileKey: img.fileKey,
				sortOrder: img.sortOrder,
				createdAt: img.createdAt,
			})),
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
		};
	}

	private async ensureBrandByName(
		tx: Prisma.TransactionClient,
		rawName: string,
	): Promise<string> {
		const name = rawName.trim();
		if (name.length === 0) {
			throw new BadRequestException("El nombre de la marca es obligatorio.");
		}

		const existing = await tx.brand.findFirst({
			where: { name },
		});
		if (existing) return existing.id;

		try {
			const created = await tx.brand.create({
				data: { name },
			});
			return created.id;
		} catch (err: unknown) {
			const code =
				typeof err === "object" && err !== null && "code" in err
					? (err as { code?: string }).code
					: undefined;
			if (code === "P2002") {
				const again = await tx.brand.findFirst({ where: { name } });
				if (again) return again.id;
			}
			throw err;
		}
	}

	private async resolveExistingBrandId(
		tx: Prisma.TransactionClient,
		brandId: string | undefined,
	): Promise<string> {
		if (!brandId) {
			throw new BadRequestException("Debes seleccionar una marca existente.");
		}

		const b = await tx.brand.findUnique({ where: { id: brandId } });
		if (!b) {
			throw new NotFoundException(`Marca con id "${brandId}" no encontrada.`);
		}
		return b.id;
	}

	private assertPriceAboveCost(cost: number, price: number): void {
		if (price <= cost) {
			throw new BadRequestException(
				"El precio de venta debe ser mayor que el costo.",
			);
		}
	}

	private async assertCategoryActive(categoryId: string): Promise<void> {
		const category = await this.prisma.category.findUnique({
			where: { id: categoryId },
		});
		if (!category) {
			throw new NotFoundException(
				`Categoría con id "${categoryId}" no encontrada.`,
			);
		}
		if (!category.status) {
			throw new BadRequestException(
				"No se puede asignar una categoría inactiva al producto.",
			);
		}
	}

	async findAll(
		filters: ProductFilters,
	): Promise<PaginatedResult<ProductEntity>> {
		const page = Math.max(1, filters.page ?? 1);
		const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
		const skip = (page - 1) * limit;

		const where: Prisma.ProductWhereInput = {};

		if (filters.search) {
			where.OR = [
				{ name: { contains: filters.search, mode: "insensitive" } },
				{ description: { contains: filters.search, mode: "insensitive" } },
			];
		}

		if (filters.status && filters.status !== "ALL") {
			where.status = filters.status === "true";
		}

		if (filters.categoryId) {
			where.categoryId = filters.categoryId;
		}

		if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
			const priceFilter: Prisma.DecimalFilter<"Product"> = {};
			if (filters.minPrice !== undefined) {
				priceFilter.gte = new Prisma.Decimal(filters.minPrice);
			}
			if (filters.maxPrice !== undefined) {
				priceFilter.lte = new Prisma.Decimal(filters.maxPrice);
			}
			where.price = priceFilter;
		}

		const [rows, total] = await Promise.all([
			this.prisma.product.findMany({
				where,
				skip,
				take: limit,
				orderBy: { name: "asc" },
				include: {
					category: { select: { name: true } },
					brand: { select: { name: true } },
					images: true,
				},
			}),
			this.prisma.product.count({ where }),
		]);

		return {
			data: rows.map((r) => this.toProductEntity(r)),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async findOne(id: string): Promise<ProductEntity> {
		const row = await this.prisma.product.findUnique({
			where: { id },
			include: {
				category: { select: { name: true } },
				brand: { select: { name: true } },
				images: true,
			},
		});
		if (!row) {
			throw new NotFoundException(`Producto con id "${id}" no encontrado.`);
		}
		return this.toProductEntity(row);
	}

	async create(dto: CreateProductDto, actorId: string): Promise<ProductEntity> {
		await this.assertCategoryActive(dto.categoryId);
		this.assertPriceAboveCost(dto.cost, dto.price);

		const product = await this.prisma.$transaction(async (tx) => {
			const resolvedBrandId =
				dto.brandMode === "existing"
					? await this.resolveExistingBrandId(tx, dto.brandId)
					: await this.ensureBrandByName(tx, dto.newBrandName ?? "");

			const p = await tx.product.create({
				data: {
					name: dto.name,
					description: dto.description ?? null,
					cost: new Prisma.Decimal(dto.cost),
					price: new Prisma.Decimal(dto.price),
					status: true,
					categoryId: dto.categoryId,
					brandId: resolvedBrandId,
					images: {
						create: dto.images.map((img, index) => ({
							url: img.url,
							fileKey: img.fileKey ?? null,
							sortOrder: img.sortOrder ?? index,
						})),
					},
				},
				include: {
					category: { select: { name: true } },
					brand: { select: { name: true } },
					images: true,
				},
			});
			return p;
		});

		await this.prisma.userAuditLog.create({
			data: {
				userId: actorId,
				actorId,
				action: "PRODUCT_CREATED",
				details: { productId: product.id, name: product.name },
			},
		});

		return this.toProductEntity(product);
	}

	async update(
		id: string,
		dto: UpdateProductDto,
		actorId: string,
	): Promise<ProductEntity> {
		const existing = await this.prisma.product.findUnique({
			where: { id },
			include: { images: true },
		});
		if (!existing) {
			throw new NotFoundException(`Producto con id "${id}" no encontrado.`);
		}

		const categoryId = dto.categoryId ?? existing.categoryId;
		if (dto.categoryId !== undefined) {
			await this.assertCategoryActive(dto.categoryId);
		}

		const cost = dto.cost ?? Number(existing.cost);
		const price = dto.price ?? Number(existing.price);
		this.assertPriceAboveCost(cost, price);

		if (dto.images !== undefined) {
			if (dto.images.length === 0) {
				throw new BadRequestException(
					"El producto debe tener al menos una imagen.",
				);
			}
		}

		const updated = await this.prisma.$transaction(async (tx) => {
			if (dto.images !== undefined) {
				await tx.productImage.deleteMany({ where: { productId: id } });
				await tx.productImage.createMany({
					data: dto.images.map((img, index) => ({
						productId: id,
						url: img.url,
						fileKey: img.fileKey ?? null,
						sortOrder: img.sortOrder ?? index,
					})),
				});
			}

			let brandPatch: { brandId: string } | Record<string, never> = {};
			if (dto.brandMode !== undefined) {
				const resolvedBrandId =
					dto.brandMode === "existing"
						? await this.resolveExistingBrandId(tx, dto.brandId)
						: await this.ensureBrandByName(tx, dto.newBrandName ?? "");
				brandPatch = { brandId: resolvedBrandId };
			}

			return tx.product.update({
				where: { id },
				data: {
					...(dto.name !== undefined ? { name: dto.name } : {}),
					...(dto.description !== undefined
						? { description: dto.description }
						: {}),
					...(dto.cost !== undefined
						? { cost: new Prisma.Decimal(dto.cost) }
						: {}),
					...(dto.price !== undefined
						? { price: new Prisma.Decimal(dto.price) }
						: {}),
					...(dto.categoryId !== undefined ? { categoryId } : {}),
					...brandPatch,
				},
				include: {
					category: { select: { name: true } },
					brand: { select: { name: true } },
					images: true,
				},
			});
		});

		await this.prisma.userAuditLog.create({
			data: {
				userId: actorId,
				actorId,
				action: "PRODUCT_UPDATED",
				details: {
					productId: id,
					patch: {
						name: dto.name,
						categoryId: dto.categoryId,
					},
				},
			},
		});

		return this.toProductEntity(updated);
	}

	async deactivate(id: string, actorId: string): Promise<ProductEntity> {
		const existing = await this.prisma.product.findUnique({
			where: { id },
			include: {
				category: { select: { name: true } },
				brand: { select: { name: true } },
				images: true,
			},
		});
		if (!existing) {
			throw new NotFoundException(`Producto con id "${id}" no encontrado.`);
		}
		if (!existing.status) {
			throw new BadRequestException("El producto ya está inactivo.");
		}

		const updated = await this.prisma.product.update({
			where: { id },
			data: { status: false },
			include: {
				category: { select: { name: true } },
				brand: { select: { name: true } },
				images: true,
			},
		});

		await this.prisma.userAuditLog.create({
			data: {
				userId: actorId,
				actorId,
				action: "PRODUCT_DEACTIVATED",
				details: { productId: id },
			},
		});

		return this.toProductEntity(updated);
	}

	async reactivate(id: string, actorId: string): Promise<ProductEntity> {
		const existing = await this.prisma.product.findUnique({
			where: { id },
			include: {
				category: { select: { name: true } },
				brand: { select: { name: true } },
				images: true,
			},
		});
		if (!existing) {
			throw new NotFoundException(`Producto con id "${id}" no encontrado.`);
		}
		if (existing.status) {
			throw new BadRequestException("El producto ya está activo.");
		}

		await this.assertCategoryActive(existing.categoryId);

		const updated = await this.prisma.product.update({
			where: { id },
			data: { status: true },
			include: {
				category: { select: { name: true } },
				brand: { select: { name: true } },
				images: true,
			},
		});

		await this.prisma.userAuditLog.create({
			data: {
				userId: actorId,
				actorId,
				action: "PRODUCT_REACTIVATED",
				details: { productId: id },
			},
		});

		return this.toProductEntity(updated);
	}
}
