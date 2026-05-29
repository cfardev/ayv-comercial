import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { CategoriasPage } from "@/pages/categorias-page";
import { ClienteCreatePage } from "@/pages/cliente-create-page.js";
import { ClienteEditPage } from "@/pages/cliente-edit-page.js";
import { ClientesPage } from "@/pages/clientes-page.js";
import { DashboardHomePage } from "@/pages/dashboard-home-page";
import { InventoryEntriesPage } from "@/pages/inventory-entries-page";
import { InventoryEntryCreatePage } from "@/pages/inventory-entry-create-page";
import { InventoryMovementsPage } from "@/pages/inventory-movements-page.js";
import { LoginPage } from "@/pages/login-page";
import { MarcasPage } from "@/pages/marcas-page.js";
import { ProductoCreatePage } from "@/pages/producto-create-page.js";
import { ProductoEditPage } from "@/pages/producto-edit-page.js";
import { ProductosPage } from "@/pages/productos-page.js";
import { ProveedorCreatePage } from "@/pages/proveedor-create-page.js";
import { ProveedorEditPage } from "@/pages/proveedor-edit-page.js";
import { ProveedoresPage } from "@/pages/proveedores-page.js";
import { PurchaseOrderCreatePage } from "@/pages/purchase-order-create-page";
import { PurchaseOrdersPage } from "@/pages/purchase-orders-page";
import { StockPage } from "@/pages/stock-page";
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
				<Route
					path="purchase-orders/new"
					element={<PurchaseOrderCreatePage />}
				/>
				<Route path="purchase-orders" element={<PurchaseOrdersPage />} />
				<Route path="inventario" element={<Placeholder title="Inventario" />} />
				<Route path="inventario/entries" element={<InventoryEntriesPage />} />
				<Route
					path="inventario/entries/nuevo"
					element={<InventoryEntryCreatePage />}
				/>
				<Route path="inventario/stock" element={<StockPage />} />
				<Route path="inventario/movements" element={<InventoryMovementsPage />} />
				<Route path="inventory/stock" element={<StockPage />} />
				<Route path="despachos" element={<Placeholder title="Despachos" />} />
				<Route path="productos/nuevo" element={<ProductoCreatePage />} />
				<Route path="productos/:id/editar" element={<ProductoEditPage />} />
				<Route path="productos" element={<ProductosPage />} />
				<Route path="clientes/nuevo" element={<ClienteCreatePage />} />
				<Route path="clientes/:id/editar" element={<ClienteEditPage />} />
				<Route path="clientes" element={<ClientesPage />} />
				<Route path="categorias" element={<CategoriasPage />} />
				<Route path="marcas" element={<MarcasPage />} />
				<Route path="proveedores/nuevo" element={<ProveedorCreatePage />} />
				<Route
					path="proveedores/:id/editar"
					element={<ProveedorEditPage />}
				/>
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
