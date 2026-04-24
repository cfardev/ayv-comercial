import { LoginFormComponent } from "@/modules/auth/components/login-form";

export function LoginPage() {
	return (
		<div className="flex min-h-svh items-center justify-center bg-background px-4">
			<div className="w-full max-w-sm space-y-6">
				<div className="space-y-2 text-center">
					<div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="size-6"
						>
							<title>A&amp;V Logo</title>
							<path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
							<path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
							<path d="M12 3v6" />
						</svg>
					</div>
					<h1 className="text-2xl font-semibold tracking-tight">A&amp;V</h1>
					<p className="text-sm text-muted-foreground">
						Iniciar sesión para continuar
					</p>
				</div>
				<LoginFormComponent />
			</div>
		</div>
	);
}
