import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig, loadEnv } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, "../..");

/** Una línea fija con el puerto para que se vea bien con `turbo run dev` (sin depender del banner por defecto). */
function logClientUrl(): Plugin {
	return {
		name: "log-client-url",
		configureServer(server) {
			server.httpServer?.once("listening", () => {
				const addr = server.httpServer?.address();
				if (addr && typeof addr === "object" && "port" in addr) {
					const port = addr.port;
					console.log(`\n[client]  http://localhost:${port}/\n`);
				}
			});
		},
	};
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, monorepoRoot, "VITE_");
	const port = Number(env.VITE_PORT) || 3000;
	/** Destino del API en dev (solo `vite.config`, no hace falta exponerlo al bundle). */
	const apiProxyTarget = env.VITE_API_PROXY_TARGET || "http://localhost:4000";

	return {
		clearScreen: false,
		envDir: monorepoRoot,
		server: {
			port,
			strictPort: true,
			proxy: {
				"/api": {
					target: apiProxyTarget,
					changeOrigin: true,
				},
			},
		},
		plugins: [react(), logClientUrl()],
	};
});
