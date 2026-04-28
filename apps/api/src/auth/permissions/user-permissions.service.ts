import { Injectable } from "@nestjs/common";
import { UserRole } from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { ALL_PERMISSION_VALUES } from "./permission-keys.js";
import { getPermissionsForRole } from "./role-permissions.map.js";

@Injectable()
export class UserPermissionsService {
	constructor(private readonly prisma: PrismaService) {}

	/** Permission names for the user's current role; empty if user missing or inactive. */
	async getPermissionNamesForUser(userId: string): Promise<string[]> {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { role: true, status: true },
		});

		if (!user || user.status !== "ACTIVE") {
			return [];
		}

		if (user.role === UserRole.ADMIN) {
			return [...ALL_PERMISSION_VALUES];
		}

		return getPermissionsForRole(user.role);
	}
}
