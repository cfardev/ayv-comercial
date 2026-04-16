import { Navigate, Route, Routes } from "react-router-dom";

import { DashboardLayout } from "@/layouts/dashboard-layout";
import { CargoPage } from "@/pages/cargo-page";
import { DashboardHomePage } from "@/pages/dashboard-home-page";
import { ReportesPage } from "@/pages/reportes-page";

export function App() {
	return (
		<Routes>
			<Route element={<DashboardLayout />}>
				<Route index element={<DashboardHomePage />} />
				<Route path="cargo" element={<CargoPage />} />
				<Route path="reportes" element={<ReportesPage />} />
			</Route>
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}
