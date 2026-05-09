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
import type { Supplier } from "../types/api.js";

interface SuppliersTableProps {
	suppliers: Supplier[];
	onEdit: (supplier: Supplier) => void;
	onDeactivate: (supplier: Supplier) => void;
	onReactivate: (supplier: Supplier) => void;
	isLoading?: boolean;
}

const COL_COUNT = 6;

function SuppliersTableHead() {
	return (
		<TableRow>
			<TableHead>Proveedor</TableHead>
			<TableHead>Documento</TableHead>
			<TableHead>Contacto</TableHead>
			<TableHead>Teléfono</TableHead>
			<TableHead>Estado</TableHead>
			<TableHead className="w-[200px]">Acciones</TableHead>
		</TableRow>
	);
}

export function SuppliersTable({
	suppliers,
	onEdit,
	onDeactivate,
	onReactivate,
	isLoading,
}: SuppliersTableProps) {
	if (isLoading) {
		return (
			<div className="overflow-x-auto rounded-md border">
				<Table>
					<TableHeader>
						<SuppliersTableHead />
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

	if (suppliers.length === 0) {
		return (
			<div className="overflow-x-auto rounded-md border">
				<Table>
					<TableHeader>
						<SuppliersTableHead />
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell
								colSpan={COL_COUNT}
								className="py-8 text-center text-muted-foreground"
							>
								No se encontraron proveedores.
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
					<SuppliersTableHead />
				</TableHeader>
				<TableBody>
					{suppliers.map((supplier) => (
						<TableRow key={supplier.id}>
							<TableCell>
								<div className="flex flex-col gap-1">
									<span className="font-medium">{supplier.name}</span>
									{supplier.email ? (
										<span className="text-sm text-muted-foreground">
											{supplier.email}
										</span>
									) : null}
								</div>
							</TableCell>
							<TableCell>{supplier.taxId}</TableCell>
							<TableCell>{supplier.contactName || "—"}</TableCell>
							<TableCell>{supplier.phone || "—"}</TableCell>
							<TableCell>
								<Badge variant={supplier.status ? "default" : "destructive"}>
									{supplier.status ? "Activo" : "Inactivo"}
								</Badge>
							</TableCell>
							<TableCell>
								<div className="flex gap-2">
									<Button
										variant="default"
										size="sm"
										className="cursor-pointer bg-blue-700 text-white hover:bg-blue-800"
										onClick={() => onEdit(supplier)}
									>
										<IconEdit className="h-4 w-4" />
										Editar
									</Button>
									{supplier.status ? (
										<Button
											variant="default"
											size="sm"
											className="cursor-pointer bg-red-700 text-white hover:bg-red-800"
											onClick={() => onDeactivate(supplier)}
										>
											<IconTrash className="h-4 w-4" />
											Desactivar
										</Button>
									) : (
										<Button
											variant="default"
											size="sm"
											className="cursor-pointer bg-green-700 text-white hover:bg-green-800"
											onClick={() => onReactivate(supplier)}
										>
											<IconRefresh className="h-4 w-4" />
											Reactivar
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
