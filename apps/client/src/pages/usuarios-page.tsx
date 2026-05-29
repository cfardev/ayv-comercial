import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { DataTablePagination } from "@/components/data-table-pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce.js";
import { usePaginationState } from "@/hooks/use-pagination-state";
import type { UserRole } from "@/lib/user-roles.js";
import { USER_ROLE_OPTIONS } from "@/lib/user-roles.js";
import { ConfirmDialog } from "@/modules/users/components/confirm-dialog.js";
import { UserFormDialog } from "@/modules/users/components/user-form-dialog.js";
import { UsersTable } from "@/modules/users/components/users-table.js";
import {
	useCreateUser,
	useDeactivateUser,
	useHardDeleteUser,
	useReactivateUser,
	useUpdateUser,
	useUsers,
} from "@/modules/users/hooks/use-users.js";
import type { User, UserStatus } from "@/modules/users/types/api.js";
import type {
	CreateUserForm,
	UpdateUserForm,
} from "@/modules/users/types/schema.js";

const statusOptions: { value: UserStatus | "ALL"; label: string }[] = [
	{ value: "ALL", label: "Todos" },
	{ value: "ACTIVE", label: "Activos" },
	{ value: "INACTIVE", label: "Inactivos" },
];

export function UsersPage() {
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 300);
	const [status, setStatus] = useState<UserStatus | "ALL">("ACTIVE");
	const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
	const { page, setPage, pageSize, setPageSize, resetPage } =
		usePaginationState();

	const [formOpen, setFormOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [confirmDialog, setConfirmDialog] = useState<{
		open: boolean;
		user: User | null;
		action: "deactivate" | "reactivate" | "hardDelete" | null;
	}>({ open: false, user: null, action: null });

	const { data: usersData, isLoading: usersLoading } = useUsers({
		search: debouncedSearch || undefined,
		status,
		role: roleFilter !== "ALL" ? roleFilter : undefined,
		page,
		limit: pageSize,
	});

	const createUser = useCreateUser();
	const updateUser = useUpdateUser();
	const deactivateUser = useDeactivateUser();
	const reactivateUser = useReactivateUser();
	const hardDeleteUser = useHardDeleteUser();

	function handleEdit(user: User) {
		setEditingUser(user);
		setFormOpen(true);
	}

	function handleCreate() {
		setEditingUser(null);
		setFormOpen(true);
	}

	function handleDeactivate(user: User) {
		setConfirmDialog({ open: true, user, action: "deactivate" });
	}

	function handleReactivate(user: User) {
		setConfirmDialog({ open: true, user, action: "reactivate" });
	}

	function handleHardDelete(user: User) {
		setConfirmDialog({ open: true, user, action: "hardDelete" });
	}

	function handleConfirmAction() {
		if (!confirmDialog.user || !confirmDialog.action) return;

		if (confirmDialog.action === "deactivate") {
			deactivateUser.mutate(confirmDialog.user.id, {
				onSuccess: () =>
					setConfirmDialog({ open: false, user: null, action: null }),
			});
		} else if (confirmDialog.action === "reactivate") {
			reactivateUser.mutate(confirmDialog.user.id, {
				onSuccess: () =>
					setConfirmDialog({ open: false, user: null, action: null }),
			});
		} else if (confirmDialog.action === "hardDelete") {
			hardDeleteUser.mutate(confirmDialog.user.id, {
				onSuccess: () =>
					setConfirmDialog({ open: false, user: null, action: null }),
			});
		}
	}

	function handleFormSubmit(data: CreateUserForm | UpdateUserForm) {
		if (editingUser) {
			updateUser.mutate(
				{ id: editingUser.id, data: data as UpdateUserForm },
				{
					onSuccess: () => {
						setFormOpen(false);
						setEditingUser(null);
					},
				},
			);
		} else {
			createUser.mutate(data as CreateUserForm, {
				onSuccess: () => {
					setFormOpen(false);
				},
			});
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Gestión de usuarios
					</h1>
					<p className="text-muted-foreground">
						Administra los usuarios del sistema
					</p>
				</div>
				<Button onClick={handleCreate}>
					<IconPlus className="size-4" />
					Nuevo usuario
				</Button>
			</div>

			<div className="flex flex-wrap items-center gap-4">
				<div className="relative flex-1 min-w-[200px]">
					<IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Buscar por nombre, correo o usuario..."
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							resetPage();
						}}
						className="pl-9"
					/>
				</div>

				<div className="flex items-center gap-2">
					<Label className="sr-only">Estado</Label>
					<Select
						value={status}
						onValueChange={(value) => {
							setStatus(value as UserStatus | "ALL");
							resetPage();
						}}
					>
						<SelectTrigger className="w-[150px]">
							<SelectValue placeholder="Estado" />
						</SelectTrigger>
						<SelectContent>
							{statusOptions.map((opt) => (
								<SelectItem key={opt.value} value={opt.value}>
									{opt.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center gap-2">
					<Label className="sr-only">Rol</Label>
					<Select
						value={roleFilter}
						onValueChange={(value) => {
							setRoleFilter(value as UserRole | "ALL");
							resetPage();
						}}
					>
						<SelectTrigger className="w-[200px]">
							<SelectValue placeholder="Todos los roles" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">Todos los roles</SelectItem>
							{USER_ROLE_OPTIONS.map((opt) => (
								<SelectItem key={opt.value} value={opt.value}>
									{opt.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<UsersTable
				users={usersData?.data ?? []}
				onEdit={handleEdit}
				onDeactivate={handleDeactivate}
				onReactivate={handleReactivate}
				onHardDelete={handleHardDelete}
				isLoading={usersLoading}
			/>

			<DataTablePagination
				page={page}
				totalPages={usersData?.totalPages ?? 1}
				total={usersData?.total ?? 0}
				pageSize={pageSize}
				onPageChange={setPage}
				onPageSizeChange={setPageSize}
				itemLabel="usuario"
			/>

			<UserFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				user={editingUser}
				onSubmit={handleFormSubmit}
				isLoading={createUser.isPending || updateUser.isPending}
			/>

			{confirmDialog.user && confirmDialog.action && (
				<ConfirmDialog
					open={confirmDialog.open}
					onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
					title={
						confirmDialog.action === "deactivate"
							? "Eliminar usuario"
							: confirmDialog.action === "reactivate"
								? "Reactivar usuario"
								: "Eliminar usuario"
					}
					description={
						confirmDialog.action === "deactivate"
							? `¿Estás seguro de que deseas eliminar a ${confirmDialog.user.fullName}? El usuario perderá acceso al sistema.`
							: confirmDialog.action === "reactivate"
								? `¿Estás seguro de que deseas reactivar a ${confirmDialog.user.fullName}? El usuario recuperará acceso al sistema.`
								: `¿Estás seguro de que deseas eliminar permanentemente a ${confirmDialog.user.fullName}? Esta acción no se puede deshacer.`
					}
					confirmLabel={
						confirmDialog.action === "deactivate"
							? "Eliminar"
							: confirmDialog.action === "reactivate"
								? "Reactivar"
								: "Eliminar"
					}
					onConfirm={handleConfirmAction}
					isLoading={
						deactivateUser.isPending ||
						reactivateUser.isPending ||
						hardDeleteUser.isPending
					}
					variant={
						confirmDialog.action === "hardDelete"
							? "destructive"
							: confirmDialog.action === "deactivate"
								? "destructive"
								: "default"
					}
				/>
			)}
		</div>
	);
}
