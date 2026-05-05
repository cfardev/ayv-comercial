import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { useAuth } from "@/lib/auth-context.js";
import {
	hasPermissionOrSystemAdmin,
	PERMISSION_KEYS,
} from "@/lib/permission-keys.js";
import { useCategories } from "@/modules/categories/hooks/use-categories.js";
import { ProductFormDialog } from "@/modules/products/components/product-form-dialog.js";
import { ProductsTable } from "@/modules/products/components/products-table.js";
import {
	useDeactivateProduct,
	useProducts,
	useReactivateProduct,
	useUpdateProduct,
} from "@/modules/products/hooks/use-products.js";
import type { Product } from "@/modules/products/types/api.js";
import type { ProductFormValues } from "@/modules/products/types/schema.js";
import { ConfirmDialog } from "@/modules/users/components/confirm-dialog.js";

type StatusFilter = "ALL" | "true" | "false";

const statusOptions: { value: StatusFilter; label: string }[] = [
	{ value: "true", label: "Activos" },
	{ value: "ALL", label: "Todos" },
	{ value: "false", label: "Inactivos" },
];

const DEBOUNCE_DELAY = 300;

export function ProductosPage() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const canCreate = hasPermissionOrSystemAdmin(
		user?.permissions,
		PERMISSION_KEYS.PRODUCTS_CREATE,
		user?.role?.slug,
	);
	const canEdit = hasPermissionOrSystemAdmin(
		user?.permissions,
		PERMISSION_KEYS.PRODUCTS_UPDATE,
		user?.role?.slug,
	);
	const canDeactivate = hasPermissionOrSystemAdmin(
		user?.permissions,
		PERMISSION_KEYS.PRODUCTS_DEACTIVATE,
		user?.role?.slug,
	);
	const canReactivate = hasPermissionOrSystemAdmin(
		user?.permissions,
		PERMISSION_KEYS.PRODUCTS_REACTIVATE,
		user?.role?.slug,
	);

	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, DEBOUNCE_DELAY);
	const [status, setStatus] = useState<StatusFilter>("true");
	const [categoryId, setCategoryId] = useState<string | "ALL">("ALL");
	const [page, setPage] = useState(1);

	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [confirmDialog, setConfirmDialog] = useState<{
		open: boolean;
		product: Product | null;
		action: "deactivate" | "reactivate" | null;
	}>({ open: false, product: null, action: null });

	const { data: categoriesData } = useCategories({
		status: "true",
		limit: 100,
		page: 1,
	});
	const categoryOptions = useMemo(
		() => categoriesData?.data ?? [],
		[categoriesData?.data],
	);

	const { data: productsData, isLoading: productsLoading } = useProducts({
		search: debouncedSearch || undefined,
		status: status === "ALL" ? undefined : status,
		categoryId: categoryId === "ALL" ? undefined : categoryId,
		page,
		limit: 20,
	});

	const updateProduct = useUpdateProduct();
	const deactivateProduct = useDeactivateProduct();
	const reactivateProduct = useReactivateProduct();

	const products = productsData?.data ?? [];
	const total = productsData?.total ?? 0;
	const totalPages = productsData?.totalPages ?? 1;

	function handleEdit(product: Product) {
		setFormError(null);
		setEditingProduct(product);
		setEditDialogOpen(true);
	}

	function handleDeactivate(product: Product) {
		setConfirmDialog({ open: true, product, action: "deactivate" });
	}

	function handleReactivate(product: Product) {
		setConfirmDialog({ open: true, product, action: "reactivate" });
	}

	function handleConfirm() {
		const { product, action } = confirmDialog;
		if (!product || !action) return;

		if (action === "deactivate") {
			deactivateProduct.mutate(product.id, {
				onSuccess: () =>
					setConfirmDialog({ open: false, product: null, action: null }),
			});
		} else {
			reactivateProduct.mutate(product.id, {
				onSuccess: () =>
					setConfirmDialog({ open: false, product: null, action: null }),
			});
		}
	}

	function buildConfirmProps() {
		const { product, action } = confirmDialog;
		if (!product || !action)
			return {
				title: "",
				description: "",
				confirmLabel: "",
				variant: "default" as const,
			};

		if (action === "deactivate") {
			return {
				title: "Desactivar producto",
				description: `¿Desactivar "${product.name}"? No aparecerá en ventas nuevas.`,
				confirmLabel: "Desactivar",
				variant: "destructive" as const,
			};
		}

		return {
			title: "Reactivar producto",
			description: `¿Reactivar "${product.name}"?`,
			confirmLabel: "Reactivar",
			variant: "default" as const,
		};
	}

	const confirmProps = buildConfirmProps();
	const isConfirmLoading =
		deactivateProduct.isPending || reactivateProduct.isPending;

	async function onSubmitEditForm(values: ProductFormValues) {
		setFormError(null);
		const productBeingEdited = editingProduct;
		if (!productBeingEdited) return;

		try {
			await updateProduct.mutateAsync({
				id: productBeingEdited.id,
				data: {
					name: values.name,
					description: values.description,
					cost: values.cost,
					price: values.price,
					categoryId: values.categoryId,
					images: values.images.map((img, i) => ({
						url: img.url,
						fileKey: img.fileKey,
						sortOrder: img.sortOrder ?? i,
					})),
				},
			});
			setEditDialogOpen(false);
			setEditingProduct(null);
		} catch (e) {
			setFormError(e instanceof Error ? e.message : "Error al guardar");
		}
	}

	const formBusy = updateProduct.isPending;

	return (
		<div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
					<p className="text-muted-foreground text-sm">
						Catálogo de productos con imágenes ({total} en esta vista).
					</p>
				</div>
				{canCreate ? (
					<Button
						type="button"
						className="cursor-pointer gap-2 self-start md:self-auto"
						onClick={() => navigate("/productos/nuevo")}
					>
						<IconPlus className="size-4" />
						Nuevo producto
					</Button>
				) : null}
			</div>

			<div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
				<div className="relative flex-1 min-w-[200px]">
					<IconSearch className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Buscar por nombre o descripción…"
						className="pl-9"
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setPage(1);
						}}
					/>
				</div>
				<Select
					value={categoryId}
					onValueChange={(v) => {
						setCategoryId(v as string | "ALL");
						setPage(1);
					}}
				>
					<SelectTrigger className="w-full cursor-pointer md:w-[220px]">
						<SelectValue placeholder="Categoría" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL" className="cursor-pointer">
							Todas las categorías
						</SelectItem>
						{categoryOptions.map((c) => (
							<SelectItem key={c.id} value={c.id} className="cursor-pointer">
								{c.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select
					value={status}
					onValueChange={(v) => {
						setStatus(v as StatusFilter);
						setPage(1);
					}}
				>
					<SelectTrigger className="w-full cursor-pointer md:w-[180px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{statusOptions.map((o) => (
							<SelectItem
								key={o.value}
								value={o.value}
								className="cursor-pointer"
							>
								{o.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<ProductsTable
				products={products}
				onEdit={handleEdit}
				onDeactivate={handleDeactivate}
				onReactivate={handleReactivate}
				canEdit={canEdit}
				canDeactivate={canDeactivate}
				canReactivate={canReactivate}
				isLoading={productsLoading}
			/>

			{totalPages > 1 ? (
				<div className="flex items-center justify-center gap-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="cursor-pointer"
						disabled={page <= 1}
						onClick={() => setPage((p) => Math.max(1, p - 1))}
					>
						Anterior
					</Button>
					<span className="text-sm text-muted-foreground">
						Página {page} de {totalPages}
					</span>
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="cursor-pointer"
						disabled={page >= totalPages}
						onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
					>
						Siguiente
					</Button>
				</div>
			) : null}

			<ProductFormDialog
				open={editDialogOpen}
				onOpenChange={(open) => {
					setEditDialogOpen(open);
					if (!open) {
						setEditingProduct(null);
						setFormError(null);
					}
				}}
				product={editingProduct}
				onSubmit={onSubmitEditForm}
				errorMessage={formError}
				isLoading={formBusy}
			/>

			<ConfirmDialog
				open={confirmDialog.open}
				onOpenChange={(open) => {
					if (!open)
						setConfirmDialog({ open: false, product: null, action: null });
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
