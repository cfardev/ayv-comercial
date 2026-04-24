import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { DashboardHomePage } from "@/pages/dashboard-home-page";
import { LoginPage } from "@/pages/login-page";

function Placeholder({ title }: { title: string }) {
	return (
		<div className="flex flex-1 items-center justify-center rounded-lg border border-dashed p-8">
			<p className="text-muted-foreground">{title} — proximamente</p>
		</div>
	);
}

function DashboardRoutes() {
	return (
		<DashboardLayout>
			<Routes>
				<Route index element={<DashboardHomePage />} />
				<Route path="pedidos" element={<Placeholder title="Pedidos" />} />
				<Route path="inventario" element={<Placeholder title="Inventario" />} />
				<Route path="despachos" element={<Placeholder title="Despachos" />} />
				<Route path="productos" element={<Placeholder title="Productos" />} />
				<Route path="clientes" element={<Placeholder title="Clientes" />} />
				<Route path="reportes" element={<Placeholder title="Reportes" />} />
				<Route
					path="configuracion"
					element={<Placeholder title="Configuracion" />}
				/>
				<Route path="dev/todo" element={<Placeholder title="TODO" />} />
			</Routes>
		</DashboardLayout>
	);
}

export default function App() {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route
				path="/*"
				element={
					<ProtectedRoute>
						<DashboardRoutes />
					</ProtectedRoute>
				}
			/>
		</Routes>
	);
}
