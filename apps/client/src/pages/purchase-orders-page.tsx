import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
	usePurchaseOrder,
	usePurchaseOrders,
	useUpdatePurchaseOrderStatus,
} from "@/modules/purchase-orders/hooks/use-purchase-orders";
import type { PurchaseOrderStatus } from "@/modules/purchase-orders/types/api";

const statusLabels: Record<PurchaseOrderStatus, string> = {
	PENDING: "Pendiente",
	SENT: "Enviada",
	PARTIAL: "Parcial",
	RECEIVED: "Recibida",
	CANCELLED: "Anulada",
};

const allowedStatusByCurrent: Record<
	PurchaseOrderStatus,
	PurchaseOrderStatus[]
> = {
	PENDING: ["SENT", "CANCELLED"],
	SENT: ["PARTIAL", "RECEIVED", "CANCELLED"],
	PARTIAL: ["RECEIVED"],
	RECEIVED: [],
	CANCELLED: [],
};

function formatDateTime(value: string) {
	return new Date(value).toLocaleString();
}

export function PurchaseOrdersPage() {
	const { user } = useAuth();
	const canRead = hasPermissionOrSystemAdmin(
		user?.permissions,
		PERMISSION_KEYS.PURCHASE_ORDERS_READ,
		user?.role.slug,
	);
	const canCreate = hasPermissionOrSystemAdmin(
		user?.permissions,
		PERMISSION_KEYS.PURCHASE_ORDERS_CREATE,
		user?.role.slug,
	);
	const canUpdate = hasPermissionOrSystemAdmin(
		user?.permissions,
		PERMISSION_KEYS.PURCHASE_ORDERS_UPDATE,
		user?.role.slug,
	);

	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<
		"ACTIVE" | PurchaseOrderStatus
	>("ACTIVE");
	const { page, setPage, pageSize, setPageSize, resetPage } =
		usePaginationState();
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
	const debouncedSearch = useDebounce(search, 300);

	const status =
		statusFilter === "ACTIVE"
			? (["PENDING", "SENT"] as PurchaseOrderStatus[])
			: [statusFilter];

	const { data, isLoading } = usePurchaseOrders({
		search: debouncedSearch || undefined,
		status,
		page,
		limit: pageSize,
	});

	const updateStatus = useUpdatePurchaseOrderStatus();

	if (!canRead) {
		return (
			<p className="text-sm text-muted-foreground">
				No tienes permisos para ver ordenes de compra.
			</p>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">
						Ordenes de compra
					</h1>
					<p className="text-sm text-muted-foreground">
						Registra y monitorea compras a proveedores.
					</p>
				</div>
				{canCreate ? (
					<Button asChild className="cursor-pointer">
						<Link to="/purchase-orders/new">
							<IconPlus className="mr-2 h-4 w-4" />
							Nueva orden
						</Link>
					</Button>
				) : null}
			</div>

			<div className="flex flex-wrap gap-3">
				<div className="relative min-w-[220px] flex-1">
					<IconSearch className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Buscar por numero o proveedor..."
						value={search}
						onChange={(event) => {
							setSearch(event.target.value);
							resetPage();
						}}
						className="pl-9"
					/>
				</div>
				<Select
					value={statusFilter}
					onValueChange={(value) =>
						setStatusFilter(value as typeof statusFilter)
					}
				>
					<SelectTrigger className="w-[200px] cursor-pointer">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ACTIVE" className="cursor-pointer">
							Activas (pendiente/enviada)
						</SelectItem>
						{Object.keys(statusLabels).map((statusKey) => (
							<SelectItem
								key={statusKey}
								value={statusKey}
								className="cursor-pointer"
							>
								{statusLabels[statusKey as PurchaseOrderStatus]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="overflow-x-auto rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Numero</TableHead>
							<TableHead>Proveedor</TableHead>
							<TableHead>Fecha</TableHead>
							<TableHead>Total estimado</TableHead>
							<TableHead>Estado</TableHead>
							<TableHead>Fecha estimada</TableHead>
							<TableHead>Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"].map((key) => (
								<TableRow key={key}>
									<TableCell colSpan={7}>
										<Skeleton className="h-4 w-full" />
									</TableCell>
								</TableRow>
							))
						) : (data?.data ?? []).length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={7}
									className="py-8 text-center text-muted-foreground"
								>
									No hay ordenes de compra para mostrar.
								</TableCell>
							</TableRow>
						) : (
							(data?.data ?? []).map((order) => (
								<TableRow key={order.id}>
									<TableCell>{order.referenceNumber}</TableCell>
									<TableCell>{order.supplierName}</TableCell>
									<TableCell>{formatDateTime(order.createdAt)}</TableCell>
									<TableCell>
										{order.totalEstimated
											? `$${order.totalEstimated.toFixed(2)}`
											: "—"}
									</TableCell>
									<TableCell>{statusLabels[order.status]}</TableCell>
									<TableCell>
										{order.estimatedReceiptDate
											? formatDateTime(order.estimatedReceiptDate)
											: "—"}
									</TableCell>
									<TableCell>
										<div className="flex gap-2">
											<Button
												variant="outline"
												className="cursor-pointer"
												onClick={() => setSelectedOrderId(order.id)}
											>
												Detalle
											</Button>
											{canUpdate
												? allowedStatusByCurrent[order.status].map(
														(nextStatus) => (
															<Button
																key={nextStatus}
																className="cursor-pointer"
																size="sm"
																onClick={() =>
																	updateStatus.mutate({
																		id: order.id,
																		status: nextStatus,
																	})
																}
															>
																{statusLabels[nextStatus]}
															</Button>
														),
													)
												: null}
											<Button
												asChild
												variant="secondary"
												className="cursor-pointer"
											>
												<Link to={`/inventario?purchaseOrderId=${order.id}`}>
													Registrar recepcion (CU10)
												</Link>
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			<PurchaseOrderDetailDialog
				orderId={selectedOrderId}
				onClose={() => setSelectedOrderId(null)}
			/>

			<DataTablePagination
				page={page}
				totalPages={data?.totalPages ?? 1}
				total={data?.total ?? 0}
				pageSize={pageSize}
				onPageChange={setPage}
				onPageSizeChange={setPageSize}
				itemLabel="orden"
			/>
		</div>
	);
}

function PurchaseOrderDetailDialog({
	orderId,
	onClose,
}: {
	orderId: string | null;
	onClose: () => void;
}) {
	const { data: selected } = usePurchaseOrder(orderId);

	return (
		<Dialog
			open={Boolean(orderId)}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Detalle de orden</DialogTitle>
				</DialogHeader>
				{selected ? (
					<div className="min-w-0 space-y-3">
						<p className="text-sm">
							{selected.referenceNumber} - {selected.supplierName}
						</p>
						<div className="overflow-x-auto rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Producto</TableHead>
										<TableHead className="text-right">Cantidad</TableHead>
										<TableHead className="text-right">Unitario</TableHead>
										<TableHead className="text-right">Subtotal</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{selected.items?.map((item) => (
										<TableRow key={item.id}>
											<TableCell className="max-w-[200px] truncate">
												{item.productName}
											</TableCell>
											<TableCell className="text-right tabular-nums whitespace-nowrap">
												{item.quantityOrdered}
											</TableCell>
											<TableCell className="text-right tabular-nums whitespace-nowrap">
												{item.unitCost ? `$${item.unitCost.toFixed(2)}` : "—"}
											</TableCell>
											<TableCell className="text-right tabular-nums whitespace-nowrap">
												{item.subtotal ? `$${item.subtotal.toFixed(2)}` : "—"}
											</TableCell>
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
