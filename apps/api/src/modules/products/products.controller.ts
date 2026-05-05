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
import { RequirePermissions } from "../../auth/decorators/require-permissions.decorator.js";
import { PermissionsGuard } from "../../auth/guards/permissions.guard.js";
import { PERMISSION_KEYS } from "../../auth/permissions/permission-keys.js";
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
	};
}

@Controller("products")
@UseGuards(PermissionsGuard)
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@Get()
	@RequirePermissions(PERMISSION_KEYS.PRODUCTS_READ)
	async findAll(
		@Query() query: ListProductsDto,
		@Req() req: AuthenticatedRequest,
	): Promise<PaginatedResult<ProductEntity>> {
		void req;

		const filters: ProductFilters = {
			search: query.search,
			status: query.status as ProductFilters["status"],
			categoryId: query.categoryId,
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

		return this.productsService.findAll(filters);
	}

	@Get(":id")
	@RequirePermissions(PERMISSION_KEYS.PRODUCTS_READ)
	async findOne(@Param("id") id: string): Promise<ProductEntity> {
		return this.productsService.findOne(id);
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

	@Post(":id/deactivate")
	@HttpCode(HttpStatus.OK)
	@RequirePermissions(PERMISSION_KEYS.PRODUCTS_DEACTIVATE)
	async deactivate(
		@Param("id") id: string,
		@Req() req: AuthenticatedRequest,
	): Promise<ProductEntity> {
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
