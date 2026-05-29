import { IconArrowLeft, IconPackage } from "@tabler/icons-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
	hasPermissionOrSystemAdmin,
	PERMISSION_KEYS,
} from "@/lib/permission-keys";
import {
	CreateEntryForm,
	type EntryFormValues,
} from "@/modules/inventory-entries/components/create-entry-form";
import { useCreateInventoryEntry } from "@/modules/inventory-entries/hooks/use-inventory-entries";

export function InventoryEntryCreatePage() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const canCreate = hasPermissionOrSystemAdmin(
		user?.permissions,
		PERMISSION_KEYS.INVENTORY_ENTRIES_CREATE,
		user?.role.slug,
	);

	const createEntry = useCreateInventoryEntry();
	const [createdEntryNumber, setCreatedEntryNumber] = useState<string | null>(
		null,
	);

	if (!canCreate) {
		return <Navigate to="/inventario/entries" replace />;
	}

	function goBack() {
		navigate("/inventario/entries");
	}

	function handleSubmit(values: EntryFormValues) {
		createEntry.mutate(
			{
				purchaseOrderId: values.purchaseOrderId,
				entryDate: values.entryDate || undefined,
				notes: values.notes || undefined,
				items: values.items.map((item) => ({
					productId: item.productId,
					quantityReceived: item.quantityReceived,
					lotNumber: item.lotNumber || undefined,
					expirationDate: item.expirationDate || undefined,
				})),
			},
			{
				onSuccess: (result) => {
					setCreatedEntryNumber(result.entryNumber);
				},
			},
		);
	}

	if (createdEntryNumber) {
		return (
			<div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
				<div className="space-y-4 py-4 text-center max-w-lg mx-auto">
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
						<IconPackage className="h-6 w-6 text-green-600" />
					</div>
					<div>
						<h1 className="text-lg font-semibold">Entrada registrada</h1>
						<p className="text-sm text-muted-foreground mt-1">
							Numero de entrada: <strong>{createdEntryNumber}</strong>
						</p>
					</div>
					<div className="flex justify-center gap-3">
						<Button
							variant="outline"
							className="cursor-pointer"
							onClick={goBack}
						>
							Volver al listado
						</Button>
						<Button asChild className="cursor-pointer">
							<Link to="/inventario/entries">Ver todas las entradas</Link>
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
			<div className="flex flex-col gap-3">
				<Button
					type="button"
					variant="ghost"
					className="cursor-pointer w-fit gap-2 -ml-2 text-muted-foreground"
					onClick={goBack}
				>
					<IconArrowLeft className="size-4" />
					Volver al listado
				</Button>
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">
						Nueva entrada de inventario
					</h1>
					<p className="text-muted-foreground text-sm">
						Registra la recepcion de mercaderia asociada a una orden de compra.
					</p>
				</div>
			</div>

			<CreateEntryForm
				isPending={createEntry.isPending}
				onSubmit={handleSubmit}
			/>
		</div>
	);
}
