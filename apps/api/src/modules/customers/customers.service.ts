import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { Prisma } from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { CreateCustomerDto } from "./dto/create-customer.dto.js";
import { UpdateCustomerDto } from "./dto/update-customer.dto.js";
import { CustomerEntity } from "./entities/customer.entity.js";
import type {
	CustomerFilters,
	PaginatedResult,
} from "./interfaces/customer-filters.interface.js";

@Injectable()
export class CustomersService {
	constructor(private readonly prisma: PrismaService) {}

	private toEntity(row: {
		id: string;
		personType: string;
		fullName: string;
		taxId: string;
		address: string | null;
		phone: string | null;
		email: string | null;
		isActive: boolean;
		createdAt: Date;
		updatedAt: Date;
	}): CustomerEntity {
		return {
			id: row.id,
			personType: row.personType as "NATURAL" | "JURIDICA",
			fullName: row.fullName,
			taxId: row.taxId,
			address: row.address,
			phone: row.phone,
			email: row.email,
			isActive: row.isActive,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
		};
	}

	private normalizeOptional(value?: string | null): string | null | undefined {
		if (value === undefined) return undefined;
		if (value === null) return null;
		const trimmed = value.trim();
		return trimmed.length > 0 ? trimmed : null;
	}

	private validateTaxIdFormat(taxId: string, personType: string): void {
		if (personType === "NATURAL" && !/^\d{10}$/.test(taxId)) {
			throw new BadRequestException(
				"La cédula para persona natural debe tener exactamente 10 dígitos.",
			);
		}
		if (personType === "JURIDICA" && !/^\d{13}$/.test(taxId)) {
			throw new BadRequestException(
				"El RUC para persona jurídica debe tener exactamente 13 dígitos.",
			);
		}
	}

	private async assertTaxIdUnique(
		taxId: string,
		excludeId?: string,
	): Promise<void> {
		const existing = await this.prisma.customer.findFirst({
			where: {
				taxId: { equals: taxId, mode: "insensitive" },
				...(excludeId ? { id: { not: excludeId } } : {}),
			},
		});

		if (existing) {
			throw new ConflictException(
				`Ya existe un cliente con la identificación "${taxId}".`,
			);
		}
	}

	async findAll(
		filters: CustomerFilters,
	): Promise<PaginatedResult<CustomerEntity>> {
		const page = Math.max(1, filters.page ?? 1);
		const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
		const skip = (page - 1) * limit;
		const rawIsActive = filters.isActive ?? "true";

		const where: Prisma.CustomerWhereInput = {};

		if (filters.search?.trim()) {
			const term = filters.search.trim();
			where.OR = [
				{ fullName: { contains: term, mode: "insensitive" } },
				{ taxId: { contains: term, mode: "insensitive" } },
				{ email: { contains: term, mode: "insensitive" } },
			];
		}

		if (filters.personType) {
			where.personType = filters.personType as "NATURAL" | "JURIDICA";
		}

		if (rawIsActive !== "ALL") {
			where.isActive = rawIsActive === "true";
		}

		const [rows, total] = await Promise.all([
			this.prisma.customer.findMany({
				where,
				skip,
				take: limit,
				orderBy: { fullName: "asc" },
			}),
			this.prisma.customer.count({ where }),
		]);

		return {
			data: rows.map((row) => this.toEntity(row)),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async findOne(id: string): Promise<CustomerEntity> {
		const customer = await this.prisma.customer.findUnique({ where: { id } });
		if (!customer) {
			throw new NotFoundException(`Cliente con id "${id}" no encontrado.`);
		}

		return this.toEntity(customer);
	}

	async create(
		dto: CreateCustomerDto,
		actorId: string,
	): Promise<CustomerEntity> {
		const fullName = dto.fullName.trim();
		const taxId = dto.taxId.trim();

		this.validateTaxIdFormat(taxId, dto.personType);
		await this.assertTaxIdUnique(taxId);

		const customer = await this.prisma.customer.create({
			data: {
				personType: dto.personType,
				fullName,
				taxId,
				address: this.normalizeOptional(dto.address) ?? null,
				phone: this.normalizeOptional(dto.phone) ?? null,
				email: this.normalizeOptional(dto.email) ?? null,
				isActive: true,
			},
		});

		await this.prisma.userAuditLog.create({
			data: {
				userId: actorId,
				actorId,
				action: "CUSTOMER_CREATED",
				details: { customerId: customer.id, fullName: customer.fullName },
			},
		});

		return this.toEntity(customer);
	}

	async update(
		id: string,
		dto: UpdateCustomerDto,
		actorId: string,
	): Promise<CustomerEntity> {
		const existing = await this.prisma.customer.findUnique({ where: { id } });
		if (!existing) {
			throw new NotFoundException(`Cliente con id "${id}" no encontrado.`);
		}

		const nextPersonType = dto.personType ?? existing.personType;
		const nextTaxId =
			dto.taxId !== undefined ? dto.taxId.trim() : existing.taxId;

		if (dto.taxId !== undefined || dto.personType !== undefined) {
			this.validateTaxIdFormat(nextTaxId, nextPersonType);
		}

		if (dto.taxId !== undefined && nextTaxId !== existing.taxId) {
			await this.assertTaxIdUnique(nextTaxId, id);
		}

		const updated = await this.prisma.customer.update({
			where: { id },
			data: {
				...(dto.personType !== undefined ? { personType: dto.personType } : {}),
				...(dto.fullName !== undefined
					? { fullName: dto.fullName.trim() }
					: {}),
				...(dto.taxId !== undefined ? { taxId: nextTaxId } : {}),
				...(dto.address !== undefined
					? { address: this.normalizeOptional(dto.address) }
					: {}),
				...(dto.phone !== undefined
					? { phone: this.normalizeOptional(dto.phone) }
					: {}),
				...(dto.email !== undefined
					? { email: this.normalizeOptional(dto.email) }
					: {}),
			},
		});

		await this.prisma.userAuditLog.create({
			data: {
				userId: actorId,
				actorId,
				action: "CUSTOMER_UPDATED",
				details: { customerId: id },
			},
		});

		return this.toEntity(updated);
	}

	async deactivate(id: string, actorId: string): Promise<CustomerEntity> {
		const existing = await this.prisma.customer.findUnique({ where: { id } });
		if (!existing) {
			throw new NotFoundException(`Cliente con id "${id}" no encontrado.`);
		}

		if (!existing.isActive) {
			throw new BadRequestException("El cliente ya está inactivo.");
		}

		// Check if customer has associated sales (for warning purposes)
		const salesCount = await this.prisma.sale.count({
			where: { customerId: id },
		});

		const updated = await this.prisma.customer.update({
			where: { id },
			data: { isActive: false },
		});

		await this.prisma.userAuditLog.create({
			data: {
				userId: actorId,
				actorId,
				action: "CUSTOMER_DEACTIVATED",
				details: { customerId: id, salesCount },
			},
		});

		return this.toEntity(updated);
	}

	async activate(id: string, actorId: string): Promise<CustomerEntity> {
		const existing = await this.prisma.customer.findUnique({ where: { id } });
		if (!existing) {
			throw new NotFoundException(`Cliente con id "${id}" no encontrado.`);
		}

		if (existing.isActive) {
			throw new BadRequestException("El cliente ya está activo.");
		}

		const updated = await this.prisma.customer.update({
			where: { id },
			data: { isActive: true },
		});

		await this.prisma.userAuditLog.create({
			data: {
				userId: actorId,
				actorId,
				action: "CUSTOMER_ACTIVATED",
				details: { customerId: id },
			},
		});

		return this.toEntity(updated);
	}
}
