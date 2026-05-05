import { Injectable } from "@nestjs/common";
import { Prisma } from "../../../generated/prisma/client.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { ListBrandsDto } from "./dto/list-brands.dto.js";
import type { BrandSummaryEntity } from "./entities/brand-summary.entity.js";

const DEFAULT_LIMIT = 50;

@Injectable()
export class BrandsService {
	constructor(private readonly prisma: PrismaService) {}

	async findAll(query: ListBrandsDto): Promise<BrandSummaryEntity[]> {
		const limit = Math.min(100, Math.max(1, query.limit ?? DEFAULT_LIMIT));

		const where: Prisma.BrandWhereInput = {};
		if (query.search?.trim()) {
			where.name = {
				contains: query.search.trim(),
				mode: "insensitive",
			};
		}

		const rows = await this.prisma.brand.findMany({
			where,
			orderBy: { name: "asc" },
			take: limit,
			select: { id: true, name: true },
		});

		return rows.map((row) => ({ id: row.id, name: row.name }));
	}
}
