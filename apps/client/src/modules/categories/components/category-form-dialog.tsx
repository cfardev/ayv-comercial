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
import { Textarea } from "@/components/ui/textarea";
import type { Category } from "../types/api.js";
import {
	type CategoryFormValues,
	categoryFormSchema,
} from "../types/schema.js";

interface CategoryFormSubmitData {
	name: string;
	description?: string;
}

interface CategoryFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	category?: Category | null;
	onSubmit: (data: CategoryFormSubmitData) => void;
	errorMessage?: string | null;
	isLoading?: boolean;
}

export function CategoryFormDialog({
	open,
	onOpenChange,
	category,
	onSubmit,
	errorMessage,
	isLoading,
}: CategoryFormDialogProps) {
	const isEditing = !!category;

	const form = useForm<CategoryFormValues>({
		resolver: zodResolver(categoryFormSchema),
		defaultValues: {
			name: "",
			description: "",
		},
	});

	useEffect(() => {
		if (open) {
			form.reset({
				name: category?.name ?? "",
				description: category?.description ?? "",
			});
		}
	}, [open, category, form]);

	useEffect(() => {
		if (errorMessage) {
			form.setError("root", { message: errorMessage });
		}
	}, [errorMessage, form]);

	function handleSubmit(values: CategoryFormValues) {
		form.clearErrors("root");
		onSubmit({ name: values.name, description: values.description });
	}

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

					{form.formState.errors.root && (
						<div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
							{form.formState.errors.root.message}
						</div>
					)}

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
