# ayv-comercial

Monorepo (**Turborepo** + **pnpm**) con backoffice en React y API en NestJS para una distribuidora de electrodomésticos y productos para el hogar. Convenciones del repo: [AGENTS.md](AGENTS.md).

## Requisitos

- **Node.js** compatible con el proyecto y **pnpm** (versión en [`package.json`](package.json): `packageManager`).
- **Docker** + **Docker Compose v2** si quieres PostgreSQL local vía compose (opcional si ya tienes Postgres instalado).

## PostgreSQL con Docker Compose

En la raíz del repo:

```bash
docker compose up -d
```

Con los valores por defecto del compose y de [`.env.example`](.env.example), la URL de conexión es:

`postgresql://ayv:ayv@localhost:5432/ayv`

Copia `.env.example` a `.env` y ajusta `POSTGRES_*` y `DATABASE_URL` si cambias usuario, contraseña o nombre de base. Para borrar datos locales: `docker compose down -v`.

## Desarrollo

```bash
pnpm install
pnpm dev
```

`pnpm dev` ejecuta las tareas `dev` de los workspaces vía Turborepo (API + client en paralelo).
