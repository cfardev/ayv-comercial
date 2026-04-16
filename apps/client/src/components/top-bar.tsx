import { UserIcon } from "lucide-react";
import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const routeLabels: Record<string, string> = {
	"": "Inicio",
	cargo: "Cargo",
	reportes: "Reportes",
};

function segmentHref(segments: string[], index: number): string {
	const slice = segments.slice(0, index + 1);
	return `/${slice.join("/")}`;
}

export function TopBar() {
	const { pathname } = useLocation();
	const segments = pathname.split("/").filter(Boolean);

	type Crumb = { key: string; label: string; href: string | null };

	const crumbs: Crumb[] =
		segments.length === 0
			? [{ key: "inicio", label: "Inicio", href: null }]
			: [
					{ key: "root", label: "Inicio", href: "/" },
					...segments.map((seg, i) => ({
						key: segmentHref(segments, i),
						label: routeLabels[seg] ?? seg,
						href: i === segments.length - 1 ? null : segmentHref(segments, i),
					})),
				];

	return (
		<div
			className={cn(
				"flex min-w-0 flex-1 items-center gap-3 px-3 py-2 sm:px-4",
				"justify-between",
			)}
		>
			<div className="flex min-w-0 flex-1 items-center gap-2">
				<SidebarTrigger />
				<Breadcrumb className="min-w-0">
					<BreadcrumbList className="flex-wrap">
						{crumbs.map((c, i) => (
							<Fragment key={c.key}>
								{i > 0 && <BreadcrumbSeparator className="[&>svg]:size-3.5" />}
								<BreadcrumbItem className="min-w-0">
									{c.href === null ? (
										<BreadcrumbPage className="truncate">
											{c.label}
										</BreadcrumbPage>
									) : (
										<BreadcrumbLink asChild>
											<Link to={c.href} className="truncate">
												{c.label}
											</Link>
										</BreadcrumbLink>
									)}
								</BreadcrumbItem>
							</Fragment>
						))}
					</BreadcrumbList>
				</Breadcrumb>
			</div>

			<div className="flex shrink-0 items-center gap-2">
				<DropdownMenu>
					<DropdownMenuTrigger className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
						<Avatar size="sm">
							<AvatarFallback>
								<UserIcon />
							</AvatarFallback>
						</Avatar>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="min-w-48">
						<DropdownMenuLabel className="font-normal">
							<div className="flex flex-col gap-0.5">
								<span className="text-sm font-medium">Usuario demo</span>
								<span className="text-xs text-muted-foreground">
									demo@ayv.local
								</span>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem disabled>
							<UserIcon />
							Perfil
						</DropdownMenuItem>
						<DropdownMenuItem disabled>Cerrar sesión</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
