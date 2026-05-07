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
import type { Category } from "../types/api.js";

interface CategoriesTableProps {
	categories: Category[];
	onEdit: (category: Category) => void;
	onDeactivate: (category: Category) => void;
	onReactivate: (category: Category) => void;
	isLoading?: boolean;
}

const COL_COUNT = 5;

function TableHeadRow() {
	return (
		<TableRow>
			<TableHead>Nombre</TableHead>
			<TableHead>Descripción</TableHead>
			<TableHead className="w-[100px]">Productos</TableHead>
			<TableHead className="w-[100px]">Estado</TableHead>
			<TableHead className="w-[140px]">Acciones</TableHead>
		</TableRow>
	);
}

export function CategoriesTable({
	categories,
	onEdit,
	onDeactivate,
	onReactivate,
	isLoading,
}: CategoriesTableProps) {
	if (isLoading) {
		return (
			<div className="overflow-x-auto rounded-md border">
				<Table>
					<TableHeader>
						<TableHeadRow />
					</TableHeader>
					<TableBody>
						{Array.from({ length: 5 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows
							<TableRow key={i}>
								{Array.from({ length: COL_COUNT }).map((__, j) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: skeleton cells
									<TableCell key={j}>
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

	if (categories.length === 0) {
		return (
			<div className="overflow-x-auto rounded-md border">
				<Table>
					<TableHeader>
						<TableHeadRow />
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell
								colSpan={COL_COUNT}
								className="text-center text-muted-foreground py-8"
							>
								No se encontraron categorías.
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
					<TableHeadRow />
				</TableHeader>
				<TableBody>
					{categories.map((category) => (
						<TableRow key={category.id}>
							<TableCell className="font-medium">{category.name}</TableCell>
							<TableCell className="text-muted-foreground max-w-[200px] truncate">
								{category.description ?? "—"}
							</TableCell>
							<TableCell>{category.productCount}</TableCell>
							<TableCell>
								<Badge variant={category.status ? "default" : "destructive"}>
									{category.status ? "Activo" : "Inactivo"}
								</Badge>
							</TableCell>
							<TableCell>
								<div className="flex gap-2">
									<Button
										variant="default"
										size="sm"
										className="cursor-pointer bg-blue-700 text-white hover:bg-blue-800"
										onClick={() => onEdit(category)}
									>
										<IconEdit className="h-4 w-4" />
										Editar
									</Button>
									{category.status ? (
										<Button
											variant="default"
											size="sm"
											className="cursor-pointer bg-red-700 text-white hover:bg-red-800"
											onClick={() => onDeactivate(category)}
										>
											<IconTrash className="h-4 w-4" />
											Eliminar
										</Button>
									) : (
										<Button
											variant="default"
											size="sm"
											className="cursor-pointer bg-green-700 text-white hover:bg-green-800"
											onClick={() => onReactivate(category)}
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
