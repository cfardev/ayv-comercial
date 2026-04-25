import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import type { LoginForm } from "../types/schema.js";
import { loginSchema } from "../types/schema.js";

const ROLE_DASHBOARD_MAP: Record<string, string> = {
	ADMIN: "/",
	SELLER: "/",
	INVENTORY_MANAGER: "/inventario",
	DISPATCH_MANAGER: "/despachos",
	OWNER_MANAGER: "/reportes",
};

export function LoginFormComponent() {
	const { login } = useAuth();
	const navigate = useNavigate();
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		setError,
	} = useForm<LoginForm>({
		resolver: zodResolver(loginSchema),
	});

	async function onSubmit(data: LoginForm) {
		try {
			const user = await login(data.email, data.password);
			const redirectPath = ROLE_DASHBOARD_MAP[user.role.name] ?? "/";
			navigate(redirectPath, { replace: true });
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Credenciales inválidas";
			setError("root", { message });
		}
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<div className="space-y-2">
				<label htmlFor="email" className="text-sm font-medium leading-none">
					Correo electrónico
				</label>
				<Input
					id="email"
					type="email"
					placeholder="admin@test.com"
					autoComplete="email"
					aria-invalid={!!errors.email}
					{...register("email")}
				/>
				{errors.email && (
					<p className="text-xs text-destructive">{errors.email.message}</p>
				)}
			</div>

			<div className="space-y-2">
				<label htmlFor="password" className="text-sm font-medium leading-none">
					Contraseña
				</label>
				<Input
					id="password"
					type="password"
					placeholder="••••••••"
					autoComplete="current-password"
					aria-invalid={!!errors.password}
					{...register("password")}
				/>
				{errors.password && (
					<p className="text-xs text-destructive">{errors.password.message}</p>
				)}
			</div>

			{errors.root && (
				<div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
					{errors.root.message}
				</div>
			)}

			<Button type="submit" className="w-full" disabled={isSubmitting}>
				{isSubmitting ? "Iniciando..." : "Iniciar sesión"}
			</Button>
		</form>
	);
}
