import { zodResolver } from "@hookform/resolvers/zod";
import type { ComponentPropsWithoutRef } from "react";
import { useEffect, useMemo } from "react";
import { Controller, type Resolver, useForm, useWatch } from "react-hook-form";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useCategories } from "@/modules/categories/hooks/use-categories.js";
import type { Product } from "../types/api.js";
import { type ProductFormValues, productFormSchema } from "../types/schema.js";
import { BrandCombobox } from "./brand-combobox.js";
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
			brandMode: "existing",
			brandId: "",
			newBrandName: "",
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
				brandMode: product.brandId ? "existing" : "new",
				brandId: product.brandId ?? "",
				newBrandName: "",
				images: imgs,
			});
		} else {
			form.reset({
				name: "",
				description: "",
				cost: 0.01,
				price: 0.02,
				categoryId: categories[0]?.id ?? "",
				brandMode: "existing",
				brandId: "",
				newBrandName: "",
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

	const brandMode = useWatch({
		control: form.control,
		name: "brandMode",
		defaultValue: "existing",
	});
	const watchedBrandId = useWatch({
		control: form.control,
		name: "brandId",
		defaultValue: "",
	});

	const brandFallbackLabel =
		product?.brandId && product.brandId === watchedBrandId
			? (product.brandName ?? "")
			: undefined;

	const nameId = `${idPrefix}-name`;
	const descId = `${idPrefix}-desc`;
	const costId = `${idPrefix}-cost`;
	const priceId = `${idPrefix}-price`;
	const newBrandId = `${idPrefix}-new-brand-name`;

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

			<div className="space-y-3 rounded-lg border border-border/50 bg-muted/30 p-3">
				<Label>
					Marca <span className="text-destructive">*</span>
				</Label>
				<Controller
					control={form.control}
					name="brandMode"
					render={({ field }) => (
						<ToggleGroup
							type="single"
							variant="outline"
							className="w-full justify-stretch sm:w-auto"
							value={field.value}
							onValueChange={(next) => {
								if (!next) return;
								field.onChange(next);
								if (next === "existing") {
									form.setValue("newBrandName", "");
								} else {
									form.setValue("brandId", "");
								}
								form.clearErrors(["brandId", "newBrandName"]);
							}}
							disabled={Boolean(isLoading)}
						>
							<ToggleGroupItem
								value="existing"
								aria-label="Marca existente"
								className="cursor-pointer flex-1"
							>
								Marca existente
							</ToggleGroupItem>
							<ToggleGroupItem
								value="new"
								aria-label="Nueva marca"
								className="cursor-pointer flex-1"
							>
								Nueva marca
							</ToggleGroupItem>
						</ToggleGroup>
					)}
				/>
				{(brandMode ?? "existing") === "existing" ? (
					<div className="space-y-2">
						<Controller
							control={form.control}
							name="brandId"
							render={({ field }) => (
								<BrandCombobox
									value={field.value}
									onValueChange={(id) => {
										field.onChange(id);
										form.clearErrors("brandId");
									}}
									disabled={Boolean(isLoading)}
									fallbackLabel={brandFallbackLabel}
								/>
							)}
						/>
						{form.formState.errors.brandId && (
							<p className="text-sm text-destructive">
								{form.formState.errors.brandId.message}
							</p>
						)}
					</div>
				) : (
					<div className="space-y-2">
						<Label htmlFor={newBrandId} className="sr-only">
							Nueva marca
						</Label>
						<Input
							id={newBrandId}
							placeholder="Nombre de la nueva marca"
							className="cursor-text"
							disabled={Boolean(isLoading)}
							{...form.register("newBrandName")}
						/>
						{form.formState.errors.newBrandName && (
							<p className="text-sm text-destructive">
								{form.formState.errors.newBrandName.message}
							</p>
						)}
					</div>
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
