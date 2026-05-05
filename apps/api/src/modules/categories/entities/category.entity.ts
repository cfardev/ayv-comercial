export class CategoryEntity {
	id!: string;
	name!: string;
	description!: string | null;
	status!: boolean;
	productCount!: number;
	createdAt!: Date;
	updatedAt!: Date;
}
