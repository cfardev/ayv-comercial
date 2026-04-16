import { join } from "node:path";

/** Salida de `vite build` del client en la raíz del monorepo (`dist/client`). */
export const CLIENT_DIST_PATH = join(__dirname, "..", "..", "..", "dist", "client");
