import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DataTablePagination } from "@/components/data-table-pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce.js";
import { usePaginationState } from "@/hooks/use-pagination-state";
import { SuppliersTable } from "@/modules/suppliers/components/suppliers-table.js";
import {
	useDeactivateSupplier,
	useReactivateSupplier,
	useSuppliers,
} from "@/modules/suppliers/hooks/use-suppliers.js";
import type { Supplier } from "@/modules/suppliers/types/api.js";
import { ConfirmDialog } from "@/modules/users/components/confirm-dialog.js";

type StatusFilter = "ALL" | "true" | "false";

const statusOptions: { value: StatusFilter; label: string }[] = [
	{ value: "ALL", label: "Todos" },
	{ value: "true", label: "Activos" },
	{ value: "false", label: "Inactivos" },
];

const DEBOUNCE_DELAY = 300;

export function ProveedoresPage() {
	const navigate = useNavigate();
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, DEBOUNCE_DELAY);
	const [status, setStatus] = useState<StatusFilter>("true");
	const { page, setPage, pageSize, setPageSize, resetPage } =
		usePaginationState();
	const [confirmDialog, setConfirmDialog] = useState<{
		open: boolean;
		supplier: Supplier | null;
		action: "deactivate" | "reactivate" | null;
	}>({ open: false, supplier: null, action: null });

	const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers({
		search: debouncedSearch || undefined,
		status,
		page,
		limit: pageSize,
	});

	const deactivateSupplier = useDeactivateSupplier();
	const reactivateSupplier = useReactivateSupplier();

	const suppliers = suppliersData?.data ?? [];
	const total = suppliersData?.total ?? 0;
	const totalPages = suppliersData?.totalPages ?? 1;

	function handleEdit(supplier: Supplier) {
		navigate(`/proveedores/${supplier.id}/editar`, { state: { supplier } });
	}

	function handleDeactivate(supplier: Supplier) {
		setConfirmDialog({ open: true, supplier, action: "deactivate" });
	}

	function handleReactivate(supplier: Supplier) {
		setConfirmDialog({ open: true, supplier, action: "reactivate" });
	}

	function handleConfirm() {
		const { supplier, action } = confirmDialog;
		if (!supplier || !action) return;

		if (action === "deactivate") {
			deactivateSupplier.mutate(supplier.id, {
				onSuccess: () =>
					setConfirmDialog({ open: false, supplier: null, action: null }),
			});
			return;
		}

		reactivateSupplier.mutate(supplier.id, {
			onSuccess: () =>
				setConfirmDialog({ open: false, supplier: null, action: null }),
		});
	}

	const isConfirmLoading =
		deactivateSupplier.isPending || reactivateSupplier.isPending;

	const confirmProps =
		confirmDialog.action === "deactivate"
			? {
					title: "Desactivar proveedor",
					description: `¿Desactivar "${confirmDialog.supplier?.name}"? Dejará de estar disponible para nuevas compras.`,
					confirmLabel: "Desactivar",
					variant: "destructive" as const,
				}
			: {
					title: "Reactivar proveedor",
					description: `¿Reactivar "${confirmDialog.supplier?.name}"? Volverá a estar disponible para nuevas compras.`,
					confirmLabel: "Reactivar",
					variant: "default" as const,
				};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Proveedores</h1>
					<p className="text-sm text-muted-foreground">
						Gestiona el maestro de proveedores para abastecimiento.
					</p>
				</div>
				<Button asChild className="cursor-pointer">
					<Link to="/proveedores/nuevo">
						<IconPlus className="mr-2 h-4 w-4" />
						Nuevo proveedor
					</Link>
				</Button>
			</div>

			<div className="flex flex-wrap gap-3">
				<div className="relative min-w-[200px] flex-1">
					<IconSearch className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Buscar por nombre, documento o contacto..."
						value={search}
						onChange={(event) => {
							setSearch(event.target.value);
							resetPage();
						}}
						className="pl-9"
					/>
				</div>
				<Select
					value={status}
					onValueChange={(value) => {
						setStatus(value as StatusFilter);
						resetPage();
					}}
				>
					<SelectTrigger className="w-[160px] cursor-pointer">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{statusOptions.map((option) => (
							<SelectItem
								key={option.value}
								value={option.value}
								className="cursor-pointer"
							>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<SuppliersTable
				suppliers={suppliers}
				onEdit={handleEdit}
				onDeactivate={handleDeactivate}
				onReactivate={handleReactivate}
				isLoading={suppliersLoading}
			/>

			<DataTablePagination
				page={page}
				totalPages={totalPages}
				total={total}
				pageSize={pageSize}
				onPageChange={setPage}
				onPageSizeChange={setPageSize}
				itemLabel="proveedor"
			/>

			<ConfirmDialog
				open={confirmDialog.open}
				onOpenChange={(open) => {
					if (!open) {
						setConfirmDialog({ open: false, supplier: null, action: null });
					}
				}}
				title={confirmProps.title}
				description={confirmProps.description}
				confirmLabel={confirmProps.confirmLabel}
				onConfirm={handleConfirm}
				isLoading={isConfirmLoading}
				variant={confirmProps.variant}
			/>
		</div>
	);
}
