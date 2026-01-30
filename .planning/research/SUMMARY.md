# Project Research Summary

**Project:** La Pan Comido — Public Site + Admin Panel
**Domain:** Local bakery catalog with WhatsApp-based quotation system
**Researched:** 2026-01-30
**Confidence:** HIGH

## Executive Summary

La Pan Comido is a local bakery website transitioning from a traditional e-commerce model to a WhatsApp-based quotation flow. This is a well-understood domain: small business catalog sites that funnel customer intent through messaging apps. The recommended approach is a **Turborepo monorepo** with three deployable apps (public site, admin panel, shared API) connected to Supabase PostgreSQL via Prisma ORM. This architecture enables code sharing, type safety, and independent deployments while maintaining a single repository.

The critical path forward involves **migrating to Prisma first** (with zero business logic changes), then building the quotation system, then splitting the architecture into public/admin sites, and finally adding OTP authentication. This order prevents the most dangerous pitfalls: schema migration chaos when features are changing, removing checkout before quotation is solid, and code duplication across the split architecture.

Key risks include WhatsApp URL encoding failures with Spanish characters (ñ, accents), Lighthouse performance scores being destroyed by Ant Design's bundle size, and OTP fatigue for the bakery owner if device fingerprinting isn't implemented. All are preventable with the patterns documented in this research.

## Key Findings

### Recommended Stack

The existing React/Vite/Express stack is solid and should be kept. Key additions are Prisma for type-safe database access, Resend for OTP emails, and security packages (helmet, express-rate-limit).

**Core technologies:**
| Technology | Version | Purpose |
|------------|---------|---------|
| Prisma | ^7.3.0 | Type-safe ORM, replaces raw SQL |
| @prisma/adapter-pg | ^7.3.0 | Supabase connection pooling |
| Resend | ^6.9.1 | OTP email delivery |
| Vite | ^7.3.1 | Build tool (upgrade from 6.0.5) |
| helmet | ^8.1.0 | Security headers |
| express-rate-limit | ^7.6.0 | Rate limiting for auth endpoints |

**Dependencies to REMOVE:**
- `@stripe/react-stripe-js`, `@stripe/stripe-js` — Payment not needed
- `appwrite` — Listed but unused
- `crypto-js` — Replace with native Web Crypto API

**Bundle size impact:** ~80KB reduction from removals, up to 200KB if Ant Design is replaced/optimized.

### Expected Features

**Must have (table stakes):**
- Product catalog with images, categories, prices
- Mobile-first responsive design
- Product selection mechanism (checkboxes or add buttons)
- Selection bar showing item count
- Quotation summary modal with wa.me link generation
- Business info (hours, location, phone, map)
- Admin authentication with product CRUD
- Category management
- Image upload to Cloudinary

**Should have (first week post-launch):**
- Selection persistence (localStorage)
- Product availability toggle ("agotado")
- Local SEO optimization (schema.org LocalBusiness, Bakery markup)
- Inquiry click logging (basic analytics)

**Defer (v2+):**
- Image gallery per product
- Seasonal/featured section
- Custom order notes field
- Inquiry history dashboard with filtering

**Anti-features (do NOT build):**
- Full e-commerce checkout
- User accounts/registration
- Shopping cart with payments
- Inventory management system
- Real-time chat widget
- Reviews/ratings system

### Architecture Approach

**Turborepo monorepo** with workspace-based separation. Single repository, three Vercel projects, shared packages for database and types. The API is a separate deployment at `api.lapancomido.cl`, consumed by both frontends.

**Major components:**
1. `apps/web` — Public-facing catalog at lapancomido.cl
2. `apps/admin` — Admin panel at admin.lapancomido.cl
3. `apps/api` — Shared Express API at api.lapancomido.cl
4. `packages/database` — Prisma schema, client, migrations
5. `packages/shared` — TypeScript types, validation schemas, constants

**Key architectural decisions:**
- Apps NEVER import from other apps — only from packages
- API is the ONLY component that accesses the database
- All admin routes require JWT with `admin` or `developer` role
- Device-based OTP verification (not per-login)

### Critical Pitfalls

1. **Prisma migration without schema freeze** — Never mix ORM migration with feature changes. Phase 1 must be Prisma-only with zero business logic changes. Validate parity before proceeding.

2. **Removing checkout before quotation is solid** — Build and test quotation system completely before touching cart code. Use feature flags to toggle between flows.

3. **Monorepo split without shared package strategy** — Design `packages/shared` and `packages/database` BEFORE splitting. Copy-pasted code will diverge and cause subtle bugs.

4. **OTP on every login** — Implement device fingerprinting first. Store trusted devices with 30-day tokens. OTP should trigger only for new devices.

5. **WhatsApp URL encoding failures** — Use `encodeURIComponent()` for all dynamic content. Test with real Spanish characters (ñ, ó, arándanos). Format: `https://wa.me/56XXXXXXXXX?text=<encoded>`.

6. **Lighthouse as afterthought** — Set up Lighthouse CI from Phase 1. Ant Design alone can tank performance score if not tree-shaked. Consider removing it from public site entirely.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation & Database Migration
**Rationale:** Prisma migration must happen first with zero feature changes to isolate ORM bugs from business logic. Lighthouse CI must be configured from day one.
**Delivers:** Type-safe database layer, Turborepo structure, CI/CD pipeline with Lighthouse
**Addresses:** Database audit, schema migration, build infrastructure
**Avoids:** Pitfall 1 (Prisma without freeze), Pitfall 5 (Lighthouse as afterthought)
**Needs research:** No — Prisma + Supabase is well-documented

### Phase 2: Quotation Feature (Public Site Core)
**Rationale:** Core business value. Selection mechanism + summary modal + WhatsApp link generation. Build this before touching any existing cart code.
**Delivers:** Working quotation flow for customers
**Uses:** Prisma client, existing product data
**Implements:** `apps/web` with selection bar, quotation modal, wa.me link
**Avoids:** Pitfall 2 (removing cart before quotation solid), Pitfall 6 (WhatsApp encoding)
**Needs research:** No — WhatsApp deep links are simple, well-documented

### Phase 3: Architecture Split & Admin Foundation
**Rationale:** After quotation is working, split into proper monorepo structure. Create admin panel shell with routing.
**Delivers:** Turborepo structure with apps/web, apps/admin, apps/api, packages/
**Uses:** All stack elements
**Implements:** Shared packages, API separation, subdomain routing
**Avoids:** Pitfall 3 (no shared package strategy), Pitfall 8 (CORS issues), Pitfall 10 (session collision)
**Needs research:** No — Turborepo + Vercel monorepos well-documented

### Phase 4: OTP Authentication
**Rationale:** Admin access requires security. Must implement device fingerprinting BEFORE OTP flow.
**Delivers:** Secure admin login with OTP for new devices, trusted device management
**Uses:** Resend for email, JWT for sessions, device fingerprinting
**Implements:** Auth routes, device trust, OTP verification
**Avoids:** Pitfall 4 (OTP on every login), Pitfall 9 (Resend email issues)
**Needs research:** Possibly — device fingerprinting libraries may need evaluation

### Phase 5: Admin Panel Features
**Rationale:** With auth in place, build product management, content editing, quotation history.
**Delivers:** Full admin panel for bakery owner
**Implements:** Product CRUD, image upload, category management, quotation history view
**Avoids:** Pitfall 11 (quotation without product snapshots)
**Needs research:** No — standard CRUD patterns

### Phase 6: Performance & SEO Optimization
**Rationale:** Polish public site for Lighthouse 100/100/100/100. Add local SEO markup.
**Delivers:** Optimized public site meeting performance targets
**Uses:** Cloudinary transformations, code splitting, tree-shaking
**Implements:** Schema.org LocalBusiness markup, meta tags, image optimization
**Avoids:** Pitfall 12 (Ant Design bundle), Pitfall 13 (Cloudinary caching)
**Needs research:** No — Lighthouse optimization is well-documented

### Phase 7: Cleanup & Launch
**Rationale:** Remove legacy code (cart, Stripe, unused deps), final testing, production deployment.
**Delivers:** Clean, production-ready codebase
**Implements:** Dependency removal, final security hardening

### Phase Ordering Rationale

- **Database first** — Prisma migration must be isolated. All subsequent features depend on stable ORM.
- **Quotation before split** — Validates core business value in simpler architecture. Easier to debug.
- **Split before admin** — Shared packages must exist before admin panel references them.
- **Auth before admin features** — No point building admin features without login.
- **Performance last** — Easier to optimize when features are stable. But Lighthouse CI runs throughout.

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 4 (OTP Authentication):** Device fingerprinting libraries and browser compatibility need evaluation. Consider fingerprintjs vs custom approach.

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Foundation):** Prisma + Supabase has official documentation
- **Phase 2 (Quotation):** WhatsApp deep links are trivial
- **Phase 3 (Architecture Split):** Turborepo + Vercel has official guides
- **Phase 5 (Admin Panel):** Standard CRUD patterns
- **Phase 6 (Performance):** Lighthouse optimization is well-documented

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official docs verified (Prisma 7.x, Resend 6.9.1, Vite 7.x) |
| Features | HIGH | Domain knowledge + wa.me format verified |
| Architecture | HIGH | Turborepo + Vercel monorepo patterns verified with official docs |
| Pitfalls | HIGH | Based on codebase analysis and documented migration patterns |

**Overall confidence:** HIGH

### Gaps to Address

- **Lighthouse 100/100/100/100:** May need to accept 95+ if Ant Design tree-shaking is insufficient. Consider replacing with Tailwind-only components for public site.
- **Device fingerprinting approach:** Evaluate fingerprintjs vs simpler localStorage + user-agent hashing. May need spike during Phase 4 planning.
- **Quotation history retention:** How long to keep? What if product is deleted? Schema design needs decision during Phase 2.

## Sources

### Primary (HIGH confidence)
- Prisma Official Docs — https://prisma.io/docs/getting-started/prisma-orm/quickstart/postgresql
- Prisma + Supabase Guide — https://prisma.io/docs/orm/overview/databases/supabase
- Resend Official Docs — https://resend.com/docs/send-with-nodejs
- Resend Node.js SDK — https://github.com/resend/resend-node (v6.9.1)
- Vercel Monorepos Documentation — https://vercel.com/docs/monorepos
- Vercel Turborepo Deployment — https://vercel.com/docs/monorepos/turborepo
- Turborepo Repository Structure — https://turbo.build/docs/crafting-your-repository/structuring-a-repository
- Web Vitals — https://web.dev/articles/vitals
- Vite Performance Guide — https://vite.dev/guide/performance
- wa.me URL format — Verified via direct test

### Secondary (MEDIUM confidence)
- Local bakery UX patterns — Domain knowledge of Latin American local business sites
- Chilean market patterns — Knowledge of Chilean e-commerce and local business practices
- WhatsApp Business features — Based on known WhatsApp Business capabilities

### Tertiary (LOW confidence)
- Ant Design bundle optimization — Estimates based on typical package sizes, actual savings may vary

---
*Research completed: 2026-01-30*
*Ready for roadmap: yes*
