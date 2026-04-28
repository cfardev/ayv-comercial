import {
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { PinoLogger } from "nestjs-pino";
import type { UserRole } from "../../generated/prisma/client.js";
import { userRoleToResponse } from "../common/constants/user-role-labels.js";
import { PrismaService } from "../common/prisma/prisma.service.js";
import type { LoginResponseDto } from "./dto/login-response.dto.js";
import { UserPermissionsService } from "./permissions/user-permissions.service.js";

const LOCKOUT_MINUTES = 15;
const MAX_FAILED_ATTEMPTS = 5;

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService,
		private readonly userPermissions: UserPermissionsService,
		private readonly logger: PinoLogger,
	) {
		this.logger.setContext(AuthService.name);
	}

	async validateUser(email: string, password: string, ip: string) {
		const user = await this.prisma.user.findFirst({
			where: {
				email,
			},
		});

		if (!user) {
			this.logger.warn({ email, ip }, "Login failed: user not found");
			await this.prisma.loginAttempt.create({
				data: { ip, success: false },
			});
			throw new UnauthorizedException("Credenciales inválidas");
		}

		if (user.status === "INACTIVE") {
			this.logger.warn(
				{ userId: user.id, ip },
				"Login blocked: inactive account",
			);
			await this.prisma.loginAttempt.create({
				data: { ip, userId: user.id, success: false },
			});
			throw new ForbiddenException("Cuenta inactiva");
		}

		const now = new Date();
		if (user.lockoutUntil && user.lockoutUntil > now) {
			const remaining = Math.ceil(
				(user.lockoutUntil.getTime() - now.getTime()) / 60000,
			);
			this.logger.warn(
				{ userId: user.id, ip, remainingMinutes: remaining },
				"Login blocked: account locked",
			);
			await this.prisma.loginAttempt.create({
				data: { ip, userId: user.id, success: false },
			});
			throw new ForbiddenException(
				`Cuenta bloqueada. Intenta en ${remaining} minutos.`,
			);
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			const newFailedAttempts = user.failedAttempts + 1;
			let lockoutUntil: Date | null = null;

			if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
				lockoutUntil = new Date(now.getTime() + LOCKOUT_MINUTES * 60 * 1000);
			}

			this.logger.warn(
				{
					userId: user.id,
					ip,
					failedAttempts: newFailedAttempts,
					isLocked: lockoutUntil !== null,
				},
				"Login failed: invalid password",
			);

			await this.prisma.user.update({
				where: { id: user.id },
				data: {
					failedAttempts: newFailedAttempts,
					lockoutUntil,
				},
			});
			await this.prisma.loginAttempt.create({
				data: { ip, userId: user.id, success: false },
			});
			throw new UnauthorizedException("Credenciales inválidas");
		}

		if (user.failedAttempts > 0 || user.lockoutUntil) {
			await this.prisma.user.update({
				where: { id: user.id },
				data: {
					failedAttempts: 0,
					lockoutUntil: null,
				},
			});
		}

		this.logger.info({ userId: user.id, ip }, "Credentials validated");

		return user;
	}

	async login(
		user: {
			id: string;
			fullName: string;
			email: string;
			role: UserRole;
		},
		ip: string,
	) {
		await this.prisma.loginAttempt.create({
			data: { ip, userId: user.id, success: true },
		});

		const rolePayload = userRoleToResponse(user.role);

		this.logger.info(
			{ userId: user.id, roleSlug: rolePayload.slug, ip },
			"Login succeeded",
		);

		const permissions = await this.userPermissions.getPermissionNamesForUser(
			user.id,
		);

		const payload = {
			sub: user.id,
			email: user.email,
			roleSlug: rolePayload.slug,
			roleName: rolePayload.slug,
		};
		const accessToken = this.jwtService.sign(payload);

		const response: LoginResponseDto = {
			accessToken,
			expiresIn: 86400,
			user: {
				id: user.id,
				fullName: user.fullName,
				email: user.email,
				role: { name: rolePayload.name, slug: rolePayload.slug },
				permissions,
			},
		};

		return response;
	}

	async getUserById(userId: string) {
		return this.prisma.user.findUnique({
			where: { id: userId },
		});
	}
}
