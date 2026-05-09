import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
	Query,
	Req,
	UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import type { UserRole } from "../../../generated/prisma/client.js";
import { RequirePermissions } from "../../auth/decorators/require-permissions.decorator.js";
import { PermissionsGuard } from "../../auth/guards/permissions.guard.js";
import { PERMISSION_KEYS } from "../../auth/permissions/permission-keys.js";
import { getPermissionsForRole } from "../../auth/permissions/role-permissions.map.js";
import {
	CreateProductDto,
	ListProductsDto,
	UpdateProductDto,
} from "./dto/index.js";
import type { ProductEntity } from "./entities/product.entity.js";
import type {
	PaginatedResult,
	ProductFilters,
} from "./interfaces/product-filters.interface.js";
import { ProductsService } from "./products.service.js";

interface AuthenticatedRequest extends Request {
	user: {
		userId: string;
		email: string;
		roleSlug: string;
	};
}

@Controller("products")
@UseGuards(PermissionsGuard)
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	/** Check if request user can view cost fields based on role permissions. */
	private canViewCost(req: AuthenticatedRequest): boolean {
		const role = req.user?.roleSlug as UserRole | undefined;
		if (!role) return false;
		const perms = getPermissionsForRole(role);
		return perms.includes(PERMISSION_KEYS.PRODUCTS_UPDATE);
	}

	/** Remove cost from product entity if user lacks cost visibility. */
	private stripCost<T extends Partial<ProductEntity>>(entity: T): T {
		const { cost: _, ...rest } = entity;
		return { ...rest, cost: undefined } as T;
	}

	@Get()
	@RequirePermissions(PERMISSION_KEYS.PRODUCTS_READ)
	async findAll(
		@Query() query: ListProductsDto,
		@Req() req: AuthenticatedRequest,
	): Promise<PaginatedResult<ProductEntity>> {
		const filters: ProductFilters = {
			search: query.search,
			status: query.status as ProductFilters["status"],
			categoryId: query.categoryId,
			brandId: query.brandId,
			page: query.page ? Number(query.page) : undefined,
			limit: query.limit ? Number(query.limit) : undefined,
		};

		if (query.minPrice !== undefined && query.minPrice !== "") {
			const n = Number(query.minPrice);
			if (!Number.isNaN(n)) filters.minPrice = n;
		}
		if (query.maxPrice !== undefined && query.maxPrice !== "") {
			const n = Number(query.maxPrice);
			if (!Number.isNaN(n)) filters.maxPrice = n;
		}

		const result = await this.productsService.findAll(filters);

		if (!this.canViewCost(req)) {
			return {
				...result,
				data: result.data.map((p) => this.stripCost(p)),
			};
		}

		return result;
	}

	@Get(":id")
	@RequirePermissions(PERMISSION_KEYS.PRODUCTS_READ)
	async findOne(
		@Param("id") id: string,
		@Req() req: AuthenticatedRequest,
	): Promise<ProductEntity> {
		const product = await this.productsService.findOne(id);
		if (!this.canViewCost(req)) {
			return this.stripCost(product);
		}
		return product;
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@RequirePermissions(PERMISSION_KEYS.PRODUCTS_CREATE)
	async create(
		@Body() dto: CreateProductDto,
		@Req() req: AuthenticatedRequest,
	): Promise<ProductEntity> {
		return this.productsService.create(dto, req.user.userId);
	}

	@Patch(":id")
	@RequirePermissions(PERMISSION_KEYS.PRODUCTS_UPDATE)
	async update(
		@Param("id") id: string,
		@Body() dto: UpdateProductDto,
		@Req() req: AuthenticatedRequest,
	): Promise<ProductEntity> {
		return this.productsService.update(id, dto, req.user.userId);
	}

	@Get(":id/deactivation-info")
	@RequirePermissions(PERMISSION_KEYS.PRODUCTS_READ)
	async getDeactivationInfo(
		@Param("id") id: string,
	): Promise<{ productName: string; salesCount: number }> {
		return this.productsService.getDeactivationInfo(id);
	}

	@Post(":id/deactivate")
	@HttpCode(HttpStatus.OK)
	@RequirePermissions(PERMISSION_KEYS.PRODUCTS_DEACTIVATE)
	async deactivate(
		@Param("id") id: string,
		@Req() req: AuthenticatedRequest,
	): Promise<{ product: ProductEntity; salesCount: number }> {
		return this.productsService.deactivate(id, req.user.userId);
	}

	@Post(":id/reactivate")
	@HttpCode(HttpStatus.OK)
	@RequirePermissions(PERMISSION_KEYS.PRODUCTS_REACTIVATE)
	async reactivate(
		@Param("id") id: string,
		@Req() req: AuthenticatedRequest,
	): Promise<ProductEntity> {
		return this.productsService.reactivate(id, req.user.userId);
	}
}
