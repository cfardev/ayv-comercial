import { useState } from "react";
import { Outlet } from "react-router-dom";

import { AppSidebar } from "@/components/app-sidebar";
import { StickyHeader } from "@/components/sticky-header";
import { TopBar } from "@/components/top-bar";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getSidebarDefaultOpen } from "@/lib/sidebar-cookie";

export function DashboardLayout() {
	const [defaultOpen] = useState(() => getSidebarDefaultOpen());

	return (
		<SidebarProvider defaultOpen={defaultOpen}>
			<AppSidebar />
			<main className="flex min-h-svh w-full min-w-0 flex-col p-2 sm:p-4">
				<StickyHeader className="shadow-md">
					<TopBar />
					<Separator />
				</StickyHeader>
				<section className="min-w-0 flex-1 rounded-b-lg bg-background px-3 py-4 shadow-md sm:px-6 sm:py-6">
					<Outlet />
				</section>
			</main>
		</SidebarProvider>
	);
}
