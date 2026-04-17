import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MONOREPO_MARKERS = ["pnpm-workspace.yaml", "turbo.json"] as const;

const findMonorepoRoot = (startDir: string): string => {
	let currentDir = startDir;

	while (true) {
		const hasMonorepoMarker = MONOREPO_MARKERS.some((marker) =>
			existsSync(join(currentDir, marker)),
		);

		if (hasMonorepoMarker) {
			return currentDir;
		}

		const parentDir = resolve(currentDir, "..");
		if (parentDir === currentDir) {
			throw new Error(`Unable to resolve monorepo root from ${startDir}`);
		}

		currentDir = parentDir;
	}
};

const MONOREPO_ROOT = findMonorepoRoot(__dirname);

export const CLIENT_DIST_PATH = join(MONOREPO_ROOT, "dist", "client");

export const MONOREPO_ROOT_ENV_FILE = join(MONOREPO_ROOT, ".env");
