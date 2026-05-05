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
import { useAuth } from "@/lib/auth-context.js";
import {
	hasPermissionOrSystemAdmin,
	PERMISSION_KEYS,
} from "@/lib/permission-keys.js";
import { BrandFormDialog } from "@/modules/brands/components/brand-form-dialog.js";
import { BrandsTable } from "@/modules/brands/components/brands-table.js";
import {
	type Brand,
	useBrandsList,
	useCreateBrand,
	useDeactivateBrand,
	useReactivateBrand,
	useUpdateBrand,
} from "@/modules/brands/hooks/use-brands.js";
import { ConfirmDialog } from "@/modules/users/components/confirm-dialog.js";

type StatusFilter = "ALL" | "true" | "false";

const statusOptions: { value: StatusFilter; label: string }[] = [
	{ value: "ALL", label: "Todos" },
	{ value: "true", label: "Activos" },
	{ value: "false", label: "Inactivos" },
];

const DEBOUNCE_DELAY = 300;

export function MarcasPage() {
	const { user } = useAuth();
	const canUpload =
		hasPermissionOrSystemAdmin(
			user?.permissions,
			PERMISSION_KEYS.PRODUCTS_UPLOAD,
			user?.role?.slug,
		) ?? false;

	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, DEBOUNCE_DELAY);
	const [status, setStatus] = useState<StatusFilter>("true");
	const [page, setPage] = useState(1);

	const [formOpen, setFormOpen] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
	const [confirmDialog, setConfirmDialog] = useState<{
		open: boolean;
		brand: Brand | null;
		action: "deactivate" | "reactivate" | null;
	}>({ open: false, brand: null, action: null });

	const { data: brandsData, isLoading: brandsLoading } = useBrandsList({
		search: debouncedSearch || undefined,
		status,
		page,
		limit: 20,
	});

	const createBrand = useCreateBrand();
	const updateBrand = useUpdateBrand();
	const deactivateBrand = useDeactivateBrand();
	const reactivateBrand = useReactivateBrand();

	const brands = brandsData?.data ?? [];
	const total = brandsData?.total ?? 0;
	const totalPages = brandsData?.totalPages ?? 1;

	function handleEdit(brand: Brand) {
		setFormError(null);
		setEditingBrand(brand);
		setFormOpen(true);
	}

	function handleCreate() {
		setFormError(null);
		setEditingBrand(null);
		setFormOpen(true);
	}

	function handleDeactivate(brand: Brand) {
		setConfirmDialog({ open: true, brand, action: "deactivate" });
	}

	function handleReactivate(brand: Brand) {
		setConfirmDialog({ open: true, brand, action: "reactivate" });
	}

	function handleFormSubmit(data: {
		name: string;
		logoUrl?: string | null;
	}) {
		setFormError(null);

		if (editingBrand) {
			updateBrand.mutate(
				{
					id: editingBrand.id,
					data: {
						name: data.name,
						logoUrl: data.logoUrl === undefined ? undefined : data.logoUrl,
					},
				},
				{
					onSuccess: () => setFormOpen(false),
					onError: (error) => setFormError(error.message),
				},
			);
		} else {
			createBrand.mutate(
				{
					name: data.name,
					...(data.logoUrl ? { logoUrl: data.logoUrl } : {}),
				},
				{
					onSuccess: () => setFormOpen(false),
					onError: (error) => setFormError(error.message),
				},
			);
		}
	}

	function handleConfirm() {
		const { brand, action } = confirmDialog;
		if (!brand || !action) return;

		if (action === "deactivate") {
			deactivateBrand.mutate(brand.id, {
				onSuccess: () =>
					setConfirmDialog({ open: false, brand: null, action: null }),
			});
		} else {
			reactivateBrand.mutate(brand.id, {
				onSuccess: () =>
					setConfirmDialog({ open: false, brand: null, action: null }),
			});
		}
	}

	const isConfirmLoading =
		deactivateBrand.isPending || reactivateBrand.isPending;

	function buildConfirmProps() {
		const { brand, action } = confirmDialog;
		if (!brand || !action)
			return { title: "", description: "", confirmLabel: "" };

		if (action === "deactivate") {
			return {
				title: "Desactivar marca",
				description: `¿Desactivar "${brand.name}"? No podrá asignarse a productos activos hasta que no queden productos activos usando esta marca.`,
				confirmLabel: "Desactivar",
				variant: "destructive" as const,
			};
		}

		return {
			title: "Reactivar marca",
			description: `¿Reactivar "${brand.name}"? Volverá a estar disponible para asignar a productos.`,
			confirmLabel: "Reactivar",
			variant: "default" as const,
		};
	}

	const confirmProps = buildConfirmProps();

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Marcas</h1>
					<p className="text-muted-foreground text-sm">
						Gestiona las marcas comerciales del catálogo.
					</p>
				</div>
				<Button onClick={handleCreate} className="cursor-pointer">
					<IconPlus className="mr-2 h-4 w-4" />
					Nueva marca
				</Button>
			</div>

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

			<BrandsTable
				brands={brands}
				onEdit={handleEdit}
				onDeactivate={handleDeactivate}
				onReactivate={handleReactivate}
				isLoading={brandsLoading}
			/>

			{totalPages > 1 && (
				<div className="flex items-center justify-between text-sm text-muted-foreground">
					<span>
						{total} marca{total !== 1 ? "s" : ""} en total
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

			<BrandFormDialog
				open={formOpen}
				onOpenChange={(open) => {
					setFormOpen(open);
					if (!open) {
						setEditingBrand(null);
						setFormError(null);
					}
				}}
				brand={editingBrand}
				onSubmit={handleFormSubmit}
				errorMessage={formError}
				isLoading={createBrand.isPending || updateBrand.isPending}
				uploadDisabled={!canUpload}
			/>

			<ConfirmDialog
				open={confirmDialog.open}
				onOpenChange={(open) => {
					if (!open)
						setConfirmDialog({ open: false, brand: null, action: null });
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
