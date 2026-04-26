import type {
	RoleName,
	UserStatus,
} from "../../../../generated/prisma/client.js";

export class UserEntity {
	id: string;
	name: string;
	email: string;
	status: UserStatus;
	role: {
		id: string;
		name: RoleName;
	};
	failedAttempts: number;
	lockoutUntil: Date | null;
	createdAt: Date;
	updatedAt: Date;
}
