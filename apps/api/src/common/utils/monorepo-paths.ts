import { join } from "node:path";

/** Raíz del monorepo (`ayv-comercial/`), válido desde `src/` compilar a `dist/`. */
const MONOREPO_ROOT = join(__dirname, "..", "..", "..", "..", "..");

/** Salida de `vite build` del client (`dist/client`). */
export const CLIENT_DIST_PATH = join(MONOREPO_ROOT, "dist", "client");

/** `.env` compartido en la raíz del monorepo. */
export const MONOREPO_ROOT_ENV_FILE = join(MONOREPO_ROOT, ".env");
