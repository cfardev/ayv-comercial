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
import type { CreateInventoryEntryDto } from "./dto/create-inventory-entry.dto.js";
import type {
	InventoryEntryEntity,
	InventoryEntryItemEntity,
} from "./entities/inventory-entry.entity.js";
import type {
	InventoryEntryFilters,
	InventoryEntryWithItems,
	PaginatedResult,
} from "./interfaces/inventory-entry-filters.interface.js";

const MAX_ENTRY_NUMBER_RETRIES = 5;

@Injectable()
export class InventoryEntriesService {
	constructor(private readonly prisma: PrismaService) {}

	private toItemEntity(
		item: Prisma.InventoryEntryItemGetPayload<{ include: { product: true } }>,
	): InventoryEntryItemEntity {
		return {
			id: item.id,
			productId: item.productId,
			productName: item.product.name,
			productCode: item.product.code,
			quantityReceived: item.quantityReceived,
			lotNumber: item.lotNumber,
			expirationDate: item.expirationDate,
		};
	}

	private toEntity(
		row: Prisma.InventoryEntryGetPayload<{
			include: {
				purchaseOrder: { include: { supplier: true } };
				creator: true;
				items: { include: { product: true } };
			};
		}>,
	): InventoryEntryWithItems {
		const items: InventoryEntryItemEntity[] = row.items.map((item) =>
			this.toItemEntity(item),
		);

		return {
			id: row.id,
			entryNumber: row.entryNumber,
			purchaseOrderId: row.purchaseOrderId,
			referenceNumber: row.purchaseOrder.referenceNumber,
			supplierName: row.purchaseOrder.supplier.name,
			entryDate: row.entryDate,
			notes: row.notes,
			createdBy: row.createdBy,
			creatorName: row.creator.fullName,
			createdAt: row.createdAt,
			items,
		};
	}

	private toListEntity(
		row: Prisma.InventoryEntryGetPayload<{
			include: {
				purchaseOrder: { include: { supplier: true } };
				creator: true;
			};
		}>,
	): InventoryEntryEntity {
		return {
			id: row.id,
			entryNumber: row.entryNumber,
			purchaseOrderId: row.purchaseOrderId,
			referenceNumber: row.purchaseOrder.referenceNumber,
			supplierName: row.purchaseOrder.supplier.name,
			entryDate: row.entryDate,
			notes: row.notes,
			createdBy: row.createdBy,
			creatorName: row.creator.fullName,
			createdAt: row.createdAt,
			items: [],
		};
	}

	private async generateEntryNumber(): Promise<string> {
		const year = new Date().getFullYear();
		const prefix = `IE-${year}-`;
		const count = await this.prisma.inventoryEntry.count({
			where: { entryNumber: { startsWith: prefix } },
		});
		return `${prefix}${String(count + 1).padStart(6, "0")}`;
	}

	private isUniqueEntryNumberError(error: unknown): boolean {
		if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
			return false;
		}
		if (error.code !== "P2002") {
			return false;
		}
		const target = error.meta?.target;
		if (Array.isArray(target)) {
			return target.includes("entry_number") || target.includes("entryNumber");
		}
		return false;
	}

	private buildWhere(
		filters: InventoryEntryFilters,
	): Prisma.InventoryEntryWhereInput {
		const where: Prisma.InventoryEntryWhereInput = {};

		if (filters.search?.trim()) {
			const term = filters.search.trim();
			where.OR = [
				{ entryNumber: { contains: term, mode: "insensitive" } },
				{
					purchaseOrder: {
						referenceNumber: { contains: term, mode: "insensitive" },
					},
				},
				{
					purchaseOrder: {
						supplier: { name: { contains: term, mode: "insensitive" } },
					},
				},
			];
		}

		if (filters.fromDate || filters.toDate) {
			where.entryDate = {
				...(filters.fromDate ? { gte: new Date(filters.fromDate) } : {}),
				...(filters.toDate ? { lte: new Date(filters.toDate) } : {}),
			};
		}

		return where;
	}

	async findAll(
		filters: InventoryEntryFilters,
	): Promise<PaginatedResult<InventoryEntryEntity>> {
		const page = Math.max(1, filters.page ?? 1);
		const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
		const skip = (page - 1) * limit;
		const where = this.buildWhere(filters);

		const [rows, total] = await Promise.all([
			this.prisma.inventoryEntry.findMany({
				where,
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
				include: {
					purchaseOrder: { include: { supplier: true } },
					creator: true,
				},
			}),
			this.prisma.inventoryEntry.count({ where }),
		]);

		return {
			data: rows.map((row) => this.toListEntity(row)),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async findOne(id: string): Promise<InventoryEntryWithItems> {
		const row = await this.prisma.inventoryEntry.findUnique({
			where: { id },
			include: {
				purchaseOrder: { include: { supplier: true } },
				creator: true,
				items: { include: { product: true } },
			},
		});

		if (!row) {
			throw new NotFoundException(`Inventory entry with id "${id}" not found.`);
		}

		return this.toEntity(row);
	}

	async create(
		dto: CreateInventoryEntryDto,
		actorId: string,
	): Promise<InventoryEntryWithItems> {
		// Validate purchase order exists and is in SENT or PARTIAL status
		const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
			where: { id: dto.purchaseOrderId },
			include: { items: { include: { product: true } } },
		});

		if (!purchaseOrder) {
			throw new NotFoundException(
				`Purchase order with id "${dto.purchaseOrderId}" not found.`,
			);
		}

		if (
			purchaseOrder.status !== PurchaseOrderStatus.SENT &&
			purchaseOrder.status !== PurchaseOrderStatus.PARTIAL
		) {
			throw new BadRequestException(
				`La orden de compra debe estar en estado enviada o parcial. Estado actual: ${purchaseOrder.status}`,
			);
		}

		if (purchaseOrder.items.length === 0) {
			throw new BadRequestException(
				"No es posible registrar la entrada: la orden de compra no tiene productos.",
			);
		}

		// Validate all items reference valid, active products
		const productIds = [...new Set(dto.items.map((item) => item.productId))];
		const products = await this.prisma.product.findMany({
			where: { id: { in: productIds }, status: true },
		});

		if (products.length !== productIds.length) {
			throw new BadRequestException(
				"Algunos productos son invalidos o no estan activos.",
			);
		}

		// Validate quantities > 0
		for (const item of dto.items) {
			if (item.quantityReceived <= 0) {
				throw new BadRequestException(
					"La cantidad recibida de cada item debe ser mayor a cero.",
				);
			}
		}

		// Build a map of PO items by productId for stock calculation
		const poItemMap = new Map<string, { quantityOrdered: number }>();
		for (const poItem of purchaseOrder.items) {
			poItemMap.set(poItem.productId, {
				quantityOrdered: poItem.quantityOrdered,
			});
		}

		// Validate every item productId belongs to the selected purchase order
		for (const item of dto.items) {
			if (!poItemMap.has(item.productId)) {
				throw new BadRequestException(
					`El producto con id "${item.productId}" no pertenece a la orden de compra seleccionada.`,
				);
			}
		}

		// Generate unique entry number
		let entryNumber = "";
		let entry: Prisma.InventoryEntryGetPayload<{
			include: {
				purchaseOrder: { include: { supplier: true } };
				creator: true;
				items: { include: { product: true } };
			};
		}> | null = null;

		for (let attempt = 0; attempt < MAX_ENTRY_NUMBER_RETRIES; attempt += 1) {
			entryNumber = await this.generateEntryNumber();
			try {
				// Execute everything in a transaction
				entry = await this.prisma.$transaction(async (tx) => {
					// 1. Create the inventory entry with items
					const createdEntry = await tx.inventoryEntry.create({
						data: {
							entryNumber,
							purchaseOrderId: dto.purchaseOrderId,
							entryDate: dto.entryDate ? new Date(dto.entryDate) : new Date(),
							notes: dto.notes?.trim() || null,
							createdBy: actorId,
							items: {
								create: dto.items.map((item) => ({
									productId: item.productId,
									quantityReceived: item.quantityReceived,
									lotNumber: item.lotNumber?.trim() || null,
									expirationDate: item.expirationDate
										? new Date(item.expirationDate)
										: null,
								})),
							},
						},
						include: {
							purchaseOrder: { include: { supplier: true } },
							creator: true,
							items: { include: { product: true } },
						},
					});

					// 2. Update stock and create movements for each item
					for (const item of dto.items) {
						// Get current stock from Inventory table (using default location)
						const inventoryRecord = await tx.inventory.findUnique({
							where: {
								productId_location: {
									productId: item.productId,
									location: "default",
								},
							},
						});

						const previousStock = inventoryRecord?.quantity ?? 0;
						const newStock = previousStock + item.quantityReceived;

						// Upsert inventory record
						await tx.inventory.upsert({
							where: {
								productId_location: {
									productId: item.productId,
									location: "default",
								},
							},
							create: {
								productId: item.productId,
								quantity: newStock,
								location: "default",
							},
							update: {
								quantity: newStock,
							},
						});

						// Create inventory movement
						await tx.inventoryMovement.create({
							data: {
								productId: item.productId,
								type: "ENTRY",
								quantity: item.quantityReceived,
								previousQuantity: previousStock,
								newQuantity: newStock,
								reason: `Entrada ${entryNumber}`,
								referenceId: createdEntry.id,
								referenceType: "INVENTORY_ENTRY",
								userId: actorId,
							},
						});
					}

					// 3. Calculate total received per product across ALL entries for this PO
					// (including this new entry) to determine PO status
					const allEntries = await tx.inventoryEntry.findMany({
						where: { purchaseOrderId: dto.purchaseOrderId },
						include: { items: true },
					});

					const totalReceivedMap = new Map<string, number>();
					for (const entry of allEntries) {
						for (const entryItem of entry.items) {
							const current = totalReceivedMap.get(entryItem.productId) ?? 0;
							totalReceivedMap.set(
								entryItem.productId,
								current + entryItem.quantityReceived,
							);
						}
					}

					// Determine new PO status
					let newStatus: PurchaseOrderStatus = purchaseOrder.status;
					let allReceived = true;
					let anyReceived = false;

					for (const poItem of purchaseOrder.items) {
						const received = totalReceivedMap.get(poItem.productId) ?? 0;
						if (received > 0) {
							anyReceived = true;
						}
						if (received < poItem.quantityOrdered) {
							allReceived = false;
						}
					}

					if (allReceived && anyReceived) {
						newStatus = PurchaseOrderStatus.RECEIVED;
					} else if (anyReceived) {
						newStatus = PurchaseOrderStatus.PARTIAL;
					}

					// Update PO status if changed
					if (newStatus !== purchaseOrder.status) {
						await tx.purchaseOrder.update({
							where: { id: dto.purchaseOrderId },
							data: { status: newStatus },
						});
					}

					// 4. Create audit log
					await tx.userAuditLog.create({
						data: {
							userId: actorId,
							actorId,
							action: "INVENTORY_ENTRY_CREATED",
							details: {
								inventoryEntryId: createdEntry.id,
								entryNumber,
								purchaseOrderId: dto.purchaseOrderId,
							},
						},
					});

					return createdEntry;
				});

				break;
			} catch (error) {
				if (!this.isUniqueEntryNumberError(error)) {
					throw error;
				}
			}
		}

		if (!entry) {
			throw new BadRequestException(
				"No fue posible generar un numero de entrada unico. Intenta nuevamente.",
			);
		}

		return this.toEntity(entry);
	}
}
