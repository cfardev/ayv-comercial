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
import type { Brand } from "../hooks/use-brands.js";

interface BrandsTableProps {
	brands: Brand[];
	onEdit: (brand: Brand) => void;
	onDeactivate: (brand: Brand) => void;
	onReactivate: (brand: Brand) => void;
	isLoading?: boolean;
}

const COL_COUNT = 5;

function TableHeadRow() {
	return (
		<TableRow>
			<TableHead className="w-[72px]">Logo</TableHead>
			<TableHead>Nombre</TableHead>
			<TableHead className="w-[100px]">Productos</TableHead>
			<TableHead className="w-[100px]">Estado</TableHead>
			<TableHead className="w-[160px]">Acciones</TableHead>
		</TableRow>
	);
}

export function BrandsTable({
	brands,
	onEdit,
	onDeactivate,
	onReactivate,
	isLoading,
}: BrandsTableProps) {
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

	if (brands.length === 0) {
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
								No se encontraron marcas.
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
					{brands.map((brand) => (
						<TableRow key={brand.id}>
							<TableCell className="w-[72px]">
								{brand.logoUrl ? (
									<img
										src={brand.logoUrl}
										alt=""
										className="size-10 rounded border object-contain"
									/>
								) : (
									<span className="text-muted-foreground text-xs">—</span>
								)}
							</TableCell>
							<TableCell className="font-medium">{brand.name}</TableCell>
							<TableCell>{brand.productCount}</TableCell>
							<TableCell>
								<Badge variant={brand.status ? "default" : "destructive"}>
									{brand.status ? "Activo" : "Inactivo"}
								</Badge>
							</TableCell>
							<TableCell>
								<div className="flex flex-wrap gap-1">
									<Button
										variant="ghost"
										size="icon"
										className="cursor-pointer"
										onClick={() => onEdit(brand)}
										title="Editar"
									>
										<IconEdit className="h-4 w-4" />
									</Button>
									{brand.status ? (
										<Button
											variant="ghost"
											size="sm"
											className="cursor-pointer text-destructive hover:text-destructive"
											onClick={() => onDeactivate(brand)}
											title="Desactivar"
										>
											<IconTrash className="h-4 w-4" />
											Desactivar
										</Button>
									) : (
										<Button
											variant="ghost"
											size="icon"
											className="cursor-pointer text-green-600 hover:text-green-600"
											onClick={() => onReactivate(brand)}
											title="Reactivar"
										>
											<IconRefresh className="h-4 w-4" />
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
