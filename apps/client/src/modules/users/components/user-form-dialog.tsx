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
import {
	USER_ROLE_OPTIONS,
	USER_ROLE_VALUES,
	type UserRole,
} from "@/lib/user-roles.js";
import type { User } from "../types/api.js";
import type { CreateUserForm, UpdateUserForm } from "../types/schema.js";
import { createUserSchema, updateUserSchema } from "../types/schema.js";

interface UserFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user?: User | null;
	onSubmit: (data: CreateUserForm | UpdateUserForm) => void;
	isLoading?: boolean;
}

export function UserFormDialog({
	open,
	onOpenChange,
	user,
	onSubmit,
	isLoading,
}: UserFormDialogProps) {
	const isEditing = !!user;

	const form = useForm<CreateUserForm | UpdateUserForm>({
		resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema),
		defaultValues: {
			fullName: user?.fullName ?? "",
			email: user?.email ?? "",
			password: "",
			role: user?.role.slug ?? USER_ROLE_VALUES[1],
		},
	});

	useEffect(() => {
		if (open) {
			form.reset({
				fullName: user?.fullName ?? "",
				email: user?.email ?? "",
				password: "",
				role: user?.role.slug ?? USER_ROLE_VALUES[1],
			});
		}
	}, [open, user, form]);

	function handleSubmit(data: CreateUserForm | UpdateUserForm) {
		onSubmit(data);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Editar usuario" : "Crear usuario"}
					</DialogTitle>
					<DialogDescription>
						{isEditing
							? "Modifica los datos del usuario"
							: "Completa los datos para crear un nuevo usuario"}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="fullName">Nombre completo</Label>
						<Input
							id="fullName"
							placeholder="Juan Pérez"
							{...form.register("fullName")}
						/>
						{form.formState.errors.fullName && (
							<p className="text-xs text-destructive">
								{form.formState.errors.fullName.message as string}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="email">Correo electrónico</Label>
						<Input
							id="email"
							type="email"
							placeholder="juan@ejemplo.com"
							{...form.register("email")}
						/>
						{form.formState.errors.email && (
							<p className="text-xs text-destructive">
								{form.formState.errors.email.message as string}
							</p>
						)}
					</div>

					{!isEditing && (
						<div className="space-y-2">
							<Label htmlFor="password">Contraseña</Label>
							<Input
								id="password"
								type="password"
								placeholder="••••••••"
								{...form.register("password")}
							/>
							{"password" in form.formState.errors && (
								<p className="text-xs text-destructive">
									{form.formState.errors.password?.message as string}
								</p>
							)}
						</div>
					)}

					<div className="space-y-2">
						<Label htmlFor="role">Rol</Label>
						<Select
							value={form.watch("role")}
							onValueChange={(value) =>
								form.setValue("role", value as UserRole, {
									shouldValidate: true,
								})
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Seleccionar rol" />
							</SelectTrigger>
							<SelectContent>
								{USER_ROLE_OPTIONS.map((opt) => (
									<SelectItem key={opt.value} value={opt.value}>
										{opt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{form.formState.errors.role && (
							<p className="text-xs text-destructive">
								{form.formState.errors.role.message as string}
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
						>
							Cancelar
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading
								? "Guardando..."
								: isEditing
									? "Guardar cambios"
									: "Crear usuario"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
