# Technology Stack — La Pan Comido Quotation System

**Project:** La Pan Comido — Public Site + Admin Panel
**Researched:** 2026-01-30
**Research Mode:** Stack dimension for subsequent milestone

## Executive Summary

This document provides prescriptive stack recommendations for adding a WhatsApp quotation system and admin panel to the existing React/Express codebase. The existing stack is modern and well-suited for the requirements. Key additions: Prisma ORM for type-safe database access, Resend for transactional emails, and performance optimizations targeting Lighthouse 100/100/100/100.

---

## Current Stack (Validated)

| Technology | Version | Status | Notes |
|------------|---------|--------|-------|
| React | 18.3.1 | Keep | Stable, mature ecosystem |
| Vite | 6.0.5 | Upgrade to 7.x | Current: 7.3.1 — significant performance improvements |
| Tailwind CSS | 4.0.1 | Keep | Latest major, CSS-first approach |
| Express | 4.21.2 | Keep | Stable, battle-tested |
| PostgreSQL | Supabase | Keep | Connection pooling via Supavisor |
| Cloudinary | 2.5.1 | Keep | Image hosting working well |

---

## Recommended Stack Additions

### Database Layer (ORM Migration)

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| `prisma` | ^7.3.0 | CLI for migrations, schema management | HIGH |
| `@prisma/client` | ^7.3.0 | Type-safe query builder | HIGH |
| `@prisma/adapter-pg` | ^7.3.0 | PostgreSQL driver adapter for connection pooling | HIGH |
| `pg` | ^8.18.0 | Node PostgreSQL driver | HIGH |

**Rationale:**
- Prisma 7.x (Jan 2026) uses the new ESM-first `prisma-client` generator with improved tree-shaking
- Driver adapters are now the recommended approach (not optional) — enables Supabase connection pooling
- Type safety prevents runtime SQL errors and enables autocomplete in IDE
- Prisma Migrate handles schema versioning with deterministic migrations

**Configuration for Supabase:**
```typescript
// prisma.config.ts
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: env('DIRECT_URL') } // CLI uses direct connection
})
```

```typescript
// src/lib/prisma.ts
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
export const prisma = new PrismaClient({ adapter }) // Runtime uses pooled connection
```

**Environment Variables:**
```bash
# Pooled connection for Prisma Client (runtime)
DATABASE_URL="postgres://postgres.[project]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection for Prisma CLI (migrations)
DIRECT_URL="postgres://postgres.[project]:[password]@db.[project].supabase.co:5432/postgres"
```

**What NOT to use:**
- ~~Drizzle ORM~~ — Lower adoption, less mature migration tooling, Prisma ecosystem is stronger
- ~~TypeORM~~ — Decorator-heavy API, worse TypeScript inference than Prisma
- ~~Raw SQL (current)~~ — No type safety, migration pain, security risks

---

### Email Service (OTP)

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| `resend` | ^6.9.1 | Transactional email API | HIGH |
| `@react-email/components` | ^1.0.6 | Type-safe email templates (optional) | MEDIUM |

**Rationale:**
- Resend is purpose-built for developers, excellent DX
- Simple API: single function call to send email
- High deliverability, handles SPF/DKIM automatically
- Free tier: 3,000 emails/month (sufficient for admin OTP)
- React Email enables JSX templates if needed later

**Basic Usage:**
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'noreply@lapancomido.cl',
  to: adminEmail,
  subject: 'Tu codigo de verificacion',
  html: `<p>Tu codigo OTP es: <strong>${otp}</strong></p>`
})
```

**What NOT to use:**
- ~~SendGrid~~ — More complex setup, overkill for OTP-only use case
- ~~AWS SES~~ — Requires AWS account, complex configuration
- ~~Nodemailer + SMTP~~ — Deliverability issues, needs SMTP server

---

### Multi-Project Architecture

| Technology | Configuration | Purpose | Confidence |
|------------|---------------|---------|------------|
| Vercel Monorepo | Two `vercel.json` files | Separate deployments for public/admin | HIGH |
| Subdomain routing | admin.lapancomido.cl | Isolated admin panel | HIGH |

**Recommended Structure:**
```
lapancomido/
  api/                    # Shared backend (deployed as Vercel Functions)
    package.json
    vercel.json           # API routes for both sites
  public-site/            # lapancomido.cl
    package.json
    vercel.json
  admin/                  # admin.lapancomido.cl
    package.json
    vercel.json
  prisma/                 # Shared schema
    schema.prisma
```

**Vercel Configuration (public-site/vercel.json):**
```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://api.lapancomido.cl/:path*" }
  ]
}
```

**What NOT to use:**
- ~~Single project with route guards~~ — Security risk, larger bundle, no isolation
- ~~Turborepo~~ — Overkill for 2 projects, adds complexity without benefit

---

### Performance Optimization (Lighthouse 100/100/100/100)

| Category | Technology/Technique | Impact | Confidence |
|----------|----------------------|--------|------------|
| Images | Cloudinary transformations, `loading="lazy"` | Performance +20-30 points | HIGH |
| Fonts | `font-display: swap`, preload critical fonts | Performance +5-10 points | HIGH |
| Code Splitting | `React.lazy()` + Suspense | Performance +10-15 points | HIGH |
| Bundle Size | Vite 7 tree-shaking, remove unused deps | Performance +5-10 points | HIGH |
| Compression | Vercel auto-gzip/brotli | Performance +5 points | HIGH |
| CSS | Tailwind CSS 4 (no purge config needed) | Already optimized | HIGH |
| Accessibility | Semantic HTML, ARIA labels, color contrast | Accessibility 100 | HIGH |
| SEO | Meta tags, structured data, sitemap | SEO 100 | HIGH |
| Best Practices | HTTPS (Vercel default), secure headers | Best Practices 100 | HIGH |

**Critical Optimizations:**

1. **LCP (Largest Contentful Paint):**
   ```jsx
   // Preload hero image
   <link rel="preload" as="image" href={heroImageUrl} />
   
   // Cloudinary optimization
   const optimizedUrl = `${baseUrl}/f_auto,q_auto,w_800/${imagePath}`
   ```

2. **INP (Interaction to Next Paint):**
   ```jsx
   // Avoid blocking the main thread
   const ProductCard = React.lazy(() => import('./ProductCard'))
   
   // Use startTransition for non-urgent updates
   import { startTransition } from 'react'
   startTransition(() => setProducts(newProducts))
   ```

3. **CLS (Cumulative Layout Shift):**
   ```jsx
   // Always specify dimensions
   <img width={400} height={300} src={url} alt={name} />
   
   // Reserve space for async content
   <div className="min-h-[200px]">
     <Suspense fallback={<Skeleton />}>
       <ProductGrid />
     </Suspense>
   </div>
   ```

**What NOT to use:**
- ~~SSR/SSG (Next.js)~~ — Adds complexity, not needed for this catalog site. CSR + aggressive caching is sufficient
- ~~Service Worker caching~~ — Premature optimization, adds complexity for minimal gain on simple site
- ~~Image sprites~~ — Obsolete technique, HTTP/2 multiplexing makes this unnecessary

---

### Frontend Upgrades

| Technology | Current | Recommended | Rationale | Confidence |
|------------|---------|-------------|-----------|------------|
| Vite | 6.0.5 | ^7.3.1 | Rolldown integration, faster builds | HIGH |
| react-router-dom | 7.1.3 | Keep | Already on v7, stable | HIGH |
| Ant Design | 5.23.3 | Consider removal | Large bundle, use Tailwind components instead | MEDIUM |
| Framer Motion | 12.0.6 | Keep | Essential for smooth animations | HIGH |

**Dependencies to REMOVE:**
| Package | Reason |
|---------|--------|
| `@stripe/react-stripe-js` | Payment not needed (WhatsApp quotation flow) |
| `@stripe/stripe-js` | Payment not needed |
| `appwrite` | Listed but unused |
| `crypto-js` | Replace with native Web Crypto API |

**Bundle Size Impact (estimated):**
- Stripe removal: ~50KB reduction
- crypto-js removal: ~30KB reduction
- Ant Design reduction (if partial): ~100-200KB potential savings

---

### Backend Upgrades

| Technology | Current | Recommended | Rationale | Confidence |
|------------|---------|-------------|-----------|------------|
| Express | 4.21.2 | Keep | Stable, works well | HIGH |
| pg (raw SQL) | 8.13.1 | Replace with Prisma | Type safety, migrations | HIGH |
| swagger | 0.7.5 | Remove | Deprecated, use swagger-jsdoc only | HIGH |

**Security Additions:**
| Package | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| `helmet` | ^8.1.0 | Security headers | HIGH |
| `express-rate-limit` | ^7.6.0 | Rate limiting for OTP endpoint | HIGH |

---

### Development Tools

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| TypeScript | ^5.8.x | Type checking (gradual migration) | HIGH |
| Biome | ^2.3.x | Fast linting + formatting (replaces ESLint + Prettier) | MEDIUM |
| Vitest | ^4.x | Unit testing (Vite-native, faster than Jest) | HIGH |

**Migration Path (Optional but Recommended):**
1. Add TypeScript to new files only (`.ts`, `.tsx`)
2. Keep existing JS files working
3. Gradual migration as files are touched

---

## Installation Commands

### Phase 1: Database Migration
```bash
# Backend (api/)
npm install prisma @prisma/client @prisma/adapter-pg --save
npm install @types/pg --save-dev

# Initialize Prisma
npx prisma init --datasource-provider postgresql --output ../generated/prisma
```

### Phase 2: Email Integration
```bash
# Backend (api/)
npm install resend
```

### Phase 3: Performance & Security
```bash
# Backend (api/)
npm install helmet express-rate-limit

# Frontend - upgrade Vite
npm install vite@^7.3.1 @tailwindcss/vite@^4.1.0

# Frontend - remove unused
npm uninstall @stripe/react-stripe-js @stripe/stripe-js appwrite crypto-js
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| ORM | Prisma | Drizzle | Prisma has better migration tooling, larger ecosystem, official Supabase guide |
| Email | Resend | SendGrid | Resend has simpler API, better DX, sufficient for OTP use case |
| Email | Resend | Mailgun | Resend is more developer-friendly, easier domain verification |
| Framework | Vite + React | Next.js | SSR not needed, adds complexity, current SPA approach is sufficient |
| Styling | Tailwind CSS 4 | CSS Modules | Tailwind already in use, utility-first is faster for this project |
| Testing | Vitest | Jest | Vitest is Vite-native, faster, better HMR in watch mode |
| Linting | ESLint (keep) | Biome | ESLint ecosystem is mature, Biome is optional improvement |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Prisma migration breaks existing data | LOW | HIGH | Use `prisma db pull` to introspect existing schema first |
| Resend email deliverability issues | LOW | MEDIUM | Verify domain, set up SPF/DKIM before go-live |
| Vite 7 breaking changes | LOW | LOW | Read migration guide, run tests before upgrading |
| Lighthouse 100 unachievable | MEDIUM | MEDIUM | Focus on Core Web Vitals (LCP, INP, CLS), accept 95+ if needed |

---

## Sources

| Source | Confidence | URL |
|--------|------------|-----|
| Prisma Official Docs | HIGH | https://prisma.io/docs/getting-started/prisma-orm/quickstart/postgresql |
| Prisma + Supabase Guide | HIGH | https://prisma.io/docs/orm/overview/databases/supabase |
| Resend Official Docs | HIGH | https://resend.com/docs/send-with-nodejs |
| Resend Node.js SDK | HIGH | https://github.com/resend/resend-node (v6.9.1) |
| Vite Performance Guide | HIGH | https://vite.dev/guide/performance |
| Web Vitals | HIGH | https://web.dev/articles/vitals |
| npm registry | HIGH | Direct version checks via `npm view` |

---

## Confidence Summary

| Area | Confidence | Notes |
|------|------------|-------|
| Prisma ORM | HIGH | Official Supabase documentation, verified current versions |
| Resend Email | HIGH | Official docs, verified v6.9.1 release (Jan 2026) |
| Performance Optimization | HIGH | Based on Core Web Vitals standards, Vite official guide |
| Multi-project Architecture | MEDIUM | Standard Vercel pattern, but specific config needs testing |
| Bundle Size Reductions | MEDIUM | Estimates based on typical package sizes, actual savings may vary |

---

*Research complete. Proceed to roadmap creation.*
