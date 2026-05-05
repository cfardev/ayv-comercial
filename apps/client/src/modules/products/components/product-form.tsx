import { zodResolver } from "@hookform/resolvers/zod";
import type { ComponentPropsWithoutRef } from "react";
import { useEffect, useMemo } from "react";
import { Controller, type Resolver, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
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
import { useCategories } from "@/modules/categories/hooks/use-categories.js";
import type { Product } from "../types/api.js";
import { type ProductFormValues, productFormSchema } from "../types/schema.js";
import {
	ProductImageDropzone,
	type ProductImageValue,
} from "./product-image-dropzone.js";

function PageFormFooter(props: ComponentPropsWithoutRef<"div">) {
	return (
		<div
			className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end"
			{...props}
		/>
	);
}

export interface ProductFormProps {
	active: boolean;
	product?: Product | null;
	onSubmit: (data: ProductFormValues) => void;
	onCancel: () => void;
	errorMessage?: string | null;
	isLoading?: boolean;
	/** Wrap actions in DialogFooter vs a plain flex row for full-page layout */
	layout: "dialog" | "page";
	/** Prefix for DOM ids to avoid clashes when nesting (e.g. page vs modal) */
	idPrefix?: string;
}

export function ProductForm({
	active,
	product,
	onSubmit,
	onCancel,
	errorMessage,
	isLoading,
	layout,
	idPrefix = "product-form",
}: ProductFormProps) {
	const { data: categoriesData, isLoading: categoriesLoading } = useCategories({
		status: "true",
		limit: 100,
		page: 1,
	});

	const categories = useMemo(
		() => categoriesData?.data ?? [],
		[categoriesData?.data],
	);

	const form = useForm<ProductFormValues>({
		resolver: zodResolver(productFormSchema) as Resolver<ProductFormValues>,
		defaultValues: {
			name: "",
			description: "",
			cost: 0.01,
			price: 0.02,
			categoryId: "",
			images: [],
		},
	});

	useEffect(() => {
		if (!active) return;
		if (product) {
			const imgs: ProductImageValue[] = [...product.images]
				.sort((a, b) => a.sortOrder - b.sortOrder)
				.map((img, i) => ({
					url: img.url,
					fileKey: img.fileKey ?? undefined,
					sortOrder: i,
				}));
			form.reset({
				name: product.name,
				description: product.description ?? "",
				cost: Number(product.cost),
				price: Number(product.price),
				categoryId: product.categoryId,
				images: imgs,
			});
		} else {
			form.reset({
				name: "",
				description: "",
				cost: 0.01,
				price: 0.02,
				categoryId: categories[0]?.id ?? "",
				images: [],
			});
		}
	}, [active, product, categories, form]);

	useEffect(() => {
		if (errorMessage) {
			form.setError("root", { message: errorMessage });
		}
	}, [errorMessage, form]);

	function handleSubmit(values: ProductFormValues) {
		form.clearErrors("root");
		onSubmit(values);
	}

	const Footer = layout === "dialog" ? DialogFooter : PageFormFooter;

	const nameId = `${idPrefix}-name`;
	const descId = `${idPrefix}-desc`;
	const costId = `${idPrefix}-cost`;
	const priceId = `${idPrefix}-price`;

	return (
		<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
			<div className="space-y-2">
				<Label>
					Imágenes <span className="text-destructive">*</span>
				</Label>
				<Controller
					control={form.control}
					name="images"
					render={({ field }) => (
						<ProductImageDropzone
							value={field.value}
							onChange={field.onChange}
							disabled={Boolean(isLoading)}
						/>
					)}
				/>
				{form.formState.errors.images && (
					<p className="text-sm text-destructive">
						{form.formState.errors.images.message}
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor={nameId}>
					Nombre <span className="text-destructive">*</span>
				</Label>
				<Input
					id={nameId}
					placeholder="Nombre del producto"
					{...form.register("name")}
				/>
				{form.formState.errors.name && (
					<p className="text-sm text-destructive">
						{form.formState.errors.name.message}
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor={descId}>Descripción</Label>
				<Textarea
					id={descId}
					placeholder="Opcional"
					{...form.register("description")}
				/>
			</div>

			<div className="space-y-2">
				<Label>
					Categoría <span className="text-destructive">*</span>
				</Label>
				<Controller
					control={form.control}
					name="categoryId"
					render={({ field }) => (
						<Select
							value={field.value}
							onValueChange={field.onChange}
							disabled={categoriesLoading}
						>
							<SelectTrigger className="cursor-pointer w-full">
								<SelectValue placeholder="Seleccionar" />
							</SelectTrigger>
							<SelectContent>
								{categories.map((c) => (
									<SelectItem
										key={c.id}
										value={c.id}
										className="cursor-pointer"
									>
										{c.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				/>
				{form.formState.errors.categoryId && (
					<p className="text-sm text-destructive">
						{form.formState.errors.categoryId.message}
					</p>
				)}
			</div>

			<div className="grid grid-cols-2 gap-3">
				<div className="space-y-2">
					<Label htmlFor={costId}>
						Costo <span className="text-destructive">*</span>
					</Label>
					<Input
						id={costId}
						type="number"
						step="0.01"
						min={0.01}
						{...form.register("cost")}
					/>
					{form.formState.errors.cost && (
						<p className="text-sm text-destructive">
							{form.formState.errors.cost.message}
						</p>
					)}
				</div>
				<div className="space-y-2">
					<Label htmlFor={priceId}>
						Precio venta <span className="text-destructive">*</span>
					</Label>
					<Input
						id={priceId}
						type="number"
						step="0.01"
						min={0.01}
						{...form.register("price")}
					/>
					{form.formState.errors.price && (
						<p className="text-sm text-destructive">
							{form.formState.errors.price.message}
						</p>
					)}
				</div>
			</div>

			{form.formState.errors.root && (
				<p className="text-sm text-destructive">
					{form.formState.errors.root.message}
				</p>
			)}

			<Footer>
				<Button
					type="button"
					variant="outline"
					className="cursor-pointer"
					onClick={onCancel}
				>
					Cancelar
				</Button>
				<Button
					type="submit"
					className="cursor-pointer"
					disabled={Boolean(isLoading)}
				>
					{isLoading ? "Guardando…" : "Guardar"}
				</Button>
			</Footer>
		</form>
	);
}
