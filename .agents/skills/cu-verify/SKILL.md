---
name: cu-verify
description: Verifies that all implementation checkboxes for a given use case (CU) are actually implemented in the codebase. Scans code for each task, reports gaps, and optionally commits and pushes when everything passes.
metadata:
  author: ayv-comercial team
  version: "2026.1.0"
---

# Skill: cu-verify

Audits a CU's implementation against its `## Implementación técnica` checkboxes.

## Trigger

User says: `"verify CU"`, `"check CUxx"`, `"is CUxx done"`, `"/cu-verify"`, or asks to review implementation completeness before merging.

## Workflow

### Step 1 — Identify the target CU

If the user specified a CU number, use that.
If not, ask: "¿Qué CU deseas verificar?"

Read `docs/use-cases/CUxx-*.md`.

### Step 2 — Extract expected tasks

Parse all checkboxes from `## Implementación técnica`:

- `### Base de datos` tasks
- `### API (NestJS)` tasks  
- `### Frontend (React)` tasks

Separate into:
- Already checked (`- [x]`) — claimed complete
- Unchecked (`- [ ]`) — explicitly not done

### Step 3 — Verify each checked task

For each `- [x]` task, search the codebase for evidence of implementation. Use the task description as a guide for what to look for.

**Base de datos checks:**
- Prisma model exists in `apps/api/prisma/schema.prisma`
- Fields / relations / indexes / `@@map` present as expected
- Migration file exists in `apps/api/prisma/migrations/`

**API (NestJS) checks:**
- Controller file exists (`apps/api/src/<domain>/<domain>.controller.ts`)
- Endpoint method present (GET/POST/PATCH/DELETE for the described route)
- DTO file exists with expected fields and validators
- Service method exists
- Module registers controller + service + providers
- Guard applied (`@UseGuards`, `@Roles`)

**Frontend (React) checks:**
- Page component exists (`apps/client/src/pages/<domain>/`)
- Route registered in router file
- TanStack Query hook (`useQuery`/`useMutation`) present for each API call
- Zod schema defined for form validation
- Form component present (if CU involves data entry)
- Role-based rendering present (if CU is role-restricted)

### Step 4 — Report results

Output a verification report:

---

**Verificación: CUxx — <Título>**

#### Base de datos

| Tarea | Estado | Evidencia |
|-------|--------|-----------|
| <task> | ✅ Encontrado | `apps/api/prisma/schema.prisma:42` |
| <task> | ❌ No encontrado | — |

#### API (NestJS)

| Tarea | Estado | Evidencia |
|-------|--------|-----------|
| <task> | ✅ Encontrado | `apps/api/src/products/products.controller.ts:18` |
| <task> | ⚠️ Parcial | Endpoint existe pero sin guard de rol |

#### Frontend (React)

| Tarea | Estado | Evidencia |
|-------|--------|-----------|
| <task> | ✅ Encontrado | `apps/client/src/pages/products/ProductsPage.tsx` |
| <task> | ❌ No encontrado | Ruta no registrada en router |

---

**Resumen:** <N> de <total> tareas verificadas. <M> gaps encontrados.

---

### Step 5 — Handle gaps

If gaps found:

> Se encontraron **<M> gaps**. ¿Deseas que implemente las tareas faltantes ahora?

If user confirms, implement each missing task and mark its checkbox.

If no gaps:

> Todas las tareas están implementadas. ¿Deseas marcar CUxx como `✅ Completo` en el ROADMAP y hacer commit?

### Step 6 — Finalize (optional, on user confirmation)

1. Update unchecked checkboxes to `- [x]` in the CU file (for any tasks implemented during this session).
2. Update `docs/ROADMAP.md`: set CU status to `✅ Completo`.
3. Stage and commit:
   ```
   docs: mark CUxx complete and verify implementation
   ```
4. Push: `git push`
5. Report: branch + commit hash.

## Verification heuristics

When searching for evidence, prefer:
- Exact class/function names derived from the task description (e.g., "ProductsController", "CreateProductDto")
- File paths matching NestJS convention: `apps/api/src/<domain>/<domain>.<type>.ts`
- Prisma model names (PascalCase) and field names (camelCase) from task description
- Route paths matching REST conventions (`/products`, `/products/:id`)

If a task is ambiguous (e.g., "Add audit fields"), look for common patterns: `createdAt`, `updatedAt`, `deletedAt` fields in the relevant model.

Mark as `⚠️ Parcial` if the construct exists but appears incomplete (e.g., controller exists but method body is empty or throws `NotImplementedException`).

## Status icons

| Icon | Meaning |
|------|---------|
| ✅ | Found and appears complete |
| ⚠️ | Found but incomplete / missing details |
| ❌ | Not found |
| ⬜ | Not checked (was already unchecked in file) |
