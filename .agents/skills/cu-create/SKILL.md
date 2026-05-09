---
name: cu-create
description: Create a new use case (CU) file for the ayv-comercial backoffice. Detects the next CU number, scaffolds the file with the standard structure including the "## Implementación técnica" section, updates ROADMAP.md, and warns about dependency overlaps with existing CUs.
metadata:
  author: ayv-comercial team
  version: "2026.1.0"
---

# Skill: cu-create

Creates a new use case file and registers it in the roadmap.

## Trigger

User says: `"create CU"`, `"new use case"`, `"add CU"`, `"/cu-create"`, or describes a new feature that needs a use case document.

## Workflow

### Step 1 — Gather information

Ask the user (in a single prompt, not one by one):

1. **Name / title** of the use case (short, e.g. "Gestión de devoluciones").
2. **Actors** involved (e.g. Vendedor, Administrador).
3. **Brief description** of what the CU covers (2–3 sentences).
4. **Which existing CUs it depends on** (user can say "none" or list CU numbers).
5. **Suggested dev order position** — ask: "Should this CU go before, after, or alongside which existing CU in the dev order?"

If the user already provided this info in their message, skip asking and proceed.

### Step 2 — Detect next CU number

Read `docs/ROADMAP.md`. Find the highest CU number currently listed (e.g., CU30). New CU number = highest + 1 (e.g., CU31).

### Step 3 — Check for duplicates / overlaps

Scan `docs/use-cases/` for existing CU files. Read their **Objetivo** and **Alcance** sections. If a similar CU already exists, warn the user:

> ⚠️ **Posible duplicado:** CUxx — <título> ya cubre <descripción>. ¿Deseas continuar creando un nuevo CU o extender el existente?

Wait for user confirmation before continuing.

### Step 4 — Create the CU file

Create `docs/use-cases/CUxx-<kebab-case-title>.md` with the full standard structure below. Fill in all sections based on the information gathered. Leave placeholders (`_[Por definir]_`) for anything not provided.

```markdown
# CUxx — <Título>

## Objetivo

<Descripción del objetivo en 1–2 oraciones.>

## Actores

- **Actor principal:** <nombre>
- **Actores secundarios:** <nombres o "Ninguno">

## Precondiciones

- <Precondición 1>
- <Precondición 2>

## Disparador

<Qué evento inicia el caso de uso.>

## Flujo principal

1. <Paso 1>
2. <Paso 2>
3. <Paso 3>

## Flujos alternos

### FA-01: <Nombre del flujo alterno>

1. <Paso>

## Postcondiciones

- <Resultado esperado tras el flujo exitoso.>

## Reglas de negocio

- **RN-01:** <Regla 1>

## Reglas de seguridad

- Solo pueden ejecutar este CU: <roles>.

## Criterios de aceptación

- [ ] <Criterio 1>
- [ ] <Criterio 2>

---

## Implementación técnica

> **Dependencias:** <CUxx, CUyy o "Ninguna">
> **Orden sugerido de desarrollo:** #<N>

### Base de datos

- [ ] <Prisma model / field / migration task>

### API (NestJS)

- [ ] <Endpoint / DTO / guard / service task>

### Frontend (React)

- [ ] <Page / form / hook / component task>
```

### Step 5 — Update ROADMAP.md

Append a new row to the table in `docs/ROADMAP.md`:

```
| <N> | [CUxx](./use-cases/CUxx-<kebab-title>.md) | <Descripción corta> | <Dependencias> | ⬜ Pendiente |
```

Insert at the correct position based on the suggested dev order (shift subsequent rows' `#` numbers if inserting mid-table, or append at end if order = last).

> **Note:** If inserting mid-table, renumber the `#` column of all subsequent rows to maintain sequence. Do NOT change the CU identifiers (CUxx) — only the `#` dev-order column.

### Step 6 — Confirm

Report to the user:
- File created: `docs/use-cases/CUxx-<title>.md`
- ROADMAP.md updated: row added at position #N
- Any placeholders left that the user should fill in

## File naming convention

`CUxx-<kebab-case-title>.md`

Examples:
- `CU31-gestion-de-devoluciones.md`
- `CU32-exportacion-de-reportes.md`

## Tech stack context (for filling "Implementación técnica")

- **DB:** Prisma schema (`apps/api/prisma/schema.prisma`), `@@map` to snake_case, migrations via `prisma migrate dev`
- **API:** NestJS modules in `apps/api/src/`, DTOs with class-validator, guards for JWT + roles, `ValidationPipe` global
- **Frontend:** React pages in `apps/client/src/pages/`, TanStack Query for server state, Zod for form validation, shadcn/ui components, react-router-dom routes
