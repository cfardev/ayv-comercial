import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { App } from "./App";
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
	throw new Error("Root element #root not found");
}

createRoot(rootEl).render(
	<StrictMode>
		<BrowserRouter>
			<TooltipProvider>
				<App />
			</TooltipProvider>
		</BrowserRouter>
	</StrictMode>,
);
