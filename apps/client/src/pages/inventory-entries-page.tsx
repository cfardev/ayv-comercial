import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table-pagination";
import { useDebounce } from "@/hooks/use-debounce.js";
import { usePaginationState } from "@/hooks/use-pagination-state";
import { useAuth } from "@/lib/auth-context";
import {
	hasPermissionOrSystemAdmin,
	PERMISSION_KEYS,
} from "@/lib/permission-keys";
import {
	useInventoryEntries,
	useInventoryEntry,
} from "@/modules/inventory-entries/hooks/use-inventory-entries";
import type { InventoryEntryItem } from "@/modules/inventory-entries/types/api";

function formatDateTime(value: string) {
	return new Date(value).toLocaleString();
}

function formatDate(value: string | null) {
	if (!value) return "—";
	return new Date(value).toLocaleDateString();
}

export function InventoryEntriesPage() {
	const { user } = useAuth();
	const canRead = hasPermissionOrSystemAdmin(
		user?.permissions,
		PERMISSION_KEYS.INVENTORY_ENTRIES_READ,
		user?.role.slug,
	);
	const canCreate = hasPermissionOrSystemAdmin(
		user?.permissions,
		PERMISSION_KEYS.INVENTORY_ENTRIES_CREATE,
		user?.role.slug,
	);

	const [search, setSearch] = useState("");
	const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
	const debouncedSearch = useDebounce(search, 300);
	const { page, setPage, pageSize, setPageSize, resetPage } =
		usePaginationState();

	const { data, isLoading } = useInventoryEntries({
		search: debouncedSearch || undefined,
		page,
		limit: pageSize,
	});

	if (!canRead) {
		return (
			<p className="text-sm text-muted-foreground">
				No tienes permisos para ver entradas de inventario.
			</p>
		);
	}

	const total = data?.total ?? 0;
	const totalPages = data?.totalPages ?? 1;

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">
						Entradas de inventario
					</h1>
					<p className="text-sm text-muted-foreground">
						Registra la recepcion de mercaderia asociada a ordenes de compra.
					</p>
				</div>
				{canCreate ? (
					<Button asChild className="cursor-pointer">
						<Link to="/inventario/entries/nuevo">
							<IconPlus className="mr-2 h-4 w-4" />
							Nueva entrada
						</Link>
					</Button>
				) : null}
			</div>

			<div className="flex flex-wrap gap-3">
				<div className="relative min-w-[220px] flex-1">
					<IconSearch className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Buscar por numero, orden o proveedor..."
						value={search}
						onChange={(event) => {
							setSearch(event.target.value);
							resetPage();
						}}
						className="pl-9"
					/>
				</div>
			</div>

			<div className="overflow-x-auto rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Numero</TableHead>
							<TableHead>Orden de compra</TableHead>
							<TableHead>Proveedor</TableHead>
							<TableHead>Fecha entrada</TableHead>
							<TableHead>Registrado por</TableHead>
							<TableHead>Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"].map((key) => (
								<TableRow key={key}>
									<TableCell colSpan={6}>
										<Skeleton className="h-4 w-full" />
									</TableCell>
								</TableRow>
							))
						) : (data?.data ?? []).length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={6}
									className="py-8 text-center text-muted-foreground"
								>
									No hay entradas de inventario para mostrar.
								</TableCell>
							</TableRow>
						) : (
							(data?.data ?? []).map((entry) => (
								<TableRow key={entry.id}>
									<TableCell>
										<Badge variant="outline">{entry.entryNumber}</Badge>
									</TableCell>
									<TableCell>{entry.referenceNumber}</TableCell>
									<TableCell>{entry.supplierName}</TableCell>
									<TableCell>{formatDateTime(entry.entryDate)}</TableCell>
									<TableCell>{entry.creatorName}</TableCell>
									<TableCell>
										<Button
											variant="outline"
											className="cursor-pointer"
											onClick={() => setSelectedEntryId(entry.id)}
										>
											Detalle
										</Button>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			<DataTablePagination
				page={page}
				totalPages={totalPages}
				total={total}
				pageSize={pageSize}
				onPageChange={setPage}
				onPageSizeChange={setPageSize}
				itemLabel="entrada"
			/>

			<EntryDetailDialog
				entryId={selectedEntryId}
				onClose={() => setSelectedEntryId(null)}
			/>
		</div>
	);
}

function EntryDetailDialog({
	entryId,
	onClose,
}: {
	entryId: string | null;
	onClose: () => void;
}) {
	const { data: entry } = useInventoryEntry(entryId);

	return (
		<Dialog
			open={Boolean(entryId)}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<DialogContent className="sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Detalle de entrada</DialogTitle>
				</DialogHeader>
				{entry ? (
					<div className="space-y-4">
						<div className="grid gap-2 sm:grid-cols-2 text-sm">
							<div>
								<span className="text-muted-foreground">Numero:</span>{" "}
								<strong>{entry.entryNumber}</strong>
							</div>
							<div>
								<span className="text-muted-foreground">Orden:</span>{" "}
								{entry.referenceNumber}
							</div>
							<div>
								<span className="text-muted-foreground">Proveedor:</span>{" "}
								{entry.supplierName}
							</div>
							<div>
								<span className="text-muted-foreground">Fecha:</span>{" "}
								{formatDateTime(entry.entryDate)}
							</div>
							<div>
								<span className="text-muted-foreground">Registrado por:</span>{" "}
								{entry.creatorName}
							</div>
							{entry.notes ? (
								<div className="sm:col-span-2">
									<span className="text-muted-foreground">Observaciones:</span>{" "}
									{entry.notes}
								</div>
							) : null}
						</div>
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Producto</TableHead>
										<TableHead>Cantidad</TableHead>
										<TableHead>Lote</TableHead>
										<TableHead>Vencimiento</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{entry.items?.map((item: InventoryEntryItem) => (
										<TableRow key={item.id}>
											<TableCell>
												<div>
													<p className="font-medium">{item.productName}</p>
													<p className="text-xs text-muted-foreground">
														{item.productCode}
													</p>
												</div>
											</TableCell>
											<TableCell>{item.quantityReceived}</TableCell>
											<TableCell>{item.lotNumber ?? "—"}</TableCell>
											<TableCell>{formatDate(item.expirationDate)}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</div>
				) : (
					<p className="text-sm text-muted-foreground">
						Sin detalle disponible.
					</p>
				)}
			</DialogContent>
		</Dialog>
	);
}
