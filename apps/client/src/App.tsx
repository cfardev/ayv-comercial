import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { CategoriasPage } from "@/pages/categorias-page";
import { DashboardHomePage } from "@/pages/dashboard-home-page";
import { LoginPage } from "@/pages/login-page";
import { MarcasPage } from "@/pages/marcas-page.js";
import { ProductoCreatePage } from "@/pages/producto-create-page.js";
import { ProductosPage } from "@/pages/productos-page.js";
import { ProveedoresPage } from "@/pages/proveedores-page.js";
import { UsersPage } from "@/pages/usuarios-page.js";

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
				<Route path="productos/nuevo" element={<ProductoCreatePage />} />
				<Route path="productos" element={<ProductosPage />} />
				<Route path="clientes" element={<Placeholder title="Clientes" />} />
				<Route path="categorias" element={<CategoriasPage />} />
				<Route path="marcas" element={<MarcasPage />} />
				<Route path="proveedores" element={<ProveedoresPage />} />
				<Route path="usuarios" element={<UsersPage />} />
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
