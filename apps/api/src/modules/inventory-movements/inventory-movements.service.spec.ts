import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InventoryMovementsService } from "./inventory-movements.service.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";

/**
 * Minimal mock shape for the Prisma client used by InventoryMovementsService.
 */
function makePrismaMock() {
	return {
		inventoryMovement: {
			findMany: vi.fn(),
			count: vi.fn(),
			findFirst: vi.fn(),
		},
		userAuditLog: {
			create: vi.fn(),
		},
	};
}

describe("InventoryMovementsService", () => {
	let service: InventoryMovementsService;
	let prisma: ReturnType<typeof makePrismaMock>;

	const actorId = "user-1";

	const baseRow = {
		id: "mov-1",
		productId: "prod-1",
		type: "ENTRY" as const,
		quantity: 10,
		previousQuantity: 0,
		newQuantity: 10,
		reason: null,
		referenceId: "ref-1",
		referenceType: "INVENTORY_ENTRY",
		userId: actorId,
		createdAt: new Date("2025-01-15T10:00:00Z"),
		product: {
			code: "PROD-001",
			name: "Product One",
			supplier: { name: "Supplier A" },
		},
		user: { fullName: "Test User" },
	};

	beforeEach(async () => {
		prisma = makePrismaMock();

		const moduleRef: TestingModule = await Test.createTestingModule({
			providers: [
				InventoryMovementsService,
				{ provide: PrismaService, useValue: prisma },
			],
		}).compile();

		service = moduleRef.get(InventoryMovementsService);
		vi.clearAllMocks();
	});

	describe("findAll — date filtering", () => {
		it("endDate includes the whole day (sets time to 23:59:59.999)", async () => {
			prisma.inventoryMovement.findMany.mockResolvedValue([]);
			prisma.inventoryMovement.count.mockResolvedValue(0);
			prisma.userAuditLog.create.mockResolvedValue({});

			await service.findAll(
				{ startDate: "2025-01-01", endDate: "2025-01-15" },
				actorId,
			);

			const whereArg = prisma.inventoryMovement.findMany.mock.calls[0][0].where;

			// endDate should have been extended to end-of-day
			const endDateValue = (whereArg as Record<string, Record<string, Date>>)
				.createdAt.lte;
			expect(endDateValue.getHours()).toBe(23);
			expect(endDateValue.getMinutes()).toBe(59);
			expect(endDateValue.getSeconds()).toBe(59);
			expect(endDateValue.getMilliseconds()).toBe(999);
		});
	});

	describe("findAll — default active-product restriction", () => {
		it("applies status:true when includeInactiveProducts is not set", async () => {
			prisma.inventoryMovement.findMany.mockResolvedValue([]);
			prisma.inventoryMovement.count.mockResolvedValue(0);
			prisma.userAuditLog.create.mockResolvedValue({});

			await service.findAll({}, actorId);

			const whereArg = prisma.inventoryMovement.findMany.mock.calls[0][0].where;
			expect(whereArg).toMatchObject({ product: { status: true } });
		});

		it("applies status:true when includeInactiveProducts is false", async () => {
			prisma.inventoryMovement.findMany.mockResolvedValue([]);
			prisma.inventoryMovement.count.mockResolvedValue(0);
			prisma.userAuditLog.create.mockResolvedValue({});

			await service.findAll({ includeInactiveProducts: false }, actorId);

			const whereArg = prisma.inventoryMovement.findMany.mock.calls[0][0].where;
			expect(whereArg).toMatchObject({ product: { status: true } });
		});

		it("does NOT apply status filter when includeInactiveProducts is true", async () => {
			prisma.inventoryMovement.findMany.mockResolvedValue([]);
			prisma.inventoryMovement.count.mockResolvedValue(0);
			prisma.userAuditLog.create.mockResolvedValue({});

			await service.findAll({ includeInactiveProducts: true }, actorId);

			const whereArg = prisma.inventoryMovement.findMany.mock.calls[0][0].where;
			expect(whereArg).not.toHaveProperty("product.status");
		});
	});

	describe("findAll — audit logging", () => {
		it("creates a userAuditLog entry with INVENTORY_MOVEMENTS_LIST action", async () => {
			prisma.inventoryMovement.findMany.mockResolvedValue([baseRow]);
			prisma.inventoryMovement.count.mockResolvedValue(1);
			prisma.userAuditLog.create.mockResolvedValue({});

			await service.findAll(
				{ movementType: "ENTRY", page: 1, limit: 20 },
				actorId,
			);

			expect(prisma.userAuditLog.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						userId: actorId,
						actorId,
						action: "INVENTORY_MOVEMENTS_LIST",
					}),
				}),
			);
		});
	});

	describe("findOne — active-product enforcement", () => {
		it("only returns movements for active products (status:true in where)", async () => {
			prisma.inventoryMovement.findFirst.mockResolvedValue(baseRow);
			prisma.userAuditLog.create.mockResolvedValue({});

			await service.findOne("mov-1", actorId);

			const whereArg = prisma.inventoryMovement.findFirst.mock.calls[0][0].where;
			expect(whereArg).toMatchObject({ id: "mov-1", product: { status: true } });
		});

		it("throws NotFoundException when movement belongs to inactive product", async () => {
			prisma.inventoryMovement.findFirst.mockResolvedValue(null);
			prisma.userAuditLog.create.mockResolvedValue({});

			await expect(service.findOne("mov-inactive", actorId)).rejects.toThrow(
				'Inventory movement with id "mov-inactive" not found.',
			);
		});

		it("creates a userAuditLog entry with INVENTORY_MOVEMENT_DETAIL action", async () => {
			prisma.inventoryMovement.findFirst.mockResolvedValue(baseRow);
			prisma.userAuditLog.create.mockResolvedValue({});

			await service.findOne("mov-1", actorId);

			expect(prisma.userAuditLog.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						userId: actorId,
						actorId,
						action: "INVENTORY_MOVEMENT_DETAIL",
						details: { movementId: "mov-1" },
					}),
				}),
			);
		});
	});
});
