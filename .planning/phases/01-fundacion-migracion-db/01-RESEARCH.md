# Phase 1: Foundation & Database Migration - Research

**Researched:** 2026-01-30
**Domain:** Turborepo monorepo setup, Prisma ORM migration, CI/CD pipeline
**Confidence:** HIGH

## Summary

This phase establishes the foundational infrastructure for the La Pan Comido project: converting from a flat structure to a Turborepo monorepo, migrating from raw SQL to Prisma ORM, and setting up CI/CD with GitHub Actions and Lighthouse CI.

The migration strategy is **introspection-first**: use `prisma db pull` to generate a schema from the existing Supabase database, create a baseline migration, then validate parity before proceeding. This approach is officially documented by Prisma for existing projects.

For Turborepo, the recommended approach is restructuring the existing code into `apps/` and `packages/` directories while preserving npm as the package manager. The current Vercel configuration will need replacement with per-app deployments.

**Primary recommendation:** Start with Prisma introspection to generate schema, validate all queries work identically, then restructure into Turborepo with shared packages.

## Standard Stack

The established libraries/tools for this phase:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `turbo` | ^2.4.x | Monorepo build orchestration | Official Vercel tool, built-in remote caching |
| `prisma` | ^7.x | Type-safe ORM and migrations | Official Supabase integration, introspection support |
| `@prisma/client` | ^7.x | Database client | Generated type-safe queries |
| `@prisma/adapter-pg` | ^7.x | PostgreSQL driver adapter | Required for Supabase connection pooling |
| `@lhci/cli` | ^0.15.x | Lighthouse CI runner | Official Google tool for performance regression testing |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `dotenv` | ^16.x | Environment variables | Already in use, keep for local development |
| `pg` | ^8.x | PostgreSQL client | Already in use, required by Prisma adapter |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Turborepo | Nx | Nx more feature-rich but heavier; Turborepo simpler, Vercel-native |
| Prisma | Drizzle ORM | Drizzle newer/lighter but Prisma has better Supabase docs |
| npm workspaces | pnpm | pnpm faster but adds migration complexity |

**Installation (root):**
```bash
npm install -D turbo
npm install prisma @prisma/client @prisma/adapter-pg
```

**Installation (CI):**
```bash
npm install -g @lhci/cli@0.15.x
```

## Architecture Patterns

### Recommended Monorepo Structure

```
lapancomido/
├── apps/
│   ├── web/              # Public-facing catalog (current frontend)
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.js
│   ├── admin/            # Admin panel (placeholder for future)
│   │   ├── src/
│   │   └── package.json
│   └── api/              # Express backend (current api/)
│       ├── src/
│       └── package.json
├── packages/
│   ├── database/         # Prisma schema, client, migrations
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── src/
│   │   │   └── client.ts
│   │   └── package.json
│   └── shared/           # Shared types, constants, utilities
│       ├── src/
│       └── package.json
├── package.json          # Root workspace config
├── turbo.json            # Turborepo task config
└── prisma.config.ts      # Prisma configuration (Prisma 7+)
```

### Pattern 1: Prisma Introspection for Existing Database

**What:** Generate Prisma schema from existing PostgreSQL database
**When to use:** Migrating existing project with raw SQL to Prisma
**Example:**

```bash
# 1. Initialize Prisma (from packages/database)
npx prisma init

# 2. Pull existing schema from database
npx prisma db pull

# 3. Review generated schema.prisma
# 4. Create baseline migration
mkdir -p prisma/migrations/0_init
npx prisma migrate diff \
  --from-empty \
  --to-schema prisma/schema.prisma \
  --script > prisma/migrations/0_init/migration.sql

# 5. Mark baseline as applied
npx prisma migrate resolve --applied 0_init

# 6. Generate client
npx prisma generate
```

Source: https://prisma.io/docs/orm/prisma-migrate/getting-started#adding-prisma-migrate-to-an-existing-project

### Pattern 2: Supabase Connection Pooling with Prisma 7

**What:** Configure dual connection strings for pooled (runtime) vs direct (CLI) connections
**When to use:** Prisma with Supabase (required for serverless)
**Example:**

```typescript
// prisma.config.ts
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Direct connection for CLI (migrations, introspection)
    url: env('DIRECT_URL'),
  },
})
```

```typescript
// packages/database/src/client.ts
import { PrismaClient } from '../prisma/generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Pooled connection for runtime
const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL 
})

export const prisma = new PrismaClient({ adapter })
```

```env
# .env
# Pooled connection (Supavisor) - for runtime
DATABASE_URL="postgres://postgres.[project]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection - for CLI (migrations, introspection)
DIRECT_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
```

Source: https://prisma.io/docs/orm/overview/databases/supabase

### Pattern 3: Turborepo Workspace Configuration (npm)

**What:** Configure npm workspaces with Turborepo
**When to use:** Setting up new monorepo structure
**Example:**

```json
// package.json (root)
{
  "name": "lapancomido",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test"
  },
  "devDependencies": {
    "turbo": "^2.4.0"
  },
  "packageManager": "npm@10.0.0"
}
```

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["build"]
    }
  }
}
```

Source: https://turbo.build/docs/crafting-your-repository/structuring-a-repository

### Pattern 4: Package Exports for Internal Packages

**What:** Use `exports` field in package.json for clean imports
**When to use:** Creating shared packages
**Example:**

```json
// packages/database/package.json
{
  "name": "@lapancomido/database",
  "version": "0.0.0",
  "private": true,
  "main": "./src/client.ts",
  "types": "./src/client.ts",
  "exports": {
    ".": "./src/client.ts",
    "./types": "./src/types.ts"
  },
  "scripts": {
    "generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev"
  },
  "dependencies": {
    "@prisma/adapter-pg": "^7.3.0",
    "@prisma/client": "^7.3.0"
  },
  "devDependencies": {
    "prisma": "^7.3.0"
  }
}
```

```typescript
// apps/api/src/controllers/product.controller.js
// Import from shared package
import { prisma } from '@lapancomido/database'

export const getAllProducts = async (req, res) => {
  const products = await prisma.product.findMany()
  res.json(products)
}
```

Source: https://turbo.build/docs/crafting-your-repository/structuring-a-repository#exports

### Anti-Patterns to Avoid

- **Cross-package file imports:** Never use `../` to access files across packages. Install package and import properly.
- **Sharing node_modules:** Each package should declare its own dependencies in package.json.
- **Root tsconfig.json:** Each package should have its own TypeScript configuration.
- **Mixing Prisma CLI with runtime:** Use `DIRECT_URL` for CLI commands, `DATABASE_URL` for runtime.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Schema introspection | Manual schema writing | `prisma db pull` | Introspection handles edge cases, naming conventions |
| Baseline migrations | Manual SQL scripts | `prisma migrate diff` | Generates correct DDL from schema |
| Monorepo task orchestration | Custom scripts | Turborepo | Handles dependency graph, caching, parallelization |
| Performance regression testing | Manual Lighthouse | Lighthouse CI | Automates runs, assertions, reporting |
| GitHub status checks | Custom API integration | LHCI GitHub App | Handles authentication, status updates |

**Key insight:** The tooling for monorepos and database migrations is mature. Custom solutions introduce subtle bugs that are already solved by standard tools.

## Common Pitfalls

### Pitfall 1: Schema Drift During Migration

**What goes wrong:** Changing business logic or adding features while migrating from raw SQL to Prisma
**Why it happens:** Natural temptation to "fix things while we're at it"
**How to avoid:** Freeze schema changes. Phase 1 must produce IDENTICAL behavior to current raw SQL.
**Warning signs:** PR includes new columns, changed relationships, or modified query behavior
**Verification:** Run existing test suite against both raw SQL and Prisma implementations, compare results

### Pitfall 2: Missing PostgreSQL Schema (search_path)

**What goes wrong:** Prisma can't find tables, introspection returns empty
**Why it happens:** Current codebase uses `SET search_path TO pancomido` (custom schema, not `public`)
**How to avoid:** Include schema in connection URL: `?schema=pancomido`
**Warning signs:** "Table not found" errors, empty introspection results

```env
# Include schema in connection URLs
DATABASE_URL="postgres://...?pgbouncer=true&schema=pancomido"
DIRECT_URL="postgresql://...?schema=pancomido"
```

### Pitfall 3: Incorrect Vercel Project Configuration

**What goes wrong:** Builds fail or wrong app deploys, cache misses on every build
**Why it happens:** Turborepo monorepo requires specific Vercel configuration per app
**How to avoid:** Create separate Vercel projects for each app, configure root directory
**Warning signs:** Deploy logs show wrong build context, missing environment variables

**Vercel Configuration per App:**
| Field | apps/web | apps/api |
|-------|----------|----------|
| Root Directory | `apps/web` | `apps/api` |
| Build Command | `turbo build` | `turbo build` |
| Framework Preset | Vite | Other |
| Install Command | Auto-detected | Auto-detected |

### Pitfall 4: Lighthouse CI Without Static Server

**What goes wrong:** Lighthouse runs fail or test wrong URLs
**Why it happens:** LHCI needs to serve built assets; current setup is SPA + API
**How to avoid:** Configure `staticDistDir` for SPA, or use `startServerCommand` for API
**Warning signs:** "No URLs found" errors, Lighthouse testing localhost:3000 without server

```js
// lighthouserc.js for SPA
module.exports = {
  ci: {
    collect: {
      staticDistDir: './apps/web/dist',
      url: ['http://localhost:8080/'],
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
```

### Pitfall 5: Environment Variable Mismanagement in Turborepo

**What goes wrong:** Builds cached incorrectly across environments, staging code deploys to production
**Why it happens:** Turborepo caches based on inputs; env vars not declared are ignored
**How to avoid:** Declare all build-affecting env vars in turbo.json
**Warning signs:** Production build uses staging API URL, unexpected cache hits

```json
// turbo.json
{
  "tasks": {
    "build": {
      "env": ["VITE_API_URL", "NODE_ENV"],
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  },
  "globalEnv": ["CI", "VERCEL"]
}
```

### Pitfall 6: Prisma Client Not Regenerated After Schema Changes

**What goes wrong:** TypeScript types don't match database, queries fail at runtime
**Why it happens:** Prisma client is generated, not dynamic; must run `prisma generate`
**How to avoid:** Add `prisma generate` to postinstall script, CI workflow
**Warning signs:** Type errors in IDE, runtime "Unknown field" errors

```json
// packages/database/package.json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

## Code Examples

Verified patterns from official sources:

### GitHub Actions Workflow for Turborepo Monorepo

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2  # For turbo-ignore

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm run test
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

  lighthouse:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build web app
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli@0.15.x
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

Source: https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/getting-started.md

### Lighthouse CI Configuration

```js
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      staticDistDir: './apps/web/dist',
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // Start lenient, tighten over time
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        // Disable audits that don't apply
        'uses-http2': 'off', // Vercel handles this
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
```

Source: https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/getting-started.md

### Prisma Schema Example (Post-Introspection)

```prisma
// packages/database/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model products {
  id          Int       @id @default(autoincrement())
  product     String
  ingredients String?
  price       Decimal   @db.Decimal(10, 2)
  weight      String?
  description String?
  nutrition   String?
  available   Boolean   @default(false)
  created_at  DateTime  @default(now())
  updated_at  DateTime  @updatedAt

  @@map("products")
  @@schema("pancomido")
}

model users {
  id         Int       @id @default(autoincrement())
  name       String
  lastname   String
  mail       String    @unique
  password   String
  phone      String?
  rut        String?
  role_id    Int?
  created_at DateTime  @default(now())
  updated_at DateTime  @updatedAt
  role       roles?    @relation(fields: [role_id], references: [id])

  @@map("users")
  @@schema("pancomido")
}

model roles {
  id    Int     @id @default(autoincrement())
  role  String
  users users[]

  @@map("roles")
  @@schema("pancomido")
}
```

**Note:** Actual schema will be generated by `prisma db pull`. This is illustrative of expected output.

### Migrating a Raw SQL Model to Prisma

**Before (raw SQL):**
```javascript
// api/src/models/Product.js
const getAllProducts = async () => {
  const query = `
    SELECT id, product, ingredients, price, weight, description, nutrition, available, created_at, updated_at
    FROM ${schema}.products
  `;
  const { rows } = await db.query(query);
  return rows;
};
```

**After (Prisma):**
```typescript
// apps/api/src/controllers/product.controller.ts
import { prisma } from '@lapancomido/database'

export const getAllProducts = async (req, res) => {
  const products = await prisma.products.findMany({
    select: {
      id: true,
      product: true,
      ingredients: true,
      price: true,
      weight: true,
      description: true,
      nutrition: true,
      available: true,
      created_at: true,
      updated_at: true,
    },
  })
  res.json(products)
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `datasource.directUrl` | `prisma.config.ts` | Prisma 7 | CLI reads from config file, not schema |
| Manual PgBouncer config | `@prisma/adapter-pg` | Prisma 5.4+ | Built-in driver adapter for connection pooling |
| `npm run build` in CI | `turbo build` | Turborepo 1.8+ | Automatic workspace scoping, caching |
| Manual Lighthouse runs | `lhci autorun` | LHCI 0.10+ | Auto-discovery, assertions, uploads |

**Deprecated/outdated:**
- `directUrl` in schema.prisma: Replaced by `prisma.config.ts` in Prisma 7
- Manual Chrome installation for LHCI: Docker images include Chrome
- Separate `vercel.json` routes: Monorepo uses per-project settings

## Open Questions

Things that couldn't be fully resolved:

1. **Database Schema Case Sensitivity**
   - What we know: PostgreSQL identifiers are case-sensitive when quoted
   - What's unclear: Whether existing schema uses quoted identifiers
   - Recommendation: Run introspection first, review generated schema

2. **Stock Table Relationship**
   - What we know: `Product.createStock` references a `stock` table
   - What's unclear: Full schema of `stock` table and its relationships
   - Recommendation: Introspection will reveal all tables and relationships

3. **Vercel Project Restructuring**
   - What we know: Current setup uses single vercel.json for both frontend and API
   - What's unclear: Whether to create new Vercel projects or reconfigure existing
   - Recommendation: Create new projects during Phase 1, migrate domains later

## Sources

### Primary (HIGH confidence)
- Prisma Official Docs - Supabase Integration: https://prisma.io/docs/orm/overview/databases/supabase
- Prisma Official Docs - Introspection: https://prisma.io/docs/orm/prisma-schema/introspection
- Prisma Official Docs - Adding Migrate to Existing Project: https://prisma.io/docs/orm/prisma-migrate/getting-started
- Turborepo Official Docs - Structuring Repository: https://turbo.build/docs/crafting-your-repository/structuring-a-repository
- Vercel Docs - Turborepo Deployment: https://vercel.com/docs/monorepos/turborepo
- Lighthouse CI GitHub - Getting Started: https://github.com/GoogleChrome/lighthouse-ci

### Secondary (MEDIUM confidence)
- Lighthouse CI GitHub Action: https://github.com/treosh/lighthouse-ci-action (community action)
- Turborepo caching behavior for environment variables: Verified with official docs

### Tertiary (LOW confidence)
- None identified - all critical claims verified with primary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All versions verified with official sources
- Architecture: HIGH - Patterns documented in official Turborepo and Prisma docs
- Pitfalls: HIGH - Based on codebase analysis (db.js shows pancomido schema) and documented patterns

**Research date:** 2026-01-30
**Valid until:** 2026-03-01 (30 days - stable tools)
