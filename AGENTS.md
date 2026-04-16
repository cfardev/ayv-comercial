# ayv-comercial — guía para agentes

Monorepo con **Turborepo** y **pnpm**: backoffice para una distribuidora de **electrodomésticos** y productos para el hogar.

## Stack

| Área | Elección |
|------|----------|
| Monorepo / tareas | Turborepo |
| Paquetes | pnpm (workspaces) |
| Frontend | React |
| Backend | Node.js + NestJS |
| Base de datos | PostgreSQL |
| ORM | Prisma |
| Autenticación | JWT |
| Lint / formato | Biome (una sola config en la raíz del repo) |

## Convenciones (obligatorias para cambios)

- **Turborepo**: pipelines, caché y dependencias entre apps/paquetes vía `turbo.json` y `package.json` de cada workspace; preferir `pnpm turbo` / filtros (`--filter`) según corresponda.
- **Variables de entorno**: un único `.env` compartido a nivel de raíz del monorepo (o documentar en `.env.example` qué claves usa cada app). No duplicar secretos por paquete salvo que el stack lo exija explícitamente.
- **Skills del proyecto**: viven en `.agents/skills/` (compartidas; no duplicar lógica en copias locales fuera del repo).
- **Código**: respetar Biome; no introducir ESLint/Prettier paralelos salvo decisión explícita del equipo.

## Conventional commits

Mensajes de commit en inglés, imperativo, una idea por commit:

`type(optional-scope): short description`

- **type** (comunes): `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.
- **scope**: opcional; en este monorepo conviene el workspace afectado (`api`, `web`, nombre del paquete, etc.) cuando ayude a filtrar historial.
- **description**: corta (~50 caracteres), sin punto final; cuerpo opcional para el “por qué” o detalles.
- **Cambios incompatibles**: `feat(api)!: ...` o pie `BREAKING CHANGE:` en el cuerpo del mensaje.

Ejemplos: `feat(web): add product filters`, `fix(api): validate JWT expiry`, `chore: bump turbo`.

## Desarrollo vs producción

| Modo | Objetivo |
|------|----------|
| **Dev** | Levantar **NestJS** y la app **React** en paralelo (hot reload en cada capa). |
| **Prod** | Build estático del frontend React; **NestJS** sirve los assets del build (SPA/API bajo el mismo origen según diseño). |

Al implementar scripts, alinear `package.json` raíz y workspaces para que `pnpm` + Turborepo reflejen esta separación (por ejemplo `dev` que orqueste ambos, `build` que compile frontend y empaquete lo que Nest sirve).

## PostgreSQL local (Docker)

Opcional: **Docker** con **Compose v2** (`docker compose`) para una instancia de desarrollo sin instalar PostgreSQL en el host.

| Acción | Comando |
|--------|---------|
| Levantar en segundo plano | `docker compose up -d` |
| Parar (conserva datos en volumen) | `docker compose down` |
| Parar y borrar el volumen de datos | `docker compose down -v` |

- **Compose** lee un `.env` en la raíz del repo (mismo archivo que usa el monorepo) para `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_DB`. Valores por defecto si no están definidos: usuario `ayv`, contraseña `ayv`, base `ayv` (ver `.env.example`).
- **`DATABASE_URL`** en el `.env` raíz debe usar las mismas credenciales y host `localhost`, puerto `5432` (ejemplo en `.env.example`). No commitear secretos reales; solo valores de desarrollo en el ejemplo.

## Qué priorizar en PRs / revisiones

- Cambios acotados al workspace afectado; evitar refactors masivos no pedidos.
- Migraciones Prisma coherentes con el modelo acordado; no exponer secretos en el cliente.
- JWT: tiempos de expiración, almacenamiento seguro en cliente y validación en guards Nest según el patrón del repo.
