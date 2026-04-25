# API App — Agent Guide

> See [root AGENTS.md](../../AGENTS.md) for monorepo-wide rules.

## Stack

| Piece | Technology |
|-------|------------|
| Framework | NestJS 11 + Express |
| Runtime | Node.js (ESM) |
| ORM | Prisma 7 + @prisma/adapter-pg |
| Validation | class-validator + class-transformer + ValidationPipe |
| Config | @nestjs/config + dotenv |
| Database | PostgreSQL via pg driver |

## Module Structure

Follow NestJS modular architecture:

```
src/
├── modules/
│   ├── products/
│   │   ├── dto/              # CreateProductDto, UpdateProductDto, etc.
│   │   ├── entities/         # Prisma entity types
│   │   ├── interfaces/      # TypeScript interfaces for this module
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   ├── products.module.ts
│   │   └── index.ts
│   ├── orders/
│   │   └── ...
│   └── users/
│       └── ...
├── common/
│   ├── guards/               # Auth guards
│   ├── decorators/           # Custom decorators
│   ├── filters/              # Exception filters
│   └── interceptors/         # Interceptors
└── app.module.ts
```

## Conventions

- **DTOs**: Use class-validator decorators, exported from `dto/index.ts`
- **Interfaces**: TypeScript interfaces for module-specific types, stored in `interfaces/` folder (e.g., `ProductFilter`, `CreateProductPayload`)
- **Entities**: Co-located in `entities/` folder
- **Services**: Business logic, inject Prisma client
- **Controllers**: HTTP layer, validation via ValidationPipe
- **Modules**: Single responsibility, import required dependencies

## Prisma

- Schema in `prisma/schema.prisma`
- Use `@map` on fields and `@@map` on models for snake_case DB
- Generate client: `pnpm --filter api prisma:generate`
- Migrations: `pnpm --filter api prisma:migrate`