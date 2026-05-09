import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useState } from "react";
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
import { SupplierFormDialog } from "@/modules/suppliers/components/supplier-form-dialog.js";
import { SuppliersTable } from "@/modules/suppliers/components/suppliers-table.js";
import {
	useCreateSupplier,
	useDeactivateSupplier,
	useReactivateSupplier,
	useSuppliers,
	useUpdateSupplier,
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
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, DEBOUNCE_DELAY);
	const [status, setStatus] = useState<StatusFilter>("true");
	const [page, setPage] = useState(1);
	const [formOpen, setFormOpen] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
	const [confirmDialog, setConfirmDialog] = useState<{
		open: boolean;
		supplier: Supplier | null;
		action: "deactivate" | "reactivate" | null;
	}>({ open: false, supplier: null, action: null });

	const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers({
		search: debouncedSearch || undefined,
		status,
		page,
		limit: 20,
	});

	const createSupplier = useCreateSupplier();
	const updateSupplier = useUpdateSupplier();
	const deactivateSupplier = useDeactivateSupplier();
	const reactivateSupplier = useReactivateSupplier();

	const suppliers = suppliersData?.data ?? [];
	const total = suppliersData?.total ?? 0;
	const totalPages = suppliersData?.totalPages ?? 1;

	function handleCreate() {
		setFormError(null);
		setEditingSupplier(null);
		setFormOpen(true);
	}

	function handleEdit(supplier: Supplier) {
		setFormError(null);
		setEditingSupplier(supplier);
		setFormOpen(true);
	}

	function handleDeactivate(supplier: Supplier) {
		setConfirmDialog({ open: true, supplier, action: "deactivate" });
	}

	function handleReactivate(supplier: Supplier) {
		setConfirmDialog({ open: true, supplier, action: "reactivate" });
	}

	function handleFormSubmit(data: {
		name: string;
		taxId: string;
		contactName?: string;
		phone?: string;
		email?: string;
		address?: string;
		commercialConditions?: string;
	}) {
		setFormError(null);

		if (editingSupplier) {
			updateSupplier.mutate(
				{
					id: editingSupplier.id,
					data,
				},
				{
					onSuccess: () => setFormOpen(false),
					onError: (error) => setFormError(error.message),
				},
			);
			return;
		}

		createSupplier.mutate(data, {
			onSuccess: () => setFormOpen(false),
			onError: (error) => setFormError(error.message),
		});
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
				<Button onClick={handleCreate} className="cursor-pointer">
					<IconPlus className="mr-2 h-4 w-4" />
					Nuevo proveedor
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
							setPage(1);
						}}
						className="pl-9"
					/>
				</div>
				<Select
					value={status}
					onValueChange={(value) => {
						setStatus(value as StatusFilter);
						setPage(1);
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

			{totalPages > 1 ? (
				<div className="flex items-center justify-between text-sm text-muted-foreground">
					<span>
						{total} proveedor{total !== 1 ? "es" : ""} en total
					</span>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={page <= 1}
							onClick={() => setPage((current) => current - 1)}
							className="cursor-pointer"
						>
							Anterior
						</Button>
						<span className="flex items-center px-2">
							{page} / {totalPages}
						</span>
						<Button
							variant="outline"
							size="sm"
							disabled={page >= totalPages}
							onClick={() => setPage((current) => current + 1)}
							className="cursor-pointer"
						>
							Siguiente
						</Button>
					</div>
				</div>
			) : null}

			<SupplierFormDialog
				open={formOpen}
				onOpenChange={(open) => {
					setFormOpen(open);
					if (!open) {
						setEditingSupplier(null);
						setFormError(null);
					}
				}}
				supplier={editingSupplier}
				onSubmit={handleFormSubmit}
				errorMessage={formError}
				isLoading={createSupplier.isPending || updateSupplier.isPending}
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
