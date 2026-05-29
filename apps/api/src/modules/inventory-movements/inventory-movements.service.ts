import { Injectable, NotFoundException } from "@nestjs/common";
import type { MovementType, Prisma } from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { InventoryMovementEntity } from "./entities/inventory-movement.entity.js";
import type {
	InventoryMovementFilters,
	PaginatedResult,
} from "./interfaces/inventory-movement-filters.interface.js";

const VALID_SORT_COLUMNS = new Set(["createdAt", "productName", "quantity"]);
const VALID_SORT_DIRECTIONS = new Set(["ASC", "DESC"]);

/** Shape returned by the Prisma query with select clauses. */
interface MovementQueryRow {
	id: string;
	productId: string;
	type: MovementType;
	quantity: number;
	previousQuantity: number | null;
	newQuantity: number | null;
	reason: string | null;
	referenceId: string | null;
	referenceType: string | null;
	userId: string;
	createdAt: Date;
	product: {
		code: string;
		name: string;
		supplier: { name: string } | null;
	};
	user: {
		fullName: string;
	};
}

@Injectable()
export class InventoryMovementsService {
	constructor(private readonly prisma: PrismaService) {}

	private toEntity(row: MovementQueryRow): InventoryMovementEntity {
		return {
			id: row.id,
			productId: row.productId,
			productCode: row.product.code,
			productName: row.product.name,
			supplierName: row.product.supplier?.name,
			type: row.type,
			quantity: row.quantity,
			previousQuantity: row.previousQuantity,
			newQuantity: row.newQuantity,
			reason: row.reason,
			referenceId: row.referenceId,
			referenceType: row.referenceType,
			userId: row.userId,
			userFullName: row.user.fullName,
			createdAt: row.createdAt,
		};
	}

	private buildWhere(
		filters: InventoryMovementFilters,
	): Prisma.InventoryMovementWhereInput {
		const where: Prisma.InventoryMovementWhereInput = {};

		if (filters.movementType) {
			where.type = filters.movementType;
		}

		if (filters.startDate || filters.endDate) {
			const dateRange: Prisma.DateTimeFilter = {};
			if (filters.startDate) {
				dateRange.gte = new Date(filters.startDate);
			}
			if (filters.endDate) {
				// Include the entire end day, not just midnight
				const end = new Date(filters.endDate);
				end.setHours(23, 59, 59, 999);
				dateRange.lte = end;
			}
			where.createdAt = dateRange;
		}

		if (filters.productId) {
			where.productId = filters.productId;
		}

		if (filters.supplierId) {
			where.product = {
				supplierId: filters.supplierId,
				...(filters.includeInactiveProducts !== true ? { status: true } : {}),
			};
		} else if (filters.includeInactiveProducts !== true) {
			// Default: only show movements for active products
			where.product = { status: true };
		}

		if (filters.createdBy) {
			where.userId = filters.createdBy;
		}

		return where;
	}

	private buildOrderBy(
		filters: InventoryMovementFilters,
	): Prisma.InventoryMovementOrderByWithRelationInput {
		const sortBy = filters.sortBy ?? "createdAt";
		const sortOrder = (filters.sortOrder ?? "desc").toUpperCase();

		if (!VALID_SORT_COLUMNS.has(sortBy)) {
			return { createdAt: "desc" };
		}

		if (!VALID_SORT_DIRECTIONS.has(sortOrder)) {
			return { createdAt: "desc" };
		}

		const direction = sortOrder === "ASC" ? "asc" : "desc";

		if (sortBy === "productName") {
			return { product: { name: direction } };
		}

		return { [sortBy]: direction };
	}

	async findAll(
		filters: InventoryMovementFilters,
		actorId: string,
	): Promise<PaginatedResult<InventoryMovementEntity>> {
		const page = Math.max(1, filters.page ?? 1);
		const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
		const skip = (page - 1) * limit;
		const where = this.buildWhere(filters);
		const orderBy = this.buildOrderBy(filters);

		const [rows, total] = await Promise.all([
			this.prisma.inventoryMovement.findMany({
				where,
				skip,
				take: limit,
				orderBy,
				select: {
					id: true,
					productId: true,
					type: true,
					quantity: true,
					previousQuantity: true,
					newQuantity: true,
					reason: true,
					referenceId: true,
					referenceType: true,
					userId: true,
					createdAt: true,
					product: {
						select: {
							code: true,
							name: true,
							supplier: { select: { name: true } },
						},
					},
					user: { select: { fullName: true } },
				},
			}),
			this.prisma.inventoryMovement.count({ where }),
		]);

		await this.prisma.userAuditLog.create({
			data: {
				userId: actorId,
				actorId,
				action: "INVENTORY_MOVEMENTS_LIST",
				details: {
					filters: {
						movementType: filters.movementType,
						startDate: filters.startDate,
						endDate: filters.endDate,
						productId: filters.productId,
						supplierId: filters.supplierId,
						createdBy: filters.createdBy,
					},
					total,
					page,
					limit,
				},
			},
		});

		return {
			data: rows.map((row) => this.toEntity(row)),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async findOne(id: string, actorId: string): Promise<InventoryMovementEntity> {
		// Enforce active-product default: movements for inactive products are not returned
		const row = await this.prisma.inventoryMovement.findFirst({
			where: {
				id,
				product: { status: true },
			},
			select: {
				id: true,
				productId: true,
				type: true,
				quantity: true,
				previousQuantity: true,
				newQuantity: true,
				reason: true,
				referenceId: true,
				referenceType: true,
				userId: true,
				createdAt: true,
				product: {
					select: {
						code: true,
						name: true,
						supplier: { select: { name: true } },
					},
				},
				user: { select: { fullName: true } },
			},
		});

		if (!row) {
			throw new NotFoundException(
				`Inventory movement with id "${id}" not found.`,
			);
		}

		await this.prisma.userAuditLog.create({
			data: {
				userId: actorId,
				actorId,
				action: "INVENTORY_MOVEMENT_DETAIL",
				details: { movementId: id },
			},
		});

		return this.toEntity(row as MovementQueryRow);
	}
}
