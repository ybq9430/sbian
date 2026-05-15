# Shelf — Digital Product Marketplace

All-in-one SaaS platform for creating, marketing, and selling digital products. Built with Next.js 14, TypeScript, Prisma, and Tailwind CSS.

## Features

### Marketplace
- Product listing with search (300ms debounce), filters, and category facets
- Product detail pages with reviews, recommendations, and dynamic SEO metadata
- Shopping cart and Stripe checkout with full payment lifecycle
- Digital file delivery after purchase
- Flash deals with countdown timers and live polling
- Product bundles at discounted prices

### AI Studio
- AI-powered product description generator
- Smart pricing recommendations
- Title alternatives and tag suggestions
- Optimization tips for higher conversions

### Social & Community
- Creator profiles with follow/unfollow and dynamic metadata
- Per-product community discussion forums with nested threaded replies
- Activity feed with paginated, chronologically sorted events
- Leaderboard ranking by revenue (client-side aggregated)

### Seller Tools
- Product management dashboard with typed analytics
- Email marketing campaigns (queued in EmailLog, ready for provider integration)
- License key generation and management (transaction-safe)
- A/B testing for product pages (titles, descriptions, pricing)
- Conversion funnel analytics with event tracking
- Customer CRM with notes and segments
- White-label storefront builder with themes
- Product boosting (configurable fee via BOOST_FEE env var)
- Team collaboration (invite editors/admins)
- CSV data export (orders, customers, products)

### Monetization
- Tiered subscription plans (Free / Pro ¥99/mo / Enterprise ¥499/mo)
- Configurable transaction fees (PLATFORM_FEE_RATE env var, default 10%)
- Product boosting (¥29 for 7 days, configurable)
- Affiliate marketing with custom referral codes
- Wallet system with balance tracking (sellers credited on purchase)

### Developer Platform
- API key management with SHA-256 hashed storage (raw key shown only on creation)
- Webhook endpoints with signing secrets
- API documentation and global rate limiting (60 req/min per IP+path)
- Delivery logs for debugging

### Gamification
- XP and leveling system with validated action types
- 8 achievement badges (First Sale, Rising Star, Best Seller, Millionaire, etc.)
- Experience point rewards for platform actions

### Platform
- Admin panel for user/product/order management
- Google OAuth + email/password authentication (NextAuth v4, JWT sessions)
- Dark mode toggle with localStorage persistence (full coverage on all 33 pages)
- Real-time notification polling (30s interval)
- Custom 404 page
- Responsive design (mobile + desktop)
- Keyboard-accessible interactive elements
- prefers-reduced-motion support

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, ESM) |
| Language | TypeScript (strict, zero `any` types) |
| Database | SQLite (dev) / PostgreSQL-ready (Prisma) |
| ORM | Prisma with typed query builders |
| Auth | NextAuth.js v4 (JWT + Google OAuth) |
| Styling | Tailwind CSS + Dark Mode (class strategy) |
| Validation | Zod (14 schemas, all POST/DELETE covered) |
| Payments | Stripe (checkout + webhook lifecycle) |
| Charts | Recharts + Chart.js |
| State | Zustand + NextAuth SessionProvider |
| Testing | Vitest (5 suites, 52 tests) |
| CI | GitHub Actions (tsc + test + build + Prisma validate) |
| Rate Limiting | In-memory sliding window (src/lib/rate-limiter.ts) |

## Getting Started

```bash
npm install
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@shelf.io | admin123 |
| Seller | seller@shelf.io | admin123 |
| Buyer | buyer@shelf.io | admin123 |

### Environment Variables

```env
NEXTAUTH_SECRET=<random-64-char-string>    # Required in production
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL="file:./prisma/dev.db"
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
PLATFORM_FEE_RATE=0.1                       # Optional, default 0.1 (10%)
BOOST_FEE=29                                 # Optional, default 29 (CNY)
```

## Project Structure

```
src/
├── app/                       # Next.js App Router (35 routes)
│   ├── api/                   # 33 API endpoints
│   │   ├── ai/describe/       # AI description generator
│   │   ├── analytics/         # Analytics + conversion funnel
│   │   ├── auth/              # Authentication (NextAuth + register)
│   │   ├── api-keys/          # Developer API keys (SHA-256 hashed)
│   │   ├── webhooks/          # Webhook endpoint management
│   │   ├── stripe/            # Checkout + webhook handler
│   │   ├── email/             # Email campaign queue (EmailLog)
│   │   └── ...                # 25+ more endpoints
│   ├── [33 pages]             # All application pages (dark mode, typed)
│   ├── loading.tsx            # Global loading spinner
│   ├── error.tsx              # Global error boundary
│   └── not-found.tsx          # Custom 404 page
├── components/                # Reusable UI components (fully typed)
│   ├── Navbar.tsx             # Navigation (keyboard accessible, Escape/outside-click close)
│   ├── Chart.tsx              # Revenue charts (useMemo optimized)
│   ├── Recommendations.tsx    # AI recommendation widget (typed)
│   ├── ThemeProvider.tsx      # Dark mode context (localStorage)
│   ├── Providers.tsx          # NextAuth SessionProvider wrapper
│   └── Footer.tsx             # Site footer (proper link elements)
├── lib/                       # Core utilities
│   ├── api-handler.ts         # withErrorHandler + rate limiting + response helpers
│   ├── auth-helpers.ts        # Type-safe auth (requireAuth, requireAdmin, getSessionUser)
│   ├── rate-limiter.ts        # Sliding window rate limiter (IP+path)
│   ├── use-auth.ts            # Typed useAuth() hook (replaces (session.user as any))
│   ├── schemas.ts             # 18 Zod validation schemas
│   ├── auth.ts                # NextAuth configuration
│   ├── prisma.ts              # Prisma client singleton
│   ├── stripe.ts              # Stripe client
│   ├── utils.ts               # cn(), formatCurrency, formatNumber, formatDate, generateSlug
│   └── __tests__/             # 5 test suites, 52 tests
├── types/                     # TypeScript declarations
│   ├── next-auth.d.ts         # Extended session/JWT types
│   └── api.ts                 # 23 shared API response interfaces + errorMessage helper
```

## Scripts

```bash
npm run dev          # Development server (localhost:3000)
npm run build        # Production build
npm start            # Start production server
npm run db:push      # Sync Prisma schema to database
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio GUI
npm test             # Run vitest (5 suites, 52 tests)
npm run test:watch   # Run tests in watch mode
npx tsc --noEmit     # TypeScript type check
```

## Architecture

### API Route Pattern

Every API route follows a 4-layer pattern enforced by `withErrorHandler`:

1. **Rate limit** — Per-IP+path sliding window (60 req/min), 429 on exceed
2. **Auth guard** — `requireAuth()` or `requireAdmin()` (or `getSessionUser()` for optional auth)
3. **Validation** — `validateBody(zodSchema, await req.json())` on all POST/DELETE
4. **Handler** — Prisma queries with typed where inputs (`Prisma.ProductWhereInput`, never `any`)

### Key Design Decisions

- ESM throughout (`"type": "module"` in package.json)
- Prisma types used for all dynamic query filters
- `$transaction()` for batch operations (no N+1 loops)
- SHA-256 hashed API keys, masked on GET
- Stripe orders created before session (webhook-ready metadata)
- Email campaigns stored in EmailLog queue (provider-agnostic)
- Inline toast messages replace browser `alert()` throughout
- 300ms debounce on search input
- Activity feed supports `?page=N&limit=N` pagination

## Production Notes

- Replace SQLite with PostgreSQL for production (update DATABASE_URL and Prisma provider)
- Set NEXTAUTH_SECRET (required — no fallback in production)
- Configure Stripe webhook endpoint to point to /api/stripe/webhook
- Integrate email provider (Resend/SendGrid) in the email POST handler
- Set up monitoring and error tracking (Sentry, etc.)

## License

MIT
