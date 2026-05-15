# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm start            # Start production server
npm run db:push      # Push Prisma schema to SQLite (creates prisma/dev.db)
npm run db:seed      # Seed demo data (admin@shelf.io, seller@shelf.io, buyer@shelf.io — all use password "admin123")
npm run db:studio    # Open Prisma Studio GUI for DB inspection
npx tsc --noEmit     # TypeScript type check
npm test             # Run tests (vitest, 52 tests across 5 suites)
npm run test:watch   # Run tests in watch mode
```

Project is ESM (`"type": "module"` in package.json). Config files use ESM syntax (`export default`).

CI runs on every push/PR: TypeScript check, tests, build, and Prisma schema validation (.github/workflows/ci.yml).

### Tests

Tests are in `src/lib/__tests__/` — vitest with `environment: "node"` and `globals: true`. Five suites:
- `api-handler.test.ts` — withErrorHandler error mapping, validateBody, response helpers
- `auth-helpers.test.ts` — AuthError class
- `schemas.test.ts` — All Zod validation schemas
- `orders-logic.test.ts` — Payout calculation, sellerMap, wallet credit direction
- `rate-limiter.test.ts` — Rate limit allowance, blocking, key independence

## Architecture

This is a **Next.js 14 App Router** SaaS marketplace for digital products (Shelf). SQLite for dev, PostgreSQL-ready via Prisma.

### Request flow in API routes

Every API route follows the same three-layer pattern, with rate limiting enforced globally:

1. **Rate limit** — Per-IP+path sliding window (60 req/min default) via `src/lib/rate-limiter.ts`. Returns 429 with `Retry-After` header when exceeded.
2. **Auth guard** — `requireAuth()` or `requireAdmin()` from `src/lib/auth-helpers.ts`. These throw `AuthError` (caught by `withErrorHandler`) when the JWT session is missing or has insufficient role. For endpoints with mixed public/auth access, use `getSessionUser()` and check the result.
3. **Validation** — `validateBody(schema, await req.json())` from `src/lib/api-handler.ts` validates against a Zod schema from `src/lib/schemas.ts`. Throws `ZodError` on failure (also caught). ALL POST/DELETE handlers must validate input.
4. **Handler logic** — Prisma queries wrapped in `withErrorHandler`, which converts `AuthError` → 401/403, `ZodError` → 400, and uncaught errors → 500.

Route files export `GET`/`POST`/`DELETE` named functions and must include `export const dynamic = "force-dynamic"`. The second argument type is `RouteContext = { params: Record<string, string> }`. For example pattern, see `src/app/api/products/route.ts`.

### API route conventions

- Always add a Zod schema in `src/lib/schemas.ts` for any new POST body shape
- Use `Prisma.ModelWhereInput` types (e.g. `Prisma.ProductWhereInput`) for dynamic Prisma query filters — never `where: any`
- Use `prisma.$transaction([...])` for batch updates, not for-loops with individual awaits
- Credit **sellers** (not buyers) for purchases; platform fee is `PLATFORM_FEE_RATE` env var (default 10%)
- `NEXTAUTH_SECRET` must be set in production — no hardcoded fallback
- API keys are stored as SHA-256 hashes; raw key is returned only on creation, subsequent GETs show masked keys
- Stripe checkout creates the order first (status: "pending"), then redirects to Stripe. Webhook updates order to "paid" on `checkout.session.completed` and "cancelled" on `checkout.session.expired`
- Email campaigns are queued in the `EmailLog` table; integrate with an email provider (Resend/SendGrid) by updating the POST handler
- Search page uses 300ms debounce on query input to reduce API load
- Activity feed supports pagination via `?page=N&limit=N`

### Auth

NextAuth v4 with JWT session strategy. Two providers: credentials (email/password via bcrypt) and Google OAuth. Session shape is extended in `src/types/next-auth.d.ts` to include `user.id` and `user.role`. The `getSessionUser()` helper returns a `SessionUser` or `null` — use this for optional-auth endpoints; use `requireAuth()`/`requireAdmin()` for protected ones.

### State management

- **Zustand** for client state (carts, UI state)
- **NextAuth SessionProvider** wrapping the entire app in `src/components/Providers.tsx` for auth state (via `useSession()`)
- **ThemeProvider** (React context, `src/components/ThemeProvider.tsx`) for dark mode — toggles `dark` class on `<html>`, persisted in localStorage

### Path alias

`@/*` maps to `./src/*` (configured in `tsconfig.json`).

### Database

Prisma with SQLite. Schema at `prisma/schema.prisma`. Key models: User, Product, Order/OrderItem, Review, FlashDeal, Bundle, Notification, Discussion/Reply (threaded), LicenseKey, Storefront, TeamMember, ConversionEvent, ApiKey, WebhookEndpoint, SubscriptionPlan/UserSubscription, ABTest/ABTestVariant, CustomerSegment, CustomerNote, EmailLog.

### Styling

Tailwind CSS with a custom `brand` color palette (`brand-50` through `brand-900`). Dark mode uses the `class` strategy — ALL page content must have `dark:` variants:
- `bg-white` → `dark:bg-gray-800`, `bg-gray-50` → `dark:bg-gray-900`
- `text-gray-900` → `dark:text-gray-100`, `text-gray-600` → `dark:text-gray-400`
- `border-gray-200` → `dark:border-gray-700`
- Success/error banners: `bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300`
- Use `motion-reduce:animate-none` on all `animate-pulse` and `animate-spin` elements

The `cn()` utility in `src/lib/utils.ts` combines `clsx` + `tailwind-merge`.

### Frontend conventions

- Fetch calls must check `res.ok` and have a `.catch()` handler — set an error state and show inline banners (never use `alert()`)
- Interactive elements (clickable divs/spans) need `role="button"`, `tabIndex={0}`, `onKeyDown` handler, and `aria-label`
- Icon-only buttons/links need `aria-label`
- `<html lang="en">` — content is English
- Product detail and creator profile pages have dynamic metadata via `layout.tsx` (`generateMetadata`)

### Key dependencies

- `next-auth` v4 (not v5/Auth.js) — imports from `next-auth` and `next-auth/react`, not `@auth/*`
- `stripe` v15 — two API routes: checkout session creation (`/api/stripe/checkout`) and webhook handler (`/api/stripe/webhook`)
- `recharts` + `chart.js`/`react-chartjs-2` — both charting libraries are in use; prefer the one already used in the page being edited
- Radix UI primitives (`@radix-ui/react-dialog`, `dropdown-menu`, `tabs`, `toast`)
- No animation library included — use CSS transitions or raw Tailwind
