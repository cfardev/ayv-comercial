import { IconEdit, IconRefresh, IconTrash } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { Customer } from "../types/api.js";

interface CustomersTableProps {
	customers: Customer[];
	onEdit: (customer: Customer) => void;
	onDeactivate: (customer: Customer) => void;
	onActivate: (customer: Customer) => void;
	isLoading?: boolean;
}

const COL_COUNT = 7;

function CustomersTableHead() {
	return (
		<TableRow>
			<TableHead>Identificación</TableHead>
			<TableHead>Nombre / Razón social</TableHead>
			<TableHead>Tipo</TableHead>
			<TableHead>Teléfono</TableHead>
			<TableHead>Correo</TableHead>
			<TableHead>Estado</TableHead>
			<TableHead className="w-[200px]">Acciones</TableHead>
		</TableRow>
	);
}

export function CustomersTable({
	customers,
	onEdit,
	onDeactivate,
	onActivate,
	isLoading,
}: CustomersTableProps) {
	if (isLoading) {
		return (
			<div className="overflow-x-auto rounded-md border">
				<Table>
					<TableHeader>
						<CustomersTableHead />
					</TableHeader>
					<TableBody>
						{Array.from({ length: 5 }).map((_, index) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows
							<TableRow key={index}>
								{Array.from({ length: COL_COUNT }).map((__, cellIndex) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: skeleton cells
									<TableCell key={cellIndex}>
										<Skeleton className="h-4 w-full" />
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		);
	}

	if (customers.length === 0) {
		return (
			<div className="overflow-x-auto rounded-md border">
				<Table>
					<TableHeader>
						<CustomersTableHead />
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell
								colSpan={COL_COUNT}
								className="py-8 text-center text-muted-foreground"
							>
								No se encontraron clientes.
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</div>
		);
	}

	return (
		<div className="overflow-x-auto rounded-md border">
			<Table>
				<TableHeader>
					<CustomersTableHead />
				</TableHeader>
				<TableBody>
					{customers.map((customer) => (
						<TableRow key={customer.id}>
							<TableCell className="font-mono text-sm">{customer.taxId}</TableCell>
							<TableCell>
								<div className="flex flex-col gap-1">
									<span className="font-medium">{customer.fullName}</span>
									{customer.email ? (
										<span className="text-sm text-muted-foreground">
											{customer.email}
										</span>
									) : null}
								</div>
							</TableCell>
							<TableCell>
								<Badge variant="outline">
									{customer.personType === "NATURAL"
										? "Natural"
										: "Jurídica"}
								</Badge>
							</TableCell>
							<TableCell>{customer.phone || "—"}</TableCell>
							<TableCell>{customer.email || "—"}</TableCell>
							<TableCell>
								<Badge
									variant={customer.isActive ? "default" : "destructive"}
								>
									{customer.isActive ? "Activo" : "Inactivo"}
								</Badge>
							</TableCell>
							<TableCell>
								<div className="flex gap-2">
									<Button
										variant="default"
										size="sm"
										className="cursor-pointer bg-blue-700 text-white hover:bg-blue-800"
										onClick={() => onEdit(customer)}
									>
										<IconEdit className="h-4 w-4" />
										Editar
									</Button>
									{customer.isActive ? (
										<Button
											variant="default"
											size="sm"
											className="cursor-pointer bg-red-700 text-white hover:bg-red-800"
											onClick={() => onDeactivate(customer)}
										>
											<IconTrash className="h-4 w-4" />
											Desactivar
										</Button>
									) : (
										<Button
											variant="default"
											size="sm"
											className="cursor-pointer bg-green-700 text-white hover:bg-green-800"
											onClick={() => onActivate(customer)}
										>
											<IconRefresh className="h-4 w-4" />
											Activar
										</Button>
									)}
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
