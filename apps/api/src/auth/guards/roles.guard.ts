import {
	type CanActivate,
	type ExecutionContext,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";
import type { Request } from "express";

interface AuthenticatedRequest extends Request {
	user: {
		userId: string;
		email: string;
		roleName: string;
	};
}

@Injectable()
export class RolesGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
		const user = request.user;

		if (!user || user.roleName !== "ADMIN") {
			throw new ForbiddenException(
				"Solo administradores pueden realizar esta acción",
			);
		}

		return true;
	}
}
