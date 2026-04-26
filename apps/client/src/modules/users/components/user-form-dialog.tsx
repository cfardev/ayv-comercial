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
import type { Role, User } from "../types/api.js";
import type { CreateUserForm, UpdateUserForm } from "../types/schema.js";
import { createUserSchema, updateUserSchema } from "../types/schema.js";

const roleLabels: Record<string, string> = {
	ADMIN: "Administrador",
	SELLER: "Vendedor",
	INVENTORY_MANAGER: "Gestor de Inventario",
	DISPATCH_MANAGER: "Gestor de Despachos",
	OWNER_MANAGER: "Gestor de Propietarios",
};

interface UserFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user?: User | null;
	roles: Role[];
	onSubmit: (data: CreateUserForm | UpdateUserForm) => void;
	isLoading?: boolean;
}

export function UserFormDialog({
	open,
	onOpenChange,
	user,
	roles,
	onSubmit,
	isLoading,
}: UserFormDialogProps) {
	const isEditing = !!user;

	const form = useForm<CreateUserForm | UpdateUserForm>({
		resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema),
		defaultValues: {
			name: user?.name ?? "",
			email: user?.email ?? "",
			password: "",
			roleId: user?.role.id ?? "",
		},
	});

	useEffect(() => {
		if (open) {
			form.reset({
				name: user?.name ?? "",
				email: user?.email ?? "",
				password: "",
				roleId: user?.role.id ?? "",
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
						<Label htmlFor="name">Nombre completo</Label>
						<Input
							id="name"
							placeholder="Juan Pérez"
							{...form.register("name")}
						/>
						{form.formState.errors.name && (
							<p className="text-xs text-destructive">
								{form.formState.errors.name.message as string}
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
							{form.formState.errors.password && (
								<p className="text-xs text-destructive">
									{form.formState.errors.password.message as string}
								</p>
							)}
						</div>
					)}

					<div className="space-y-2">
						<Label htmlFor="roleId">Rol</Label>
						<Select
							value={form.watch("roleId")}
							onValueChange={(value) => form.setValue("roleId", value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Seleccionar rol" />
							</SelectTrigger>
							<SelectContent>
								{roles.map((role) => (
									<SelectItem key={role.id} value={role.id}>
										{roleLabels[role.name] ?? role.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{form.formState.errors.roleId && (
							<p className="text-xs text-destructive">
								{form.formState.errors.roleId.message as string}
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
