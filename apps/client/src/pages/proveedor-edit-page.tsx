import { IconArrowLeft } from "@tabler/icons-react";
import { useState } from "react";
import {
	Navigate,
	useLocation,
	useNavigate,
	useParams,
} from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
	SupplierForm,
	type SupplierFormSubmitData,
} from "@/modules/suppliers/components/supplier-form.js";
import { useUpdateSupplier } from "@/modules/suppliers/hooks/use-suppliers.js";
import type { Supplier } from "@/modules/suppliers/types/api.js";

export function ProveedorEditPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const location = useLocation();
	const supplier = location.state?.supplier as Supplier | undefined;

	const updateSupplier = useUpdateSupplier();
	const [formError, setFormError] = useState<string | null>(null);

	if (!id || !supplier || supplier.id !== id) {
		return <Navigate to="/proveedores" replace />;
	}

	function goBack() {
		navigate("/proveedores");
	}

	function onSubmit(data: SupplierFormSubmitData) {
		setFormError(null);
		updateSupplier.mutate(
			{ id: supplier!.id, data },
			{
				onSuccess: () => navigate("/proveedores"),
				onError: (error) => setFormError(error.message),
			},
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
						Editar proveedor
					</h1>
					<p className="text-muted-foreground text-sm">
						Modifica los datos de {supplier.name}.
					</p>
				</div>
			</div>

			<SupplierForm
				active
				supplier={supplier}
				onSubmit={onSubmit}
				onCancel={goBack}
				errorMessage={formError}
				isLoading={updateSupplier.isPending}
				idPrefix="supplier-edit"
			/>
		</div>
	);
}
