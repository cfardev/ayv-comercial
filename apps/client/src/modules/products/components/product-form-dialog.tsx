import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { Product } from "../types/api.js";
import type { ProductFormValues } from "../types/schema.js";
import { ProductForm } from "./product-form.js";

interface ProductFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	product: Product | null;
	onSubmit: (data: ProductFormValues) => void;
	errorMessage?: string | null;
	isLoading?: boolean;
}

export function ProductFormDialog({
	open,
	onOpenChange,
	product,
	onSubmit,
	errorMessage,
	isLoading,
}: ProductFormDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
				{product ? (
					<>
						<DialogHeader>
							<DialogTitle>Editar producto</DialogTitle>
							<DialogDescription>
								Modifica los datos del producto y sus imágenes.
							</DialogDescription>
						</DialogHeader>

						<ProductForm
							active={open}
							product={product}
							layout="dialog"
							idPrefix="product-dialog-form"
							onSubmit={onSubmit}
							onCancel={() => onOpenChange(false)}
							errorMessage={errorMessage}
							isLoading={isLoading}
						/>
					</>
				) : null}
			</DialogContent>
		</Dialog>
	);
}
