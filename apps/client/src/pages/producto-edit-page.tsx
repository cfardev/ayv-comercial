import { IconArrowLeft } from "@tabler/icons-react";
import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context.js";
import {
	hasPermissionOrSystemAdmin,
	PERMISSION_KEYS,
} from "@/lib/permission-keys.js";
import { ProductForm } from "@/modules/products/components/product-form.js";
import {
	useProduct,
	useUpdateProduct,
} from "@/modules/products/hooks/use-products.js";
import type { ProductFormValues } from "@/modules/products/types/schema.js";
import { buildUpdateProductPayload } from "@/modules/products/utils/build-product-api-payload.js";

export function ProductoEditPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { user } = useAuth();

	const canEdit = hasPermissionOrSystemAdmin(
		user?.permissions,
		PERMISSION_KEYS.PRODUCTS_UPDATE,
		user?.role?.slug,
	);

	const { data: product, isLoading, isError } = useProduct(id ?? null);
	const updateProduct = useUpdateProduct();
	const [formError, setFormError] = useState<string | null>(null);

	if (!canEdit) {
		return <Navigate to="/productos" replace />;
	}

	if (!id) {
		return <Navigate to="/productos" replace />;
	}

	function goBack() {
		navigate("/productos");
	}

	async function onSubmitForm(values: ProductFormValues) {
		if (!product) return;
		setFormError(null);
		try {
			await updateProduct.mutateAsync({
				id: product.id,
				data: buildUpdateProductPayload(values),
			});
			navigate("/productos");
		} catch (e) {
			setFormError(e instanceof Error ? e.message : "Error al guardar");
		}
	}

	if (isLoading) {
		return (
			<div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (isError || !product) {
		return <Navigate to="/productos" replace />;
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
						Editar producto
					</h1>
					<p className="text-muted-foreground text-sm">
						Modifica los datos de {product.name}.
					</p>
				</div>
			</div>

			<ProductForm
				active
				layout="page"
				idPrefix="product-edit-form"
				product={product}
				onSubmit={onSubmitForm}
				onCancel={goBack}
				errorMessage={formError}
				isLoading={updateProduct.isPending}
			/>
		</div>
	);
}
