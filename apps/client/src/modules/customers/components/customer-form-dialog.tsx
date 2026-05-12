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
import type { Customer } from "../types/api.js";
import {
	type CustomerFormValues,
	customerFormSchema,
} from "../types/schema.js";

interface CustomerFormSubmitData {
	personType: "NATURAL" | "JURIDICA";
	fullName: string;
	taxId: string;
	address?: string;
	phone?: string;
	email?: string;
}

interface CustomerFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	customer?: Customer | null;
	onSubmit: (data: CustomerFormSubmitData) => void;
	errorMessage?: string | null;
	isLoading?: boolean;
}

export function CustomerFormDialog({
	open,
	onOpenChange,
	customer,
	onSubmit,
	errorMessage,
	isLoading,
}: CustomerFormDialogProps) {
	const isEditing = !!customer;

	const form = useForm<CustomerFormValues>({
		resolver: zodResolver(customerFormSchema),
		defaultValues: {
			personType: "NATURAL",
			fullName: "",
			taxId: "",
			email: "",
			phone: "",
			address: "",
		},
	});

	useEffect(() => {
		if (open) {
			form.reset({
				personType: customer?.personType ?? "NATURAL",
				fullName: customer?.fullName ?? "",
				taxId: customer?.taxId ?? "",
				email: customer?.email ?? "",
				phone: customer?.phone ?? "",
				address: customer?.address ?? "",
			});
		}
	}, [open, customer, form]);

	useEffect(() => {
		if (errorMessage) {
			form.setError("root", { message: errorMessage });
		}
	}, [errorMessage, form]);

	function normalizeOptionalText(value?: string) {
		const trimmedValue = value?.trim();
		return trimmedValue ? trimmedValue : undefined;
	}

	function handleSubmit(values: CustomerFormValues) {
		form.clearErrors("root");
		onSubmit({
			personType: values.personType,
			fullName: values.fullName,
			taxId: values.taxId,
			address: normalizeOptionalText(values.address),
			phone: normalizeOptionalText(values.phone),
			email: normalizeOptionalText(values.email),
		});
	}

	const personType = form.watch("personType");

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[560px]">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Editar cliente" : "Nuevo cliente"}
					</DialogTitle>
					<DialogDescription>
						{isEditing
							? "Modifica los datos del cliente."
							: "Completa los datos para registrar un nuevo cliente."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="customer-person-type">
								Tipo de persona <span className="text-destructive">*</span>
							</Label>
							<Select
								value={form.watch("personType")}
								onValueChange={(value) => {
									form.setValue("personType", value as "NATURAL" | "JURIDICA");
									form.setValue("taxId", "");
								}}
							>
								<SelectTrigger
									id="customer-person-type"
									className="cursor-pointer"
								>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="NATURAL" className="cursor-pointer">
										Persona natural
									</SelectItem>
									<SelectItem value="JURIDICA" className="cursor-pointer">
										Persona jurídica
									</SelectItem>
								</SelectContent>
							</Select>
							{form.formState.errors.personType ? (
								<p className="text-sm text-destructive">
									{form.formState.errors.personType.message}
								</p>
							) : null}
						</div>

						<div className="space-y-2">
							<Label htmlFor="customer-full-name">
								{personType === "NATURAL" ? "Nombre completo" : "Razón social"}{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Input
								id="customer-full-name"
								placeholder={
									personType === "NATURAL"
										? "Ej. Juan Pérez"
										: "Ej. Distribuidora ABC S.A."
								}
								{...form.register("fullName")}
							/>
							{form.formState.errors.fullName ? (
								<p className="text-sm text-destructive">
									{form.formState.errors.fullName.message}
								</p>
							) : null}
						</div>

						<div className="space-y-2">
							<Label htmlFor="customer-tax-id">
								{personType === "NATURAL" ? "Cédula" : "RUC"}{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Input
								id="customer-tax-id"
								placeholder={
									personType === "NATURAL"
										? "Ej. 1234567890"
										: "Ej. 1234567890001"
								}
								{...form.register("taxId")}
							/>
							{form.formState.errors.taxId ? (
								<p className="text-sm text-destructive">
									{form.formState.errors.taxId.message}
								</p>
							) : null}
						</div>

						<div className="space-y-2">
							<Label htmlFor="customer-phone">Teléfono</Label>
							<Input
								id="customer-phone"
								placeholder="Ej. 0999123456"
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
						<Label htmlFor="customer-email">Correo electrónico</Label>
						<Input
							id="customer-email"
							type="email"
							placeholder="cliente@ejemplo.com"
							{...form.register("email")}
						/>
						{form.formState.errors.email ? (
							<p className="text-sm text-destructive">
								{form.formState.errors.email.message}
							</p>
						) : null}
					</div>

					<div className="space-y-2">
						<Label htmlFor="customer-address">Dirección</Label>
						<Input
							id="customer-address"
							placeholder="Dirección del cliente"
							{...form.register("address")}
						/>
						{form.formState.errors.address ? (
							<p className="text-sm text-destructive">
								{form.formState.errors.address.message}
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
									: "Crear cliente"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
