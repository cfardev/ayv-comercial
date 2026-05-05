import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { RequirePermissions } from "../../auth/decorators/require-permissions.decorator.js";
import { PermissionsGuard } from "../../auth/guards/permissions.guard.js";
import { PERMISSION_KEYS } from "../../auth/permissions/permission-keys.js";
import { BrandsService } from "./brands.service.js";
import { ListBrandsDto } from "./dto/list-brands.dto.js";
import type { BrandSummaryEntity } from "./entities/brand-summary.entity.js";

interface AuthenticatedRequest extends Request {
	user: {
		userId: string;
		email: string;
	};
}

@Controller("brands")
@UseGuards(PermissionsGuard)
export class BrandsController {
	constructor(private readonly brandsService: BrandsService) {}

	@Get()
	@RequirePermissions(PERMISSION_KEYS.PRODUCTS_READ)
	async findAll(
		@Query() query: ListBrandsDto,
		@Req() req: AuthenticatedRequest,
	): Promise<BrandSummaryEntity[]> {
		void req;
		return this.brandsService.findAll(query);
	}
}
