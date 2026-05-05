import {
	type CanActivate,
	type ExecutionContext,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { PERMISSIONS_KEY } from "../decorators/require-permissions.decorator.js";
import type { PermissionKey } from "../permissions/permission-keys.js";
import { UserPermissionsService } from "../permissions/user-permissions.service.js";
import { isUploadThingHookRequest } from "../utils/is-uploadthing-hook-request.js";

interface AuthedRequest extends Request {
	user: {
		userId: string;
		email: string;
		roleSlug: string;
		roleName: string;
	};
}

@Injectable()
export class PermissionsGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly userPermissions: UserPermissionsService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<AuthedRequest>();
		if (isUploadThingHookRequest(request.headers)) {
			return true;
		}

		const required = this.reflector.getAllAndOverride<PermissionKey[]>(
			PERMISSIONS_KEY,
			[context.getHandler(), context.getClass()],
		);

		if (!required?.length) {
			return true;
		}
		const userId = request.user?.userId;
		if (!userId) {
			throw new ForbiddenException("No autorizado");
		}

		const granted =
			await this.userPermissions.getPermissionNamesForUser(userId);
		const hasAll = required.every((p) => granted.includes(p));

		if (!hasAll) {
			throw new ForbiddenException(
				"No tienes permisos suficientes para esta acción",
			);
		}

		return true;
	}
}
