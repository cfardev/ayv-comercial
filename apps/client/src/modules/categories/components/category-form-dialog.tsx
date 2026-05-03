import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
import type { Category } from "../types/api.js";
import {
	type CategoryFormValues,
	categoryFormSchema,
} from "../types/schema.js";

const NO_PARENT = "__none__";

interface CategoryFormSubmitData {
	name: string;
	description?: string;
	parentId: string | null;
}

interface CategoryFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	category?: Category | null;
	parentCategories: Category[];
	onSubmit: (data: CategoryFormSubmitData) => void;
	isLoading?: boolean;
}

export function CategoryFormDialog({
	open,
	onOpenChange,
	category,
	parentCategories,
	onSubmit,
	isLoading,
}: CategoryFormDialogProps) {
	const isEditing = !!category;

	const form = useForm<CategoryFormValues>({
		resolver: zodResolver(categoryFormSchema),
		defaultValues: {
			name: "",
			description: "",
			parentId: undefined,
		},
	});

	useEffect(() => {
		if (open) {
			form.reset({
				name: category?.name ?? "",
				description: category?.description ?? "",
				parentId: category?.parentId ?? undefined,
			});
		}
	}, [open, category, form]);

	function handleSubmit(values: CategoryFormValues) {
		const parentId: string | null =
			values.parentId === NO_PARENT || !values.parentId
				? null
				: values.parentId;
		onSubmit({ name: values.name, description: values.description, parentId });
	}

	// Only show categories that can be valid parents:
	// - must be active
	// - must not be the category itself (on edit)
	// - must have depth < 2
	const validParents = parentCategories.filter(
		(c) =>
			c.status &&
			c.depth < 2 &&
			(!isEditing || (c.id !== category?.id && c.parentId !== category?.id)),
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[480px]">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Editar categoría" : "Nueva categoría"}
					</DialogTitle>
					<DialogDescription>
						{isEditing
							? "Modifica los datos de la categoría."
							: "Completa los datos para crear una nueva categoría."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">
							Nombre <span className="text-destructive">*</span>
						</Label>
						<Input
							id="name"
							placeholder="Ej. Electrodomésticos"
							{...form.register("name")}
						/>
						{form.formState.errors.name && (
							<p className="text-sm text-destructive">
								{form.formState.errors.name.message}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Descripción</Label>
						<Textarea
							id="description"
							placeholder="Descripción opcional de la categoría"
							rows={3}
							{...form.register("description")}
						/>
						{form.formState.errors.description && (
							<p className="text-sm text-destructive">
								{form.formState.errors.description.message}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="parentId">Categoría padre</Label>
						<Select
							value={form.watch("parentId") ?? NO_PARENT}
							onValueChange={(val) =>
								form.setValue("parentId", val === NO_PARENT ? undefined : val)
							}
						>
							<SelectTrigger id="parentId" className="cursor-pointer">
								<SelectValue placeholder="Sin categoría padre (raíz)" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={NO_PARENT} className="cursor-pointer">
									Sin categoría padre (raíz)
								</SelectItem>
								{validParents.map((c) => (
									<SelectItem
										key={c.id}
										value={c.id}
										className="cursor-pointer"
									>
										{"  ".repeat(c.depth)}
										{c.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							className="cursor-pointer"
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							disabled={isLoading}
							className="cursor-pointer"
						>
							{isLoading
								? isEditing
									? "Guardando..."
									: "Creando..."
								: isEditing
									? "Guardar cambios"
									: "Crear categoría"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
