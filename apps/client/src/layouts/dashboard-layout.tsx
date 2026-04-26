import {
	IconBox,
	IconBuildingWarehouse,
	IconChartBar,
	IconFileInvoice,
	IconLayoutDashboard,
	IconLogout,
	IconPackages,
	IconSettings,
	IconTruck,
	IconUsers,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
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
	DropdownMenuGroup,
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
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth-context";

function getInitials(fullName: string): string {
	return fullName
		.split(" ")
		.map((n) => n[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

const navOperaciones = [
	{ title: "Panel", url: "/", icon: IconLayoutDashboard },
	{ title: "Pedidos", url: "/pedidos", icon: IconFileInvoice },
	{ title: "Inventario", url: "/inventario", icon: IconPackages },
	{ title: "Despachos", url: "/despachos", icon: IconTruck },
];

const navCatalogo = [
	{ title: "Productos", url: "/productos", icon: IconBox },
	{ title: "Clientes", url: "/clientes", icon: IconUsers },
];

const navReportes = [
	{ title: "Reportes", url: "/reportes", icon: IconChartBar },
	{ title: "Usuarios", url: "/usuarios", icon: IconUsers },
	{ title: "Configuracion", url: "/configuracion", icon: IconSettings },
];

const pageTitles: Record<string, string> = {
	"/": "Panel",
	"/pedidos": "Pedidos",
	"/inventario": "Inventario",
	"/despachos": "Despachos",
	"/productos": "Productos",
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
	items: typeof navOperaciones;
	currentPath: string;
}) {
	return (
		<SidebarGroup>
			<SidebarGroupLabel>{label}</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton asChild isActive={currentPath === item.url}>
								<Link to={item.url}>
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

export function DashboardLayout({ children }: { children: ReactNode }) {
	const location = useLocation();
	const currentPath = location.pathname;
	const pageTitle = pageTitles[currentPath] ?? "A&V";
	const { user, logout } = useAuth();

	return (
		<TooltipProvider>
			<SidebarProvider className="h-svh min-h-0 overflow-hidden">
				<Sidebar>
					<SidebarHeader>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton size="lg" asChild>
									<Link to="/">
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
										<DropdownMenuGroup>
											<DropdownMenuItem asChild>
												<Link to="/configuracion">
													<IconSettings data-icon="inline-start" />
													Configuracion
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={logout}
												className="cursor-pointer"
											>
												<IconLogout data-icon="inline-start" />
												Cerrar sesion
											</DropdownMenuItem>
										</DropdownMenuGroup>
									</DropdownMenuContent>
								</DropdownMenu>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarFooter>
					<SidebarRail />
				</Sidebar>
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
