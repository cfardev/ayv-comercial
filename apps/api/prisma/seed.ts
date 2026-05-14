import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import {
	InvoiceStatus,
	MovementType,
	OrderStatus,
	PersonType,
	PrismaClient,
	PurchaseOrderStatus,
	UserRole,
	type UserStatus,
} from "../generated/prisma/client.js";

config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const BCRYPT_ROUNDS = 12;

async function main() {
	const password = await bcrypt.hash("admin1234", BCRYPT_ROUNDS);
	const sellerPassword = await bcrypt.hash("seller1234", BCRYPT_ROUNDS);
	const inventoryPassword = await bcrypt.hash("inventory1234", BCRYPT_ROUNDS);

	// Check if seed has already been run
	const existingAdmin = await prisma.user.findUnique({
		where: { email: "admin@test.com" },
	});

	if (existingAdmin) {
		console.log("Seed already ran — admin user exists, skipping...");
		return;
	}

	// ── Users ──────────────────────────────────────────────────────────────
	const admin = await prisma.user.create({
		data: {
			fullName: "Admin User",
			email: "admin@test.com",
			password,
			status: "ACTIVE" as UserStatus,
			role: UserRole.ADMIN,
		},
	});

	const seller = await prisma.user.create({
		data: {
			fullName: "Juan Vendedor",
			email: "seller@test.com",
			password: sellerPassword,
			status: "ACTIVE" as UserStatus,
			role: UserRole.SELLER,
		},
	});

	const seller2 = await prisma.user.create({
		data: {
			fullName: "María Vendedora",
			email: "seller2@test.com",
			password: sellerPassword,
			status: "ACTIVE" as UserStatus,
			role: UserRole.SELLER,
		},
	});

	const inventoryManager = await prisma.user.create({
		data: {
			fullName: "Carlos Inventario",
			email: "inventory@test.com",
			password: inventoryPassword,
			status: "ACTIVE" as UserStatus,
			role: UserRole.INVENTORY_MANAGER,
		},
	});

	console.log("Users created");

	// ── Categories ─────────────────────────────────────────────────────────
	const categories = await Promise.all([
		prisma.category.create({
			data: {
				name: "Refrigeradores",
				description: "Refrigeradores y heladeras",
			},
		}),
		prisma.category.create({
			data: { name: "Lavadoras", description: "Lavadoras y secadoras" },
		}),
		prisma.category.create({
			data: { name: "Cocinas", description: "Cocinas y hornos" },
		}),
		prisma.category.create({
			data: {
				name: "Climatización",
				description: "Aires acondicionados y ventiladores",
			},
		}),
		prisma.category.create({
			data: {
				name: "Pequeños Electrodomésticos",
				description: "Licuadoras, tostadoras, etc.",
			},
		}),
		prisma.category.create({
			data: { name: "Televisores", description: "Smart TVs y monitores" },
		}),
		prisma.category.create({
			data: { name: "Microondas", description: "Hornos microondas" },
		}),
	]);

	console.log("Categories created");

	// ── Brands ─────────────────────────────────────────────────────────────
	const brands = await Promise.all([
		prisma.brand.create({ data: { name: "Samsung" } }),
		prisma.brand.create({ data: { name: "LG" } }),
		prisma.brand.create({ data: { name: "Whirlpool" } }),
		prisma.brand.create({ data: { name: "Bosch" } }),
		prisma.brand.create({ data: { name: "Electrolux" } }),
		prisma.brand.create({ data: { name: "Mabe" } }),
		prisma.brand.create({ data: { name: "Patrick" } }),
	]);

	console.log("Brands created");

	// ── Suppliers ──────────────────────────────────────────────────────────
	const suppliers = await Promise.all([
		prisma.supplier.create({
			data: {
				name: "Distribuidora Norte SRL",
				taxId: "30-12345678-9",
				contactName: "Roberto García",
				phone: "+54 11 4567-8901",
				email: "ventas@distnorte.com",
				address: "Av. Industrial 1234, Buenos Aires",
			},
		}),
		prisma.supplier.create({
			data: {
				name: "ElectroMayor SA",
				taxId: "30-87654321-0",
				contactName: "Ana López",
				phone: "+54 11 5678-9012",
				email: "pedidos@electromayor.com",
				address: "Calle Comercio 567, Córdoba",
			},
		}),
		prisma.supplier.create({
			data: {
				name: "Importadora del Sur",
				taxId: "30-11223344-5",
				contactName: "Martín Rodríguez",
				phone: "+54 11 6789-0123",
				email: "info@importsur.com",
				address: "Zona Franca 890, Tierra del Fuego",
			},
		}),
	]);

	console.log("Suppliers created");

	// ── Products ───────────────────────────────────────────────────────────
	const products = await Promise.all([
		prisma.product.create({
			data: {
				code: "REF-SAM-001",
				name: "Refrigerador Samsung RT38 382L No Frost",
				description:
					"Refrigerador Samsung de 382 litros con sistema No Frost y freezer superior",
				cost: 450000,
				price: 650000,
				categoryId: categories[0].id,
				brandId: brands[0].id,
				supplierId: suppliers[0].id,
				unitOfMeasure: "unidad",
				minimumStock: 5,
			},
		}),
		prisma.product.create({
			data: {
				code: "REF-LG-002",
				name: "Heladera LG Top Freezer 420L",
				description: "Heladera LG de 420 litros con dispensador de agua",
				cost: 480000,
				price: 720000,
				categoryId: categories[0].id,
				brandId: brands[1].id,
				supplierId: suppliers[1].id,
				unitOfMeasure: "unidad",
				minimumStock: 3,
			},
		}),
		prisma.product.create({
			data: {
				code: "LAV-SAM-003",
				name: "Lavadora Samsung WA15 15kg",
				description: "Lavadora Samsung de 15 kg con tecnología Eco Bubble",
				cost: 380000,
				price: 550000,
				categoryId: categories[1].id,
				brandId: brands[0].id,
				supplierId: suppliers[0].id,
				unitOfMeasure: "unidad",
				minimumStock: 4,
			},
		}),
		prisma.product.create({
			data: {
				code: "LAV-WHP-004",
				name: "Lavadora Whirlpool 12kg",
				description: "Lavadora Whirlpool de 12 kg con ciclo rápido",
				cost: 320000,
				price: 480000,
				categoryId: categories[1].id,
				brandId: brands[2].id,
				supplierId: suppliers[2].id,
				unitOfMeasure: "unidad",
				minimumStock: 5,
			},
		}),
		prisma.product.create({
			data: {
				code: "COC-BOS-005",
				name: "Cocina Bosch 60cm 4 quemadores",
				description:
					"Cocina a gas Bosch de 60 cm con 4 quemadores y horno eléctrico",
				cost: 290000,
				price: 420000,
				categoryId: categories[2].id,
				brandId: brands[3].id,
				supplierId: suppliers[1].id,
				unitOfMeasure: "unidad",
				minimumStock: 3,
			},
		}),
		prisma.product.create({
			data: {
				code: "CLI-SAM-006",
				name: "Aire Acondicionado Samsung Split 3200W",
				description: "Aire acondicionado split Samsung de 3200W frío/calor",
				cost: 520000,
				price: 780000,
				categoryId: categories[3].id,
				brandId: brands[0].id,
				supplierId: suppliers[0].id,
				unitOfMeasure: "unidad",
				minimumStock: 2,
			},
		}),
		prisma.product.create({
			data: {
				code: "CLI-LG-007",
				name: "Aire Acondicionado LG Dual Inverter 4500W",
				description: "Aire acondicionado LG Dual Inverter de 4500W con WiFi",
				cost: 680000,
				price: 950000,
				categoryId: categories[3].id,
				brandId: brands[1].id,
				supplierId: suppliers[1].id,
				unitOfMeasure: "unidad",
				minimumStock: 2,
			},
		}),
		prisma.product.create({
			data: {
				code: "PEQ-PAT-008",
				name: "Licuadora Patrick 3 velocidades",
				description:
					"Licuadora Patrick de 1.5L con 3 velocidades y vaso de vidrio",
				cost: 25000,
				price: 45000,
				categoryId: categories[4].id,
				brandId: brands[6].id,
				supplierId: suppliers[2].id,
				unitOfMeasure: "unidad",
				minimumStock: 20,
			},
		}),
		prisma.product.create({
			data: {
				code: "PEQ-ELE-009",
				name: "Tostadora Electrolux 2 ranuras",
				description: "Tostadora Electrolux de acero inoxidable con 2 ranuras",
				cost: 18000,
				price: 32000,
				categoryId: categories[4].id,
				brandId: brands[4].id,
				supplierId: suppliers[2].id,
				unitOfMeasure: "unidad",
				minimumStock: 25,
			},
		}),
		prisma.product.create({
			data: {
				code: "TV-SAM-010",
				name: 'Smart TV Samsung 55" 4K UHD',
				description:
					"Smart TV Samsung de 55 pulgadas con resolución 4K y Tizen OS",
				cost: 420000,
				price: 620000,
				categoryId: categories[5].id,
				brandId: brands[0].id,
				supplierId: suppliers[0].id,
				unitOfMeasure: "unidad",
				minimumStock: 5,
			},
		}),
		prisma.product.create({
			data: {
				code: "MIC-SAM-011",
				name: "Microondas Samsung 23L",
				description: "Microondas Samsung de 23 litros con grill",
				cost: 85000,
				price: 130000,
				categoryId: categories[6].id,
				brandId: brands[0].id,
				supplierId: suppliers[0].id,
				unitOfMeasure: "unidad",
				minimumStock: 10,
			},
		}),
		prisma.product.create({
			data: {
				code: "TV-LG-012",
				name: 'Smart TV LG 50" 4K NanoCell',
				description:
					"Smart TV LG de 50 pulgadas con tecnología NanoCell y webOS",
				cost: 390000,
				price: 580000,
				categoryId: categories[5].id,
				brandId: brands[1].id,
				supplierId: suppliers[1].id,
				unitOfMeasure: "unidad",
				minimumStock: 4,
			},
		}),
	]);

	console.log("Products created");

	// ── Inventory ──────────────────────────────────────────────────────────
	const _inventoryEntries = await Promise.all([
		prisma.inventory.create({
			data: {
				productId: products[0].id,
				quantity: 25,
				location: "Depósito A - Estante 1",
			},
		}),
		prisma.inventory.create({
			data: {
				productId: products[1].id,
				quantity: 18,
				location: "Depósito A - Estante 2",
			},
		}),
		prisma.inventory.create({
			data: {
				productId: products[2].id,
				quantity: 30,
				location: "Depósito B - Estante 1",
			},
		}),
		prisma.inventory.create({
			data: {
				productId: products[3].id,
				quantity: 22,
				location: "Depósito B - Estante 2",
			},
		}),
		prisma.inventory.create({
			data: {
				productId: products[4].id,
				quantity: 15,
				location: "Depósito C - Estante 1",
			},
		}),
		prisma.inventory.create({
			data: {
				productId: products[5].id,
				quantity: 10,
				location: "Depósito A - Estante 3",
			},
		}),
		prisma.inventory.create({
			data: {
				productId: products[6].id,
				quantity: 8,
				location: "Depósito A - Estante 4",
			},
		}),
		prisma.inventory.create({
			data: {
				productId: products[7].id,
				quantity: 50,
				location: "Depósito D - Estante 1",
			},
		}),
		prisma.inventory.create({
			data: {
				productId: products[8].id,
				quantity: 60,
				location: "Depósito D - Estante 2",
			},
		}),
		prisma.inventory.create({
			data: {
				productId: products[9].id,
				quantity: 20,
				location: "Depósito E - Estante 1",
			},
		}),
		prisma.inventory.create({
			data: {
				productId: products[10].id,
				quantity: 35,
				location: "Depósito D - Estante 3",
			},
		}),
		prisma.inventory.create({
			data: {
				productId: products[11].id,
				quantity: 12,
				location: "Depósito E - Estante 2",
			},
		}),
	]);

	console.log("Inventory created");

	// ── Inventory Movements ────────────────────────────────────────────────
	await Promise.all([
		prisma.inventoryMovement.create({
			data: {
				productId: products[0].id,
				type: MovementType.ENTRY,
				quantity: 30,
				previousQuantity: 0,
				newQuantity: 30,
				reason: "Recepción inicial de stock",
				userId: inventoryManager.id,
			},
		}),
		prisma.inventoryMovement.create({
			data: {
				productId: products[0].id,
				type: MovementType.EXIT,
				quantity: 5,
				previousQuantity: 30,
				newQuantity: 25,
				reason: "Venta #1",
				referenceId: "sale-001",
				referenceType: "SALE",
				userId: inventoryManager.id,
			},
		}),
		prisma.inventoryMovement.create({
			data: {
				productId: products[2].id,
				type: MovementType.ENTRY,
				quantity: 35,
				previousQuantity: 0,
				newQuantity: 35,
				reason: "Recepción inicial de stock",
				userId: inventoryManager.id,
			},
		}),
		prisma.inventoryMovement.create({
			data: {
				productId: products[2].id,
				type: MovementType.EXIT,
				quantity: 5,
				previousQuantity: 35,
				newQuantity: 30,
				reason: "Venta #2",
				referenceId: "sale-002",
				referenceType: "SALE",
				userId: inventoryManager.id,
			},
		}),
		prisma.inventoryMovement.create({
			data: {
				productId: products[7].id,
				type: MovementType.ADJUSTMENT,
				quantity: -5,
				previousQuantity: 55,
				newQuantity: 50,
				reason: "Ajuste por inventario físico — unidades dañadas",
				userId: inventoryManager.id,
			},
		}),
	]);

	console.log("Inventory movements created");

	// ── Customers ──────────────────────────────────────────────────────────
	const customers = await Promise.all([
		prisma.customer.create({
			data: {
				personType: PersonType.NATURAL,
				fullName: "Carlos Fernández",
				taxId: "20-12345678-9",
				address: "Av. San Martín 456, Rosario",
				phone: "+54 341 555-1234",
				email: "carlos.fernandez@email.com",
			},
		}),
		prisma.customer.create({
			data: {
				personType: PersonType.NATURAL,
				fullName: "Laura Gómez",
				taxId: "27-23456789-0",
				address: "Calle Belgrano 789, Mendoza",
				phone: "+54 261 555-5678",
				email: "laura.gomez@email.com",
			},
		}),
		prisma.customer.create({
			data: {
				personType: PersonType.JURIDICA,
				fullName: "ElectroHogar SRL",
				taxId: "30-34567890-1",
				address: "Av. Corrientes 1234, CABA",
				phone: "+54 11 5555-9012",
				email: "compras@electrohogar.com",
			},
		}),
		prisma.customer.create({
			data: {
				personType: PersonType.NATURAL,
				fullName: "Diego Martínez",
				taxId: "20-45678901-2",
				address: "Bv. Oroño 321, Rosario",
				phone: "+54 341 555-3456",
				email: "diego.martinez@email.com",
			},
		}),
		prisma.customer.create({
			data: {
				personType: PersonType.JURIDICA,
				fullName: "Hotel Mar del Plata SA",
				taxId: "30-56789012-3",
				address: "Av. Colón 567, Mar del Plata",
				phone: "+54 223 555-7890",
				email: "admin@hotelmardelplata.com",
			},
		}),
	]);

	console.log("Customers created");

	// ── Sales ──────────────────────────────────────────────────────────────
	const sale1 = await prisma.sale.create({
		data: {
			total: 650000,
			customerId: customers[0].id,
			sellerId: seller.id,
			items: {
				create: {
					productId: products[0].id,
					quantity: 1,
					unitPrice: 650000,
					subtotal: 650000,
				},
			},
		},
	});

	const sale2 = await prisma.sale.create({
		data: {
			total: 1100000,
			customerId: customers[2].id,
			sellerId: seller.id,
			items: {
				createMany: {
					data: [
						{
							productId: products[2].id,
							quantity: 2,
							unitPrice: 550000,
							subtotal: 1100000,
						},
					],
				},
			},
		},
	});

	const sale3 = await prisma.sale.create({
		data: {
			total: 1715000,
			customerId: customers[4].id,
			sellerId: seller2.id,
			items: {
				createMany: {
					data: [
						{
							productId: products[1].id,
							quantity: 1,
							unitPrice: 720000,
							subtotal: 720000,
						},
						{
							productId: products[5].id,
							quantity: 1,
							unitPrice: 780000,
							subtotal: 780000,
						},
						{
							productId: products[8].id,
							quantity: 5,
							unitPrice: 32000,
							subtotal: 160000,
						},
						{
							productId: products[7].id,
							quantity: 1,
							unitPrice: 45000,
							subtotal: 45000,
						},
					],
				},
			},
		},
	});

	const sale4 = await prisma.sale.create({
		data: {
			total: 1200000,
			customerId: customers[1].id,
			sellerId: seller2.id,
			items: {
				createMany: {
					data: [
						{
							productId: products[9].id,
							quantity: 1,
							unitPrice: 620000,
							subtotal: 620000,
						},
						{
							productId: products[11].id,
							quantity: 1,
							unitPrice: 580000,
							subtotal: 580000,
						},
					],
				},
			},
		},
	});

	console.log("Sales created");

	// ── Invoices ───────────────────────────────────────────────────────────
	await Promise.all([
		prisma.invoice.create({
			data: {
				number: "A-0001-00000001",
				saleId: sale1.id,
				status: InvoiceStatus.ACTIVE,
			},
		}),
		prisma.invoice.create({
			data: {
				number: "A-0001-00000002",
				saleId: sale2.id,
				status: InvoiceStatus.ACTIVE,
			},
		}),
		prisma.invoice.create({
			data: {
				number: "A-0001-00000003",
				saleId: sale3.id,
				status: InvoiceStatus.ACTIVE,
			},
		}),
		prisma.invoice.create({
			data: {
				number: "A-0001-00000004",
				saleId: sale4.id,
				status: InvoiceStatus.ACTIVE,
			},
		}),
	]);

	console.log("Invoices created");

	// ── Orders ─────────────────────────────────────────────────────────────
	const order1 = await prisma.order.create({
		data: {
			customerId: customers[0].id,
			total: 650000,
			status: OrderStatus.DELIVERED,
		},
	});

	const _order2 = await prisma.order.create({
		data: {
			customerId: customers[2].id,
			total: 1100000,
			status: OrderStatus.IN_PREPARATION,
		},
	});

	const order3 = await prisma.order.create({
		data: {
			customerId: customers[4].id,
			total: 1715000,
			status: OrderStatus.READY,
		},
	});

	const _order4 = await prisma.order.create({
		data: {
			customerId: customers[3].id,
			total: 420000,
			status: OrderStatus.PENDING,
		},
	});

	console.log("Orders created");

	// ── Dispatch Orders ────────────────────────────────────────────────────
	await Promise.all([
		prisma.dispatchOrder.create({
			data: {
				orderId: order1.id,
				destination: "Av. San Martín 456, Rosario",
				packages: 1,
				carrier: "Correo Argentino",
				departureDate: new Date("2025-01-10"),
			},
		}),
		prisma.dispatchOrder.create({
			data: {
				orderId: order3.id,
				destination: "Av. Colón 567, Mar del Plata",
				packages: 4,
				carrier: "Andreani",
			},
		}),
	]);

	console.log("Dispatch orders created");

	// ── Purchase Orders ────────────────────────────────────────────────────
	const po1 = await prisma.purchaseOrder.create({
		data: {
			supplierId: suppliers[0].id,
			referenceNumber: "PO-2025-001",
			estimatedReceiptDate: new Date("2025-02-15"),
			paymentTerms: "Neto 30 días",
			notes: "Reposición de stock — línea Samsung",
			status: PurchaseOrderStatus.RECEIVED,
			totalEstimated: 4500000,
			createdBy: admin.id,
			items: {
				createMany: {
					data: [
						{
							productId: products[0].id,
							quantityOrdered: 10,
							unitCost: 450000,
							subtotal: 4500000,
						},
					],
				},
			},
		},
	});

	const _po2 = await prisma.purchaseOrder.create({
		data: {
			supplierId: suppliers[1].id,
			referenceNumber: "PO-2025-002",
			estimatedReceiptDate: new Date("2025-03-01"),
			paymentTerms: "50% anticipo, 50% contra entrega",
			notes: "Pedido de aires acondicionados — temporada verano",
			status: PurchaseOrderStatus.SENT,
			totalEstimated: 3400000,
			createdBy: admin.id,
			items: {
				createMany: {
					data: [
						{
							productId: products[5].id,
							quantityOrdered: 5,
							unitCost: 520000,
							subtotal: 2600000,
						},
						{
							productId: products[6].id,
							quantityOrdered: 1,
							unitCost: 680000,
							subtotal: 680000,
						},
						{
							productId: products[10].id,
							quantityOrdered: 1,
							unitCost: 85000,
							subtotal: 85000,
						},
					],
				},
			},
		},
	});

	const _po3 = await prisma.purchaseOrder.create({
		data: {
			supplierId: suppliers[2].id,
			referenceNumber: "PO-2025-003",
			estimatedReceiptDate: new Date("2025-03-20"),
			paymentTerms: "Neto 60 días",
			notes: "Pequeños electrodomésticos — reposición",
			status: PurchaseOrderStatus.PENDING,
			totalEstimated: 860000,
			createdBy: admin.id,
			items: {
				createMany: {
					data: [
						{
							productId: products[7].id,
							quantityOrdered: 20,
							unitCost: 25000,
							subtotal: 500000,
						},
						{
							productId: products[8].id,
							quantityOrdered: 20,
							unitCost: 18000,
							subtotal: 360000,
						},
					],
				},
			},
		},
	});

	console.log("Purchase orders created");

	// ── Inventory Entry (linked to PO1) ────────────────────────────────────
	const _inventoryEntry = await prisma.inventoryEntry.create({
		data: {
			entryNumber: "ENT-2025-001",
			purchaseOrderId: po1.id,
			notes: "Recepción completa de PO-2025-001",
			createdBy: inventoryManager.id,
			items: {
				create: {
					productId: products[0].id,
					quantityReceived: 10,
					lotNumber: "LOT-SAM-2025-001",
				},
			},
		},
	});

	console.log("Inventory entry created");

	// ── Price History ──────────────────────────────────────────────────────
	await Promise.all([
		prisma.priceHistory.create({
			data: {
				productId: products[0].id,
				previousCost: 420000,
				newCost: 450000,
				previousSalePrice: 620000,
				newSalePrice: 650000,
				justification: "Ajuste por aumento del proveedor Samsung",
				changedBy: admin.id,
			},
		}),
		prisma.priceHistory.create({
			data: {
				productId: products[9].id,
				previousCost: 400000,
				newCost: 420000,
				previousSalePrice: 590000,
				newSalePrice: 620000,
				justification: "Ajuste trimestral por inflación",
				changedBy: admin.id,
			},
		}),
	]);

	console.log("Price history created");

	// ── Login Attempts ─────────────────────────────────────────────────────
	await Promise.all([
		prisma.loginAttempt.create({
			data: {
				ip: "192.168.1.100",
				userId: admin.id,
				success: true,
			},
		}),
		prisma.loginAttempt.create({
			data: {
				ip: "192.168.1.101",
				userId: seller.id,
				success: true,
			},
		}),
		prisma.loginAttempt.create({
			data: {
				ip: "10.0.0.50",
				success: false,
			},
		}),
	]);

	console.log("Login attempts created");

	// ── Audit Logs ─────────────────────────────────────────────────────────
	await Promise.all([
		prisma.userAuditLog.create({
			data: {
				userId: admin.id,
				actorId: admin.id,
				action: "USER_CREATED",
				details: { targetRole: "SELLER", email: "seller@test.com" },
			},
		}),
		prisma.userAuditLog.create({
			data: {
				userId: seller.id,
				actorId: admin.id,
				action: "SALE_CREATED",
				details: { saleId: sale1.id, total: 650000 },
			},
		}),
		prisma.userAuditLog.create({
			data: {
				userId: inventoryManager.id,
				actorId: inventoryManager.id,
				action: "INVENTORY_ADJUSTMENT",
				details: { productId: products[7].id, adjustment: -5 },
			},
		}),
	]);

	console.log("Audit logs created");

	console.log("\nSeed completed successfully!");
	console.log("\nTest credentials:");
	console.log("  Admin:     admin@test.com / admin1234");
	console.log("  Seller:    seller@test.com / seller1234");
	console.log("  Seller 2:  seller2@test.com / seller1234");
	console.log("  Inventory: inventory@test.com / inventory1234");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
