---
name: cu-delete
description: Delete an existing use case (CU) file for the ayv-comercial backoffice. Checks for dependents (CUs that list the target as a dependency) and prompts for developer approval before proceeding. After deletion, removes the CU row from ROADMAP.md and renumbers the dev-order column.
metadata:
  author: ayv-comercial team
  version: "2026.1.0"
---

# Skill: cu-delete

Safely deletes a use case file after dependency analysis and explicit developer approval.

## Trigger

User says: `"delete CU"`, `"remove CU"`, `"eliminate CU"`, `"/cu-delete"`, or asks to get rid of a specific use case.

## Workflow

### Step 1 — Identify the target CU

If the user specified a CU number or name, resolve it to its file path:
- Pattern: `docs/use-cases/CUxx-*.md`

If ambiguous or not specified, ask:

> Which CU do you want to delete? (e.g., CU07, "Gestión de productos")

Read the target file to confirm it exists and extract its title.

### Step 2 — Dependency analysis

Scan ALL files in `docs/use-cases/` for references to the target CU number.  
Check two places per file:

1. The `> **Dependencias:**` line in `## Implementación técnica`.
2. Any mention of the CU number (e.g., `CU07`) anywhere in the file body.

Also check `docs/ROADMAP.md` Dependencias column for the target CU number.

Build two lists:

- **Direct dependents:** CUs whose `Dependencias:` line lists the target CU explicitly.
- **Indirect mentions:** CUs that reference the target CU in their body text (e.g., "referencia CU07") but do not list it as a hard dependency.

### Step 3 — Prompt for approval

Always show a confirmation prompt — even if no dependents are found.

#### Case A — No dependents

```
⚠️  Vas a eliminar CUxx — <Título>.

No se encontraron CUs que dependan de este.
Esta acción no puede deshacerse.

¿Confirmas la eliminación? (sí / no)
```

#### Case B — Direct dependents found

**Warning:** This is a potentially breaking deletion.

```
🚫  Vas a eliminar CUxx — <Título>.

Los siguientes CUs lo listan como dependencia directa:
  • CUyy — <Título> (docs/use-cases/CUyy-*.md)
  • CUzz — <Título> (docs/use-cases/CUzz-*.md)

Eliminar este CU dejará esas dependencias sin resolver.
Se recomienda actualizar o eliminar esos CUs primero,
o reasignar sus dependencias antes de continuar.

¿Deseas continuar de todas formas? (sí / no)
```

#### Case C — Indirect mentions found (no direct dependents)

```
⚠️  Vas a eliminar CUxx — <Título>.

Los siguientes CUs lo mencionan en su contenido (no como dependencia directa):
  • CUyy — <Título>

Considera revisar esas referencias tras la eliminación.

¿Confirmas la eliminación? (sí / no)
```

**Wait for explicit user confirmation** (`sí`, `yes`, `confirm`, `proceed`, or equivalent) before continuing.  
If the user says `no`, `cancel`, or anything negative — abort and inform:

> Eliminación cancelada. No se realizaron cambios.

### Step 4 — Delete the CU file

After approval, delete the file:
- `docs/use-cases/CUxx-<kebab-title>.md`

### Step 5 — Update ROADMAP.md

Open `docs/ROADMAP.md`:

1. **Remove the row** corresponding to the deleted CU (match by CU number in the link).
2. **Renumber the `#` dev-order column** for all rows that follow the removed one (subtract 1 from each subsequent `#` value).
3. **Do NOT change any other CU identifiers** (CUxx numbers, file links, or dependency references in other rows remain unchanged).

Example — before deletion of row `#7`:
```
| 7  | [CU07](...) | ... | CU04, CU05 | ✅ Completo |
| 8  | [CU08](...) | ... | CU07       | ⬜ Pendiente |
| 9  | [CU14](...) | ... | CU01       | ⬜ Pendiente |
```

After:
```
| 8  | [CU08](...) | ... | CU07       | ⬜ Pendiente |
| 9  | [CU14](...) | ... | CU01       | ⬜ Pendiente |
```

> Note: Row `#8` keeps its CU08 identifier — only the `#` ordinal changes (8→7, 9→8, etc.).

### Step 6 — Handle indirect mentions (optional cleanup)

If indirect mentions were found in Step 2 (Case C), list them again in the confirmation report so the developer knows which files may need manual cleanup.

### Step 7 — Confirm

Report to the user:
- File deleted: `docs/use-cases/CUxx-<title>.md`
- ROADMAP.md: row removed, subsequent rows renumbered.
- If dependents existed and the user proceeded anyway: remind them to update the dependent CUs' `Dependencias:` lines.
- If indirect mentions exist: list files that may reference the deleted CU.

## Rules

- **Never delete without explicit approval.** Always pause at Step 3.
- **Never auto-delete dependent CUs** — only the target CU is deleted. Dependents must be handled manually by the developer.
- If the target CU file does not exist, inform the user and abort:
  > ❌ No se encontró el archivo para CUxx. Verifica el número e intenta de nuevo.
- If the CU is currently `🔄 En progreso` in ROADMAP.md, add an extra warning line in the prompt:
  > ⚠️ Este CU está marcado como **En progreso** en el roadmap.
- Never modify the dependency references of other CU files automatically — leave that to the developer.
