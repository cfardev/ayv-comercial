import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

const rows = [
	{ id: "C-1001", cliente: "Distribuidora Norte", estado: "En tránsito" },
	{ id: "C-1002", cliente: "Retail Centro", estado: "Pendiente" },
	{ id: "C-1003", cliente: "Mayorista Sur", estado: "Entregado" },
] as const;

export function CargoPage() {
	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Cargo</h1>
				<p className="text-muted-foreground text-sm">
					Lista de envíos de ejemplo.
				</p>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Envíos recientes</CardTitle>
					<CardDescription>
						Datos estáticos para maquetar el listado.
					</CardDescription>
				</CardHeader>
				<CardContent className="px-0 sm:px-6">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>ID</TableHead>
								<TableHead>Cliente</TableHead>
								<TableHead className="text-right">Estado</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{rows.map((r) => (
								<TableRow key={r.id}>
									<TableCell className="font-medium">{r.id}</TableCell>
									<TableCell>{r.cliente}</TableCell>
									<TableCell className="text-right">
										<Badge variant="secondary">{r.estado}</Badge>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
