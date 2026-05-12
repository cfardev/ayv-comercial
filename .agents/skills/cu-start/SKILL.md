---
name: cu-start
description: Begins implementation of a specific use case. Sets ROADMAP.md status to in-progress, creates a git branch, and implements each checkbox in the "## Implementación técnica" section sequentially. Never marks ROADMAP as complete; completion is handled only after cu-verify and explicit user confirmation.
metadata:
  author: ayv-comercial team
  version: "2026.1.0"
---

# Skill: cu-start

Starts implementing a CU end-to-end, from branch creation to final checkbox.

## Trigger

User says: `"start CU"`, `"implement CUxx"`, `"begin CUxx"`, `"/cu-start"`, or `"start"` after `cu-next` presented a CU.

## Workflow

### Step 1 — Identify the target CU

If the user specified a CU number (e.g., "start CU07"), use that.
If not specified, run the `cu-next` logic to identify the next ready CU and confirm with the user before proceeding.

### Step 2 — Validate dependencies

Read `docs/ROADMAP.md`. Check that all dependencies of the target CU are `✅ Completo`.

If any dependency is not complete:

> ⚠️ **Dependencias incompletas:**
> - CUxx — <título> (estado actual: ⬜/🔄)
>
> Implementar este CU antes de continuar puede generar trabajo duplicado o errores. ¿Deseas continuar de todas formas?

Wait for confirmation.

### Step 3 — Update ROADMAP status

Edit `docs/ROADMAP.md`: change the target CU's `Estado` cell from `⬜ Pendiente` to `🔄 En progreso`.

### Step 4 — Create git branch

Run:

```bash
git pull origin main
git checkout -b feat/CUxx-<kebab-title>
```

Where `<kebab-title>` = CU title in kebab-case, lowercase, max 40 chars (e.g., `feat/CU07-gestion-de-productos`).

Report the branch name created.

### Step 5 — Read implementation tasks

Read the CU file `docs/use-cases/CUxx-*.md`. Extract all checkboxes from `## Implementación técnica`, grouped by layer:

- `### Base de datos`
- `### API (NestJS)`
- `### Frontend (React)`

Present the full task list to the user and confirm: "¿Comenzamos con la primera tarea?"

### Step 6 — Implement tasks sequentially

Work through tasks **one layer at a time**, in order: Base de datos → API → Frontend.

For each task:

1. **Announce** the task being worked on.
2. **Implement** the change (edit files, run commands as needed).
3. **Verify** the change compiles / passes basic checks:
   - DB: `pnpm --filter api prisma validate` (schema valid)
   - API: `pnpm --filter api build` (no TS errors)
   - Frontend: `pnpm --filter client build` (no TS errors)
4. **Mark checkbox done** in the CU file: change `- [ ]` to `- [x]`.
5. **Commit** the completed task:
   ```
   feat(api): <short description of what was done> [CUxx]
   ```
   Use `feat(api):` for backend tasks, `feat(web):` for frontend tasks, `feat(db):` for migration-only tasks.
6. Move to next task.

> **If blocked:** If a task is unclear or requires a design decision, stop and ask the user. Do NOT guess or skip.

### Step 7 — Final summary

After all checkboxes are done, report summary and prompt for verification:

> **CUxx — <Título>** implementado localmente.
>
> - Rama: `feat/CUxx-<kebab-title>`
> - Commits: <N>
> - Tareas completadas: <N>/<N>
>
> Revisa los cambios y ejecuta `/cu-verify CUxx` para verificar que todo está correctamente implementado antes de hacer push y crear el PR.

### Step 8 — Completion boundary (strict)

- `cu-start` **must not** cambiar `docs/ROADMAP.md` a `✅ Completo`.
- `cu-start` **must not** hacer push automáticamente al terminar implementación.
- Al terminar tareas, el flujo correcto es: `cu-start` -> `cu-verify` -> confirmación explícita del usuario para `git add/commit/push` -> recién ahí actualizar ROADMAP a `✅ Completo`.
- Si `cu-start` marcó ROADMAP como completo por error, debe revertir ese estado a `🔄 En progreso` inmediatamente.

## Implementation guidelines

### Base de datos (Prisma)

- Edit `apps/api/prisma/schema.prisma`.
- Follow conventions: `camelCase` fields, `@map("snake_case")` per field, `@@map("snake_case")` per model.
- Run `pnpm --filter api prisma migrate dev --name <migration-name>` after schema changes.
- Regenerate client: `pnpm --filter api prisma generate`.

### API (NestJS)

- Modules in `apps/api/src/<domain>/`.
- DTOs in `<domain>/dto/`, use `class-validator` decorators.
- Guards: reuse existing `JwtAuthGuard` and `RolesGuard`; apply `@Roles(...)` decorator.
- Register new modules in `AppModule`.
- Follow NestJS best practices skill if loaded.

### Frontend (React)

- Pages in `apps/client/src/pages/<domain>/`.
- Register routes in `apps/client/src/router.tsx` (or equivalent router file).
- Server state via TanStack Query (`useQuery`, `useMutation`).
- Form validation via Zod + react-hook-form.
- UI components from shadcn/ui; icons from `@tabler/icons-react`.
- Role-based UI: check user role from auth context before rendering sensitive actions.

## Branch naming

`feat/CUxx-<kebab-title>`

Max 50 chars total. Examples:
- `feat/CU01-inicio-de-sesion`
- `feat/CU07-gestion-de-productos`
- `feat/CU15-registro-de-venta`

## Commit message format

```
feat(scope): short description [CUxx]
```

Scopes: `api`, `web`, `db`. Include `[CUxx]` tag at end for traceability.

Examples:
- `feat(db): add product model and migration [CU07]`
- `feat(api): add products CRUD endpoints [CU07]`
- `feat(web): add products management page [CU07]`
