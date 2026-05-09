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
import type { Supplier } from "../types/api.js";
import {
	type SupplierFormValues,
	supplierFormSchema,
} from "../types/schema.js";

interface SupplierFormSubmitData {
	name: string;
	taxId: string;
	contactName?: string;
	phone?: string;
	email?: string;
	address?: string;
	commercialConditions?: string;
}

interface SupplierFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	supplier?: Supplier | null;
	onSubmit: (data: SupplierFormSubmitData) => void;
	errorMessage?: string | null;
	isLoading?: boolean;
}

export function SupplierFormDialog({
	open,
	onOpenChange,
	supplier,
	onSubmit,
	errorMessage,
	isLoading,
}: SupplierFormDialogProps) {
	const isEditing = !!supplier;

	const form = useForm<SupplierFormValues>({
		resolver: zodResolver(supplierFormSchema),
		defaultValues: {
			name: "",
			taxId: "",
			contactName: "",
			phone: "",
			email: "",
			address: "",
			commercialConditions: "",
		},
	});

	useEffect(() => {
		if (open) {
			form.reset({
				name: supplier?.name ?? "",
				taxId: supplier?.taxId ?? "",
				contactName: supplier?.contactName ?? "",
				phone: supplier?.phone ?? "",
				email: supplier?.email ?? "",
				address: supplier?.address ?? "",
				commercialConditions: supplier?.commercialConditions ?? "",
			});
		}
	}, [open, supplier, form]);

	useEffect(() => {
		if (errorMessage) {
			form.setError("root", { message: errorMessage });
		}
	}, [errorMessage, form]);

	function handleSubmit(values: SupplierFormValues) {
		form.clearErrors("root");
		onSubmit({
			name: values.name,
			taxId: values.taxId,
			contactName: values.contactName?.trim(),
			phone: values.phone?.trim(),
			email: values.email?.trim(),
			address: values.address?.trim(),
			commercialConditions: values.commercialConditions?.trim(),
		});
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[560px]">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Editar proveedor" : "Nuevo proveedor"}
					</DialogTitle>
					<DialogDescription>
						{isEditing
							? "Modifica los datos del proveedor."
							: "Completa los datos para crear un nuevo proveedor."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="supplier-name">
								Nombre <span className="text-destructive">*</span>
							</Label>
							<Input
								id="supplier-name"
								placeholder="Ej. Distribuidora Andina"
								{...form.register("name")}
							/>
							{form.formState.errors.name ? (
								<p className="text-sm text-destructive">
									{form.formState.errors.name.message}
								</p>
							) : null}
						</div>

						<div className="space-y-2">
							<Label htmlFor="supplier-tax-id">
								Documento fiscal <span className="text-destructive">*</span>
							</Label>
							<Input
								id="supplier-tax-id"
								placeholder="Ej. J-12345678-9"
								{...form.register("taxId")}
							/>
							{form.formState.errors.taxId ? (
								<p className="text-sm text-destructive">
									{form.formState.errors.taxId.message}
								</p>
							) : null}
						</div>

						<div className="space-y-2">
							<Label htmlFor="supplier-contact-name">Persona de contacto</Label>
							<Input
								id="supplier-contact-name"
								placeholder="Ej. Ana Pérez"
								{...form.register("contactName")}
							/>
							{form.formState.errors.contactName ? (
								<p className="text-sm text-destructive">
									{form.formState.errors.contactName.message}
								</p>
							) : null}
						</div>

						<div className="space-y-2">
							<Label htmlFor="supplier-phone">Teléfono</Label>
							<Input
								id="supplier-phone"
								placeholder="Ej. 0412-5551234"
								{...form.register("phone")}
							/>
							{form.formState.errors.phone ? (
								<p className="text-sm text-destructive">
									{form.formState.errors.phone.message}
								</p>
							) : null}
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="supplier-email">Correo electrónico</Label>
						<Input
							id="supplier-email"
							type="email"
							placeholder="contacto@proveedor.com"
							{...form.register("email")}
						/>
						{form.formState.errors.email ? (
							<p className="text-sm text-destructive">
								{form.formState.errors.email.message}
							</p>
						) : null}
					</div>

					<div className="space-y-2">
						<Label htmlFor="supplier-address">Dirección</Label>
						<Textarea
							id="supplier-address"
							placeholder="Dirección fiscal o comercial"
							rows={3}
							{...form.register("address")}
						/>
						{form.formState.errors.address ? (
							<p className="text-sm text-destructive">
								{form.formState.errors.address.message}
							</p>
						) : null}
					</div>

					<div className="space-y-2">
						<Label htmlFor="supplier-conditions">Condiciones comerciales</Label>
						<Textarea
							id="supplier-conditions"
							placeholder="Observaciones, plazos o acuerdos comerciales"
							rows={3}
							{...form.register("commercialConditions")}
						/>
						{form.formState.errors.commercialConditions ? (
							<p className="text-sm text-destructive">
								{form.formState.errors.commercialConditions.message}
							</p>
						) : null}
					</div>

					{form.formState.errors.root ? (
						<div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
							{form.formState.errors.root.message}
						</div>
					) : null}

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
									: "Crear proveedor"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
