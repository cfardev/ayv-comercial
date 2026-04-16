import { BarChart3Icon, HomeIcon, PackageIcon } from "lucide-react";

export const dashboardNavItems = [
	{ title: "Inicio", url: "/", icon: HomeIcon },
	{ title: "Cargo", url: "/cargo", icon: PackageIcon },
	{ title: "Reportes", url: "/reportes", icon: BarChart3Icon },
] as const;
