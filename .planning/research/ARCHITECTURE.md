# Architecture Patterns: Multi-Project Local Business Site

**Domain:** Public site + Admin panel with shared backend  
**Researched:** 2026-01-30  
**Overall Confidence:** HIGH (patterns verified with Vercel official docs and Turborepo)

## Executive Summary

For restructuring lapancomido.cl into public site + admin.lapancomido.cl, the recommended architecture is a **Turborepo monorepo with workspace-based project separation**. This maintains a single repository while allowing independent deployments to Vercel. The shared API becomes a deployable package consumed by both frontends.

**Key insight:** Vercel natively supports monorepos by creating separate Vercel Projects pointing to different directories within the same Git repository. Each commit triggers builds only for affected projects.

---

## Recommended Architecture

```
lapancomido/                          # Turborepo monorepo root
├── apps/
│   ├── web/                          # Public site (lapancomido.cl)
│   │   ├── package.json
│   │   ├── vercel.json
│   │   └── src/
│   ├── admin/                        # Admin panel (admin.lapancomido.cl)
│   │   ├── package.json
│   │   ├── vercel.json
│   │   └── src/
│   └── api/                          # Shared Express API (api.lapancomido.cl)
│       ├── package.json
│       ├── vercel.json
│       └── src/
├── packages/
│   ├── database/                     # Prisma schema + client
│   │   ├── package.json
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── src/
│   │       └── client.ts
│   ├── shared/                       # Shared types, utilities, constants
│   │   ├── package.json
│   │   └── src/
│   └── ui/                           # Shared UI components (if any)
│       ├── package.json
│       └── src/
├── package.json                      # Root package.json with workspaces
├── turbo.json                        # Turborepo task configuration
├── pnpm-workspace.yaml               # Workspace definition (if using pnpm)
└── .planning/
```

---

## Component Boundaries

| Component | Responsibility | Communicates With | Deploy Target |
|-----------|---------------|-------------------|---------------|
| `apps/web` | Public-facing catalog, quotation flow, WhatsApp integration | `apps/api` via HTTP | lapancomido.cl |
| `apps/admin` | Product CRUD, content management, quotation history | `apps/api` via HTTP | admin.lapancomido.cl |
| `apps/api` | REST endpoints, business logic, database access | `packages/database`, Cloudinary, Resend | api.lapancomido.cl |
| `packages/database` | Prisma schema, client, migrations | Supabase PostgreSQL | (not deployed separately) |
| `packages/shared` | TypeScript types, validation schemas, constants | (imported by apps) | (not deployed separately) |

### Boundary Rules

1. **Apps NEVER import from other apps** - Only from packages
2. **Packages CAN import from other packages** - With explicit dependencies
3. **API is the ONLY component that accesses the database** - Frontends communicate via HTTP
4. **Shared types live in `packages/shared`** - Both frontends and API import from here

---

## Data Flow

### Public Site: Quotation Flow

```
User → apps/web → apps/api → packages/database → Supabase
                     ↓
              WhatsApp (wa.me link generation)
                     ↓
              Quotation saved to DB
```

1. User browses catalog (GET `/api/products`)
2. User selects products, quantities
3. User submits quotation form (name, phone, message)
4. Frontend generates WhatsApp link, opens in new tab
5. Simultaneously: POST `/api/quotations` saves to database
6. Admin can view quotation history later

### Admin Site: Product Management Flow

```
Admin → apps/admin → apps/api → packages/database → Supabase
                         ↓
                    Cloudinary (images)
```

1. Admin authenticates (POST `/api/auth/login` + OTP verification)
2. Admin edits product (PUT `/api/admin/products/:id`)
3. API validates, updates database, syncs Cloudinary if images changed
4. Response confirms update

### Authentication Flow

```
                    ┌──────────────────────────┐
                    │      apps/admin          │
                    │   (admin.lapancomido.cl) │
                    └────────────┬─────────────┘
                                 │
                    POST /api/auth/login
                                 │
                    ┌────────────▼─────────────┐
                    │        apps/api          │
                    │   (api.lapancomido.cl)   │
                    ├──────────────────────────┤
                    │ 1. Verify credentials    │
                    │ 2. Check if new device   │
                    │ 3. Send OTP via Resend   │
                    │ 4. Return pending token  │
                    └────────────┬─────────────┘
                                 │
                    POST /api/auth/verify-otp
                                 │
                    ┌────────────▼─────────────┐
                    │        apps/api          │
                    ├──────────────────────────┤
                    │ 1. Verify OTP            │
                    │ 2. Register device hash  │
                    │ 3. Issue JWT (30 days)   │
                    │ 4. Return session token  │
                    └──────────────────────────┘
```

**Security isolation:** Public site has NO access to admin routes. Admin routes require JWT with `admin` or `developer` role. OTP adds device-level verification.

---

## API Architecture Pattern

### Option A: Shared API at Subdomain (RECOMMENDED)

```
lapancomido.cl        → apps/web
admin.lapancomido.cl  → apps/admin  
api.lapancomido.cl    → apps/api
```

**Pros:**
- Single API deployment, single codebase
- Both frontends consume same endpoints
- Clear separation of concerns
- Easier to manage CORS (single origin configuration)
- Vercel "Related Projects" can link deployments

**Cons:**
- API is a single point of failure (mitigated by Vercel's infrastructure)

### Option B: API as Internal Package (NOT recommended for this project)

Each frontend bundles the API as a serverless function. This duplicates the API and complicates database connections.

**Recommendation:** Use Option A. Deploy API as separate Vercel project at `api.lapancomido.cl`.

---

## Vercel Deployment Strategy

### Project Setup

Create **3 Vercel Projects** from the same Git repository:

| Vercel Project | Root Directory | Domain |
|----------------|----------------|--------|
| lapancomido-web | `apps/web` | lapancomido.cl |
| lapancomido-admin | `apps/admin` | admin.lapancomido.cl |
| lapancomido-api | `apps/api` | api.lapancomido.cl |

### vercel.json per app

**apps/web/vercel.json:**
```json
{
  "framework": "vite",
  "buildCommand": "turbo build --filter=web",
  "outputDirectory": "dist"
}
```

**apps/admin/vercel.json:**
```json
{
  "framework": "vite",
  "buildCommand": "turbo build --filter=admin",
  "outputDirectory": "dist"
}
```

**apps/api/vercel.json:**
```json
{
  "framework": null,
  "functions": {
    "src/index.ts": {
      "memory": 512,
      "maxDuration": 10
    }
  },
  "rewrites": [
    { "source": "/(.*)", "destination": "/src/index.ts" }
  ]
}
```

### Related Projects Configuration

Use Vercel's `relatedProjects` to link deployments:

**apps/web/vercel.json:**
```json
{
  "relatedProjects": ["prj_API_PROJECT_ID"]
}
```

This makes the API URL available as `VERCEL_RELATED_PROJECTS` env var, ensuring preview deployments of web connect to preview deployments of API.

---

## Shared Code Strategy

### packages/database (Prisma)

```typescript
// packages/database/src/client.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export * from '@prisma/client'
```

**Usage in API:**
```typescript
// apps/api/src/controllers/product.controller.ts
import { prisma } from '@repo/database'

export async function getProducts() {
  return prisma.product.findMany({ where: { isActive: true } })
}
```

### packages/shared (Types)

```typescript
// packages/shared/src/types/quotation.ts
export interface QuotationItem {
  productId: number
  quantity: number
  price: number
}

export interface QuotationRequest {
  customerName: string
  customerPhone: string
  items: QuotationItem[]
  message?: string
}

// packages/shared/src/constants/roles.ts
export const ROLES = {
  ADMIN: 'admin',
  DEVELOPER: 'developer',
} as const

export type Role = typeof ROLES[keyof typeof ROLES]
```

**Usage:**
```typescript
// apps/api/src/routes/quotation.routes.ts
import type { QuotationRequest } from '@repo/shared/types/quotation'

// apps/admin/src/hooks/useQuotations.ts
import type { QuotationRequest } from '@repo/shared/types/quotation'
```

---

## Database Schema for Quotations

Based on PROJECT.md requirements, add quotation tracking:

```prisma
// packages/database/prisma/schema.prisma

model Quotation {
  id          Int              @id @default(autoincrement())
  createdAt   DateTime         @default(now())
  customerName    String
  customerPhone   String
  message     String?
  totalAmount Decimal          @db.Decimal(10, 2)
  status      QuotationStatus  @default(SENT)
  items       QuotationItem[]
  
  @@schema("pancomido")
}

model QuotationItem {
  id          Int        @id @default(autoincrement())
  quotationId Int
  productId   Int
  quantity    Int
  unitPrice   Decimal    @db.Decimal(10, 2)
  quotation   Quotation  @relation(fields: [quotationId], references: [id], onDelete: Cascade)
  product     Product    @relation(fields: [productId], references: [id])
  
  @@schema("pancomido")
}

enum QuotationStatus {
  SENT       // WhatsApp link opened
  VIEWED     // Admin viewed in dashboard
  CONTACTED  // Admin marked as contacted
  CONVERTED  // Resulted in sale
  EXPIRED    // No follow-up
  
  @@schema("pancomido")
}
```

---

## Build Order (Dependencies)

Build order is critical for Turborepo task execution:

```
packages/database  ──┐
                     ├──► packages/shared
packages/ui (if any)─┘
        │
        ▼
   apps/api ──────────► apps/web
        │                  │
        └───────────────► apps/admin
```

**turbo.json configuration:**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "db:generate": {
      "cache": false
    },
    "db:push": {
      "cache": false
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "type-check": {
      "dependsOn": ["^build"]
    }
  }
}
```

**Build sequence:**
1. `packages/database` - Generate Prisma client
2. `packages/shared` - Compile shared types/utilities
3. `apps/api` - Build API (depends on database, shared)
4. `apps/web` and `apps/admin` - Build frontends (depend on shared, API types)

---

## Suggested Build Order (Migration from Current State)

### Phase 1: Foundation (Week 1)

1. **Initialize Turborepo structure**
   - Create `apps/` and `packages/` directories
   - Set up root `package.json` with workspaces
   - Configure `turbo.json`
   - Move existing code to `apps/legacy/` temporarily

2. **Create packages/database**
   - Initialize Prisma
   - Migrate existing SQL schema to Prisma schema
   - Generate client
   - Test connection to Supabase

3. **Create packages/shared**
   - Extract shared TypeScript types
   - Extract shared constants (roles, status codes)
   - Export validation schemas (Zod)

### Phase 2: API Restructure (Week 2)

4. **Create apps/api**
   - Migrate Express app from `api/` to `apps/api/`
   - Replace raw SQL with Prisma client
   - Add Resend integration for OTP
   - Verify all endpoints work
   - Deploy to api.lapancomido.cl

### Phase 3: Public Site (Week 3-4)

5. **Create apps/web**
   - Fresh Vite + React project
   - Copy UI components selectively (keeping good ones)
   - Rebuild with quotation flow (not cart/checkout)
   - Connect to apps/api
   - Deploy to lapancomido.cl

### Phase 4: Admin Panel (Week 5-6)

6. **Create apps/admin**
   - Fresh Vite + React project
   - Implement OTP authentication flow
   - Build product management UI
   - Build quotation history view
   - Deploy to admin.lapancomido.cl

### Phase 5: Cleanup (Week 7)

7. **Remove legacy code**
   - Delete `apps/legacy/`
   - Remove unused dependencies (Stripe, Appwrite, cart code)
   - Final testing and optimization

---

## Patterns to Follow

### Pattern 1: Environment-Based API URL

**What:** Frontend uses environment variable for API base URL  
**When:** Always - enables preview deployments to work correctly

```typescript
// apps/web/src/lib/api.ts
const API_BASE = import.meta.env.VITE_API_URL || 'https://api.lapancomido.cl'

export async function fetchProducts() {
  const res = await fetch(`${API_BASE}/products`)
  return res.json()
}
```

### Pattern 2: Workspace-Scoped Package Naming

**What:** Use `@repo/` namespace for internal packages  
**When:** Always for internal packages

```json
// packages/database/package.json
{
  "name": "@repo/database",
  "version": "0.0.0",
  "private": true
}

// apps/api/package.json
{
  "dependencies": {
    "@repo/database": "workspace:*",
    "@repo/shared": "workspace:*"
  }
}
```

### Pattern 3: Strict API Route Separation

**What:** Separate public and admin routes with middleware  
**When:** Always - security boundary

```typescript
// apps/api/src/routes/index.ts
import { Router } from 'express'
import publicRoutes from './public'
import adminRoutes from './admin'
import { requireAuth, requireAdmin } from '../middleware/auth'

const router = Router()

// Public routes - no auth required
router.use('/products', publicRoutes.products)
router.use('/quotations', publicRoutes.quotations)
router.use('/auth', publicRoutes.auth)

// Admin routes - auth + role required
router.use('/admin', requireAuth, requireAdmin, adminRoutes)

export default router
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Cross-App Imports

**What:** Importing directly from one app to another  
**Why bad:** Breaks build isolation, creates tight coupling  
**Instead:** Use shared packages

```typescript
// BAD - never do this
import { ProductCard } from '../../admin/src/components/ProductCard'

// GOOD - use shared package
import { ProductCard } from '@repo/ui'
```

### Anti-Pattern 2: Hardcoded API URLs

**What:** Hardcoding production API URL in frontend  
**Why bad:** Preview deployments break, can't test locally  
**Instead:** Use environment variables

```typescript
// BAD
const API = 'https://api.lapancomido.cl'

// GOOD
const API = import.meta.env.VITE_API_URL
```

### Anti-Pattern 3: Database Access in Frontend

**What:** Importing Prisma client in frontend code  
**Why bad:** Exposes database credentials, massive bundle  
**Instead:** Always access via API

### Anti-Pattern 4: Shared node_modules API Access

**What:** Having API as a package that frontends import functions from  
**Why bad:** Includes server code in frontend bundle, secret exposure  
**Instead:** API is separate deployment, frontends fetch via HTTP

---

## Scalability Considerations

| Concern | At MVP | At 1K users/month | At 10K users/month |
|---------|--------|-------------------|---------------------|
| API response time | Single Vercel Function | Same (Vercel scales) | Consider caching layer |
| Database connections | Supabase pooler handles | Same | Same |
| Image loading | Cloudinary default | Cloudinary transformations | Cloudinary with CDN |
| Build times | ~1-2 min | Same | Turborepo remote cache |

For a local bakery in Caldera, Chile, the MVP architecture will handle projected load indefinitely. Optimization is not needed until significant growth.

---

## Monorepo vs Separate Repos Decision

| Factor | Monorepo (RECOMMENDED) | Separate Repos |
|--------|------------------------|----------------|
| Shared code | Easy via packages/ | Requires npm publishing or git submodules |
| Atomic changes | One PR updates all | Multiple PRs, coordination needed |
| Type safety | Immediate across projects | Delayed until package published |
| Build complexity | Turborepo handles | Manual coordination |
| Deployment | Vercel supports natively | Each repo needs own pipeline |
| Team size | Works for 1-5 devs | Better for large teams (10+) |

**Recommendation:** Use monorepo. Solo developer, shared types, atomic deployments. Separate repos add unnecessary complexity.

---

## Security Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│                        PUBLIC INTERNET                           │
└───────────────┬──────────────────────────────┬──────────────────┘
                │                              │
    ┌───────────▼───────────┐    ┌─────────────▼─────────────┐
    │   lapancomido.cl      │    │   admin.lapancomido.cl    │
    │   (Public Site)       │    │   (Admin Panel)           │
    │   NO AUTH REQUIRED    │    │   REQUIRES:               │
    │                       │    │   - Email/password        │
    │   Can access:         │    │   - OTP verification      │
    │   - GET /products     │    │   - JWT token             │
    │   - POST /quotations  │    │   - admin/developer role  │
    └───────────┬───────────┘    └─────────────┬─────────────┘
                │                              │
                └──────────────┬───────────────┘
                               │
                 ┌─────────────▼─────────────┐
                 │   api.lapancomido.cl      │
                 │   (Shared API)            │
                 ├───────────────────────────┤
                 │   Public routes:          │
                 │   - /products (GET)       │
                 │   - /quotations (POST)    │
                 │   - /auth/login           │
                 │   - /auth/verify-otp      │
                 ├───────────────────────────┤
                 │   Admin routes:           │
                 │   (requireAuth +          │
                 │    requireAdmin)          │
                 │   - /admin/products       │
                 │   - /admin/quotations     │
                 │   - /admin/content        │
                 └─────────────┬─────────────┘
                               │
                 ┌─────────────▼─────────────┐
                 │   Supabase PostgreSQL     │
                 │   (Private, no direct     │
                 │    internet access)       │
                 └───────────────────────────┘
```

**Key security measures:**
1. Admin panel on separate subdomain - harder to accidentally expose admin UI
2. OTP verification per device - prevents credential sharing
3. All admin routes require middleware validation
4. Database only accessible via API (no direct client access)
5. JWT tokens with 30-day expiry (balance of security/UX for bakery owner)

---

## Sources

- Vercel Monorepos Documentation: https://vercel.com/docs/monorepos (HIGH confidence)
- Vercel Turborepo Deployment: https://vercel.com/docs/monorepos/turborepo (HIGH confidence)
- Turborepo Repository Structure: https://turbo.build/docs/crafting-your-repository/structuring-a-repository (HIGH confidence)
- Vercel Express Deployment: https://vercel.com/docs/frameworks/backend/express (HIGH confidence)
- Vercel Project Configuration: https://vercel.com/docs/project-configuration (HIGH confidence)
- Vercel Related Projects: https://vercel.com/docs/monorepos#how-to-link-projects-together-in-a-monorepo (HIGH confidence)

---

*Architecture research: 2026-01-30*
