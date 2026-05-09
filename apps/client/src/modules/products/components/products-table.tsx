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
import type { Product } from "../types/api.js";

interface ProductsTableProps {
	products: Product[];
	onEdit: (product: Product) => void;
	onDeactivate: (product: Product) => void;
	onReactivate: (product: Product) => void;
	canEdit: boolean;
	canDeactivate: boolean;
	canReactivate: boolean;
	canViewCost?: boolean;
	isLoading?: boolean;
}

function TableHeadRow({ showCost }: { showCost: boolean }) {
	return (
		<TableRow>
			<TableHead className="w-[72px]">Imagen</TableHead>
			<TableHead>Código</TableHead>
			<TableHead>Nombre</TableHead>
			<TableHead>Categoría</TableHead>
			<TableHead>Marca</TableHead>
			{showCost && <TableHead className="text-right">Costo</TableHead>}
			<TableHead className="text-right">Precio</TableHead>
			<TableHead className="text-right">Stock</TableHead>
			<TableHead className="w-[90px]">Estado</TableHead>
			<TableHead className="w-[140px]">Acciones</TableHead>
		</TableRow>
	);
}

function formatMoney(value: string): string {
	const n = Number(value);
	if (Number.isNaN(n)) return value;
	return new Intl.NumberFormat("es-AR", {
		style: "currency",
		currency: "ARS",
		maximumFractionDigits: 2,
	}).format(n);
}

export function ProductsTable({
	products,
	onEdit,
	onDeactivate,
	onReactivate,
	canEdit,
	canDeactivate,
	canReactivate,
	canViewCost = true,
	isLoading,
}: ProductsTableProps) {
	const colCount = canViewCost ? 10 : 9;

	if (isLoading) {
		return (
			<div className="overflow-x-auto rounded-md border">
				<Table>
					<TableHeader>
						<TableHeadRow showCost={canViewCost} />
					</TableHeader>
					<TableBody>
						{Array.from({ length: 5 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows
							<TableRow key={i}>
								{Array.from({ length: colCount }).map((__, j) => (
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

	if (products.length === 0) {
		return (
			<div className="overflow-x-auto rounded-md border">
				<Table>
					<TableHeader>
						<TableHeadRow showCost={canViewCost} />
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell
								colSpan={colCount}
								className="text-center text-muted-foreground py-8"
							>
								No se encontraron productos.
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
					<TableHeadRow showCost={canViewCost} />
				</TableHeader>
				<TableBody>
					{products.map((product) => {
						const thumb = product.images[0]?.url;
						const isLowStock =
							product.stockCurrent <= product.minimumStock && product.status;
						return (
							<TableRow key={product.id}>
								<TableCell>
									{thumb ? (
										<img
											src={thumb}
											alt=""
											className="size-12 rounded-md object-cover"
										/>
									) : (
										<div className="size-12 rounded-md bg-muted" />
									)}
								</TableCell>
								<TableCell className="font-mono text-sm">
									{product.code}
								</TableCell>
								<TableCell className="font-medium">{product.name}</TableCell>
								<TableCell className="text-muted-foreground">
									{product.categoryName}
								</TableCell>
								<TableCell className="max-w-[160px] truncate text-muted-foreground">
									{product.brandName ?? "—"}
								</TableCell>
								{canViewCost && (
									<TableCell className="text-right tabular-nums">
										{formatMoney(product.cost)}
									</TableCell>
								)}
								<TableCell className="text-right tabular-nums">
									{formatMoney(product.price)}
								</TableCell>
								<TableCell className="text-right tabular-nums">
									{isLowStock ? (
										<Badge variant="destructive">{product.stockCurrent}</Badge>
									) : (
										<span>{product.stockCurrent}</span>
									)}
								</TableCell>
								<TableCell>
									{product.status ? (
										<Badge variant="default">Activo</Badge>
									) : (
										<Badge variant="secondary">Inactivo</Badge>
									)}
								</TableCell>
								<TableCell>
									<div className="flex flex-wrap gap-1">
										{canEdit ? (
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="cursor-pointer"
												onClick={() => onEdit(product)}
												aria-label="Editar"
											>
												<IconEdit className="size-4" />
											</Button>
										) : null}
										{canDeactivate && product.status ? (
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="cursor-pointer text-destructive"
												onClick={() => onDeactivate(product)}
												aria-label="Desactivar"
											>
												<IconTrash className="size-4" />
											</Button>
										) : null}
										{canReactivate && !product.status ? (
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="cursor-pointer"
												onClick={() => onReactivate(product)}
												aria-label="Reactivar"
											>
												<IconRefresh className="size-4" />
											</Button>
										) : null}
									</div>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
