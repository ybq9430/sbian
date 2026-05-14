# Shelf — Digital Product Marketplace

All-in-one SaaS platform for creating, marketing, and selling digital products. Built with Next.js 14, TypeScript, Prisma, and Tailwind CSS.

## Features

### Marketplace
- Product listing with search, filters, and categories
- Product detail pages with reviews and recommendations
- Shopping cart and Stripe checkout
- Digital file delivery after purchase
- Flash deals with countdown timers
- Product bundles at discounted prices

### AI Studio
- AI-powered product description generator
- Smart pricing recommendations
- Title alternatives and tag suggestions
- Optimization tips for higher conversions

### Social & Community
- Creator profiles with follow/unfollow
- Per-product community discussion forums
- Nested replies and threaded conversations
- Activity feed showing purchases, launches, and reviews
- Leaderboard ranking by revenue

### Seller Tools
- Product management dashboard
- Email marketing campaigns to customers
- License key generation and management
- A/B testing for product pages (titles, descriptions, pricing)
- Conversion funnel analytics
- Customer CRM with notes and segments
- White-label storefront builder with themes
- Product boosting (paid promotion)
- Team collaboration (invite editors/admins)
- CSV data export (orders, customers, products)

### Monetization
- Tiered subscription plans (Free / Pro ¥99/mo / Enterprise ¥499/mo)
- Transaction fees (10% / 5% / 2%)
- Product boosting (¥29 for 7 days)
- Affiliate marketing with custom referral codes
- Wallet system with balance tracking

### Developer Platform
- API key management (read/write/admin scopes)
- Webhook endpoints with signing secrets
- API documentation and rate limiting
- Delivery logs for debugging

### Gamification
- XP and leveling system
- 8 achievement badges (First Sale, Rising Star, Best Seller, Millionaire, etc.)
- Experience point rewards for platform actions

### Platform
- Admin panel for user/product/order management
- Google OAuth + email/password authentication
- Dark mode toggle with localStorage persistence
- Real-time notification system
- Responsive design (mobile + desktop)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | SQLite (dev) / PostgreSQL-ready (Prisma) |
| ORM | Prisma |
| Auth | NextAuth.js (JWT + Google OAuth) |
| Styling | Tailwind CSS + Dark Mode |
| Validation | Zod |
| Payments | Stripe |
| Charts | Recharts |
| State | Zustand |

## Getting Started

```bash
# Install dependencies
npm install

# Initialize database
npx prisma db push

# Seed demo data
npx tsx prisma/seed.ts

# Start dev server
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

Create `.env` file:

```env
NEXTAUTH_SECRET=<random-64-char-string>
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL="file:./prisma/dev.db"
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
```

## Project Structure

```
src/
├── app/                    # Next.js App Router (50 routes)
│   ├── api/                # 33 API endpoints
│   │   ├── ai/             # AI description generator
│   │   ├── analytics/      # Analytics + conversion funnel
│   │   ├── auth/           # Authentication (NextAuth + register)
│   │   ├── api-keys/       # Developer API keys
│   │   ├── webhooks/       # Webhook endpoint management
│   │   └── ...             # 25+ more endpoints
│   ├── [33 pages]          # All application pages
│   ├── loading.tsx         # Global loading state
│   └── error.tsx           # Global error boundary
├── components/             # Reusable UI components
│   ├── Navbar.tsx          # Navigation with dark mode + notifications
│   ├── Chart.tsx           # Revenue charts
│   ├── Recommendations.tsx # AI recommendation widget
│   ├── ThemeProvider.tsx   # Dark mode context
│   └── Footer.tsx          # Site footer
├── lib/                    # Core utilities
│   ├── api-handler.ts      # Error handling wrapper + HTTP helpers
│   ├── auth-helpers.ts     # Type-safe auth (requireAuth, requireAdmin)
│   ├── schemas.ts          # 18 Zod validation schemas
│   ├── auth.ts             # NextAuth configuration
│   ├── prisma.ts           # Prisma client
│   ├── stripe.ts           # Stripe client
│   └── utils.ts            # Formatting utilities
└── types/                  # TypeScript declarations
    └── next-auth.d.ts      # Extended session types
```

## API Endpoints

| Endpoint | Methods | Auth | Validation |
|---|---|---|---|
| `/api/auth/register` | POST | Public | Zod |
| `/api/auth/[...nextauth]` | GET/POST | Public | — |
| `/api/products` | GET/POST | GET: Public, POST: Auth | Zod |
| `/api/products/[id]` | GET | Public | — |
| `/api/products/boost` | POST | Auth | Zod |
| `/api/orders` | GET/POST | Auth | Zod |
| `/api/analytics` | GET | Auth | — |
| `/api/analytics/conversion` | GET/POST | Mixed | Zod |
| `/api/ai/describe` | POST | Auth | Zod |
| `/api/recommendations` | GET | Mixed | — |
| `/api/discussions` | GET/POST | GET: Public, POST: Auth | Zod |
| `/api/discussions/[id]/reply` | POST | Auth | Zod |
| `/api/flash-deals` | GET | Public | — |
| `/api/bundles` | GET/POST | GET: Public, POST: Auth | — |
| `/api/search` | GET | Public | — |
| `/api/follow` | GET/POST | POST: Auth | Zod |
| `/api/gamification` | GET/POST | Auth | Zod |
| `/api/notifications` | GET/POST | Auth | — |
| `/api/licenses` | GET/POST | Auth | Zod |
| `/api/storefront` | GET/POST | POST: Auth | Zod |
| `/api/team` | GET/POST/DELETE | Auth | Zod |
| `/api/subscriptions` | GET/POST | Auth | Zod |
| `/api/ab-tests` | GET/POST | Auth | Zod |
| `/api/crm` | GET/POST | Auth | Zod |
| `/api/api-keys` | GET/POST/DELETE | Auth | Zod |
| `/api/webhooks` | GET/POST/DELETE | Auth | Zod |
| `/api/admin` | GET | Admin | — |
| `/api/affiliate` | GET | Auth | — |
| `/api/email` | GET/POST | Auth | Zod |
| `/api/activity` | GET | Public | — |
| `/api/export` | GET | Auth | — |
| `/api/stripe/checkout` | POST | Auth | — |
| `/api/stripe/webhook` | POST | Public | — |

## Scripts

```bash
npm run dev        # Development server
npm run build      # Production build
npm start          # Start production server
npm run db:push    # Sync Prisma schema to database
npm run db:seed    # Seed demo data
npm run db:studio  # Open Prisma Studio
```

## Production Notes

- Replace SQLite with PostgreSQL for production. Update `DATABASE_URL` in `.env` and change the Prisma provider.
- Set production `NEXTAUTH_SECRET`, Stripe keys, and Google OAuth credentials.
- Add rate limiting for API endpoints.
- Set up monitoring and error tracking (Sentry, etc.).
- Add unit and integration tests before deploying to production.

## License

MIT
