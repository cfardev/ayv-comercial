import {
	type CanActivate,
	type ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator.js";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") implements CanActivate {
	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const reflector = new Reflector();
		const isPublic = reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic) {
			return true;
		}

		return super.canActivate(context);
	}

	handleRequest<TUser = unknown>(err: unknown, user: TUser): TUser {
		if (err || !user) {
			throw err || new UnauthorizedException();
		}
		return user;
	}
}
