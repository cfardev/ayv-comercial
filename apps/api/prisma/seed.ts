import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import type { RoleName, UserStatus } from "../generated/prisma/client.js";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const BCRYPT_ROUNDS = 12;

async function main() {
	const password = await bcrypt.hash("admin1234", BCRYPT_ROUNDS);

	const role = await prisma.role.upsert({
		where: { name: "ADMIN" as RoleName },
		update: {},
		create: { name: "ADMIN" as RoleName },
	});

	const adminExists = await prisma.user.findUnique({
		where: { email: "admin@test.com" },
	});

	if (adminExists) {
		console.log("Superadmin user already exists, skipping...");
		return;
	}

	await prisma.user.create({
		data: {
			name: "Admin",
			email: "admin@test.com",
			username: "admin",
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
