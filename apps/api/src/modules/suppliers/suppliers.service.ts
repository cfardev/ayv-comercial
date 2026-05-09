import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { Prisma } from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { CreateSupplierDto } from "./dto/create-supplier.dto.js";
import type { UpdateSupplierDto } from "./dto/update-supplier.dto.js";
import type { SupplierEntity } from "./entities/supplier.entity.js";
import type {
	PaginatedResult,
	SupplierFilters,
} from "./interfaces/supplier-filters.interface.js";

@Injectable()
export class SuppliersService {
	constructor(private readonly prisma: PrismaService) {}

	private toEntity(row: {
		id: string;
		name: string;
		taxId: string;
		contactName: string | null;
		phone: string | null;
		email: string | null;
		address: string | null;
		commercialConditions: string | null;
		status: boolean;
		createdAt: Date;
		updatedAt: Date;
	}): SupplierEntity {
		return {
			id: row.id,
			name: row.name,
			taxId: row.taxId,
			contactName: row.contactName,
			phone: row.phone,
			email: row.email,
			address: row.address,
			commercialConditions: row.commercialConditions,
			status: row.status,
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

	private async assertNameUnique(
		name: string,
		excludeId?: string,
	): Promise<void> {
		const existing = await this.prisma.supplier.findFirst({
			where: {
				name: { equals: name, mode: "insensitive" },
				...(excludeId ? { id: { not: excludeId } } : {}),
			},
		});

		if (existing) {
			throw new ConflictException(
				`Ya existe un proveedor con el nombre "${name}".`,
			);
		}
	}

	private async assertTaxIdUnique(
		taxId: string,
		excludeId?: string,
	): Promise<void> {
		const existing = await this.prisma.supplier.findFirst({
			where: {
				taxId: { equals: taxId, mode: "insensitive" },
				...(excludeId ? { id: { not: excludeId } } : {}),
			},
		});

		if (existing) {
			throw new ConflictException(
				`Ya existe un proveedor con el documento fiscal "${taxId}".`,
			);
		}
	}

	async findAll(
		filters: SupplierFilters,
	): Promise<PaginatedResult<SupplierEntity>> {
		const page = Math.max(1, filters.page ?? 1);
		const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
		const skip = (page - 1) * limit;
		const rawStatus = filters.status ?? "true";

		const where: Prisma.SupplierWhereInput = {};

		if (filters.search?.trim()) {
			const term = filters.search.trim();
			where.OR = [
				{ name: { contains: term, mode: "insensitive" } },
				{ taxId: { contains: term, mode: "insensitive" } },
				{ contactName: { contains: term, mode: "insensitive" } },
				{ email: { contains: term, mode: "insensitive" } },
				{ phone: { contains: term, mode: "insensitive" } },
			];
		}

		if (rawStatus !== "ALL") {
			where.status = rawStatus === "true";
		}

		const [rows, total] = await Promise.all([
			this.prisma.supplier.findMany({
				where,
				skip,
				take: limit,
				orderBy: { name: "asc" },
			}),
			this.prisma.supplier.count({ where }),
		]);

		return {
			data: rows.map((row) => this.toEntity(row)),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async findOne(id: string): Promise<SupplierEntity> {
		const supplier = await this.prisma.supplier.findUnique({ where: { id } });
		if (!supplier) {
			throw new NotFoundException(`Proveedor con id "${id}" no encontrado.`);
		}

		return this.toEntity(supplier);
	}

	async create(
		dto: CreateSupplierDto,
		actorId: string,
	): Promise<SupplierEntity> {
		const name = dto.name.trim();
		const taxId = dto.taxId.trim();

		await this.assertNameUnique(name);
		await this.assertTaxIdUnique(taxId);

		const supplier = await this.prisma.supplier.create({
			data: {
				name,
				taxId,
				contactName: this.normalizeOptional(dto.contactName) ?? null,
				phone: this.normalizeOptional(dto.phone) ?? null,
				email: this.normalizeOptional(dto.email) ?? null,
				address: this.normalizeOptional(dto.address) ?? null,
				commercialConditions:
					this.normalizeOptional(dto.commercialConditions) ?? null,
				status: true,
			},
		});

		await this.prisma.userAuditLog.create({
			data: {
				userId: actorId,
				actorId,
				action: "SUPPLIER_CREATED",
				details: { supplierId: supplier.id, name: supplier.name },
			},
		});

		return this.toEntity(supplier);
	}

	async update(
		id: string,
		dto: UpdateSupplierDto,
		actorId: string,
	): Promise<SupplierEntity> {
		const existing = await this.prisma.supplier.findUnique({ where: { id } });
		if (!existing) {
			throw new NotFoundException(`Proveedor con id "${id}" no encontrado.`);
		}

		const nextName = dto.name !== undefined ? dto.name.trim() : existing.name;
		const nextTaxId =
			dto.taxId !== undefined ? dto.taxId.trim() : existing.taxId;

		if (dto.name !== undefined && nextName !== existing.name) {
			await this.assertNameUnique(nextName, id);
		}

		if (dto.taxId !== undefined && nextTaxId !== existing.taxId) {
			await this.assertTaxIdUnique(nextTaxId, id);
		}

		const updated = await this.prisma.supplier.update({
			where: { id },
			data: {
				...(dto.name !== undefined ? { name: nextName } : {}),
				...(dto.taxId !== undefined ? { taxId: nextTaxId } : {}),
				...(dto.contactName !== undefined
					? { contactName: this.normalizeOptional(dto.contactName) }
					: {}),
				...(dto.phone !== undefined
					? { phone: this.normalizeOptional(dto.phone) }
					: {}),
				...(dto.email !== undefined
					? { email: this.normalizeOptional(dto.email) }
					: {}),
				...(dto.address !== undefined
					? { address: this.normalizeOptional(dto.address) }
					: {}),
				...(dto.commercialConditions !== undefined
					? {
							commercialConditions: this.normalizeOptional(
								dto.commercialConditions,
							),
						}
					: {}),
			},
		});

		await this.prisma.userAuditLog.create({
			data: {
				userId: actorId,
				actorId,
				action: "SUPPLIER_UPDATED",
				details: { supplierId: id },
			},
		});

		return this.toEntity(updated);
	}

	async deactivate(id: string, actorId: string): Promise<SupplierEntity> {
		const existing = await this.prisma.supplier.findUnique({ where: { id } });
		if (!existing) {
			throw new NotFoundException(`Proveedor con id "${id}" no encontrado.`);
		}

		if (!existing.status) {
			throw new BadRequestException("El proveedor ya está inactivo.");
		}

		const updated = await this.prisma.supplier.update({
			where: { id },
			data: { status: false },
		});

		await this.prisma.userAuditLog.create({
			data: {
				userId: actorId,
				actorId,
				action: "SUPPLIER_DEACTIVATED",
				details: { supplierId: id },
			},
		});

		return this.toEntity(updated);
	}

	async reactivate(id: string, actorId: string): Promise<SupplierEntity> {
		const existing = await this.prisma.supplier.findUnique({ where: { id } });
		if (!existing) {
			throw new NotFoundException(`Proveedor con id "${id}" no encontrado.`);
		}

		if (existing.status) {
			throw new BadRequestException("El proveedor ya está activo.");
		}

		const updated = await this.prisma.supplier.update({
			where: { id },
			data: { status: true },
		});

		await this.prisma.userAuditLog.create({
			data: {
				userId: actorId,
				actorId,
				action: "SUPPLIER_REACTIVATED",
				details: { supplierId: id },
			},
		});

		return this.toEntity(updated);
	}
}
