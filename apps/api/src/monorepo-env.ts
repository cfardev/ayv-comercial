import { join } from "node:path";

/** Ruta al `.env` compartido en la raíz del monorepo (válido desde `src/` y desde `dist/`). */
export const MONOREPO_ROOT_ENV_FILE = join(__dirname, "../../../.env");
