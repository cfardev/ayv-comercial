import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
	const { theme, setTheme } = useTheme();

	return (
		<Button
			variant="ghost"
			size="icon"
			type="button"
			className="relative"
			aria-label={
				theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
			}
			onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
		>
			<IconSun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
			<IconMoon className="absolute inset-0 m-auto rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
		</Button>
	);
}
