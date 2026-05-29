import { zodResolver } from "@hookform/resolvers/zod";
import type { ComponentPropsWithoutRef } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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

function PageFormFooter(props: ComponentPropsWithoutRef<"div">) {
	return (
		<div
			className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end"
			{...props}
		/>
	);
}

export interface CustomerFormSubmitData {
	personType: "NATURAL" | "JURIDICA";
	fullName: string;
	taxId: string;
	address?: string;
	phone?: string;
	email?: string;
}

export interface CustomerFormProps {
	active: boolean;
	customer?: Customer | null;
	onSubmit: (data: CustomerFormSubmitData) => void;
	onCancel: () => void;
	errorMessage?: string | null;
	isLoading?: boolean;
	idPrefix?: string;
}

export function CustomerForm({
	active,
	customer,
	onSubmit,
	onCancel,
	errorMessage,
	isLoading,
	idPrefix = "customer-form",
}: CustomerFormProps) {
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
		if (active) {
			form.reset({
				personType: customer?.personType ?? "NATURAL",
				fullName: customer?.fullName ?? "",
				taxId: customer?.taxId ?? "",
				email: customer?.email ?? "",
				phone: customer?.phone ?? "",
				address: customer?.address ?? "",
			});
		}
	}, [active, customer, form]);

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
		<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor={`${idPrefix}-person-type`}>
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
							id={`${idPrefix}-person-type`}
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
					<Label htmlFor={`${idPrefix}-full-name`}>
						{personType === "NATURAL" ? "Nombre completo" : "Razón social"}{" "}
						<span className="text-destructive">*</span>
					</Label>
					<Input
						id={`${idPrefix}-full-name`}
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
					<Label htmlFor={`${idPrefix}-tax-id`}>
						{personType === "NATURAL" ? "Cédula" : "RUC"}{" "}
						<span className="text-destructive">*</span>
					</Label>
					<Input
						id={`${idPrefix}-tax-id`}
						placeholder={
							personType === "NATURAL" ? "Ej. 1234567890" : "Ej. 1234567890001"
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
					<Label htmlFor={`${idPrefix}-phone`}>Teléfono</Label>
					<Input
						id={`${idPrefix}-phone`}
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
				<Label htmlFor={`${idPrefix}-email`}>Correo electrónico</Label>
				<Input
					id={`${idPrefix}-email`}
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
				<Label htmlFor={`${idPrefix}-address`}>Dirección</Label>
				<Input
					id={`${idPrefix}-address`}
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
							: "Crear cliente"}
				</Button>
			</PageFormFooter>
		</form>
	);
}
