import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import {
	Prisma,
	PurchaseOrderStatus,
} from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { CreatePurchaseOrderDto } from "./dto/create-purchase-order.dto.js";
import type { UpdatePurchaseOrderStatusDto } from "./dto/update-purchase-order-status.dto.js";
import type {
	PurchaseOrderEntity,
	PurchaseOrderItemEntity,
} from "./entities/purchase-order.entity.js";
import type {
	PaginatedResult,
	PurchaseOrderFilters,
	PurchaseOrderWithItems,
} from "./interfaces/purchase-order-filters.interface.js";

const DEFAULT_STATUSES: PurchaseOrderStatus[] = [
	PurchaseOrderStatus.PENDING,
	PurchaseOrderStatus.SENT,
];

@Injectable()
export class PurchaseOrdersService {
	constructor(private readonly prisma: PrismaService) {}

	private toNumber(value: Prisma.Decimal): number {
		return Number(value);
	}

	private toEntity(
		row: Prisma.PurchaseOrderGetPayload<{
			include: { supplier: true; items: { include: { product: true } } };
		}>,
	): PurchaseOrderWithItems {
		const items: PurchaseOrderItemEntity[] = row.items.map((item) => ({
			id: item.id,
			productId: item.productId,
			productName: item.product.name,
			quantityOrdered: item.quantityOrdered,
			unitCost: this.toNumber(item.unitCost),
			subtotal: this.toNumber(item.subtotal),
		}));

		return {
			id: row.id,
			supplierId: row.supplierId,
			supplierName: row.supplier.name,
			referenceNumber: row.referenceNumber,
			estimatedReceiptDate: row.estimatedReceiptDate,
			paymentTerms: row.paymentTerms,
			notes: row.notes,
			status: row.status,
			totalEstimated: this.toNumber(row.totalEstimated),
			createdBy: row.createdBy,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
			items,
		};
	}

	private getAllowedTransitions(
		status: PurchaseOrderStatus,
	): PurchaseOrderStatus[] {
		switch (status) {
			case PurchaseOrderStatus.PENDING:
				return [PurchaseOrderStatus.SENT, PurchaseOrderStatus.CANCELLED];
			case PurchaseOrderStatus.SENT:
				return [
					PurchaseOrderStatus.PARTIAL,
					PurchaseOrderStatus.RECEIVED,
					PurchaseOrderStatus.CANCELLED,
				];
			case PurchaseOrderStatus.PARTIAL:
				return [PurchaseOrderStatus.RECEIVED];
			case PurchaseOrderStatus.RECEIVED:
			case PurchaseOrderStatus.CANCELLED:
				return [];
			default:
				return [];
		}
	}

	private buildWhere(
		filters: PurchaseOrderFilters,
	): Prisma.PurchaseOrderWhereInput {
		const where: Prisma.PurchaseOrderWhereInput = {};

		if (filters.search?.trim()) {
			const term = filters.search.trim();
			where.OR = [
				{ referenceNumber: { contains: term, mode: "insensitive" } },
				{ supplier: { name: { contains: term, mode: "insensitive" } } },
			];
		}

		where.status = {
			in: filters.status?.length ? filters.status : DEFAULT_STATUSES,
		};

		if (filters.fromDate || filters.toDate) {
			where.createdAt = {
				...(filters.fromDate ? { gte: new Date(filters.fromDate) } : {}),
				...(filters.toDate ? { lte: new Date(filters.toDate) } : {}),
			};
		}

		return where;
	}

	private async generateReferenceNumber(): Promise<string> {
		const year = new Date().getFullYear();
		const prefix = `PO-${year}-`;
		const count = await this.prisma.purchaseOrder.count({
			where: { referenceNumber: { startsWith: prefix } },
		});
		return `${prefix}${String(count + 1).padStart(6, "0")}`;
	}

	async findAll(
		filters: PurchaseOrderFilters,
	): Promise<PaginatedResult<PurchaseOrderEntity>> {
		const page = Math.max(1, filters.page ?? 1);
		const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
		const skip = (page - 1) * limit;
		const where = this.buildWhere(filters);

		const [rows, total] = await Promise.all([
			this.prisma.purchaseOrder.findMany({
				where,
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
				include: {
					supplier: true,
					items: { include: { product: true } },
				},
			}),
			this.prisma.purchaseOrder.count({ where }),
		]);

		return {
			data: rows.map((row) => this.toEntity(row)),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async findOne(id: string): Promise<PurchaseOrderWithItems> {
		const row = await this.prisma.purchaseOrder.findUnique({
			where: { id },
			include: {
				supplier: true,
				items: { include: { product: true } },
			},
		});

		if (!row) {
			throw new NotFoundException(`Purchase order with id "${id}" not found.`);
		}

		return this.toEntity(row);
	}

	async create(
		dto: CreatePurchaseOrderDto,
		actorId: string,
	): Promise<PurchaseOrderWithItems> {
		const supplier = await this.prisma.supplier.findUnique({
			where: { id: dto.supplierId },
		});

		if (!supplier?.status) {
			throw new BadRequestException(
				"Selected supplier is invalid or inactive.",
			);
		}

		const productIds = [...new Set(dto.items.map((item) => item.productId))];
		const products = await this.prisma.product.findMany({
			where: {
				id: { in: productIds },
				status: true,
				supplierId: dto.supplierId,
			},
		});

		if (products.length !== productIds.length) {
			throw new BadRequestException(
				"Some products are invalid, inactive, or not associated with selected supplier.",
			);
		}

		for (const item of dto.items) {
			if (item.quantityOrdered <= 0) {
				throw new BadRequestException(
					"Item quantity must be greater than zero.",
				);
			}
		}

		const referenceNumber = await this.generateReferenceNumber();
		const totalEstimated = dto.items.reduce(
			(acc, item) => acc + item.quantityOrdered * item.unitCost,
			0,
		);

		const order = await this.prisma.purchaseOrder.create({
			data: {
				supplierId: dto.supplierId,
				referenceNumber,
				estimatedReceiptDate: dto.estimatedReceiptDate
					? new Date(dto.estimatedReceiptDate)
					: null,
				paymentTerms: dto.paymentTerms?.trim() || null,
				notes: dto.notes?.trim() || null,
				status: PurchaseOrderStatus.PENDING,
				totalEstimated,
				createdBy: actorId,
				items: {
					create: dto.items.map((item) => ({
						productId: item.productId,
						quantityOrdered: item.quantityOrdered,
						unitCost: item.unitCost,
						subtotal: item.quantityOrdered * item.unitCost,
					})),
				},
			},
			include: {
				supplier: true,
				items: { include: { product: true } },
			},
		});

		await this.prisma.userAuditLog.create({
			data: {
				userId: actorId,
				actorId,
				action: "PURCHASE_ORDER_CREATED",
				details: { purchaseOrderId: order.id, referenceNumber },
			},
		});

		return this.toEntity(order);
	}

	async updateStatus(
		id: string,
		dto: UpdatePurchaseOrderStatusDto,
		actorId: string,
	): Promise<PurchaseOrderWithItems> {
		const current = await this.prisma.purchaseOrder.findUnique({
			where: { id },
		});
		if (!current) {
			throw new NotFoundException(`Purchase order with id "${id}" not found.`);
		}

		const allowed = this.getAllowedTransitions(current.status);
		if (!allowed.includes(dto.status)) {
			throw new BadRequestException(
				`Invalid status transition from ${current.status} to ${dto.status}.`,
			);
		}

		await this.prisma.purchaseOrder.update({
			where: { id },
			data: { status: dto.status, notes: dto.notes?.trim() || current.notes },
		});

		await this.prisma.userAuditLog.create({
			data: {
				userId: actorId,
				actorId,
				action: "PURCHASE_ORDER_STATUS_UPDATED",
				details: {
					purchaseOrderId: id,
					fromStatus: current.status,
					toStatus: dto.status,
					notes: dto.notes ?? null,
				},
			},
		});

		return this.findOne(id);
	}

	async findProductsBySupplier(
		supplierId: string,
	): Promise<Array<{ id: string; name: string; cost: number }>> {
		const supplier = await this.prisma.supplier.findUnique({
			where: { id: supplierId },
		});
		if (!supplier?.status) {
			throw new NotFoundException("Active supplier not found.");
		}

		const products = await this.prisma.product.findMany({
			where: { status: true, supplierId },
			select: { id: true, name: true, cost: true },
			orderBy: { name: "asc" },
		});

		return products.map((product) => ({
			id: product.id,
			name: product.name,
			cost: this.toNumber(product.cost),
		}));
	}
}
