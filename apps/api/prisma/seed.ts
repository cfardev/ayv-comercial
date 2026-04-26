import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import type { RoleName, UserStatus } from "../generated/prisma/client.js";
import { PrismaClient } from "../generated/prisma/client.js";

config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const BCRYPT_ROUNDS = 12;

const ROLES: RoleName[] = [
	"ADMIN",
	"SELLER",
	"INVENTORY_MANAGER",
	"DISPATCH_MANAGER",
	"OWNER_MANAGER",
];

async function main() {
	const password = await bcrypt.hash("admin1234", BCRYPT_ROUNDS);

	for (const roleName of ROLES) {
		await prisma.role.upsert({
			where: { name: roleName },
			update: {},
			create: { name: roleName },
		});
	}

	const role = await prisma.role.findUnique({
		where: { name: "ADMIN" as RoleName },
	});

	if (!role) {
		console.error("ADMIN role not found after creation");
		return;
	}

	const adminExists = await prisma.user.findUnique({
		where: { email: "admin@test.com" },
	});

	if (adminExists) {
		console.log("Superadmin user already exists, skipping...");
		return;
	}

	await prisma.user.create({
		data: {
			fullName: "Admin",
			email: "admin@test.com",
			password,
			status: "ACTIVE" as UserStatus,
			roleId: role.id,
		},
	});

	console.log("Superadmin user created successfully");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
