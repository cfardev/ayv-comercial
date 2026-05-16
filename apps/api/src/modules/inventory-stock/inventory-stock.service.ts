import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { StockEntity } from "./entities/stock.entity.js";
import type {
	PaginatedResult,
	StockFilters,
	StockStatus,
} from "./interfaces/stock-filters.interface.js";

const VALID_SORT_COLUMNS = new Set([
	"code",
	"name",
	"categoryName",
	"brandName",
	"supplierName",
	"currentStock",
	"minStock",
	"stockStatus",
	"updatedAt",
]);

const VALID_SORT_DIRECTIONS = new Set(["ASC", "DESC"]);

interface StockComputedRow {
	product_id: string;
	product_code: string;
	product_name: string;
	category_name: string;
	brand_name: string | null;
	supplier_name: string | null;
	product_cost: string;
	product_price: string;
	minimum_stock: number;
	updated_at: Date;
	current_stock: number;
}

@Injectable()
export class InventoryStockService {
	constructor(private readonly prisma: PrismaService) {}

	private computeStockStatus(
		currentStock: number,
		minStock: number,
	): StockStatus {
		if (currentStock === 0) return "OUT_OF_STOCK";
		if (currentStock < minStock) return "LOW";
		return "NORMAL";
	}

	private toStockEntity(row: StockComputedRow): StockEntity {
		const currentStock = row.current_stock;
		return {
			id: row.product_id,
			code: row.product_code,
			name: row.product_name,
			categoryName: row.category_name,
			brandName: row.brand_name ?? null,
			supplierName: row.supplier_name ?? "Proveedor no disponible",
			currentStock,
			minStock: row.minimum_stock,
			stockStatus: this.computeStockStatus(currentStock, row.minimum_stock),
			cost: row.product_cost,
			price: row.product_price,
			updatedAt: row.updated_at,
		};
	}

	/**
	 * Build the WHERE clause fragment for raw SQL stock queries.
	 * Returns { whereClause, params } where params is an array of values
	 * to be substituted for $1, $2, ... placeholders.
	 */
	private buildRawWhere(filters: StockFilters): {
		whereClause: string;
		params: unknown[];
	} {
		const clauses: string[] = [];
		const params: unknown[] = [];
		let idx = 1;

		if (filters.search) {
			clauses.push(
				`(p.code ILIKE $${idx} OR p.name ILIKE $${idx} OR c.name ILIKE $${idx})`,
			);
			params.push(`%${filters.search}%`);
			idx++;
		}

		if (filters.isActive === "true") {
			clauses.push(`p.status = true`);
		} else if (filters.isActive === "false") {
			clauses.push(`p.status = false`);
		}

		if (filters.categoryId) {
			clauses.push(`p.category_id = $${idx}`);
			params.push(filters.categoryId);
			idx++;
		}

		if (filters.brandId) {
			clauses.push(`p.brand_id = $${idx}`);
			params.push(filters.brandId);
			idx++;
		}

		if (filters.supplierId) {
			clauses.push(`p.supplier_id = $${idx}`);
			params.push(filters.supplierId);
			idx++;
		}

		if (filters.stockStatus) {
			const stockCase =
				"CASE WHEN COALESCE(s.current_stock, 0) = 0 THEN 'OUT_OF_STOCK' " +
				"WHEN COALESCE(s.current_stock, 0) < p.minimum_stock THEN 'LOW' " +
				"ELSE 'NORMAL' END";
			clauses.push(`${stockCase} = $${idx}`);
			params.push(filters.stockStatus);
			idx++;
		}

		const whereClause =
			clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
		return { whereClause, params };
	}

	/**
	 * Build the ORDER BY fragment for raw SQL stock queries.
	 * All columns — including computed ones (currentStock, stockStatus) —
	 * are sorted at DB level BEFORE pagination for true global ordering.
	 */
	private buildRawOrderBy(filters: StockFilters): string {
		const sortBy = filters.sortBy ?? "name";
		const sortOrder = (filters.sortOrder ?? "asc").toUpperCase();

		if (!VALID_SORT_COLUMNS.has(sortBy)) {
			return "ORDER BY p.name ASC";
		}

		if (!VALID_SORT_DIRECTIONS.has(sortOrder)) {
			return "ORDER BY p.name ASC";
		}

		switch (sortBy) {
			case "code":
				return `ORDER BY p.code ${sortOrder}`;
			case "name":
				return `ORDER BY p.name ${sortOrder}`;
			case "categoryName":
				return `ORDER BY c.name ${sortOrder}`;
			case "brandName":
				return `ORDER BY b.name ${sortOrder}`;
			case "supplierName":
				return `ORDER BY sup.name ${sortOrder}`;
			case "updatedAt":
				return `ORDER BY p.updated_at ${sortOrder}`;
			case "minStock":
				return `ORDER BY p.minimum_stock ${sortOrder}`;
			case "currentStock":
				return `ORDER BY COALESCE(s.current_stock, 0) ${sortOrder}`;
			case "stockStatus": {
				// OUT_OF_STOCK=0, LOW=1, NORMAL=2 for consistent ordering
				const dir = sortOrder === "DESC" ? "DESC" : "ASC";
				return `ORDER BY (CASE WHEN COALESCE(s.current_stock, 0) = 0 THEN 0 WHEN COALESCE(s.current_stock, 0) < p.minimum_stock THEN 1 ELSE 2 END) ${dir}`;
			}
			default:
				return `ORDER BY p.name ASC`;
		}
	}

	async findAll(filters: StockFilters): Promise<PaginatedResult<StockEntity>> {
		const page = Math.max(1, filters.page ?? 1);
		const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
		const skip = (page - 1) * limit;

		const { whereClause, params: whereParams } = this.buildRawWhere(filters);
		const orderBy = this.buildRawOrderBy(filters);

		// Single raw query: LEFT JOIN aggregates stock BEFORE sort + pagination.
		// This guarantees GLOBAL ordering — not just within-page sorting.
		const query = `
			SELECT
				p.id          AS product_id,
				p.code        AS product_code,
				p.name        AS product_name,
				c.name        AS category_name,
				b.name        AS brand_name,
				sup.name      AS supplier_name,
				p.cost        AS product_cost,
				p.price       AS product_price,
				p.minimum_stock,
				p.updated_at,
				COALESCE(s.current_stock, 0) AS current_stock
			FROM products p
			JOIN categories c ON c.id = p.category_id
			LEFT JOIN brands b ON b.id = p.brand_id
			LEFT JOIN suppliers sup ON sup.id = p.supplier_id
			LEFT JOIN (
				SELECT product_id, SUM(quantity) AS current_stock
				FROM inventory
				GROUP BY product_id
			) s ON s.product_id = p.id
			${whereClause}
			${orderBy}
			LIMIT $${whereParams.length + 1}
			OFFSET $${whereParams.length + 2}
		`;

		const countQuery = `
			SELECT COUNT(*)::int AS total
			FROM products p
			JOIN categories c ON c.id = p.category_id
			LEFT JOIN (
				SELECT product_id, SUM(quantity) AS current_stock
				FROM inventory
				GROUP BY product_id
			) s ON s.product_id = p.id
			${whereClause}
		`;

		const allParams = [...whereParams, limit, skip];

		const [rows, countResult] = await Promise.all([
			this.prisma.$queryRawUnsafe<StockComputedRow[]>(query, ...allParams),
			this.prisma.$queryRawUnsafe<{ total: number }[]>(
				countQuery,
				...whereParams,
			),
		]);

		const total = countResult[0]?.total ?? 0;

		const data = rows.map((r) => this.toStockEntity(r));

		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async findOne(id: string, includeCost: boolean): Promise<StockEntity> {
		const row = await this.prisma.product.findUnique({
			where: { id },
			include: {
				category: { select: { name: true } },
				brand: { select: { name: true } },
				supplier: { select: { name: true } },
			},
		});
		if (!row) {
			throw new NotFoundException(`Producto con id "${id}" no encontrado.`);
		}

		const stockMap = await this.aggregateStock([id]);
		const entity = this.toStockEntityPrisma({
			...row,
			_stockCurrent: stockMap.get(id) ?? 0,
		});

		if (!includeCost) {
			const { cost: _, ...rest } = entity;
			return rest as StockEntity;
		}

		return entity;
	}

	/** Adapter for Prisma-based findOne (keeps existing pattern). */
	private toStockEntityPrisma(row: {
		id: string;
		code: string;
		name: string;
		category: { name: string };
		brand: { name: string } | null;
		supplier: { name: string };
		cost: Prisma.Decimal;
		price: Prisma.Decimal;
		minimumStock: number;
		updatedAt: Date;
		_stockCurrent: number;
	}): StockEntity {
		const currentStock = row._stockCurrent;
		return {
			id: row.id,
			code: row.code,
			name: row.name,
			categoryName: row.category.name,
			brandName: row.brand?.name ?? null,
			supplierName: row.supplier?.name ?? "Proveedor no disponible",
			currentStock,
			minStock: row.minimumStock,
			stockStatus: this.computeStockStatus(currentStock, row.minimumStock),
			cost: row.cost.toString(),
			price: row.price.toString(),
			updatedAt: row.updatedAt,
		};
	}

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
}
