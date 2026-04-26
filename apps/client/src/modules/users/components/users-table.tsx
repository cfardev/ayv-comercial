import {
	IconEdit,
	IconPower,
	IconTrash,
	IconUserCheck,
} from "@tabler/icons-react";
import type { VariantProps } from "class-variance-authority";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { User } from "../types/api.js";

const roleLabels: Record<string, string> = {
	ADMIN: "Administrador",
	SELLER: "Vendedor",
	INVENTORY_MANAGER: "Gestor de Inventario",
	DISPATCH_MANAGER: "Gestor de Despachos",
	OWNER_MANAGER: "Gestor de Propietarios",
};

const statusVariants: Record<
	string,
	VariantProps<typeof badgeVariants>["variant"]
> = {
	ACTIVE: "default",
	INACTIVE: "destructive",
};

const statusLabels: Record<string, string> = {
	ACTIVE: "Activo",
	INACTIVE: "Inactivo",
};

function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString("es-ES", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

interface UsersTableProps {
	users: User[];
	onEdit: (user: User) => void;
	onDeactivate: (user: User) => void;
	onReactivate: (user: User) => void;
	onHardDelete: (user: User) => void;
	isLoading?: boolean;
}

export function UsersTable({
	users,
	onEdit,
	onDeactivate,
	onReactivate,
	onHardDelete,
	isLoading,
}: UsersTableProps) {
	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<p className="text-muted-foreground">Cargando...</p>
			</div>
		);
	}

	if (users.length === 0) {
		return (
			<div className="flex items-center justify-center py-8">
				<p className="text-muted-foreground">No hay usuarios para mostrar</p>
			</div>
		);
	}

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Nombre</TableHead>
						<TableHead>Correo</TableHead>
						<TableHead>Rol</TableHead>
						<TableHead>Estado</TableHead>
						<TableHead>Fecha de creación</TableHead>
						<TableHead className="w-[120px]">Acciones</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{users.map((user) => (
						<TableRow key={user.id}>
							<TableCell className="font-medium">{user.fullName}</TableCell>
							<TableCell>{user.email}</TableCell>
							<TableCell>
								{roleLabels[user.role.name] ?? user.role.name}
							</TableCell>
							<TableCell>
								<Badge variant={statusVariants[user.status]}>
									{statusLabels[user.status]}
								</Badge>
							</TableCell>
							<TableCell>{formatDate(user.createdAt)}</TableCell>
							<TableCell>
								<div className="flex items-center gap-1">
									<Button
										variant="ghost"
										size="icon"
										onClick={() => onEdit(user)}
										title="Editar"
									>
										<IconEdit className="size-4" />
									</Button>
									{user.status === "ACTIVE" && user.role.name !== "ADMIN" && (
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onDeactivate(user)}
											title="Desactivar"
										>
											<IconPower className="size-4" />
										</Button>
									)}
									{user.status === "INACTIVE" && (
										<>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => onReactivate(user)}
												title="Reactivar"
											>
												<IconUserCheck className="size-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => onHardDelete(user)}
												title="Eliminar permanentemente"
											>
												<IconTrash className="size-4 text-destructive" />
											</Button>
										</>
									)}
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
