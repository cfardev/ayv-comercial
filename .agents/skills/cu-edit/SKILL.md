---
name: cu-edit
description: Edit an existing use case (CU) file for the ayv-comercial backoffice. Add, remove, or update any section or implementation task. After changes, syncs ROADMAP.md status automatically — marks the CU as complete if all tasks are checked, or reverts to pending/in-progress if unchecked tasks remain.
metadata:
  author: ayv-comercial team
  version: "2026.1.0"
---

# Skill: cu-edit

Edits an existing use case file and keeps ROADMAP.md in sync.

## Trigger

User says: `"edit CU"`, `"update CU"`, `"modify CU"`, `"add task to CU"`, `"remove task from CU"`, `"/cu-edit"`, or references a specific CU and describes a change to make.

## Workflow

### Step 1 — Identify the target CU

If the user specified a CU number or name, resolve it to its file path:
- Pattern: `docs/use-cases/CUxx-*.md`

If ambiguous or not specified, ask:

> Which CU do you want to edit? (e.g., CU07, "Gestión de productos")

Read the target file before making any edits.

### Step 2 — Understand the requested change

Classify the change into one or more of the following types:

| Type | Examples |
|------|---------|
| **Section update** | Rewrite Objetivo, add an actor, modify a business rule, update a flujo alterno |
| **Task added** | New `- [ ]` checkbox under Base de datos, API, or Frontend |
| **Task removed** | Remove an existing task (checked or unchecked) |
| **Task marked** | Mark a specific task as done (`- [x]`) or undone (`- [ ]`) |
| **Dependency change** | Update the `> **Dependencias:**` line in Implementación técnica |

If the change type is ambiguous, infer it from context. Do not ask unless truly unclear.

### Step 3 — Apply the edits

Edit the CU file directly using precise string replacements. Rules:

- Preserve all markdown formatting, list indentation, and section headers.
- When **adding** a task, insert it at the end of the relevant subsection (Base de datos / API / Frontend) unless the user specifies otherwise.
- When **removing** a task, delete the entire line. If it was the only task in a subsection, leave the subsection header intact with a placeholder: `- _[Sin tareas pendientes]_`.
- When **updating a section** (non-task), replace only the affected lines — do not rewrite the whole file.
- Do not alter CU number, file name, or ROADMAP.md row position.

### Step 4 — Compute new ROADMAP status

After applying edits, count checkboxes in `## Implementación técnica`:

```
total_tasks   = count of `- [ ]` + `- [x]` lines
checked_tasks = count of `- [x]` lines
```

Determine the new status:

| Condition | ROADMAP status |
|-----------|---------------|
| `checked_tasks == total_tasks` AND `total_tasks > 0` | `✅ Completo` |
| `checked_tasks > 0` AND `checked_tasks < total_tasks` | `🔄 En progreso` |
| `checked_tasks == 0` | `⬜ Pendiente` |

### Step 5 — Update ROADMAP.md

Open `docs/ROADMAP.md`. Find the row for the edited CU (match by CU number in the link, e.g., `CU07`). Replace only the **Estado** cell with the new status computed in Step 4.

Example — row before:
```
| 7 | [CU07](./use-cases/CU07-gestion-de-productos.md) | Gestión de productos | CU04, CU05 | 🔄 En progreso |
```

Row after (if all tasks are now checked):
```
| 7 | [CU07](./use-cases/CU07-gestion-de-productos.md) | Gestión de productos | CU04, CU05 | ✅ Completo |
```

If the **Dependencias** field changed in the CU file, also update the Dependencias cell in the ROADMAP row to match.

### Step 6 — Confirm

Report to the user:
- Which file was edited and what changed (brief summary).
- New ROADMAP status for the CU.
- Any tasks that are still pending (list unchecked `- [ ]` items if relevant).

## Rules

- Never rename or move the CU file.
- Never change the CU number or the ROADMAP `#` dev-order column.
- If a dependency is added and that dependency CU does not exist in ROADMAP.md, warn the user:
  > ⚠️ **Dependencia no encontrada:** CUxx no existe en el roadmap. Verifica el número o crea el CU primero.
- If the edit would leave `## Implementación técnica` with zero tasks, warn the user:
  > ⚠️ La sección de implementación técnica quedaría vacía. ¿Deseas continuar?
  Wait for confirmation before saving.

## ROADMAP status icons reference

| Icon | Meaning |
|------|---------|
| `⬜ Pendiente` | No tasks checked |
| `🔄 En progreso` | Some tasks checked, some pending |
| `✅ Completo` | All tasks checked |
| `🚫 Bloqueado` | Set manually; this skill does not auto-assign this status |
