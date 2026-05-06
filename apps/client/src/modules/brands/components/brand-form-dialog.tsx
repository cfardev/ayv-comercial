import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
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
import type { Brand } from "../hooks/use-brands.js";
import { type BrandFormValues, brandFormSchema } from "../types/schema.js";
import { BrandLogoDropzone } from "./brand-logo-dropzone.js";

interface BrandFormSubmitData {
	name: string;
	logoUrl?: string | null;
}

interface BrandFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	brand?: Brand | null;
	onSubmit: (data: BrandFormSubmitData) => void;
	errorMessage?: string | null;
	isLoading?: boolean;
	uploadDisabled?: boolean;
}

export function BrandFormDialog({
	open,
	onOpenChange,
	brand,
	onSubmit,
	errorMessage,
	isLoading,
	uploadDisabled,
}: BrandFormDialogProps) {
	const isEditing = !!brand;

	const form = useForm<BrandFormValues>({
		resolver: zodResolver(brandFormSchema),
		defaultValues: {
			name: "",
			logoUrl: null,
		},
	});

	useEffect(() => {
		if (open) {
			form.reset({
				name: brand?.name ?? "",
				logoUrl: brand?.logoUrl ?? null,
			});
		}
	}, [open, brand, form]);

	useEffect(() => {
		if (errorMessage) {
			form.setError("root", { message: errorMessage });
		}
	}, [errorMessage, form]);

	function handleSubmit(values: BrandFormValues) {
		form.clearErrors("root");
		onSubmit({
			name: values.name,
			logoUrl:
				values.logoUrl === null || values.logoUrl === undefined
					? null
					: values.logoUrl.trim() || null,
		});
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[520px]">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Editar marca" : "Nueva marca"}
					</DialogTitle>
					<DialogDescription>
						{isEditing
							? "Modifica los datos de la marca."
							: "Completa los datos para crear una nueva marca."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label>
							Logo
							<span className="ml-1 text-muted-foreground font-normal">
								(opcional)
							</span>
						</Label>
						<Controller
							control={form.control}
							name="logoUrl"
							render={({ field }) => (
								<BrandLogoDropzone
									value={field.value}
									onChange={field.onChange}
									disabled={uploadDisabled || isLoading}
								/>
							)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="brand-name">
							Nombre <span className="text-destructive">*</span>
						</Label>
						<Input
							id="brand-name"
							placeholder="Ej. Samsung"
							{...form.register("name")}
						/>
						{form.formState.errors.name && (
							<p className="text-sm text-destructive">
								{form.formState.errors.name.message}
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
									: "Crear marca"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
