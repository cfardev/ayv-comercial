import { IconArrowLeft } from "@tabler/icons-react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context.js";
import {
	hasPermissionOrSystemAdmin,
	PERMISSION_KEYS,
} from "@/lib/permission-keys.js";
import { ProductForm } from "@/modules/products/components/product-form.js";
import { useCreateProduct } from "@/modules/products/hooks/use-products.js";
import type { ProductFormValues } from "@/modules/products/types/schema.js";
import { buildCreateProductPayload } from "@/modules/products/utils/build-product-api-payload.js";

export function ProductoCreatePage() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const canCreate = hasPermissionOrSystemAdmin(
		user?.permissions,
		PERMISSION_KEYS.PRODUCTS_CREATE,
		user?.role?.slug,
	);

	const createProduct = useCreateProduct();
	const [formError, setFormError] = useState<string | null>(null);

	if (!canCreate) {
		return <Navigate to="/productos" replace />;
	}

	async function onSubmitForm(values: ProductFormValues) {
		setFormError(null);
		try {
			await createProduct.mutateAsync(buildCreateProductPayload(values));
			navigate("/productos");
		} catch (e) {
			setFormError(e instanceof Error ? e.message : "Error al guardar");
		}
	}

	function goBackToList() {
		navigate("/productos");
	}

	return (
		<div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
			<div className="flex flex-col gap-3">
				<Button
					type="button"
					variant="ghost"
					className="cursor-pointer w-fit gap-2 -ml-2 text-muted-foreground"
					onClick={goBackToList}
				>
					<IconArrowLeft className="size-4" />
					Volver al listado
				</Button>
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">
						Nuevo producto
					</h1>
					<p className="text-muted-foreground text-sm">
						Completa los datos; al menos una imagen es obligatoria.
					</p>
				</div>
			</div>

			<ProductForm
				active
				layout="page"
				idPrefix="product-create-form"
				product={null}
				onSubmit={onSubmitForm}
				onCancel={goBackToList}
				errorMessage={formError}
				isLoading={createProduct.isPending}
			/>
		</div>
	);
}
