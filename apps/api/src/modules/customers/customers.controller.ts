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
import { CustomersService } from "./customers.service.js";
import { CreateCustomerDto } from "./dto/create-customer.dto.js";
import { ListCustomersDto } from "./dto/list-customers.dto.js";
import { UpdateCustomerDto } from "./dto/update-customer.dto.js";
import { CustomerEntity } from "./entities/customer.entity.js";
import type {
	CustomerFilters,
	PaginatedResult,
} from "./interfaces/customer-filters.interface.js";

interface AuthenticatedRequest extends Request {
	user: {
		userId: string;
		email: string;
	};
}

@Controller("customers")
@UseGuards(PermissionsGuard)
export class CustomersController {
	constructor(private readonly customersService: CustomersService) {}

	@Get()
	@RequirePermissions(PERMISSION_KEYS.CUSTOMERS_READ)
	async findAll(
		@Query() query: ListCustomersDto,
	): Promise<PaginatedResult<CustomerEntity>> {
		const filters: CustomerFilters = {
			search: query.search,
			personType: query.personType as "NATURAL" | "JURIDICA" | undefined,
			isActive: query.isActive as "true" | "false" | "ALL" | undefined,
			page: query.page ? Number(query.page) : undefined,
			limit: query.limit ? Number(query.limit) : undefined,
		};

		return this.customersService.findAll(filters);
	}

	@Get(":id")
	@RequirePermissions(PERMISSION_KEYS.CUSTOMERS_READ)
	async findOne(@Param("id") id: string): Promise<CustomerEntity> {
		return this.customersService.findOne(id);
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@RequirePermissions(PERMISSION_KEYS.CUSTOMERS_CREATE)
	async create(
		@Body() dto: CreateCustomerDto,
		@Req() req: AuthenticatedRequest,
	): Promise<CustomerEntity> {
		return this.customersService.create(dto, req.user.userId);
	}

	@Patch(":id")
	@RequirePermissions(PERMISSION_KEYS.CUSTOMERS_UPDATE)
	async update(
		@Param("id") id: string,
		@Body() dto: UpdateCustomerDto,
		@Req() req: AuthenticatedRequest,
	): Promise<CustomerEntity> {
		return this.customersService.update(id, dto, req.user.userId);
	}

	@Patch(":id/deactivate")
	@HttpCode(HttpStatus.OK)
	@RequirePermissions(PERMISSION_KEYS.CUSTOMERS_DEACTIVATE)
	async deactivate(
		@Param("id") id: string,
		@Req() req: AuthenticatedRequest,
	): Promise<CustomerEntity> {
		return this.customersService.deactivate(id, req.user.userId);
	}

	@Patch(":id/activate")
	@HttpCode(HttpStatus.OK)
	@RequirePermissions(PERMISSION_KEYS.CUSTOMERS_REACTIVATE)
	async activate(
		@Param("id") id: string,
		@Req() req: AuthenticatedRequest,
	): Promise<CustomerEntity> {
		return this.customersService.activate(id, req.user.userId);
	}
}
