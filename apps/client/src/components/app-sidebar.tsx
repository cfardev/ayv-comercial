import { NavLink, useLocation } from "react-router-dom";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	useSidebar,
} from "@/components/ui/sidebar";
import { dashboardNavItems } from "@/lib/dashboard-nav";

function SidebarBrand() {
	const { state } = useSidebar();
	const expanded = state === "expanded";

	return (
		<div className="flex items-center gap-2 px-2 py-1.5">
			<div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
				AYV
			</div>
			{expanded && (
				<span className="truncate font-semibold tracking-tight text-sidebar-foreground">
					Portal comercial
				</span>
			)}
		</div>
	);
}

export function AppSidebar() {
	const { pathname } = useLocation();

	return (
		<Sidebar collapsible="icon" variant="sidebar">
			<SidebarHeader>
				<SidebarBrand />
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Navegación</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{dashboardNavItems.map((item) => {
								const Icon = item.icon;
								const isActive =
									item.url === "/"
										? pathname === "/"
										: pathname.startsWith(item.url);

								return (
									<SidebarMenuItem key={item.url}>
										<SidebarMenuButton
											asChild
											isActive={isActive}
											tooltip={item.title}
										>
											<NavLink to={item.url} end={item.url === "/"}>
												<Icon />
												<span>{item.title}</span>
											</NavLink>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	);
}
