import { IconSearch } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { DataTablePagination } from "@/components/data-table-pagination";
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
import { useBrands } from "@/modules/brands/hooks/use-brands.js";
import { useCategories } from "@/modules/categories/hooks/use-categories.js";
import { StockTable } from "@/modules/inventory-stock/components/stock-table.js";
import { useStock } from "@/modules/inventory-stock/hooks/use-stock.js";
import type { StockStatus } from "@/modules/inventory-stock/types/api.js";
import { useSuppliers } from "@/modules/suppliers/hooks/use-suppliers.js";

const DEBOUNCE_DELAY = 300;

const stockStatusOptions: { value: StockStatus | "ALL"; label: string }[] = [
	{ value: "ALL", label: "Todos los estados" },
	{ value: "NORMAL", label: "Normal" },
	{ value: "LOW", label: "Bajo" },
	{ value: "OUT_OF_STOCK", label: "Agotado" },
];

export function StockPage() {
	const { user } = useAuth();
	const canViewCost = hasPermissionOrSystemAdmin(
		user?.permissions,
		PERMISSION_KEYS.PRODUCTS_UPDATE,
		user?.role?.slug,
	);

	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, DEBOUNCE_DELAY);
	const [stockStatus, setStockStatus] = useState<StockStatus | "ALL">("ALL");
	const [categoryId, setCategoryId] = useState<string | "ALL">("ALL");
	const [brandId, setBrandId] = useState<string | "ALL">("ALL");
	const [supplierId, setSupplierId] = useState<string | "ALL">("ALL");
	const { page, setPage, pageSize, setPageSize, resetPage } =
		usePaginationState();
	const [sortBy, setSortBy] = useState("name");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

	const { data: categoriesData } = useCategories({
		status: "true",
		limit: 100,
		page: 1,
	});
	const categoryOptions = useMemo(
		() => categoriesData?.data ?? [],
		[categoriesData?.data],
	);

	const { data: brandsData } = useBrands({ limit: 100 });
	const brandOptions = useMemo(() => brandsData ?? [], [brandsData]);

	const { data: suppliersData } = useSuppliers({
		status: "true",
		limit: 100,
		page: 1,
	});
	const supplierOptions = useMemo(
		() => suppliersData?.data ?? [],
		[suppliersData?.data],
	);

	const { data: stockData, isLoading } = useStock({
		search: debouncedSearch || undefined,
		categoryId: categoryId === "ALL" ? undefined : categoryId,
		brandId: brandId === "ALL" ? undefined : brandId,
		supplierId: supplierId === "ALL" ? undefined : supplierId,
		stockStatus: stockStatus === "ALL" ? undefined : stockStatus,
		isActive: "true",
		sortBy,
		sortOrder,
		page,
		limit: pageSize,
	});

	const items = stockData?.data ?? [];
	const total = stockData?.total ?? 0;
	const totalPages = stockData?.totalPages ?? 1;

	function handleSort(column: string) {
		if (sortBy === column) {
			setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
		} else {
			setSortBy(column);
			setSortOrder("asc");
		}
	}

	return (
		<div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">
					Consulta de existencias
				</h1>
				<p className="text-muted-foreground text-sm">
					Visualizá el stock actual de todos los productos ({total} en esta
					vista).
				</p>
			</div>

			<div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
				<div className="relative flex-1 min-w-[200px]">
					<IconSearch className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Buscar por código o nombre…"
						className="pl-9"
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							resetPage();
						}}
					/>
				</div>

				<Select
					value={stockStatus}
					onValueChange={(v) => {
						setStockStatus(v as StockStatus | "ALL");
						resetPage();
					}}
				>
					<SelectTrigger className="w-full cursor-pointer md:w-[180px]">
						<SelectValue placeholder="Estado de stock" />
					</SelectTrigger>
					<SelectContent>
						{stockStatusOptions.map((o) => (
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
					value={supplierId}
					onValueChange={(v) => {
						setSupplierId(v as string | "ALL");
						resetPage();
					}}
				>
					<SelectTrigger className="w-full cursor-pointer md:w-[200px]">
						<SelectValue placeholder="Proveedor" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL" className="cursor-pointer">
							Todos los proveedores
						</SelectItem>
						{supplierOptions.map((s) => (
							<SelectItem key={s.id} value={s.id} className="cursor-pointer">
								{s.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<StockTable
				items={items}
				canViewCost={canViewCost}
				isLoading={isLoading}
				sortBy={sortBy}
				sortOrder={sortOrder}
				onSort={handleSort}
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
		</div>
	);
}
