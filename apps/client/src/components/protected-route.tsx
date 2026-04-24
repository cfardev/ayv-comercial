import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";

interface ProtectedRouteProps {
	children?: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { accessToken } = useAuth();

	if (!accessToken) {
		return <Navigate to="/login" replace />;
	}

	if (children) {
		return <>{children}</>;
	}

	return <Outlet />;
}
