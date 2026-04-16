/** Lee `sidebar_state` (misma cookie que escribe el SidebarProvider de shadcn). */
export function getSidebarDefaultOpen(): boolean {
	if (typeof document === "undefined") {
		return true;
	}
	const match = document.cookie.match(
		/(?:^|; )sidebar_state=(true|false)(?:;|$)/,
	);
	return match ? match[1] === "true" : true;
}
