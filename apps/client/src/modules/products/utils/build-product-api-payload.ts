import type {
	CreateProductPayload,
	UpdateProductPayload,
} from "../types/api.js";
import type { ProductFormValues } from "../types/schema.js";

function mapImages(values: ProductFormValues) {
	return values.images.map((img, i) => ({
		url: img.url,
		fileKey: img.fileKey,
		sortOrder: img.sortOrder ?? i,
	}));
}

function mapBrand(values: ProductFormValues) {
	if (values.brandMode === "existing") {
		return {
			brandMode: "existing" as const,
			brandId: values.brandId,
		};
	}
	return {
		brandMode: "new" as const,
		newBrandName: values.newBrandName.trim(),
	};
}

export function buildCreateProductPayload(
	values: ProductFormValues,
): CreateProductPayload {
	return {
		code: values.code,
		name: values.name,
		description: values.description,
		cost: values.cost,
		price: values.price,
		categoryId: values.categoryId,
		images: mapImages(values),
		unitOfMeasure: values.unitOfMeasure || undefined,
		minimumStock: values.minimumStock,
		supplier: values.supplier || undefined,
		...mapBrand(values),
	};
}

export function buildUpdateProductPayload(
	values: ProductFormValues,
): UpdateProductPayload {
	return {
		code: values.code,
		name: values.name,
		description: values.description,
		cost: values.cost,
		price: values.price,
		categoryId: values.categoryId,
		images: mapImages(values),
		unitOfMeasure: values.unitOfMeasure || undefined,
		minimumStock: values.minimumStock,
		supplier: values.supplier || undefined,
		...mapBrand(values),
	};
}
