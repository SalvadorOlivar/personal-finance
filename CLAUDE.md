# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:3000
npm run build     # Production build
npm run lint      # ESLint
npm run seed      # Seed DB with demo data (12 categories + 30 transactions)
```

No test suite is configured.

After schema changes, regenerate the Prisma client:
```bash
npx prisma generate
npx prisma db push   # Apply migrations to dev.db
```

## Architecture

**Stack:** Next.js 16 App Router · TypeScript · Tailwind CSS 4 · Prisma 7 + SQLite (via libsql) · Recharts · Lucide React

All pages are `"use client"` components that fetch data from API routes on mount. There is no server-side rendering for page content — state is managed locally with `useState`/`useEffect` + `fetch`.

### Key paths

| Path | Purpose |
|------|---------|
| `lib/prisma.ts` | Prisma singleton using `PrismaLibSql` adapter |
| `app/generated/prisma/client.ts` | Generated Prisma client (import from here, not from `@/app/generated/prisma`) |
| `prisma/schema.prisma` | DB schema |
| `prisma/seed.ts` | Demo data seed |
| `components/` | Sidebar, StatCard, TransactionForm, SavingsGoalForm, SavingsDepositForm |

### Pages & their API routes

| Page | Route | APIs used |
|------|-------|-----------|
| `/` Dashboard | `app/page.tsx` | `/api/transactions`, `/api/analytics` |
| `/transacciones` | `app/transacciones/page.tsx` | `/api/transactions`, `/api/categories` |
| `/analytics` | `app/analytics/page.tsx` | `/api/analytics` |
| `/categorias` | `app/categorias/page.tsx` | `/api/categories` |
| `/ahorro` | `app/ahorro/page.tsx` | `/api/savings/goals`, `/api/savings/transactions` |
| `/pendientes` | `app/pendientes/page.tsx` | `/api/pending` |

### API routes

- `GET/POST /api/transactions` — supports `?month=&year=&type=` filters
- `PUT/DELETE /api/transactions/[id]`
- `GET /api/analytics?months=N` — monthly trend, category breakdown, current-month KPIs
- `GET/POST /api/categories`
- `GET/POST /api/savings/goals`, `PUT/DELETE /api/savings/goals/[id]`
- `GET/POST /api/savings/transactions`, `DELETE /api/savings/transactions/[id]`
- `GET/POST /api/pending`, `PUT/DELETE /api/pending/[id]`

### DB models

- **Category** — name, icon, color, type (`income` | `expense`)
- **Transaction** — amount, description, date, type, categoryId
- **SavingsGoal** — name, targetAmount, icon, color, completed
- **SavingsTransaction** — amount, date, notes, goalId (optional — can be "general")
- **PendingExpense** — title, amount, notes, priority, completed

### Prisma 7 specifics

Prisma 7 requires a driver adapter — never use bare `new PrismaClient()`:

```ts
import { PrismaLibSql } from "@prisma/adapter-libsql";  // PrismaLibSql, NOT PrismaLibSQL
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
new PrismaClient({ adapter } as never);
```

The SQLite file lives at the project root: `c:\GIT\gastos\dev.db`. The URL must be an absolute path: `file:C:/GIT/gastos/dev.db`. In `lib/prisma.ts` this is built with `path.resolve(process.cwd(), "dev.db")`.
