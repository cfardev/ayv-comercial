export class BrandEntity {
	id!: string;
	name!: string;
	description!: string | null;
	status!: boolean;
	logoUrl!: string | null;
	productCount!: number;
	createdAt!: Date;
	updatedAt!: Date;
}
