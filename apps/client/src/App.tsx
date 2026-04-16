import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { DashboardHomePage } from "@/pages/dashboard-home-page";

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route
					path="/*"
					element={
						<DashboardLayout>
							<Routes>
								<Route index element={<DashboardHomePage />} />
								<Route
									path="pedidos"
									element={<Placeholder title="Pedidos" />}
								/>
								<Route
									path="inventario"
									element={<Placeholder title="Inventario" />}
								/>
								<Route
									path="despachos"
									element={<Placeholder title="Despachos" />}
								/>
								<Route
									path="productos"
									element={<Placeholder title="Productos" />}
								/>
								<Route
									path="clientes"
									element={<Placeholder title="Clientes" />}
								/>
								<Route
									path="reportes"
									element={<Placeholder title="Reportes" />}
								/>
								<Route
									path="configuracion"
									element={<Placeholder title="Configuracion" />}
								/>
							</Routes>
						</DashboardLayout>
					}
				/>
			</Routes>
		</BrowserRouter>
	);
}

function Placeholder({ title }: { title: string }) {
	return (
		<div className="flex flex-1 items-center justify-center rounded-lg border border-dashed p-8">
			<p className="text-muted-foreground">{title} — proximamente</p>
		</div>
	);
}
