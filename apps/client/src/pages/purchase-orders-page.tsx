import { zodResolver } from "@hookform/resolvers/zod";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/use-debounce.js";
import { useAuth } from "@/lib/auth-context";
import {
	hasPermissionOrSystemAdmin,
	PERMISSION_KEYS,
} from "@/lib/permission-keys";
import {
	useCreatePurchaseOrder,
	usePurchaseOrder,
	usePurchaseOrders,
	useSupplierProducts,
	useSuppliersLite,
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

const createSchema = z.object({
	supplierId: z.string().min(1, "Proveedor requerido"),
	estimatedReceiptDate: z.string().optional(),
	paymentTerms: z.string().optional(),
	notes: z.string().optional(),
	items: z
		.array(
			z.object({
				productId: z.string().min(1, "Producto requerido"),
				quantityOrdered: z.coerce.number().min(1, "Cantidad invalida"),
				unitCost: z.coerce.number().min(0.01, "Costo invalido"),
			}),
		)
		.min(1, "Debes agregar al menos un item"),
});

type CreateFormValues = z.infer<typeof createSchema>;

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

	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<
		"ACTIVE" | PurchaseOrderStatus
	>("ACTIVE");
	const [page, setPage] = useState(1);
	const [dialogOpen, setDialogOpen] = useState(false);
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
		limit: 20,
	});

	const { data: suppliers = [] } = useSuppliersLite();
	const createOrder = useCreatePurchaseOrder();
	const updateStatus = useUpdatePurchaseOrderStatus();

	const form = useForm<CreateFormValues>({
		resolver: zodResolver(createSchema) as never,
		defaultValues: { supplierId: "", items: [] },
	});
	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "items",
	});
	const watchedItems = useWatch({ control: form.control, name: "items" }) ?? [];

	const supplierId = form.watch("supplierId");
	const { data: supplierProducts = [] } = useSupplierProducts(supplierId);
	const hasSupplierSelected = Boolean(supplierId);
	const hasSupplierProducts = supplierProducts.length > 0;

	const total = useMemo(() => {
		return watchedItems.reduce((acc, item) => {
			const quantity = Number(item?.quantityOrdered ?? 0);
			const unitCost = Number(item?.unitCost ?? 0);
			if (Number.isNaN(quantity) || Number.isNaN(unitCost)) return acc;
			return acc + quantity * unitCost;
		}, 0);
	}, [watchedItems]);

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
					<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
						<DialogTrigger asChild>
							<Button className="cursor-pointer">
								<IconPlus className="mr-2 h-4 w-4" />
								Nueva orden
							</Button>
						</DialogTrigger>
						<DialogContent className="max-h-[85vh] overflow-auto sm:max-w-3xl">
							<DialogHeader>
								<DialogTitle>Nueva orden de compra</DialogTitle>
							</DialogHeader>
							<form
								onSubmit={form.handleSubmit((values) => {
									createOrder.mutate(values as never, {
										onSuccess: () => {
											setDialogOpen(false);
											form.reset({ supplierId: "", items: [] });
										},
									});
								})}
								className="space-y-4"
								noValidate
							>
								<div className="grid gap-3 sm:grid-cols-2">
									<div className="space-y-2">
										<Label>Proveedor</Label>
										<Select
											value={supplierId}
											onValueChange={(value) =>
												form.setValue("supplierId", value, {
													shouldValidate: true,
												})
											}
										>
											<SelectTrigger className="cursor-pointer">
												<SelectValue placeholder="Selecciona proveedor" />
											</SelectTrigger>
											<SelectContent>
												{suppliers.map((supplier) => (
													<SelectItem
														key={supplier.id}
														value={supplier.id}
														className="cursor-pointer"
													>
														{supplier.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{form.formState.errors.supplierId ? (
											<p className="text-sm text-destructive">
												{form.formState.errors.supplierId.message}
											</p>
										) : null}
									</div>
									<div className="space-y-2">
										<Label>Fecha y hora estimada</Label>
										<Input
											type="datetime-local"
											{...form.register("estimatedReceiptDate")}
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label>Condiciones de pago</Label>
									<Input {...form.register("paymentTerms")} />
								</div>
								<div className="space-y-2">
									<Label>Observaciones</Label>
									<Textarea {...form.register("notes")} />
								</div>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<Label>Items</Label>
										<Button
											type="button"
											className="cursor-pointer"
											variant="outline"
											onClick={() =>
												append({
													productId: "",
													quantityOrdered: 1,
													unitCost: 0,
												})
											}
											disabled={!hasSupplierSelected || !hasSupplierProducts}
										>
											Agregar item
										</Button>
									</div>
									{hasSupplierSelected && !hasSupplierProducts ? (
										<p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
											No hay productos activos asociados a este proveedor. Crea
											o edita productos y asígnalos a este proveedor para poder
											agregarlos.
										</p>
									) : null}
									{!hasSupplierSelected ? (
										<p className="text-sm text-muted-foreground">
											Selecciona un proveedor para habilitar productos en los
											items.
										</p>
									) : null}
									{fields.map((field, index) => (
										<div
											key={field.id}
											className="grid gap-2 rounded-md border p-3 sm:grid-cols-4"
										>
											<div className="space-y-1">
												<Label htmlFor={`item-product-${index}`}>
													Producto
												</Label>
												<Select
													value={form.watch(`items.${index}.productId`)}
													onValueChange={(value) =>
														form.setValue(`items.${index}.productId`, value, {
															shouldValidate: true,
														})
													}
													disabled={!hasSupplierProducts}
												>
													<SelectTrigger className="cursor-pointer">
														<SelectValue placeholder="Producto" />
													</SelectTrigger>
													<SelectContent>
														{supplierProducts.map((product) => (
															<SelectItem
																key={product.id}
																value={product.id}
																className="cursor-pointer"
															>
																{product.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												{form.formState.errors.items?.[index]?.productId ? (
													<p className="text-xs text-destructive">
														{
															form.formState.errors.items[index]?.productId
																?.message
														}
													</p>
												) : null}
											</div>
											<div className="space-y-1">
												<Label htmlFor={`item-quantity-${index}`}>
													Cantidad
												</Label>
												<Input
													id={`item-quantity-${index}`}
													type="number"
													min={1}
													{...form.register(`items.${index}.quantityOrdered`)}
												/>
												{form.formState.errors.items?.[index]
													?.quantityOrdered ? (
													<p className="text-xs text-destructive">
														{
															form.formState.errors.items[index]
																?.quantityOrdered?.message
														}
													</p>
												) : null}
											</div>
											<div className="space-y-1">
												<Label htmlFor={`item-unit-cost-${index}`}>
													Costo unitario
												</Label>
												<Input
													id={`item-unit-cost-${index}`}
													type="number"
													min={0.01}
													step="0.01"
													{...form.register(`items.${index}.unitCost`)}
												/>
												{form.formState.errors.items?.[index]?.unitCost ? (
													<p className="text-xs text-destructive">
														{
															form.formState.errors.items[index]?.unitCost
																?.message
														}
													</p>
												) : null}
												<p className="text-xs text-muted-foreground">
													Subtotal: $
													{(
														(Number(
															watchedItems[index]?.quantityOrdered ?? 0,
														) || 0) *
														(Number(watchedItems[index]?.unitCost ?? 0) || 0)
													).toFixed(2)}
												</p>
											</div>
											<div className="space-y-1">
												<Label>Acción</Label>
												<Button
													type="button"
													variant="destructive"
													className="cursor-pointer w-full"
													onClick={() => remove(index)}
												>
													Quitar
												</Button>
											</div>
										</div>
									))}
									{form.formState.errors.items?.message ? (
										<p className="text-sm text-destructive">
											{form.formState.errors.items.message}
										</p>
									) : null}
								</div>
								<p className="text-sm font-medium">
									Total estimado: ${total.toFixed(2)}
								</p>
								<Button
									type="submit"
									className="w-full cursor-pointer"
									disabled={createOrder.isPending}
								>
									Guardar orden
								</Button>
							</form>
						</DialogContent>
					</Dialog>
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
							setPage(1);
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
											{allowedStatusByCurrent[order.status].map(
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
											)}
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

			{(data?.totalPages ?? 1) > 1 ? (
				<div className="flex items-center justify-between text-sm text-muted-foreground">
					<span>{data?.total ?? 0} ordenes en total</span>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							className="cursor-pointer"
							disabled={page <= 1}
							onClick={() => setPage((current) => current - 1)}
						>
							Anterior
						</Button>
						<span className="flex items-center px-2">
							{page} / {data?.totalPages ?? 1}
						</span>
						<Button
							variant="outline"
							size="sm"
							className="cursor-pointer"
							disabled={page >= (data?.totalPages ?? 1)}
							onClick={() => setPage((current) => current + 1)}
						>
							Siguiente
						</Button>
					</div>
				</div>
			) : null}
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
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Detalle de orden</DialogTitle>
				</DialogHeader>
				{selected ? (
					<div className="space-y-3">
						<p className="text-sm">
							{selected.referenceNumber} - {selected.supplierName}
						</p>
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Producto</TableHead>
										<TableHead>Cantidad</TableHead>
										<TableHead>Unitario</TableHead>
										<TableHead>Subtotal</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{selected.items?.map((item) => (
										<TableRow key={item.id}>
											<TableCell>{item.productName}</TableCell>
											<TableCell>{item.quantityOrdered}</TableCell>
											<TableCell>
												{item.unitCost ? `$${item.unitCost.toFixed(2)}` : "—"}
											</TableCell>
											<TableCell>
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
