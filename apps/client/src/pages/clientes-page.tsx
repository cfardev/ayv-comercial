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
import { CustomerFormDialog } from "@/modules/customers/components/customer-form-dialog.js";
import { CustomersTable } from "@/modules/customers/components/customers-table.js";
import {
	useActivateCustomer,
	useCreateCustomer,
	useCustomers,
	useDeactivateCustomer,
	useUpdateCustomer,
} from "@/modules/customers/hooks/use-customers.js";
import type { Customer } from "@/modules/customers/types/api.js";
import { ConfirmDialog } from "@/modules/users/components/confirm-dialog.js";

type StatusFilter = "ALL" | "true" | "false";
type PersonTypeFilter = "ALL" | "NATURAL" | "JURIDICA";

const statusOptions: { value: StatusFilter; label: string }[] = [
	{ value: "true", label: "Activos" },
	{ value: "false", label: "Inactivos" },
	{ value: "ALL", label: "Todos" },
];

const personTypeOptions: { value: PersonTypeFilter; label: string }[] = [
	{ value: "ALL", label: "Todos" },
	{ value: "NATURAL", label: "Persona natural" },
	{ value: "JURIDICA", label: "Persona jurídica" },
];

const DEBOUNCE_DELAY = 300;

export function ClientesPage() {
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, DEBOUNCE_DELAY);
	const [status, setStatus] = useState<StatusFilter>("true");
	const [personType, setPersonType] = useState<PersonTypeFilter>("ALL");
	const [page, setPage] = useState(1);
	const [formOpen, setFormOpen] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
	const [confirmDialog, setConfirmDialog] = useState<{
		open: boolean;
		customer: Customer | null;
		action: "deactivate" | "activate" | null;
	}>({ open: false, customer: null, action: null });

	const { data: customersData, isLoading: customersLoading } = useCustomers({
		search: debouncedSearch || undefined,
		personType: personType !== "ALL" ? personType : undefined,
		isActive: status,
		page,
		limit: 20,
	});

	const createCustomer = useCreateCustomer();
	const updateCustomer = useUpdateCustomer();
	const deactivateCustomer = useDeactivateCustomer();
	const activateCustomer = useActivateCustomer();

	const customers = customersData?.data ?? [];
	const total = customersData?.total ?? 0;
	const totalPages = customersData?.totalPages ?? 1;

	function handleCreate() {
		setFormError(null);
		setEditingCustomer(null);
		setFormOpen(true);
	}

	function handleEdit(customer: Customer) {
		setFormError(null);
		setEditingCustomer(customer);
		setFormOpen(true);
	}

	function handleDeactivate(customer: Customer) {
		setConfirmDialog({ open: true, customer, action: "deactivate" });
	}

	function handleActivate(customer: Customer) {
		setConfirmDialog({ open: true, customer, action: "activate" });
	}

	function handleFormSubmit(data: {
		personType: "NATURAL" | "JURIDICA";
		fullName: string;
		taxId: string;
		address?: string;
		phone?: string;
		email?: string;
	}) {
		setFormError(null);

		if (editingCustomer) {
			updateCustomer.mutate(
				{
					id: editingCustomer.id,
					data,
				},
				{
					onSuccess: () => setFormOpen(false),
					onError: (error) => setFormError(error.message),
				},
			);
			return;
		}

		createCustomer.mutate(data, {
			onSuccess: () => setFormOpen(false),
			onError: (error) => setFormError(error.message),
		});
	}

	function handleConfirm() {
		const { customer, action } = confirmDialog;
		if (!customer || !action) return;

		if (action === "deactivate") {
			deactivateCustomer.mutate(customer.id, {
				onSuccess: () =>
					setConfirmDialog({ open: false, customer: null, action: null }),
			});
			return;
		}

		activateCustomer.mutate(customer.id, {
			onSuccess: () =>
				setConfirmDialog({ open: false, customer: null, action: null }),
		});
	}

	const isConfirmLoading =
		deactivateCustomer.isPending || activateCustomer.isPending;

	const confirmProps =
		confirmDialog.action === "deactivate"
			? {
					title: "Desactivar cliente",
					description: `¿Desactivar "${confirmDialog.customer?.fullName}"? Dejará de estar disponible para nuevas ventas.`,
					confirmLabel: "Desactivar",
					variant: "destructive" as const,
				}
			: {
					title: "Activar cliente",
					description: `¿Activar "${confirmDialog.customer?.fullName}"? Volverá a estar disponible para nuevas ventas.`,
					confirmLabel: "Activar",
					variant: "default" as const,
				};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
					<p className="text-sm text-muted-foreground">
						Gestiona el maestro de clientes para ventas y facturación.
					</p>
				</div>
				<Button onClick={handleCreate} className="cursor-pointer">
					<IconPlus className="mr-2 h-4 w-4" />
					Nuevo cliente
				</Button>
			</div>

			<div className="flex flex-wrap gap-3">
				<div className="relative min-w-[200px] flex-1">
					<IconSearch className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Buscar por nombre, razón social o identificación..."
						value={search}
						onChange={(event) => {
							setSearch(event.target.value);
							setPage(1);
						}}
						className="pl-9"
					/>
				</div>
				<Select
					value={personType}
					onValueChange={(value) => {
						setPersonType(value as PersonTypeFilter);
						setPage(1);
					}}
				>
					<SelectTrigger className="w-[180px] cursor-pointer">
						<SelectValue placeholder="Tipo de persona" />
					</SelectTrigger>
					<SelectContent>
						{personTypeOptions.map((option) => (
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
				<Select
					value={status}
					onValueChange={(value) => {
						setStatus(value as StatusFilter);
						setPage(1);
					}}
				>
					<SelectTrigger className="w-[140px] cursor-pointer">
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

			<CustomersTable
				customers={customers}
				onEdit={handleEdit}
				onDeactivate={handleDeactivate}
				onActivate={handleActivate}
				isLoading={customersLoading}
			/>

			{totalPages > 1 ? (
				<div className="flex items-center justify-between text-sm text-muted-foreground">
					<span>
						{total} cliente{total !== 1 ? "s" : ""} en total
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

			<CustomerFormDialog
				open={formOpen}
				onOpenChange={(open) => {
					setFormOpen(open);
					if (!open) {
						setEditingCustomer(null);
						setFormError(null);
					}
				}}
				customer={editingCustomer}
				onSubmit={handleFormSubmit}
				errorMessage={formError}
				isLoading={createCustomer.isPending || updateCustomer.isPending}
			/>

			<ConfirmDialog
				open={confirmDialog.open}
				onOpenChange={(open) => {
					if (!open) {
						setConfirmDialog({ open: false, customer: null, action: null });
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
