# Client App — Agent Guide

> See [root AGENTS.md](../../AGENTS.md) for monorepo-wide rules.

## Stack

| Piece | Technology |
|-------|------------|
| Framework | React 19 + Vite + TypeScript |
| Routing | react-router-dom |
| Forms | react-hook-form + Zod |
| UI | shadcn/ui (Radix primitives) |
| Icons | @tabler/icons-react |
| State | Zustand (global), React state (local) |
| Styles | Tailwind CSS 4, tw-animate-css |
| Theme | next-themes (class + .dark) |
| Fonts | Figtree Variable |

## SCREAM Architecture

Organize code by **feature/module** folders. Each module is self-contained:

```
src/
├── modules/
│   ├── products/
│   │   ├── components/       # Product-specific components
│   │   ├── hooks/            # Product-specific hooks
│   │   ├── stores/           # Zustand store for this module
│   │   ├── types/            # Zod schemas, TypeScript types
│   │   ├── utils/            # Helpers exclusive to this module
│   │   └── index.ts          # Public exports
│   ├── orders/
│   │   └── ...
│   └── users/
│       └── ...
├── shared/
│   ├── components/           # Reusable UI components (shadcn)
│   ├── hooks/                # Shared hooks
│   ├── lib/                  # Utilities (cn, formatDate, etc.)
│   └── types/                # Shared types/schemas
└── routes/                   # Route definitions
```

### Rules

- **Co-location**: Keep related code together (components with their hooks, types with their schemas)
- **Barrel exports**: Each module has `index.ts` for public API
- **No flat structures**: Never put all components in a single `components/` folder — organize by domain
- **Zustand stores**: One store per module in `stores/`, named `{module}Store.ts`
- **Zod schemas**: Co-located with types in `types/` as `schema.ts` files
- **react-hook-form**: Use with Zod resolver, schema per form

## Tech Usage

### Zod
- Define schemas in `types/schema.ts` per module
- Use for: form validation, API response validation, env validation

### react-hook-form
- Controller components wrap shadcn inputs
- Schema from Zod passed to `useForm` via `zodResolver`

### Zustand
- Global state in `stores/`
- Use `immer` middleware for complex updates
- Co-located with module it manages

### shadcn/ui
- Add components via CLI: `npx shadcn@latest add [component]`
- Customize via `components.json` preset
- Place in `shared/components/ui/`

## Routing

- `routes/` holds route definitions
- Use `react-router-dom` v7 patterns
- Lazy load route modules with `React.lazy` + `Suspense`