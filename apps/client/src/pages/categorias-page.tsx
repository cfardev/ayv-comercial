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
import { CategoriesTable } from "@/modules/categories/components/categories-table.js";
import { CategoryFormDialog } from "@/modules/categories/components/category-form-dialog.js";
import {
	useCategories,
	useCreateCategory,
	useDeactivateCategory,
	useReactivateCategory,
	useUpdateCategory,
} from "@/modules/categories/hooks/use-categories.js";
import type { Category } from "@/modules/categories/types/api.js";
import { ConfirmDialog } from "@/modules/users/components/confirm-dialog.js";

type StatusFilter = "ALL" | "true" | "false";

const statusOptions: { value: StatusFilter; label: string }[] = [
	{ value: "ALL", label: "Todos" },
	{ value: "true", label: "Activos" },
	{ value: "false", label: "Inactivos" },
];

const DEBOUNCE_DELAY = 300;

export function CategoriasPage() {
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, DEBOUNCE_DELAY);
	const [status, setStatus] = useState<StatusFilter>("true");
	const [page, setPage] = useState(1);

	const [formOpen, setFormOpen] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);
	const [confirmDialog, setConfirmDialog] = useState<{
		open: boolean;
		category: Category | null;
		action: "deactivate" | "reactivate" | null;
	}>({ open: false, category: null, action: null });

	const { data: categoriesData, isLoading: categoriesLoading } = useCategories({
		search: debouncedSearch || undefined,
		status: status === "ALL" ? undefined : status,
		page,
		limit: 20,
	});

	const createCategory = useCreateCategory();
	const updateCategory = useUpdateCategory();
	const deactivateCategory = useDeactivateCategory();
	const reactivateCategory = useReactivateCategory();

	const categories = categoriesData?.data ?? [];
	const total = categoriesData?.total ?? 0;
	const totalPages = categoriesData?.totalPages ?? 1;

	function handleEdit(category: Category) {
		setFormError(null);
		setEditingCategory(category);
		setFormOpen(true);
	}

	function handleCreate() {
		setFormError(null);
		setEditingCategory(null);
		setFormOpen(true);
	}

	function handleDeactivate(category: Category) {
		setConfirmDialog({ open: true, category, action: "deactivate" });
	}

	function handleReactivate(category: Category) {
		setConfirmDialog({ open: true, category, action: "reactivate" });
	}

	function handleFormSubmit(data: { name: string; description?: string }) {
		setFormError(null);

		if (editingCategory) {
			updateCategory.mutate(
				{
					id: editingCategory.id,
					data: {
						name: data.name,
						description: data.description,
					},
				},
				{
					onSuccess: () => setFormOpen(false),
					onError: (error) => setFormError(error.message),
				},
			);
		} else {
			createCategory.mutate(
				{
					name: data.name,
					description: data.description,
				},
				{
					onSuccess: () => setFormOpen(false),
					onError: (error) => setFormError(error.message),
				},
			);
		}
	}

	function handleConfirm() {
		const { category, action } = confirmDialog;
		if (!category || !action) return;

		if (action === "deactivate") {
			deactivateCategory.mutate(category.id, {
				onSuccess: () =>
					setConfirmDialog({ open: false, category: null, action: null }),
			});
		} else {
			reactivateCategory.mutate(category.id, {
				onSuccess: () =>
					setConfirmDialog({ open: false, category: null, action: null }),
			});
		}
	}

	const isConfirmLoading =
		deactivateCategory.isPending || reactivateCategory.isPending;

	function buildConfirmProps() {
		const { category, action } = confirmDialog;
		if (!category || !action)
			return { title: "", description: "", confirmLabel: "" };

		if (action === "deactivate") {
			return {
				title: "Eliminar categoría",
				description: `¿Eliminar "${category.name}"? La categoría dejará de estar disponible para nuevos productos.`,
				confirmLabel: "Eliminar",
				variant: "destructive" as const,
			};
		}

		return {
			title: "Reactivar categoría",
			description: `¿Reactivar "${category.name}"? Volverá a estar disponible para asignar a productos.`,
			confirmLabel: "Reactivar",
			variant: "default" as const,
		};
	}

	const confirmProps = buildConfirmProps();

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Categorías</h1>
					<p className="text-muted-foreground text-sm">
						Gestiona las categorías del catálogo de productos.
					</p>
				</div>
				<Button onClick={handleCreate} className="cursor-pointer">
					<IconPlus className="mr-2 h-4 w-4" />
					Nueva categoría
				</Button>
			</div>

			{/* Filters */}
			<div className="flex flex-wrap gap-3">
				<div className="relative flex-1 min-w-[200px]">
					<IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Buscar por nombre o descripción..."
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setPage(1);
						}}
						className="pl-9"
					/>
				</div>
				<Select
					value={status}
					onValueChange={(val) => {
						setStatus(val as StatusFilter);
						setPage(1);
					}}
				>
					<SelectTrigger className="w-[160px] cursor-pointer">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{statusOptions.map((opt) => (
							<SelectItem
								key={opt.value}
								value={opt.value}
								className="cursor-pointer"
							>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Table */}
			<CategoriesTable
				categories={categories}
				onEdit={handleEdit}
				onDeactivate={handleDeactivate}
				onReactivate={handleReactivate}
				isLoading={categoriesLoading}
			/>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex items-center justify-between text-sm text-muted-foreground">
					<span>
						{total} categoría{total !== 1 ? "s" : ""} en total
					</span>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={page <= 1}
							onClick={() => setPage((p) => p - 1)}
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
							onClick={() => setPage((p) => p + 1)}
							className="cursor-pointer"
						>
							Siguiente
						</Button>
					</div>
				</div>
			)}

			{/* Form dialog */}
			<CategoryFormDialog
				open={formOpen}
				onOpenChange={(open) => {
					setFormOpen(open);
					if (!open) {
						setEditingCategory(null);
						setFormError(null);
					}
				}}
				category={editingCategory}
				onSubmit={handleFormSubmit}
				errorMessage={formError}
				isLoading={createCategory.isPending || updateCategory.isPending}
			/>

			{/* Confirm dialog */}
			<ConfirmDialog
				open={confirmDialog.open}
				onOpenChange={(open) => {
					if (!open)
						setConfirmDialog({ open: false, category: null, action: null });
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
