import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
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
import { usePaginationState } from "@/hooks/use-pagination-state";
import { useAuth } from "@/lib/auth-context.js";
import {
	hasPermissionOrSystemAdmin,
	PERMISSION_KEYS,
} from "@/lib/permission-keys.js";
import { useBrandsList } from "@/modules/brands/hooks/use-brands.js";
import { useCategories } from "@/modules/categories/hooks/use-categories.js";
import { DataTablePagination } from "@/components/data-table-pagination";
import { ProductsTable } from "@/modules/products/components/products-table.js";
import { UpdatePricingDialog } from "@/modules/products/components/update-pricing-dialog.js";
import {
	useDeactivateProduct,
	useProductDeactivationInfo,
	useProducts,
	useReactivateProduct,
	useUpdatePricing,
} from "@/modules/products/hooks/use-products.js";
import type {
	Product,
	UpdatePricingPayload,
} from "@/modules/products/types/api.js";
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
	const canViewCost = hasPermissionOrSystemAdmin(
		user?.permissions,
		PERMISSION_KEYS.PRODUCTS_UPDATE,
		user?.role?.slug,
	);
	const canUpdatePricing = hasPermissionOrSystemAdmin(
		user?.permissions,
		PERMISSION_KEYS.PRODUCTS_UPDATE,
		user?.role?.slug,
	);

	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, DEBOUNCE_DELAY);
	const [status, setStatus] = useState<StatusFilter>("true");
	const [categoryId, setCategoryId] = useState<string | "ALL">("ALL");
	const [brandId, setBrandId] = useState<string | "ALL">("ALL");
	const { page, setPage, pageSize, setPageSize, resetPage } =
		usePaginationState();

	const [confirmDialog, setConfirmDialog] = useState<{
		open: boolean;
		product: Product | null;
		action: "deactivate" | "reactivate" | null;
		salesCount: number;
	}>({ open: false, product: null, action: null, salesCount: 0 });

	const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
	const [pricingProduct, setPricingProduct] = useState<Product | null>(null);
	const [pricingError, setPricingError] = useState<string | null>(null);

	const [pendingDeactivateId, setPendingDeactivateId] = useState<string | null>(
		null,
	);
	const { data: deactivationInfo } =
		useProductDeactivationInfo(pendingDeactivateId);

	const { data: categoriesData } = useCategories({
		status: "true",
		limit: 100,
		page: 1,
	});
	const categoryOptions = useMemo(
		() => categoriesData?.data ?? [],
		[categoriesData?.data],
	);

	const { data: brandsData } = useBrandsList({
		status: "true",
		limit: 100,
		page: 1,
	});
	const brandOptions = useMemo(
		() => brandsData?.data ?? [],
		[brandsData?.data],
	);

	const { data: productsData, isLoading: productsLoading } = useProducts({
		search: debouncedSearch || undefined,
		status: status === "ALL" ? undefined : status,
		categoryId: categoryId === "ALL" ? undefined : categoryId,
		brandId: brandId === "ALL" ? undefined : brandId,
		page,
		limit: pageSize,
	});

	const deactivateProduct = useDeactivateProduct();
	const reactivateProduct = useReactivateProduct();
	const updatePricing = useUpdatePricing();

	const products = productsData?.data ?? [];
	const total = productsData?.total ?? 0;
	const totalPages = productsData?.totalPages ?? 1;

	// Open confirm dialog once deactivation info is fetched
	useEffect(() => {
		if (!deactivationInfo || !pendingDeactivateId) return;
		const product = products.find((p) => p.id === pendingDeactivateId);
		if (!product) return;

		setConfirmDialog({
			open: true,
			product,
			action: "deactivate",
			salesCount: deactivationInfo.salesCount,
		});
		setPendingDeactivateId(null);
	}, [deactivationInfo, pendingDeactivateId, products]);

	function handleEdit(product: Product) {
		navigate(`/productos/${product.id}/editar`);
	}

	function handleOpenPricingDialog(product: Product) {
		setPricingError(null);
		setPricingProduct(product);
		setPricingDialogOpen(true);
	}

	async function handleSubmitPricing(payload: UpdatePricingPayload) {
		if (!pricingProduct) return;
		setPricingError(null);
		try {
			await updatePricing.mutateAsync({ id: pricingProduct.id, data: payload });
			setPricingDialogOpen(false);
			setPricingProduct(null);
		} catch (e) {
			setPricingError(
				e instanceof Error ? e.message : "Error al guardar precios",
			);
		}
	}

	function handleDeactivate(product: Product) {
		setPendingDeactivateId(product.id);
	}

	function handleReactivate(product: Product) {
		setConfirmDialog({
			open: true,
			product,
			action: "reactivate",
			salesCount: 0,
		});
	}

	async function handleConfirm() {
		const { product, action } = confirmDialog;
		if (!product || !action) return;

		if (action === "deactivate") {
			try {
				const result = await deactivateProduct.mutateAsync(product.id);
				setConfirmDialog({
					open: false,
					product: null,
					action: null,
					salesCount: 0,
				});
				// If there were sales, the backend returned the count — we already allowed it
				void result;
			} catch {
				// Error already shown via toast or form error
			}
		} else {
			reactivateProduct.mutate(product.id, {
				onSuccess: () =>
					setConfirmDialog({
						open: false,
						product: null,
						action: null,
						salesCount: 0,
					}),
			});
		}
	}

	function buildConfirmProps() {
		const { product, action, salesCount } = confirmDialog;
		if (!product || !action)
			return {
				title: "",
				description: "",
				confirmLabel: "",
				variant: "default" as const,
			};

		if (action === "deactivate") {
			const salesWarning =
				salesCount > 0
					? ` Este producto tiene ${salesCount} venta${salesCount > 1 ? "s" : ""} registrada${salesCount > 1 ? "s" : ""}. La desactivación no afecta el historial.`
					: "";
			return {
				title: "Desactivar producto",
				description: `¿Desactivar "${product.name}"? No aparecerá en ventas nuevas.${salesWarning}`,
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
						placeholder="Buscar por código, nombre o descripción…"
						className="pl-9"
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							resetPage();
						}}
					/>
				</div>
				<Select
					value={categoryId}
					onValueChange={(v) => {
						setCategoryId(v as string | "ALL");
						resetPage();
					}}
				>
					<SelectTrigger className="w-full cursor-pointer md:w-[200px]">
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
					value={brandId}
					onValueChange={(v) => {
						setBrandId(v as string | "ALL");
						resetPage();
					}}
				>
					<SelectTrigger className="w-full cursor-pointer md:w-[180px]">
						<SelectValue placeholder="Marca" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL" className="cursor-pointer">
							Todas las marcas
						</SelectItem>
						{brandOptions.map((b) => (
							<SelectItem key={b.id} value={b.id} className="cursor-pointer">
								{b.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select
					value={status}
					onValueChange={(v) => {
						setStatus(v as StatusFilter);
						resetPage();
					}}
				>
					<SelectTrigger className="w-full cursor-pointer md:w-[160px]">
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
				onUpdatePricing={handleOpenPricingDialog}
				canEdit={canEdit}
				canDeactivate={canDeactivate}
				canReactivate={canReactivate}
				canUpdatePricing={canUpdatePricing}
				canViewCost={canViewCost}
				isLoading={productsLoading}
			/>

			<DataTablePagination
				page={page}
				totalPages={totalPages}
				total={total}
				pageSize={pageSize}
				onPageChange={setPage}
				onPageSizeChange={setPageSize}
				itemLabel="producto"
			/>

			<ConfirmDialog
				open={confirmDialog.open}
				onOpenChange={(open) => {
					if (!open) {
						setConfirmDialog({
							open: false,
							product: null,
							action: null,
							salesCount: 0,
						});
						setPendingDeactivateId(null);
					}
				}}
				title={confirmProps.title}
				description={confirmProps.description}
				confirmLabel={confirmProps.confirmLabel}
				onConfirm={handleConfirm}
				isLoading={isConfirmLoading}
				variant={confirmProps.variant}
			/>

			<UpdatePricingDialog
				open={pricingDialogOpen}
				onOpenChange={(open) => {
					setPricingDialogOpen(open);
					if (!open) {
						setPricingProduct(null);
						setPricingError(null);
					}
				}}
				product={pricingProduct}
				onSubmit={handleSubmitPricing}
				isLoading={updatePricing.isPending}
				errorMessage={pricingError}
			/>
		</div>
	);
}
