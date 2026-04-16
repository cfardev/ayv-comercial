import {
	IconArrowUpRight,
	IconArrowDownRight,
	IconPackage,
	IconCurrencyDollar,
	IconTruck,
	IconAlertTriangle,
	IconCircleCheck,
	IconClock,
	IconMapPin,
} from "@tabler/icons-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

/* ── hardcoded data ─────────────────────────────────────── */

const pedidosRecientes = [
	{
		id: "PED-1042",
		cliente: "Electrohogar del Sur",
		initials: "ES",
		items: 12,
		total: 4850.0,
		estado: "pendiente" as const,
		fecha: "15 Abr 2026",
	},
	{
		id: "PED-1041",
		cliente: "Distribuciones Marin",
		initials: "DM",
		items: 8,
		total: 3200.0,
		estado: "despachado" as const,
		fecha: "14 Abr 2026",
	},
	{
		id: "PED-1040",
		cliente: "Casa & Confort",
		initials: "CC",
		items: 24,
		total: 9100.0,
		estado: "entregado" as const,
		fecha: "13 Abr 2026",
	},
	{
		id: "PED-1039",
		cliente: "TecnoHogar Express",
		initials: "TE",
		items: 5,
		total: 1750.0,
		estado: "pendiente" as const,
		fecha: "13 Abr 2026",
	},
	{
		id: "PED-1038",
		cliente: "Almacenes Rodriguez",
		initials: "AR",
		items: 16,
		total: 6400.0,
		estado: "despachado" as const,
		fecha: "12 Abr 2026",
	},
];

const estadoBadge = {
	pendiente: {
		label: "Pendiente",
		className: "border-warning/40 bg-warning/10 text-warning",
	},
	despachado: {
		label: "Despachado",
		className: "border-chart-1/40 bg-chart-1/10 text-chart-1",
	},
	entregado: {
		label: "Entregado",
		className: "border-success/40 bg-success/10 text-success",
	},
};

const stockCategorias = [
	{ nombre: "Refrigeradores", actual: 45, capacidad: 60, porcentaje: 75 },
	{ nombre: "Lavadoras", actual: 28, capacidad: 50, porcentaje: 56 },
	{ nombre: "Microondas", actual: 12, capacidad: 80, porcentaje: 15 },
	{ nombre: "Licuadoras", actual: 64, capacidad: 100, porcentaje: 64 },
	{
		nombre: "Aires Acondicionados",
		actual: 8,
		capacidad: 30,
		porcentaje: 27,
	},
	{ nombre: "Cocinas", actual: 33, capacidad: 40, porcentaje: 83 },
];

const despachosPendientes = [
	{
		id: "DSP-320",
		destino: "Valencia",
		bultos: 18,
		transportista: "TransCarga CA",
		salida: "16 Abr",
	},
	{
		id: "DSP-319",
		destino: "Maracaibo",
		bultos: 32,
		transportista: "Envios Rapidos",
		salida: "16 Abr",
	},
	{
		id: "DSP-318",
		destino: "Barquisimeto",
		bultos: 11,
		transportista: "TransCarga CA",
		salida: "17 Abr",
	},
];

/* ── metric card colors ─────────────────────────────────── */

const metricStyles = {
	ventas: {
		iconBg: "bg-chart-1/15",
		iconColor: "text-chart-1",
	},
	pedidos: {
		iconBg: "bg-chart-2/15",
		iconColor: "text-chart-2",
	},
	despachos: {
		iconBg: "bg-chart-4/15",
		iconColor: "text-chart-4",
	},
	stock: {
		iconBg: "bg-warning/15",
		iconColor: "text-warning",
	},
};

/* ── components ─────────────────────────────────────────── */

function MetricCard({
	title,
	value,
	change,
	changeLabel,
	icon: Icon,
	positive,
	colorKey,
}: {
	title: string;
	value: string;
	change: string;
	changeLabel: string;
	icon: typeof IconCurrencyDollar;
	positive: boolean;
	colorKey: keyof typeof metricStyles;
}) {
	const style = metricStyles[colorKey];
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardDescription>{title}</CardDescription>
				<div
					className={`flex size-9 items-center justify-center rounded-lg ${style.iconBg}`}
				>
					<Icon className={style.iconColor} />
				</div>
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-semibold tracking-tight">{value}</div>
				<div className="mt-1 flex items-center gap-1 text-xs">
					{positive ? (
						<IconArrowUpRight className="size-3.5 text-success" />
					) : (
						<IconArrowDownRight className="size-3.5 text-destructive" />
					)}
					<span className={positive ? "text-success" : "text-destructive"}>
						{change}
					</span>
					<span className="text-muted-foreground">{changeLabel}</span>
				</div>
			</CardContent>
		</Card>
	);
}

function StockLevel({
	nombre,
	actual,
	capacidad,
	porcentaje,
}: (typeof stockCategorias)[number]) {
	const isLow = porcentaje < 30;
	const isGood = porcentaje >= 70;
	return (
		<div className="flex flex-col gap-1.5">
			<div className="flex items-center justify-between text-sm">
				<span className="flex items-center gap-1.5">
					{isLow && <IconAlertTriangle className="size-3.5 text-destructive" />}
					{isGood && <IconCircleCheck className="size-3.5 text-success" />}
					{nombre}
				</span>
				<span className="tabular-nums text-muted-foreground">
					{actual}/{capacidad}
				</span>
			</div>
			<Progress
				value={porcentaje}
				className={
					isLow
						? "[&>div]:bg-destructive"
						: isGood
							? "[&>div]:bg-success"
							: "[&>div]:bg-chart-2"
				}
			/>
		</div>
	);
}

export function DashboardHomePage() {
	return (
		<div className="flex flex-col gap-6">
			{/* ── hero metric + supporting stats ── */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<MetricCard
					title="Ventas del mes"
					value="$128,430"
					change="+12.5%"
					changeLabel="vs mes anterior"
					icon={IconCurrencyDollar}
					positive
					colorKey="ventas"
				/>
				<MetricCard
					title="Pedidos activos"
					value="34"
					change="+8"
					changeLabel="esta semana"
					icon={IconPackage}
					positive
					colorKey="pedidos"
				/>
				<MetricCard
					title="Despachos hoy"
					value="7"
					change="-2"
					changeLabel="vs ayer"
					icon={IconTruck}
					positive={false}
					colorKey="despachos"
				/>
				<MetricCard
					title="Stock bajo"
					value="3"
					change="+1"
					changeLabel="categorias"
					icon={IconAlertTriangle}
					positive={false}
					colorKey="stock"
				/>
			</div>

			{/* ── main content: orders + stock side by side ── */}
			<div className="grid gap-4 lg:grid-cols-5">
				{/* recent orders — takes 3 cols */}
				<Card className="lg:col-span-3">
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle>Pedidos recientes</CardTitle>
							<CardDescription>Ultimos 5 pedidos registrados</CardDescription>
						</div>
						<Button variant="outline" size="sm">
							Ver todos
						</Button>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Pedido</TableHead>
									<TableHead>Cliente</TableHead>
									<TableHead className="text-right">Total</TableHead>
									<TableHead>Estado</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{pedidosRecientes.map((p) => (
									<TableRow key={p.id}>
										<TableCell className="font-medium tabular-nums">
											{p.id}
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Avatar className="size-6">
													<AvatarFallback className="bg-primary/10 text-primary text-[10px]">
														{p.initials}
													</AvatarFallback>
												</Avatar>
												<span className="truncate max-w-[140px]">
													{p.cliente}
												</span>
											</div>
										</TableCell>
										<TableCell className="text-right tabular-nums">
											$
											{p.total.toLocaleString("en-US", {
												minimumFractionDigits: 2,
											})}
										</TableCell>
										<TableCell>
											<Badge
												variant="outline"
												className={estadoBadge[p.estado].className}
											>
												{estadoBadge[p.estado].label}
											</Badge>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>

				{/* stock health — takes 2 cols */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>Nivel de inventario</CardTitle>
						<CardDescription>Capacidad por categoria</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col gap-4">
							{stockCategorias.map((cat) => (
								<StockLevel key={cat.nombre} {...cat} />
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* ── pending dispatches ── */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle>Despachos programados</CardTitle>
						<CardDescription>Proximas salidas del almacen</CardDescription>
					</div>
					<Badge
						variant="outline"
						className="border-chart-4/40 bg-chart-4/10 text-chart-4"
					>
						{despachosPendientes.length} pendientes
					</Badge>
				</CardHeader>
				<CardContent>
					<div className="grid gap-3 sm:grid-cols-3">
						{despachosPendientes.map((d) => (
							<div
								key={d.id}
								className="flex flex-col gap-2 rounded-lg border p-3"
							>
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium tabular-nums">
										{d.id}
									</span>
									<Badge
										variant="outline"
										className="border-chart-2/40 bg-chart-2/10 text-chart-2"
									>
										<IconClock data-icon="inline-start" />
										{d.salida}
									</Badge>
								</div>
								<Separator />
								<div className="flex flex-col gap-1.5 text-sm">
									<div className="flex items-center justify-between">
										<span className="flex items-center gap-1 text-muted-foreground">
											<IconMapPin className="size-3.5" />
											Destino
										</span>
										<span className="font-medium">{d.destino}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Bultos</span>
										<span className="tabular-nums">{d.bultos}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Transportista</span>
										<span className="truncate max-w-[120px] text-right">
											{d.transportista}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
