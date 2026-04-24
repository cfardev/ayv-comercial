# ayv-comercial — guía para agentes

Monorepo con **Turborepo** y **pnpm**: backoffice para una distribuidora de **electrodomésticos** y productos para el hogar.

## Stack

| Área | Elección |
|------|----------|
| Monorepo / tareas | Turborepo |
| Paquetes | pnpm (workspaces) |
| Frontend | `apps/client`: React 19 + Vite + **TypeScript** (detalle abajo) |
| Backend | `apps/api`: NestJS + Express + Prisma + **TypeScript** (detalle abajo) |
| Base de datos | PostgreSQL |
| ORM | Prisma |
| Validación (cliente) | **Zod** |
| Validación (API) | **class-validator** + **class-transformer** + **`ValidationPipe`** de Nest (DTOs con decoradores) |
| Autenticación | JWT |
| Lint / formato | Biome (una sola config en la raíz del repo) |

### Frontend (`apps/client`)

| Pieza | Tecnología |
|-------|------------|
| Bundler / dev server | **Vite** (`@vitejs/plugin-react`) |
| UI | **shadcn/ui** (CLI `shadcn`, estilo Radix Vega en `components.json`) |
| Primitivos accesibles | **Radix UI** (`radix-ui`) |
| Iconos | **Tabler** (`@tabler/icons-react`) |
| Estilos | **Tailwind CSS 4** (`tailwindcss`, `@tailwindcss/vite`), **tw-animate-css** |
| Tema claro/oscuro | **next-themes** (atributo `class` + `.dark` en `index.css`) |
| Routing | **react-router-dom** |
| Esquemas / validación (formularios, etc.) | **Zod** |
| Utilidades CSS / variantes | `class-variance-authority`, `clsx`, `tailwind-merge` |
| Tipografía | Figtree Variable (`@fontsource-variable/figtree`) |

### Backend (`apps/api`)

| Pieza | Tecnología |
|-------|------------|
| Runtime | **Node.js** (módulos **ESM**: `type: "module"` en `package.json`) |
| Framework | **NestJS** 11 (`@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`) |
| HTTP | **Express** (stack por defecto de Nest vía `platform-express`) |
| Configuración | **@nestjs/config**, **dotenv** |
| Archivos estáticos / SPA | **@nestjs/serve-static** (alinear con el build de `apps/client` en prod) |
| PostgreSQL | Driver **`pg`** (node-postgres) |
| ORM | **Prisma 7** (`@prisma/client`, adaptador **`@prisma/adapter-pg`**, CLI `prisma` en dev) |
| Validación (entrada HTTP) | **class-validator** + **class-transformer**; **`ValidationPipe`** global o por ruta sobre DTOs |
| Reactividad / DI (Nest) | **RxJS**, **reflect-metadata** |

## Convenciones (obligatorias para cambios)

- **Turborepo**: pipelines, caché y dependencias entre apps/paquetes vía `turbo.json` y `package.json` de cada workspace; preferir `pnpm turbo` / filtros (`--filter`) según corresponda.
- **Variables de entorno**: un único `.env` compartido a nivel de raíz del monorepo (o documentar en `.env.example` qué claves usa cada app). No duplicar secretos por paquete salvo que el stack lo exija explícitamente.
- **Skills del proyecto**: viven en `.agents/skills/` (compartidas; no duplicar lógica en copias locales fuera del repo).
- **Lenguaje**: usar **TypeScript** tanto en `apps/client` como en `apps/api`; evitar JavaScript sin tipado salvo scripts puntuales.
- **Código**: respetar Biome; no introducir ESLint/Prettier paralelos salvo decisión explícita del equipo.
- **Idioma del código**: TODO el código, nombres de variables, funciones, modelos, campos, mensajes de error, comentarios y configuraciones deben estar en **inglés**. Las únicas excepciones son textos hardcoded que se muestran directamente al usuario final (labels UI, mensajes de validación, etc.) — estos pueden estar en español si el proyecto lo requiere.
- **Prisma schema**: usar `camelCase` en los modelos y campos del schema (API TypeScript); usar `@map` a nivel de cada campo y `@@map` en el modelo para mapear a `lower_snake_case` en PostgreSQL. Todo modelo debe tener su `@@map` explícito.

## Conventional commits

Mensajes de commit en inglés, imperativo, una idea por commit:

`type(optional-scope): short description`

- **type** (comunes): `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `build`, `ci`, `chore`.
- **scope**: opcional; en este monorepo conviene el workspace afectado (`api`, `web`, nombre del paquete, etc.) cuando ayude a filtrar historial.
- **description**: corta (~50 caracteres), sin punto final; cuerpo opcional para el “por qué” o detalles.
- **Cambios incompatibles**: `feat(api)!: ...` o pie `BREAKING CHANGE:` en el cuerpo del mensaje.

Ejemplos: `feat(web): add product filters`, `fix(api): validate JWT expiry`, `chore: bump turbo`.

## Versionado del proyecto

- **SemVer** (`MAJOR.MINOR.PATCH`) para lo que se publique o etiquete como release del producto (imagen Docker, artefacto desplegable, tag `v*.*.*` en git).
- **Versión canónica del monorepo**: el campo `version` del `package.json` en la **raíz** (`ayv-comercial`). Es la referencia para comunicar “qué versión del sistema” se despliega; alinearla con tags y notas de release cuando existan.
- **Sin automatización de release**: este repo no usa **semantic-release**, ni scripts, ni workflows automáticos para versionar/publicar.
- **Responsabilidad del agente**: cuando se pida versionar o preparar un release, el agente debe encargarse del proceso manual completo: calcular el bump (según Conventional Commits o instrucción explícita), actualizar la `version` en `package.json` raíz y en `apps/api/package.json` + `apps/client/package.json`, y actualizar `CHANGELOG.md` si aplica.
- **Workspaces**: `apps/api` y `apps/client` deben mantener la **misma** `version` que la raíz en cada release; no editar versiones de forma aislada salvo excepción documentada.
- **Ejecución controlada**: no crear tags remotos ni hacer push de release sin solicitud explícita del usuario.
- **Cambios incompatibles**: reflejarlos en el mensaje de commit (`!` o `BREAKING CHANGE:`) para que el próximo release suba **MAJOR**.
- **Dependencias**: bumps de librerías no cuentan como “feature” del producto; usar `chore`/`build`/`ci` para que no inflen la versión de usuario salvo que el equipo decida contarlos (por defecto no disparan release relevante).
- **CI/CD**: nombrar artefactos o imágenes con la versión del tag o del `package.json` raíz definido para el release en curso.

## Desarrollo vs producción

| Modo | Objetivo |
|------|----------|
| **Dev** | Levantar **NestJS** y el cliente **Vite** (`apps/client`) en paralelo (hot reload en cada capa). |
| **Prod** | Build estático del frontend (`vite build`); **NestJS** sirve los assets del build (SPA/API bajo el mismo origen según diseño). |

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
