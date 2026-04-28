import type { UserStatus } from "../../../../generated/prisma/client.js";

export class UserEntity {
	id!: string;
	fullName!: string;
	email!: string;
	status!: UserStatus;
	role!: {
		name: string;
		slug: string;
	};
	failedAttempts!: number;
	lockoutUntil!: Date | null;
	createdAt!: Date;
	updatedAt!: Date;
}
