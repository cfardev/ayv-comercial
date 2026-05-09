export class SupplierEntity {
	id!: string;
	name!: string;
	taxId!: string;
	contactName!: string | null;
	phone!: string | null;
	email!: string | null;
	address!: string | null;
	commercialConditions!: string | null;
	status!: boolean;
	createdAt!: Date;
	updatedAt!: Date;
}
