import {
	IconBox,
	IconBuildingWarehouse,
	IconCategory,
	IconChartBar,
	IconFileInvoice,
	IconLayoutDashboard,
	IconLogout,
	IconPackages,
	IconSettings,
	IconTag,
	IconTruck,
	IconTruckDelivery,
	IconUsers,
} from "@tabler/icons-react";
import type { ComponentType, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarRail,
	SidebarTrigger,
	useSidebar,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth-context";
import {
	hasPermissionOrSystemAdmin,
	PERMISSION_KEYS,
} from "@/lib/permission-keys";

type DashboardNavItem = {
	title: string;
	url: string;
	icon: ComponentType<{ className?: string }>;
	isActive?: (pathname: string) => boolean;
};

function getInitials(fullName: string): string {
	return fullName
		.split(" ")
		.map((n) => n[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

const navOperaciones: DashboardNavItem[] = [
	{ title: "Panel", url: "/", icon: IconLayoutDashboard },
	{ title: "Pedidos", url: "/pedidos", icon: IconFileInvoice },
	{ title: "Inventario", url: "/inventario", icon: IconPackages },
	{ title: "Despachos", url: "/despachos", icon: IconTruck },
];

const navCatalogoBase: DashboardNavItem[] = [
	{
		title: "Productos",
		url: "/productos",
		icon: IconBox,
		isActive: (pathname) =>
			pathname === "/productos" || pathname.startsWith("/productos/"),
	},
	{ title: "Categorías", url: "/categorias", icon: IconCategory },
];

const pageTitles: Record<string, string> = {
	"/": "Panel",
	"/pedidos": "Pedidos",
	"/inventario": "Inventario",
	"/despachos": "Despachos",
	"/productos": "Productos",
	"/productos/nuevo": "Nuevo producto",
	"/categorias": "Categorías",
	"/marcas": "Marcas",
	"/proveedores": "Proveedores",
	"/clientes": "Clientes",
	"/usuarios": "Usuarios",
	"/reportes": "Reportes",
	"/configuracion": "Configuracion",
	"/dev/todo": "TODO",
};

function NavGroup({
	label,
	items,
	currentPath,
}: {
	label: string;
	items: DashboardNavItem[];
	currentPath: string;
}) {
	const { setOpenMobile } = useSidebar();

	return (
		<SidebarGroup>
			<SidebarGroupLabel>{label}</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton
								asChild
								isActive={
									item.isActive
										? item.isActive(currentPath)
										: currentPath === item.url
								}
							>
								<Link to={item.url} onClick={() => setOpenMobile(false)}>
									<item.icon />
									<span>{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}

function DashboardSidebar({ currentPath }: { currentPath: string }) {
	const { user, logout } = useAuth();
	const { setOpenMobile } = useSidebar();

	const navReportes: DashboardNavItem[] = [
		{ title: "Reportes", url: "/reportes", icon: IconChartBar },
		...(hasPermissionOrSystemAdmin(
			user?.permissions,
			PERMISSION_KEYS.USERS_READ,
			user?.role?.slug,
		)
			? [{ title: "Usuarios", url: "/usuarios", icon: IconUsers }]
			: []),
		{ title: "Configuracion", url: "/configuracion", icon: IconSettings },
	];

	const navCatalogo: DashboardNavItem[] = [
		...navCatalogoBase,
		...(hasPermissionOrSystemAdmin(
			user?.permissions,
			PERMISSION_KEYS.BRANDS_READ,
			user?.role?.slug,
		)
			? [{ title: "Marcas", url: "/marcas", icon: IconTag }]
			: []),
		...(hasPermissionOrSystemAdmin(
			user?.permissions,
			PERMISSION_KEYS.SUPPLIERS_READ,
			user?.role?.slug,
		)
			? [{ title: "Proveedores", url: "/proveedores", icon: IconTruckDelivery }]
			: []),
		{ title: "Clientes", url: "/clientes", icon: IconUsers },
	];

	return (
		<Sidebar>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link to="/" onClick={() => setOpenMobile(false)}>
								<div className="flex items-center gap-2">
									<div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
										<IconBuildingWarehouse className="size-4" />
									</div>
									<div className="flex flex-col leading-none">
										<span className="font-semibold text-sm">A&amp;V</span>
										<span className="text-xs text-muted-foreground">
											Inventario y Facturación
										</span>
									</div>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavGroup
					label="Operaciones"
					items={navOperaciones}
					currentPath={currentPath}
				/>
				<NavGroup
					label="Catalogo"
					items={navCatalogo}
					currentPath={currentPath}
				/>
				<NavGroup
					label="Sistema"
					items={navReportes}
					currentPath={currentPath}
				/>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton size="lg">
									<Avatar className="size-7">
										<AvatarFallback className="text-xs">
											{user ? getInitials(user.fullName) : "??"}
										</AvatarFallback>
									</Avatar>
									<div className="flex flex-col leading-none">
										<span className="text-sm font-medium">
											{user?.fullName ?? "Cargando..."}
										</span>
										<span className="text-xs text-muted-foreground">
											{user?.email ?? ""}
										</span>
									</div>
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								side="top"
								className="w-[--radix-popper-anchor-width]"
							>
								<DropdownMenuItem onClick={logout} className="cursor-pointer">
									<IconLogout data-icon="inline-start" />
									Cerrar sesion
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}

export function DashboardLayout({ children }: { children: ReactNode }) {
	const location = useLocation();
	const currentPath = location.pathname;
	const pageTitle = pageTitles[currentPath] ?? "A&V";

	return (
		<TooltipProvider>
			<SidebarProvider className="h-svh min-h-0 overflow-hidden">
				<DashboardSidebar currentPath={currentPath} />
				<SidebarInset className="min-h-0 overflow-hidden">
					<header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4">
						<SidebarTrigger className="-ml-1" />
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem>
									<BreadcrumbPage>{pageTitle}</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
						<div className="ml-auto">
							<ModeToggle />
						</div>
					</header>
					<main className="min-h-0 flex-1 overflow-auto p-4 lg:p-6">
						{children}
					</main>
				</SidebarInset>
			</SidebarProvider>
		</TooltipProvider>
	);
}
