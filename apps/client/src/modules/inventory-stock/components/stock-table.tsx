import {
	IconArrowDown,
	IconArrowsSort,
	IconArrowUp,
} from "@tabler/icons-react";
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
import type { StockItem, StockStatus } from "../types/api.js";

interface StockTableProps {
	items: StockItem[];
	canViewCost: boolean;
	isLoading: boolean;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	onSort?: (column: string) => void;
}

const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
	NORMAL: "Normal",
	LOW: "Bajo",
	OUT_OF_STOCK: "Agotado",
};

const STOCK_STATUS_VARIANTS: Record<StockStatus, "default" | "destructive"> = {
	NORMAL: "default",
	LOW: "destructive",
	OUT_OF_STOCK: "destructive",
};

function formatMoney(value: string): string {
	const n = Number(value);
	if (Number.isNaN(n)) return value;
	return new Intl.NumberFormat("es-AR", {
		style: "currency",
		currency: "ARS",
		maximumFractionDigits: 2,
	}).format(n);
}

function formatDateTime(value: string): string {
	return new Date(value).toLocaleString("es-AR");
}

interface SortableHeadProps {
	label: string;
	column: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	onSort?: (column: string) => void;
	className?: string;
}

function SortableHead({
	label,
	column,
	sortBy,
	sortOrder,
	onSort,
	className,
}: SortableHeadProps) {
	const isActive = sortBy === column;
	return (
		<TableHead className={className}>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				className="cursor-pointer -ml-3 h-auto p-2 hover:bg-transparent"
				onClick={() => onSort?.(column)}
			>
				<span>{label}</span>
				<span className="ml-1 opacity-60">
					{isActive ? (
						sortOrder === "asc" ? (
							<IconArrowUp className="size-3.5" />
						) : (
							<IconArrowDown className="size-3.5" />
						)
					) : (
						<IconArrowsSort className="size-3.5" />
					)}
				</span>
			</Button>
		</TableHead>
	);
}

function TableHeadRow({
	showCost,
	sortBy,
	sortOrder,
	onSort,
}: {
	showCost: boolean;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	onSort?: (column: string) => void;
}) {
	return (
		<TableRow>
			<SortableHead
				label="Código"
				column="code"
				sortBy={sortBy}
				sortOrder={sortOrder}
				onSort={onSort}
			/>
			<SortableHead
				label="Nombre"
				column="name"
				sortBy={sortBy}
				sortOrder={sortOrder}
				onSort={onSort}
			/>
			<SortableHead
				label="Categoría"
				column="categoryName"
				sortBy={sortBy}
				sortOrder={sortOrder}
				onSort={onSort}
			/>
			<SortableHead
				label="Marca"
				column="brandName"
				sortBy={sortBy}
				sortOrder={sortOrder}
				onSort={onSort}
			/>
			<SortableHead
				label="Proveedor"
				column="supplierName"
				sortBy={sortBy}
				sortOrder={sortOrder}
				onSort={onSort}
			/>
			<SortableHead
				label="Stock actual"
				column="currentStock"
				sortBy={sortBy}
				sortOrder={sortOrder}
				onSort={onSort}
				className="text-right"
			/>
			<SortableHead
				label="Stock mínimo"
				column="minStock"
				sortBy={sortBy}
				sortOrder={sortOrder}
				onSort={onSort}
				className="text-right"
			/>
			<TableHead>Estado</TableHead>
			{showCost && <TableHead className="text-right">Costo</TableHead>}
			<SortableHead
				label="Última actualización"
				column="updatedAt"
				sortBy={sortBy}
				sortOrder={sortOrder}
				onSort={onSort}
			/>
		</TableRow>
	);
}

function StatusBadge({ status }: { status: StockStatus }) {
	const label = STOCK_STATUS_LABELS[status];
	const variant = STOCK_STATUS_VARIANTS[status];

	if (status === "LOW") {
		return (
			<Badge
				variant="outline"
				className="border-amber-500 text-amber-700 dark:text-amber-400"
			>
				{label}
			</Badge>
		);
	}

	return <Badge variant={variant}>{label}</Badge>;
}

export function StockTable({
	items,
	canViewCost,
	isLoading,
	sortBy,
	sortOrder,
	onSort,
}: StockTableProps) {
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

	if (items.length === 0) {
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
								No se encontraron productos con los filtros seleccionados.
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
					<TableHeadRow
						showCost={canViewCost}
						sortBy={sortBy}
						sortOrder={sortOrder}
						onSort={onSort}
					/>
				</TableHeader>
				<TableBody>
					{items.map((item) => (
						<TableRow key={item.id}>
							<TableCell className="font-mono text-sm">{item.code}</TableCell>
							<TableCell className="font-medium truncate max-w-[200px]">
								{item.name}
							</TableCell>
							<TableCell className="text-muted-foreground">
								{item.categoryName}
							</TableCell>
							<TableCell className="text-muted-foreground truncate max-w-[140px]">
								{item.brandName ?? "—"}
							</TableCell>
							<TableCell className="text-muted-foreground truncate max-w-[160px]">
								{item.supplierName}
							</TableCell>
							<TableCell className="text-right tabular-nums">
								{item.currentStock}
							</TableCell>
							<TableCell className="text-right tabular-nums">
								{item.minStock}
							</TableCell>
							<TableCell>
								<StatusBadge status={item.stockStatus} />
							</TableCell>
							{canViewCost && (
								<TableCell className="text-right tabular-nums">
									{item.cost ? formatMoney(item.cost) : "—"}
								</TableCell>
							)}
							<TableCell className="text-muted-foreground text-sm">
								{formatDateTime(item.updatedAt)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
