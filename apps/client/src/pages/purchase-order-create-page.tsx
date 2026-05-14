import { zodResolver } from "@hookform/resolvers/zod";
import { IconArrowLeft } from "@tabler/icons-react";
import { useMemo } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import {
	hasPermissionOrSystemAdmin,
	PERMISSION_KEYS,
} from "@/lib/permission-keys";
import {
	useCreatePurchaseOrder,
	useSupplierProducts,
	useSuppliersLite,
} from "@/modules/purchase-orders/hooks/use-purchase-orders";

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

export function PurchaseOrderCreatePage() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const canCreate = hasPermissionOrSystemAdmin(
		user?.permissions,
		PERMISSION_KEYS.PURCHASE_ORDERS_CREATE,
		user?.role.slug,
	);

	const { data: suppliers = [] } = useSuppliersLite();
	const createOrder = useCreatePurchaseOrder();

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

	if (!canCreate) {
		return <Navigate to="/purchase-orders" replace />;
	}

	function goBackToList() {
		navigate("/purchase-orders");
	}

	return (
		<div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
			<div className="flex flex-col gap-3">
				<Button
					type="button"
					variant="ghost"
					className="-ml-2 w-fit cursor-pointer gap-2 text-muted-foreground"
					onClick={goBackToList}
				>
					<IconArrowLeft className="size-4" />
					Volver al listado
				</Button>
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">
						Nueva orden de compra
					</h1>
					<p className="text-sm text-muted-foreground">
						Completa los datos generales y luego agrega los items de la orden.
					</p>
				</div>
			</div>

			<form
				onSubmit={form.handleSubmit((values) => {
					createOrder.mutate(values as never, {
						onSuccess: () => {
							form.reset({ supplierId: "", items: [] });
							navigate("/purchase-orders");
						},
					});
				})}
				className="flex flex-col gap-6"
				noValidate
			>
				<div className="rounded-lg border bg-card p-4 md:p-6">
					<div className="flex flex-col gap-4">
						<div className="grid gap-4 md:grid-cols-2">
							<div className="flex flex-col gap-2">
								<Label>Proveedor</Label>
								<Select
									value={supplierId}
									onValueChange={(value) => {
										form.setValue("supplierId", value, {
											shouldValidate: true,
										});
										form.resetField("items", { defaultValue: [] });
										void form.trigger("items");
									}}
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
							<div className="flex flex-col gap-2">
								<Label>Fecha y hora estimada</Label>
								<Input
									type="datetime-local"
									{...form.register("estimatedReceiptDate")}
								/>
							</div>
						</div>

						<div className="flex flex-col gap-2">
							<Label>Condiciones de pago</Label>
							<Input {...form.register("paymentTerms")} />
						</div>

						<div className="flex flex-col gap-2">
							<Label>Observaciones</Label>
							<Textarea {...form.register("notes")} />
						</div>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-4 md:p-6">
					<div className="flex flex-col gap-4">
						<div className="flex items-center justify-between gap-3">
							<div>
								<h2 className="font-medium">Items</h2>
								<p className="text-sm text-muted-foreground">
									Agrega los productos y sus costos estimados.
								</p>
							</div>
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
								No hay productos activos asociados a este proveedor. Crea o
								edita productos y asígnalos a este proveedor para poder
								agregarlos.
							</p>
						) : null}

						{!hasSupplierSelected ? (
							<p className="text-sm text-muted-foreground">
								Selecciona un proveedor para habilitar productos en los items.
							</p>
						) : null}

						<div className="flex flex-col gap-3">
							{fields.map((field, index) => (
								<div
									key={field.id}
									className="grid gap-3 rounded-md border p-3 md:grid-cols-4"
								>
									<div className="flex flex-col gap-1">
										<Label htmlFor={`item-product-${index}`}>Producto</Label>
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
												{form.formState.errors.items[index]?.productId?.message}
											</p>
										) : null}
									</div>

									<div className="flex flex-col gap-1">
										<Label htmlFor={`item-quantity-${index}`}>Cantidad</Label>
										<Input
											id={`item-quantity-${index}`}
											type="number"
											min={1}
											{...form.register(`items.${index}.quantityOrdered`)}
										/>
										{form.formState.errors.items?.[index]?.quantityOrdered ? (
											<p className="text-xs text-destructive">
												{
													form.formState.errors.items[index]?.quantityOrdered
														?.message
												}
											</p>
										) : null}
									</div>

									<div className="flex flex-col gap-1">
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
												{form.formState.errors.items[index]?.unitCost?.message}
											</p>
										) : null}
										<p className="text-xs text-muted-foreground">
											Subtotal: $
											{(
												(Number(watchedItems[index]?.quantityOrdered ?? 0) ||
													0) * (Number(watchedItems[index]?.unitCost ?? 0) || 0)
											).toFixed(2)}
										</p>
									</div>

									<div className="flex flex-col gap-1">
										<Label>Acción</Label>
										<Button
											type="button"
											variant="destructive"
											className="w-full cursor-pointer"
											onClick={() => remove(index)}
										>
											Quitar
										</Button>
									</div>
								</div>
							))}
						</div>

						{form.formState.errors.items?.message ? (
							<p className="text-sm text-destructive">
								{form.formState.errors.items.message}
							</p>
						) : null}

						<p className="text-sm font-medium">
							Total estimado: ${total.toFixed(2)}
						</p>
					</div>
				</div>

				<div className="flex items-center justify-end gap-3">
					<Button
						type="button"
						variant="outline"
						className="cursor-pointer"
						onClick={goBackToList}
					>
						Cancelar
					</Button>
					<Button
						type="submit"
						className="cursor-pointer"
						disabled={createOrder.isPending}
					>
						Guardar orden
					</Button>
				</div>
			</form>
		</div>
	);
}
