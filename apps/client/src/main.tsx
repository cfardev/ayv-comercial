import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { queryClient } from "@/lib/query-client";
import App from "./App";

const rootElement = document.getElementById("root");

if (!rootElement) {
	throw new Error("No se encontro el elemento root");
}

createRoot(rootElement).render(
	<StrictMode>
		<BrowserRouter>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider>
					<AuthProvider>
						<App />
					</AuthProvider>
				</ThemeProvider>
				{import.meta.env.DEV ? (
					<ReactQueryDevtools initialIsOpen={false} />
				) : null}
			</QueryClientProvider>
		</BrowserRouter>
	</StrictMode>,
);
