import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { parse } from "dotenv";
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
	const rootEnvPath = path.join(monorepoRoot, ".env");
	const rootEnv = existsSync(rootEnvPath)
		? parse(readFileSync(rootEnvPath, "utf8"))
		: {};
	const viteEnv = loadEnv(mode, monorepoRoot, "VITE_");

	const port = Number(viteEnv.VITE_PORT ?? rootEnv.VITE_PORT) || 5173;
	const apiPort = Number(rootEnv.PORT) || 4000;
	const apiProxyTarget =
		viteEnv.VITE_API_PROXY_TARGET ??
		rootEnv.VITE_API_PROXY_TARGET ??
		`http://localhost:${apiPort}`;

	return {
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
		build: {
			outDir: path.join(monorepoRoot, "dist/client"),
			emptyOutDir: true,
		},
		clearScreen: false,
		envDir: monorepoRoot,
		server: {
			port,
			strictPort: false,
			proxy: {
				"/api": {
					target: apiProxyTarget,
					changeOrigin: true,
				},
			},
		},
		plugins: [react(), tailwindcss(), logClientUrl()],
	};
});
