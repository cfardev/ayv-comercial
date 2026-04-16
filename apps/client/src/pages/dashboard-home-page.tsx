import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function DashboardHomePage() {
	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Inicio</h1>
				<p className="text-muted-foreground text-sm">
					Resumen del portal (contenido estático de demo).
				</p>
			</div>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Pedidos</CardDescription>
						<CardTitle className="text-3xl tabular-nums">128</CardTitle>
					</CardHeader>
					<CardContent className="text-muted-foreground text-sm">
						Últimos 30 días (dato quemado).
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Facturación</CardDescription>
						<CardTitle className="text-3xl tabular-nums">$42.5k</CardTitle>
					</CardHeader>
					<CardContent className="text-muted-foreground text-sm">
						Estimación interna, sin API.
					</CardContent>
				</Card>
				<Card className="sm:col-span-2 lg:col-span-1">
					<CardHeader className="pb-2">
						<CardDescription>Alertas</CardDescription>
						<CardTitle className="text-3xl tabular-nums">3</CardTitle>
					</CardHeader>
					<CardContent className="text-muted-foreground text-sm">
						Revisar cuando conectes backend.
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
