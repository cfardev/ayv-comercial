import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { Prisma } from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { CreateProductDto } from "./dto/create-product.dto.js";
import type { UpdatePricingDto } from "./dto/update-pricing.dto.js";
import type { UpdateProductDto } from "./dto/update-product.dto.js";
import type {
	PriceHistoryEntity,
	UpdatePricingResult,
} from "./entities/price-history.entity.js";
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
		code: string;
		name: string;
		description: string | null;
		cost: Prisma.Decimal;
		price: Prisma.Decimal;
		status: boolean;
		categoryId: string;
		brandId: string | null;
		supplierId: string | null;
		unitOfMeasure: string | null;
		minimumStock: number;
		createdAt: Date;
		updatedAt: Date;
		category: { name: string };
		brand: { name: string } | null;
		supplier: { name: string } | null;
		images: {
			id: string;
			url: string;
			fileKey: string | null;
			sortOrder: number;
			createdAt: Date;
		}[];
		_stockCurrent?: number;
	}): ProductEntity {
		const sortedImages = [...row.images].sort(
			(a, b) => a.sortOrder - b.sortOrder,
		);
		return {
			id: row.id,
			code: row.code,
			name: row.name,
			description: row.description,
			cost: row.cost.toString(),
			price: row.price.toString(),
			status: row.status,
			categoryId: row.categoryId,
			categoryName: row.category.name,
			brandId: row.brandId,
			brandName: row.brand?.name ?? null,
			supplierId: row.supplierId ?? "",
			supplierName: row.supplier?.name ?? "Proveedor no disponible",
			unitOfMeasure: row.unitOfMeasure,
			minimumStock: row.minimumStock,
			stockCurrent: row._stockCurrent ?? 0,
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
		if (existing) {
			if (!existing.status) {
				throw new BadRequestException(
					`Ya existe una marca inactiva con el nombre "${name}". Reactívala desde la gestión de marcas o usa otro nombre.`,
				);
			}
			return existing.id;
		}

		try {
			const created = await tx.brand.create({
				data: {
					name,
					status: true,
					logoUrl: null,
				},
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
		if (!b.status) {
			throw new BadRequestException(
				"La marca seleccionada está inactiva. Elige una marca activa o crea una nueva.",
			);
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

	private async assertCodeUnique(
		code: string,
		excludeId?: string,
	): Promise<void> {
		const existing = await this.prisma.product.findFirst({
			where: {
				code: { equals: code },
				...(excludeId ? { id: { not: excludeId } } : {}),
			},
		});
		if (existing) {
			throw new ConflictException(
				`Ya existe un producto con el código "${code}".`,
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

	private async assertSupplierActive(supplierId: string): Promise<void> {
		const supplier = await this.prisma.supplier.findUnique({
			where: { id: supplierId },
		});
		if (!supplier) {
			throw new NotFoundException(
				`Proveedor con id "${supplierId}" no encontrado.`,
			);
		}
		if (!supplier.status) {
			throw new BadRequestException(
				"No se puede asignar un proveedor inactivo al producto.",
			);
		}
	}

	/**
	 * Aggregate stock quantity from Inventory table for given product IDs.
	 * Returns a Map<productId, totalQuantity>.
	 */
	private async aggregateStock(
		productIds: string[],
	): Promise<Map<string, number>> {
		if (productIds.length === 0) return new Map();

		const rows = await this.prisma.inventory.groupBy({
			by: ["productId"],
			where: { productId: { in: productIds } },
			_sum: { quantity: true },
		});

		const map = new Map<string, number>();
		for (const row of rows) {
			map.set(row.productId, row._sum.quantity ?? 0);
		}
		return map;
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
				{ code: { contains: filters.search, mode: "insensitive" } },
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

		if (filters.brandId) {
			where.brandId = filters.brandId;
		}

		if (filters.supplierId) {
			where.supplierId = filters.supplierId;
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
					supplier: { select: { name: true } },
					images: true,
				},
			}),
			this.prisma.product.count({ where }),
		]);

		// Aggregate stock for the current page
		const stockMap = await this.aggregateStock(rows.map((r) => r.id));

		return {
			data: rows.map((r) =>
				this.toProductEntity({
					...r,
					_stockCurrent: stockMap.get(r.id) ?? 0,
				}),
			),
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
				supplier: { select: { name: true } },
				images: true,
			},
		});
		if (!row) {
			throw new NotFoundException(`Producto con id "${id}" no encontrado.`);
		}

		// Aggregate stock for this single product
		const stockMap = await this.aggregateStock([id]);

		return this.toProductEntity({
			...row,
			_stockCurrent: stockMap.get(id) ?? 0,
		});
	}

	async create(dto: CreateProductDto, actorId: string): Promise<ProductEntity> {
		await this.assertCategoryActive(dto.categoryId);
		await this.assertSupplierActive(dto.supplierId);
		await this.assertCodeUnique(dto.code);
		this.assertPriceAboveCost(dto.cost, dto.price);

		const product = await this.prisma.$transaction(async (tx) => {
			const resolvedBrandId =
				dto.brandMode === "existing"
					? await this.resolveExistingBrandId(tx, dto.brandId)
					: await this.ensureBrandByName(tx, dto.newBrandName ?? "");

			const p = await tx.product.create({
				data: {
					code: dto.code,
					name: dto.name,
					description: dto.description ?? null,
					cost: new Prisma.Decimal(dto.cost),
					price: new Prisma.Decimal(dto.price),
					status: true,
					categoryId: dto.categoryId,
					brandId: resolvedBrandId,
					supplierId: dto.supplierId,
					unitOfMeasure: dto.unitOfMeasure ?? null,
					minimumStock: dto.minimumStock ?? 0,
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
					supplier: { select: { name: true } },
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
				details: {
					productId: product.id,
					name: product.name,
					code: product.code,
				},
			},
		});

		return this.toProductEntity({ ...product, _stockCurrent: 0 });
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

		if (dto.supplierId !== undefined) {
			await this.assertSupplierActive(dto.supplierId);
		}

		const cost = dto.cost ?? Number(existing.cost);
		const price = dto.price ?? Number(existing.price);
		this.assertPriceAboveCost(cost, price);

		if (dto.code !== undefined && dto.code !== existing.code) {
			await this.assertCodeUnique(dto.code, id);
		}

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
					...(dto.code !== undefined ? { code: dto.code } : {}),
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
					...(dto.supplierId !== undefined
						? { supplierId: dto.supplierId }
						: {}),
					...(dto.unitOfMeasure !== undefined
						? { unitOfMeasure: dto.unitOfMeasure }
						: {}),
					...(dto.minimumStock !== undefined
						? { minimumStock: dto.minimumStock }
						: {}),
					...brandPatch,
				},
				include: {
					category: { select: { name: true } },
					brand: { select: { name: true } },
					supplier: { select: { name: true } },
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
						code: dto.code,
						categoryId: dto.categoryId,
						supplierId: dto.supplierId,
					},
				},
			},
		});

		// Get stock for updated product
		const stockMap = await this.aggregateStock([id]);
		return this.toProductEntity({
			...updated,
			_stockCurrent: stockMap.get(id) ?? 0,
		});
	}

	async getDeactivationInfo(
		id: string,
	): Promise<{ productName: string; salesCount: number }> {
		const existing = await this.prisma.product.findUnique({
			where: { id },
			select: { name: true, status: true },
		});
		if (!existing) {
			throw new NotFoundException(`Producto con id "${id}" no encontrado.`);
		}
		if (!existing.status) {
			throw new BadRequestException("El producto ya está inactivo.");
		}

		const salesCount = await this.prisma.saleItem.count({
			where: { productId: id },
		});

		return { productName: existing.name, salesCount };
	}

	async deactivate(
		id: string,
		actorId: string,
	): Promise<{ product: ProductEntity; salesCount: number }> {
		const existing = await this.prisma.product.findUnique({
			where: { id },
			include: {
				category: { select: { name: true } },
				brand: { select: { name: true } },
				supplier: { select: { name: true } },
				images: true,
			},
		});
		if (!existing) {
			throw new NotFoundException(`Producto con id "${id}" no encontrado.`);
		}
		if (!existing.status) {
			throw new BadRequestException("El producto ya está inactivo.");
		}

		// Count sales associated with this product (for frontend warning)
		const salesCount = await this.prisma.saleItem.count({
			where: { productId: id },
		});

		const updated = await this.prisma.product.update({
			where: { id },
			data: { status: false },
			include: {
				category: { select: { name: true } },
				brand: { select: { name: true } },
				supplier: { select: { name: true } },
				images: true,
			},
		});

		await this.prisma.userAuditLog.create({
			data: {
				userId: actorId,
				actorId,
				action: "PRODUCT_DEACTIVATED",
				details: { productId: id, salesCount },
			},
		});

		const stockMap = await this.aggregateStock([id]);
		return {
			product: this.toProductEntity({
				...updated,
				_stockCurrent: stockMap.get(id) ?? 0,
			}),
			salesCount,
		};
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

		await this.assertSupplierActive(existing.supplierId);

		const updated = await this.prisma.product.update({
			where: { id },
			data: { status: true },
			include: {
				category: { select: { name: true } },
				brand: { select: { name: true } },
				supplier: { select: { name: true } },
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

		const stockMap = await this.aggregateStock([id]);
		return this.toProductEntity({
			...updated,
			_stockCurrent: stockMap.get(id) ?? 0,
		});
	}

	async updatePricing(
		id: string,
		dto: UpdatePricingDto,
		actorId: string,
	): Promise<UpdatePricingResult> {
		const product = await this.prisma.product.findUnique({ where: { id } });
		if (!product) {
			throw new NotFoundException(`Producto con id "${id}" no encontrado.`);
		}
		if (!product.status) {
			throw new BadRequestException(
				"No se puede modificar el precio de un producto inactivo. Reactívalo primero.",
			);
		}

		const prevCost = Number(product.cost);
		const prevPrice = Number(product.price);
		const newCost = dto.cost;
		const newSalePrice = dto.salePrice;

		// Negative margin check
		const negativeMargin = newSalePrice <= newCost;
		if (negativeMargin && !dto.forceNegativeMargin) {
			throw new BadRequestException({
				message:
					"El precio de venta es menor o igual al costo (margen negativo). Confirma con forceNegativeMargin: true para continuar.",
				warning: "NEGATIVE_MARGIN",
				newMarginPercent:
					prevCost > 0
						? (((newSalePrice - newCost) / newCost) * 100).toFixed(2)
						: null,
			});
		}

		// Large variation check (based on previous price)
		const variationPercent =
			prevPrice > 0
				? Math.abs(((newSalePrice - prevPrice) / prevPrice) * 100)
				: 0;
		const largeVariation = variationPercent > 50;
		if (largeVariation && !dto.forceLargeVariation) {
			throw new BadRequestException({
				message: `La variación de precio es de ${variationPercent.toFixed(2)}% (supera el 50%). Confirma con forceLargeVariation: true para continuar.`,
				warning: "LARGE_VARIATION",
				variationPercent: variationPercent.toFixed(2),
			});
		}

		// Atomic transaction: update product + create price history
		const [updatedProduct, history] = await this.prisma.$transaction(
			async (tx) => {
				const updated = await tx.product.update({
					where: { id },
					data: {
						cost: new Prisma.Decimal(newCost),
						price: new Prisma.Decimal(newSalePrice),
					},
					select: { id: true, cost: true, price: true },
				});

				const ph = await tx.priceHistory.create({
					data: {
						productId: id,
						previousCost: new Prisma.Decimal(prevCost),
						newCost: new Prisma.Decimal(newCost),
						previousSalePrice: new Prisma.Decimal(prevPrice),
						newSalePrice: new Prisma.Decimal(newSalePrice),
						justification: dto.justification ?? null,
						changedBy: actorId,
					},
				});

				return [updated, ph] as const;
			},
		);

		const priceHistory: PriceHistoryEntity = {
			id: history.id,
			productId: history.productId,
			previousCost: history.previousCost.toString(),
			newCost: history.newCost.toString(),
			previousSalePrice: history.previousSalePrice.toString(),
			newSalePrice: history.newSalePrice.toString(),
			justification: history.justification,
			changedBy: history.changedBy,
			createdAt: history.createdAt,
		};

		return {
			product: {
				id: updatedProduct.id,
				cost: updatedProduct.cost.toString(),
				price: updatedProduct.price.toString(),
			},
			priceHistory,
			warnings: {
				negativeMargin,
				largeVariation,
				variationPercent,
			},
		};
	}
}
