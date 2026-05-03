/** @type {import('lint-staged').Config} */
export default {
  // Mirrors .github/workflows/verify.yml: lint + build on commit; typecheck deferred to pre-push

  // biome check --write on staged files (lint step)
  "*.{ts,tsx,js,mjs,json}": ["biome check --write"],

  // build runs project-wide when any TS file is staged
  "*.{ts,tsx}": [() => "pnpm build"],
};
