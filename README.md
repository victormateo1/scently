# Scently

Organiza tu colección de perfumes: controla lo que queda en cada frasco, su historial y qué fragancia usar.

## Stack

- TanStack Start (React 19, TypeScript)
- Tailwind CSS 4 + shadcn/ui
- Supabase (Auth, PostgreSQL, Storage)

## Desarrollo

```sh
bun install
cp .env.example .env   # rellena con las claves de tu proyecto Supabase
bun run dev
```

## Variables de entorno

| Variable | Uso |
| --- | --- |
| `VITE_SUPABASE_URL` | URL del proyecto (cliente) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clave publishable (cliente) |
| `SUPABASE_URL` | URL del proyecto (servidor) |
| `SUPABASE_PUBLISHABLE_KEY` | Clave publishable (servidor) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave secret, solo servidor |
| `CRON_SECRET` | Secreto para endpoints de cron |

## Scripts

`dev`, `build`, `preview`, `lint`, `format`, `test`