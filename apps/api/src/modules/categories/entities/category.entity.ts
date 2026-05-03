export class CategoryEntity {
	id!: string;
	name!: string;
	description!: string | null;
	status!: boolean;
	parentId!: string | null;
	depth!: number;
	productCount!: number;
	childrenCount!: number;
	parent!: { id: string; name: string } | null;
	createdAt!: Date;
	updatedAt!: Date;
}
