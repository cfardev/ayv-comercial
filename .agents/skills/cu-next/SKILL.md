---
name: cu-next
description: Identifies the next use case (CU) ready to be implemented by checking ROADMAP.md for pending CUs whose dependencies are all complete. Also surfaces any incomplete checkboxes from in-progress CUs.
metadata:
  author: ayv-comercial team
  version: "2026.1.0"
---

# Skill: cu-next

Finds the next implementable CU and surfaces its tasks.

## Trigger

User says: `"next CU"`, `"what's next"`, `"which CU should I work on"`, `"/cu-next"`, or asks for implementation priority.

## Workflow

### Step 1 — Check for in-progress CUs

Read `docs/ROADMAP.md`. Find any row with status `🔄 En progreso`.

If found:
- Read that CU's file (`docs/use-cases/CUxx-*.md`).
- List all **unchecked** checkboxes (`- [ ]`) from `## Implementación técnica`.
- Ask the user:

> **CUxx — <título>** está `🔄 En progreso` con las siguientes tareas pendientes:
>
> **Base de datos:**
> - [ ] <task>
>
> **API (NestJS):**
> - [ ] <task>
>
> **Frontend (React):**
> - [ ] <task>
>
> ¿Deseas continuar con este CU o saltar al siguiente?

If user says "continuar": stop here, present the task list clearly and offer to start with the first unchecked task.
If user says "saltar": proceed to Step 2.

### Step 2 — Find next pending CU

Read `docs/ROADMAP.md` table. Iterate rows in `#` order. For each `⬜ Pendiente` row:

1. Check its **Dependencias** column.
2. For each listed dependency (e.g., CU01, CU03), verify it has status `✅ Completo` in the ROADMAP table.
3. First row where **all dependencies are `✅ Completo`** (or dependencies = `—`) = next CU to implement.

### Step 3 — Present the CU

Read the CU file. Output:

---

**Próximo CU a implementar: CUxx — <Título>**

> Orden de desarrollo: #N | Dependencias: <lista o "Ninguna">

**Objetivo:** <texto del objetivo>

**Actores:** <lista>

---

### Tareas de implementación

**Base de datos**
- [ ] <task 1>
- [ ] <task 2>

**API (NestJS)**
- [ ] <task 1>
- [ ] <task 2>

**Frontend (React)**
- [ ] <task 1>
- [ ] <task 2>

---

¿Deseas comenzar con este CU? (Di `"start"` o usa la skill `cu-start` para crear la rama y comenzar.)

---

### Step 4 — If no CU is ready

If all pending CUs have unmet dependencies:

> No hay CU listo para implementar. Los siguientes CU están bloqueados porque sus dependencias no están completas:
>
> | CU | Dependencias faltantes |
> |----|------------------------|
> | CUxx | CUyy (⬜), CUzz (⬜) |

Suggest which blocked CU has the fewest unmet dependencies.

## Notes

- Read ROADMAP status from the emoji in the `Estado` column: `⬜` = Pendiente, `🔄` = En progreso, `✅` = Completo, `🚫` = Bloqueado.
- If multiple CUs are ready (all deps met), present the one with the lowest `#` number first.
- Do NOT auto-start or modify any files. This skill is read-only + advisory.
