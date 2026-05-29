import { zodResolver } from "@hookform/resolvers/zod";
import {
	IconAlertTriangle,
	IconFileText,
	IconSearch,
} from "@tabler/icons-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import { usePurchaseOrder, usePurchaseOrders } from "@/modules/purchase-orders/hooks/use-purchase-orders";
import type { PurchaseOrderStatus } from "@/modules/purchase-orders/types/api";
import { ConfirmDialog } from "@/modules/users/components/confirm-dialog";

const poStatusLabels: Record<PurchaseOrderStatus, string> = {
	PENDING: "Pendiente",
	SENT: "Enviada",
	PARTIAL: "Parcial",
	RECEIVED: "Recibida",
	CANCELLED: "Anulada",
};

const entryFormSchema = z.object({
	purchaseOrderId: z.string().min(1, "Orden de compra requerida"),
	entryDate: z.string().optional(),
	notes: z.string().optional(),
	items: z
		.array(
			z.object({
				productId: z.string().min(1, "Producto requerido"),
				productName: z.string(),
				quantityOrdered: z.number().min(1),
				quantityReceived: z.coerce
					.number()
					.min(1, "Cantidad debe ser mayor a cero"),
				lotNumber: z.string().optional(),
				expirationDate: z.string().optional(),
			}),
		)
		.min(1, "Debe haber al menos un item"),
});

export type EntryFormValues = z.infer<typeof entryFormSchema>;

export function CreateEntryForm({
	onSubmit,
	isPending,
}: {
	onSubmit: (values: EntryFormValues) => void;
	isPending: boolean;
}) {
	const [selectedPoId, setSelectedPoId] = useState<string>("");
	const [poDialogOpen, setPoDialogOpen] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [pendingValues, setPendingValues] = useState<EntryFormValues | null>(
		null,
	);

	const form = useForm<EntryFormValues>({
		resolver: zodResolver(entryFormSchema) as never,
		defaultValues: {
			purchaseOrderId: "",
			entryDate: "",
			notes: "",
			items: [],
		},
	});

	const { fields, replace } = useFieldArray({
		control: form.control,
		name: "items",
	});

	// Load PO when selected
	const { data: selectedPo, isLoading: poLoading } = usePurchaseOrder(
		selectedPoId || null,
	);

	// When PO loads, populate items
	const poItems = selectedPo?.items ?? [];
	if (selectedPo && poItems.length > 0 && fields.length === 0) {
		replace(
			poItems.map((item) => ({
				productId: item.productId,
				productName: item.productName,
				quantityOrdered: item.quantityOrdered,
				quantityReceived: item.quantityOrdered,
				lotNumber: "",
				expirationDate: "",
			})),
		);
	}

	const handlePoSelect = (poId: string) => {
		setSelectedPoId(poId);
		form.setValue("purchaseOrderId", poId, { shouldValidate: true });
		setPoDialogOpen(false);
		// Reset items so they get repopulated
		replace([]);
	};

	// Collect items where received > ordered
	const exceededItems = fields
		.map((_field, index) => {
			const ordered = form.watch(`items.${index}.quantityOrdered`) ?? 0;
			const received = form.watch(`items.${index}.quantityReceived`) ?? 0;
			return {
				index,
				ordered,
				received,
				productName: form.watch(`items.${index}.productName`),
			};
		})
		.filter((item) => item.received > item.ordered);

	const handleFormSubmit = (values: EntryFormValues) => {
		// Check if any item exceeds ordered quantity
		const hasExceeded = values.items.some(
			(item) => item.quantityReceived > item.quantityOrdered,
		);
		if (hasExceeded) {
			setPendingValues(values);
			setConfirmOpen(true);
			return;
		}
		onSubmit(values);
	};

	const handleConfirm = () => {
		setConfirmOpen(false);
		if (pendingValues) {
			onSubmit(pendingValues);
			setPendingValues(null);
		}
	};

	return (
		<form
			onSubmit={form.handleSubmit(handleFormSubmit)}
			className="space-y-4"
			noValidate
		>
			{/* Purchase Order Selector */}
			<div className="space-y-2">
				<Label>Orden de compra</Label>
				<PurchaseOrderSelector
					value={selectedPoId}
					onSelect={handlePoSelect}
					open={poDialogOpen}
					onOpenChange={setPoDialogOpen}
				/>
				{form.formState.errors.purchaseOrderId ? (
					<p className="text-sm text-destructive">
						{form.formState.errors.purchaseOrderId.message}
					</p>
				) : null}
			</div>

			{/* Entry Date and Notes */}
			<div className="grid gap-3 sm:grid-cols-2">
				<div className="space-y-2">
					<Label>Fecha de entrada</Label>
					<Input type="datetime-local" {...form.register("entryDate")} />
				</div>
				<div className="space-y-2">
					<Label>Observaciones</Label>
					<Textarea {...form.register("notes")} />
				</div>
			</div>

			{/* Items Section */}
			{selectedPo ? (
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label>Productos de la orden</Label>
						<Badge variant="outline">
							{selectedPo.referenceNumber} — {poStatusLabels[selectedPo.status]}
						</Badge>
					</div>

					{/* Warning if PO is not SENT or PARTIAL */}
					{selectedPo.status !== "SENT" && selectedPo.status !== "PARTIAL" ? (
						<div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
							<IconAlertTriangle className="h-4 w-4 shrink-0" />
							La orden debe estar en estado enviada o parcial.
						</div>
					) : null}

					<div className="overflow-x-auto rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Producto</TableHead>
									<TableHead className="w-[100px]">Ordenado</TableHead>
									<TableHead className="w-[120px]">Recibido</TableHead>
									<TableHead className="w-[140px]">Lote</TableHead>
									<TableHead className="w-[160px]">Vencimiento</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{fields.map((field, index) => {
									const ordered =
										form.watch(`items.${index}.quantityOrdered`) ?? 0;
									const received =
										form.watch(`items.${index}.quantityReceived`) ?? 0;
									const exceedsOrdered = received > ordered;

									return (
										<TableRow key={field.id}>
											<TableCell>
												<div>
													<p className="font-medium">
														{form.watch(`items.${index}.productName`)}
													</p>
												</div>
											</TableCell>
											<TableCell>{ordered}</TableCell>
											<TableCell>
												<div className="space-y-1">
													<Input
														type="number"
														min={1}
														className={cn(
															"w-full",
															exceedsOrdered && "border-amber-400",
														)}
														{...form.register(
															`items.${index}.quantityReceived`,
														)}
													/>
													{exceedsOrdered ? (
														<p className="text-xs text-amber-600">
															Supera lo ordenado
														</p>
													) : null}
													{form.formState.errors.items?.[index]
														?.quantityReceived ? (
														<p className="text-xs text-destructive">
															{
																form.formState.errors.items[index]
																	?.quantityReceived?.message
															}
														</p>
													) : null}
												</div>
											</TableCell>
											<TableCell>
												<Input
													placeholder="Opcional"
													{...form.register(`items.${index}.lotNumber`)}
												/>
											</TableCell>
											<TableCell>
												<Input
													type="date"
													{...form.register(`items.${index}.expirationDate`)}
												/>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>
				</div>
			) : poLoading ? (
				<div className="space-y-2">
					<Label>Cargando productos...</Label>
					<Skeleton className="h-24 w-full" />
				</div>
			) : null}

			<Button
				type="submit"
				className="w-full cursor-pointer"
				disabled={
					isPending ||
					!selectedPo ||
					(selectedPo.status !== "SENT" && selectedPo.status !== "PARTIAL")
				}
			>
				{isPending ? "Registrando..." : "Confirmar entrada"}
			</Button>

			<ConfirmDialog
				open={confirmOpen}
				onOpenChange={setConfirmOpen}
				title="Cantidad recibida excede la ordenada"
				description={
					exceededItems.length > 0
						? `Los siguientes productos tienen una cantidad recibida mayor a la ordenada: ${exceededItems.map((item) => `${item.productName} (${item.received} / ${item.ordered})`).join(", ")}. ¿Desea continuar de todos modos?`
						: ""
				}
				confirmLabel="Continuar"
				cancelLabel="Revisar cantidades"
				onConfirm={handleConfirm}
				isLoading={isPending}
			/>
		</form>
	);
}

function PurchaseOrderSelector({
	value,
	onSelect,
	open,
	onOpenChange,
}: {
	value: string;
	onSelect: (poId: string) => void;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 300);

	const { data, isLoading } = usePurchaseOrders({
		search: debouncedSearch || undefined,
		status: ["SENT", "PARTIAL"],
		page: 1,
		limit: 50,
	});

	const orders = data?.data ?? [];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant="outline"
					className="cursor-pointer w-full justify-between font-normal"
				>
					<span className="truncate">
						{value
							? (orders.find((o) => o.id === value)?.referenceNumber ??
								"Seleccionar orden...")
							: "Seleccionar orden de compra..."}
					</span>
					<IconFileText className="size-4 shrink-0 opacity-50" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Seleccionar orden de compra</DialogTitle>
				</DialogHeader>
				<div className="space-y-3">
					<div className="relative">
						<IconSearch className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Buscar por numero o proveedor..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-9"
						/>
					</div>
					<div className="max-h-64 overflow-auto space-y-2">
						{isLoading ? (
							<div className="space-y-2">
								{["sk-1", "sk-2", "sk-3"].map((key) => (
									<Skeleton key={key} className="h-12 w-full" />
								))}
							</div>
						) : orders.length === 0 ? (
							<p className="text-sm text-muted-foreground text-center py-4">
								No hay ordenes en estado enviada o parcial.
							</p>
						) : (
							orders.map((order) => (
								<button
									key={order.id}
									type="button"
									className={cn(
										"w-full text-left rounded-md border p-3 transition-colors cursor-pointer hover:bg-muted",
										order.id === value && "border-primary bg-muted",
									)}
									onClick={() => onSelect(order.id)}
								>
									<div className="flex items-center justify-between">
										<div>
											<p className="font-medium text-sm">
												{order.referenceNumber}
											</p>
											<p className="text-xs text-muted-foreground">
												{order.supplierName}
											</p>
										</div>
										<Badge
											variant={
												order.status === "SENT" ? "default" : "secondary"
											}
										>
											{poStatusLabels[order.status]}
										</Badge>
									</div>
								</button>
							))
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

