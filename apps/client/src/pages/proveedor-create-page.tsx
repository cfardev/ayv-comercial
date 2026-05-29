import { IconArrowLeft } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
	SupplierForm,
	type SupplierFormSubmitData,
} from "@/modules/suppliers/components/supplier-form.js";
import { useCreateSupplier } from "@/modules/suppliers/hooks/use-suppliers.js";

export function ProveedorCreatePage() {
	const navigate = useNavigate();
	const createSupplier = useCreateSupplier();
	const [formError, setFormError] = useState<string | null>(null);

	function goBack() {
		navigate("/proveedores");
	}

	function onSubmit(data: SupplierFormSubmitData) {
		setFormError(null);
		createSupplier.mutate(data, {
			onSuccess: () => navigate("/proveedores"),
			onError: (error) => setFormError(error.message),
		});
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
						Nuevo proveedor
					</h1>
					<p className="text-muted-foreground text-sm">
						Completa los datos para crear un nuevo proveedor.
					</p>
				</div>
			</div>

			<SupplierForm
				active
				onSubmit={onSubmit}
				onCancel={goBack}
				errorMessage={formError}
				isLoading={createSupplier.isPending}
				idPrefix="supplier-create"
			/>
		</div>
	);
}
