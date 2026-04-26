import { Controller, Get, UseGuards } from "@nestjs/common";
import type { RoleName } from "../../../generated/prisma/client.js";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard.js";
import { RolesGuard } from "../../auth/guards/roles.guard.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";

class RoleDto {
	id: string;
	name: RoleName;
	createdAt: Date;
}

@Controller("roles")
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
	constructor(private readonly prisma: PrismaService) {}

	@Get()
	async findAll(): Promise<RoleDto[]> {
		return this.prisma.role.findMany({
			orderBy: { name: "asc" },
		}) as Promise<RoleDto[]>;
	}
}
