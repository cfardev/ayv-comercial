import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { parse } from "dotenv";
import type { Plugin } from "vite";
import { defineConfig, loadEnv } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, "../..");

const DOCS_MIME: Record<string, string> = {
	".bpmn": "application/xml; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".html": "text/html; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".md": "text/markdown; charset=utf-8",
	".svg": "image/svg+xml",
	".woff": "font/woff",
	".woff2": "font/woff2",
};

function serveDocs(docsRoot: string): Plugin {
	return {
		name: "serve-docs",
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				const pathname = (req.url ?? "").split("?")[0] ?? "";
				if (pathname !== "/docs" && !pathname.startsWith("/docs/")) {
					next();
					return;
				}

				let relative = decodeURIComponent(pathname.slice("/docs".length));
				if (relative === "" || relative.endsWith("/")) {
					relative = `${relative.replace(/\/$/, "")}/index.html`;
				}

				const filePath = path.resolve(docsRoot, relative.replace(/^\/+/, ""));
				const root = path.resolve(docsRoot);
				if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
					res.statusCode = 403;
					res.end();
					return;
				}

				if (!existsSync(filePath) || !statSync(filePath).isFile()) {
					res.statusCode = 404;
					res.end("Not found");
					return;
				}

				res.setHeader(
					"Content-Type",
					DOCS_MIME[path.extname(filePath)] ?? "application/octet-stream",
				);
				createReadStream(filePath).pipe(res);
			});
		},
	};
}

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

export default defineConfig(({ mode }) => {
	const rootEnvPath = path.join(monorepoRoot, ".env");
	const rootEnv = existsSync(rootEnvPath)
		? parse(readFileSync(rootEnvPath, "utf8"))
		: {};
	const viteEnv = loadEnv(mode, monorepoRoot, "VITE_");

	const port = Number(viteEnv.VITE_PORT ?? rootEnv.VITE_PORT) || 3000;
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
			outDir: path.join(__dirname, "dist"),
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
		plugins: [
			serveDocs(path.join(monorepoRoot, "docs")),
			react(),
			tailwindcss(),
			logClientUrl(),
		],
	};
});
