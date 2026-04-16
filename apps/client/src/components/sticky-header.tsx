import { type ReactNode, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const SCROLL_THRESHOLD_PX = 16;

export function StickyHeader({
	className,
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => {
			setScrolled(window.scrollY >= SCROLL_THRESHOLD_PX);
		};
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<header
			className={cn(
				"sticky z-[90] bg-background transition-[top,border-radius] duration-200",
				scrolled ? "top-0 rounded-none" : "top-4 rounded-t-lg",
				className,
			)}
		>
			{children}
		</header>
	);
}
