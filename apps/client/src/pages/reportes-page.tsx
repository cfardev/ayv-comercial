import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ReportesPage() {
	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Reportes</h1>
				<p className="text-muted-foreground text-sm">
					Vistas placeholder con métricas inventadas.
				</p>
			</div>
			<Tabs defaultValue="ventas">
				<TabsList>
					<TabsTrigger value="ventas">Ventas</TabsTrigger>
					<TabsTrigger value="inventario">Inventario</TabsTrigger>
				</TabsList>
				<TabsContent value="ventas" className="mt-4">
					<Card>
						<CardHeader>
							<CardTitle>Meta Q1</CardTitle>
							<CardDescription>
								Progreso ficticio hacia objetivo.
							</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col gap-3">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Completado</span>
								<span className="font-medium tabular-nums">67%</span>
							</div>
							<Progress value={67} />
							<p className="text-muted-foreground text-sm">
								Sustituir por gráficos reales cuando tengas datos.
							</p>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="inventario" className="mt-4">
					<Card>
						<CardHeader>
							<CardTitle>Stock crítico</CardTitle>
							<CardDescription>
								Artículos bajo mínimo (lista quemada).
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ul className="flex flex-col gap-2 text-sm">
								<li className="flex justify-between border-b border-border py-2">
									<span>SKU-8821</span>
									<span className="text-muted-foreground">4 uds</span>
								</li>
								<li className="flex justify-between border-b border-border py-2">
									<span>SKU-4410</span>
									<span className="text-muted-foreground">11 uds</span>
								</li>
								<li className="flex justify-between py-2">
									<span>SKU-2003</span>
									<span className="text-muted-foreground">0 uds</span>
								</li>
							</ul>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
