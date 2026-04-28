import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import {
	PrismaClient,
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
			role: UserRole.ADMIN,
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
