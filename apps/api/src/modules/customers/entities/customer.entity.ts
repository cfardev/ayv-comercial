export class CustomerEntity {
	id!: string;
	personType!: "NATURAL" | "JURIDICA";
	fullName!: string;
	taxId!: string;
	address!: string | null;
	phone!: string | null;
	email!: string | null;
	isActive!: boolean;
	createdAt!: Date;
	updatedAt!: Date;
}
