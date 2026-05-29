import { zodResolver } from "@hookform/resolvers/zod";
import type { ComponentPropsWithoutRef } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Supplier } from "../types/api.js";
import {
	type SupplierFormValues,
	supplierFormSchema,
} from "../types/schema.js";

function PageFormFooter(props: ComponentPropsWithoutRef<"div">) {
	return (
		<div
			className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end"
			{...props}
		/>
	);
}

export interface SupplierFormSubmitData {
	name: string;
	taxId: string;
	contactName?: string;
	phone?: string;
	email?: string;
	address?: string;
	commercialConditions?: string;
}

export interface SupplierFormProps {
	active: boolean;
	supplier?: Supplier | null;
	onSubmit: (data: SupplierFormSubmitData) => void;
	onCancel: () => void;
	errorMessage?: string | null;
	isLoading?: boolean;
	idPrefix?: string;
}

export function SupplierForm({
	active,
	supplier,
	onSubmit,
	onCancel,
	errorMessage,
	isLoading,
	idPrefix = "supplier-form",
}: SupplierFormProps) {
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
		if (active) {
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
	}, [active, supplier, form]);

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
		<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor={`${idPrefix}-name`}>
						Nombre <span className="text-destructive">*</span>
					</Label>
					<Input
						id={`${idPrefix}-name`}
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
					<Label htmlFor={`${idPrefix}-tax-id`}>
						Documento fiscal <span className="text-destructive">*</span>
					</Label>
					<Input
						id={`${idPrefix}-tax-id`}
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
					<Label htmlFor={`${idPrefix}-contact-name`}>Persona de contacto</Label>
					<Input
						id={`${idPrefix}-contact-name`}
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
					<Label htmlFor={`${idPrefix}-phone`}>Teléfono</Label>
					<Input
						id={`${idPrefix}-phone`}
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
				<Label htmlFor={`${idPrefix}-email`}>Correo electrónico</Label>
				<Input
					id={`${idPrefix}-email`}
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
				<Label htmlFor={`${idPrefix}-address`}>Dirección</Label>
				<Textarea
					id={`${idPrefix}-address`}
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
				<Label htmlFor={`${idPrefix}-conditions`}>Condiciones comerciales</Label>
				<Textarea
					id={`${idPrefix}-conditions`}
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

			<PageFormFooter>
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					className="cursor-pointer"
				>
					Cancelar
				</Button>
				<Button type="submit" disabled={isLoading} className="cursor-pointer">
					{isLoading
						? isEditing
							? "Guardando..."
							: "Creando..."
						: isEditing
							? "Guardar cambios"
							: "Crear proveedor"}
				</Button>
			</PageFormFooter>
		</form>
	);
}
