# Domain Pitfalls

**Domain:** E-commerce to WhatsApp Quotation Migration  
**Researched:** 2026-01-30  
**Confidence:** HIGH (based on documented migration patterns)

## Critical Pitfalls

Mistakes that cause rewrites, major delays, or project failure.

---

### Pitfall 1: Prisma Migration Without Schema Freeze

**What goes wrong:** Migrating raw SQL to Prisma while simultaneously changing business logic. Schema evolution and ORM adoption happen in parallel, creating confusion about whether bugs are from Prisma migration or feature changes.

**Why it happens:** Teams want to "fix everything at once" — migrate ORM, add new features, remove old features simultaneously.

**Consequences:**
- Impossible to isolate whether bugs are from ORM migration or business logic
- Rollback becomes impossible (can't revert to raw SQL if new features depend on Prisma)
- Data integrity issues go undetected longer
- Testing becomes meaningless (no stable baseline)

**Warning signs:**
- "Let's add the quotation feature while we're migrating to Prisma"
- Same PR contains Prisma schema AND new business logic
- No working raw SQL → Prisma parity checkpoint

**Prevention:**
1. **Phase 1 ONLY**: Migrate to Prisma with ZERO business logic changes
2. Validate Prisma produces identical results to raw SQL
3. Run both in parallel briefly, compare outputs
4. Freeze schema until Prisma migration is verified

**Phase mapping:** Address in Phase 1 (Database Migration) — complete before any feature work.

---

### Pitfall 2: Removing Checkout Before Quotation Is Solid

**What goes wrong:** Removing cart/checkout/Stripe code before the quotation system is fully functional. Users have no way to express intent.

**Why it happens:** "We're removing e-commerce anyway, let's clean up first" — but cleanup breaks the existing (working) flow before replacement is ready.

**Consequences:**
- Site becomes unusable during transition
- No way to A/B test new quotation flow against old
- If quotation has bugs, no fallback
- User trust lost if site "stops working"

**Warning signs:**
- Deleting cart code before quotation modal is tested
- "We don't need the cart anymore" before quotation is live
- No feature flag to toggle between flows

**Prevention:**
1. Build quotation system completely (selection bar, modal, WhatsApp link)
2. Test quotation end-to-end before touching cart code
3. Use feature flag: `USE_QUOTATION_FLOW=true/false`
4. Only after quotation is validated, remove cart/checkout in separate phase
5. Keep Stripe removal as final cleanup (it's dormant anyway)

**Phase mapping:** Build quotation in Phase 2, remove cart/checkout in Phase 3.

---

### Pitfall 3: Monorepo Split Without Shared Package Strategy

**What goes wrong:** Splitting into public + admin projects but duplicating code instead of sharing. Both projects have their own auth logic, API clients, types, and validators.

**Why it happens:** "It's faster to just copy the code" — but now bugs must be fixed in two places, and they inevitably diverge.

**Consequences:**
- Auth token format differs between apps (one accepts, other rejects)
- API response parsing breaks in one app but not other
- Type definitions drift, causing subtle bugs
- Double maintenance burden forever

**Warning signs:**
- Copy-pasting AuthProvider to admin project
- Different API client implementations
- "We'll sync them later" (you won't)
- No shared types between projects

**Prevention:**
1. Before splitting, identify shared code: auth, API client, types, validators
2. Create shared package structure (e.g., `packages/shared/`)
3. Use workspace configuration (npm/pnpm workspaces)
4. Extract shared code BEFORE splitting, not after
5. Alternatively: keep as monorepo with separate entry points

**Phase mapping:** Design shared structure in Phase 3 (Architecture Split), extract before creating admin project.

---

### Pitfall 4: OTP Implementation Without Device Fingerprinting

**What goes wrong:** OTP required on every login, not just new devices. Admin user (non-technical bakery owner) must enter OTP code every single time.

**Why it happens:** "OTP per login is more secure" — but destroys UX for a single-admin use case.

**Consequences:**
- Admin abandons the system (too annoying)
- Workarounds emerge (saving OTP codes, sharing devices)
- "Remember me" checkbox doesn't work as expected
- False sense of security without actual device recognition

**Warning signs:**
- OTP flow triggers on every login
- No device fingerprinting or trust mechanism
- "Remember me" only extends session, doesn't skip OTP
- Testing only on single device

**Prevention:**
1. Implement device fingerprinting (browser fingerprint + localStorage token)
2. Store trusted devices in database with user
3. OTP only triggers for new/unknown devices
4. "Remember this device" = 30-day trusted device token
5. Allow admin to see/revoke trusted devices

**Phase mapping:** Address in Phase 4 (OTP Authentication) — design device trust before implementing OTP.

---

### Pitfall 5: Lighthouse 100/100/100/100 as Afterthought

**What goes wrong:** Building features first, optimizing for Lighthouse last. By then, performance issues are architectural (wrong image format, client-side rendering, heavy dependencies).

**Why it happens:** "We'll optimize later" — but Lighthouse 100 requires decisions from day one, not polishing at the end.

**Consequences:**
- Ant Design alone may tank performance score
- Client-side rendering kills Performance/SEO scores
- Large JS bundles from framer-motion, swiper
- Image optimization requires rearchitecting
- "100/100/100/100 is impossible" becomes the narrative

**Warning signs:**
- No Lighthouse CI in pipeline from start
- Using Ant Design without tree-shaking strategy
- All images loaded client-side without optimization
- No code splitting plan
- SEO score ignored until "SEO phase"

**Prevention:**
1. Set up Lighthouse CI from Phase 1 — fail builds below threshold
2. Start with 90/90/90/90 threshold, increase as features complete
3. Choose components carefully — Ant Design needs aggressive tree-shaking
4. Use next-gen image formats (WebP/AVIF) with Cloudinary transformations
5. Implement critical CSS and minimal above-the-fold JS
6. SSR or static generation for SEO (consider Astro for public site)

**Phase mapping:** Configure Lighthouse CI in Phase 1, maintain thresholds throughout all phases.

---

### Pitfall 6: WhatsApp Link Encoding Failures

**What goes wrong:** Quotation message contains special characters that break wa.me URL encoding. Spanish characters (ñ, accents), line breaks, and currency symbols cause truncated or corrupted messages.

**Why it happens:** Building WhatsApp link with simple string concatenation, not proper URL encoding.

**Consequences:**
- Quotation messages arrive garbled
- Customer must re-type order manually
- Bakery owner sees partial order
- Trust in system lost

**Warning signs:**
- Testing only with ASCII product names
- Using `+` for spaces instead of `%20`
- No testing with ñ, ó, é in product names
- Line breaks render as literal `\n`

**Prevention:**
1. Use `encodeURIComponent()` for all dynamic content
2. Test with real product names: "Kuchen de Arándanos", "Pan de Nuez"
3. Format message with URL-safe line breaks (`%0A`)
4. Test on actual WhatsApp (web + mobile)
5. Keep message under 1000 characters (WhatsApp limit)

**Phase mapping:** Critical for Phase 2 (Quotation Feature) — test early with real data.

---

## Moderate Pitfalls

Mistakes that cause delays or technical debt.

---

### Pitfall 7: Prisma Schema Mismatch with Existing Data

**What goes wrong:** Prisma schema introspection generates clean types, but existing data has nulls, empty strings, and invalid references that violate the schema.

**Why it happens:** Raw SQL allowed flexible data; Prisma enforces types strictly.

**Prevention:**
1. Run data audit BEFORE Prisma migration
2. Identify columns with unexpected nulls, empty strings
3. Clean data or adjust schema to match reality
4. Use `db pull` to introspect, then manually refine
5. Test with production data copy, not just dev fixtures

**Phase mapping:** Data audit in Phase 1 before schema finalization.

---

### Pitfall 8: Admin Subdomain CORS Nightmares

**What goes wrong:** API returns 403/CORS errors for admin.lapancomido.cl because CORS only allows lapancomido.cl.

**Why it happens:** CORS configuration forgotten when splitting to subdomain.

**Prevention:**
1. Configure CORS with explicit origin array from start
2. Use environment variable for allowed origins: `ALLOWED_ORIGINS=lapancomido.cl,admin.lapancomido.cl`
3. Test CORS from both domains before deploying split
4. Consider same API for both apps (no subdomain for API)

**Phase mapping:** Configure in Phase 3 when splitting architecture.

---

### Pitfall 9: Resend Email in Development Hell

**What goes wrong:** OTP emails work in development, fail in production (or vice versa). Domain verification, SPF, DKIM issues only appear in production.

**Why it happens:** Testing with Resend sandbox/dev mode, which bypasses real email delivery.

**Prevention:**
1. Set up Resend domain verification early (DNS propagation takes time)
2. Test with real production Resend key in staging
3. Monitor Resend dashboard for delivery failures
4. Have fallback: log OTP to console in development

**Phase mapping:** Configure Resend domain in Phase 1 (Infrastructure), use in Phase 4.

---

### Pitfall 10: Session Storage Collision Between Apps

**What goes wrong:** Public site and admin site both store session in localStorage with same key. Logging into admin logs out of public site (or worse, gives public users admin tokens).

**Why it happens:** Copy-pasted auth code uses same `USER_SESSION` key.

**Prevention:**
1. Prefix localStorage keys by app: `lapan_public_session`, `lapan_admin_session`
2. Use different JWT issuers for public vs admin tokens
3. Admin JWT should include role claim validated server-side
4. Never share auth tokens between domains

**Phase mapping:** Design in Phase 3 (Split), implement in Phase 4 (Auth).

---

### Pitfall 11: Quotation History Without Product Snapshots

**What goes wrong:** Quotation records reference product IDs, but when product is edited/deleted, historical quotations show wrong data or break.

**Why it happens:** Storing only product ID, not a snapshot of the product at quotation time.

**Prevention:**
1. Store product snapshot (name, price, image URL) in quotation record
2. Alternatively: implement soft delete for products (never hard delete)
3. Design schema: `quotation_items` with denormalized product fields
4. Consider: do you need historical quotations at all? (may be out of scope)

**Phase mapping:** Schema design in Phase 2 (Quotation Feature).

---

### Pitfall 12: Ant Design Bundle Size Kills Performance

**What goes wrong:** Importing Ant Design naively includes entire library (1MB+), destroying Lighthouse Performance score.

**Why it happens:** `import { Button } from 'antd'` without tree-shaking configuration.

**Consequences:**
- 50+ Performance score due to large JS bundle
- First Contentful Paint delayed significantly
- Mobile users on slow connections suffer most

**Prevention:**
1. Use babel-plugin-import for tree-shaking
2. Consider replacing Ant Design with lighter alternatives for public site
3. Keep Ant Design only for admin (where bundle size matters less)
4. Lazy load heavy components (DatePicker, Table)

**Phase mapping:** Audit in Phase 1, replace/configure during component work.

---

## Minor Pitfalls

Mistakes that cause annoyance but are fixable.

---

### Pitfall 13: Cloudinary URL Transformation Not Cached

**What goes wrong:** Every product image request hits Cloudinary API for transformations. No CDN caching, slow image loads.

**Prevention:**
1. Use Cloudinary's built-in CDN (default with correct URL format)
2. Apply transformations in URL, not API: `/image/upload/w_400,f_auto,q_auto/...`
3. Verify Cache-Control headers on image responses

---

### Pitfall 14: Phone Number Formatting Inconsistency

**What goes wrong:** WhatsApp link fails because phone numbers stored inconsistently (+56 vs 56 vs 9xxxx).

**Prevention:**
1. Normalize phone numbers on input (remove spaces, add country code)
2. Validate Chilean phone format (9 digits starting with 9, +56 prefix)
3. Store in E.164 format: +56912345678

---

### Pitfall 15: Vercel Environment Variables for Split Deploy

**What goes wrong:** Environment variables set for main project don't apply to admin project. Each Vercel project needs its own env vars.

**Prevention:**
1. Document all required env vars per project
2. Use Vercel CLI to verify env vars before deploy
3. Consider shared env var file with project-specific overrides

---

## Phase-Specific Warnings

| Phase | Likely Pitfall | Mitigation |
|-------|---------------|------------|
| Phase 1: Database/Prisma | Schema mismatch with data | Data audit before migration, test with prod copy |
| Phase 1: Infrastructure | Lighthouse as afterthought | Set up Lighthouse CI from day 1, fail builds below threshold |
| Phase 2: Quotation | WhatsApp URL encoding | Test with Spanish characters, verify on real WhatsApp |
| Phase 2: Quotation | Removing cart before quotation solid | Build quotation first, feature flag, remove cart later |
| Phase 3: Split | CORS for subdomain | Configure origin array explicitly |
| Phase 3: Split | Session storage collision | Prefix localStorage keys by app |
| Phase 3: Split | No shared package strategy | Design shared structure before split |
| Phase 4: OTP | OTP on every login | Implement device fingerprinting first |
| Phase 4: OTP | Resend email issues | Configure domain verification early |
| Performance | Ant Design bundle size | Tree-shaking or replace for public site |
| Performance | Image optimization | Use Cloudinary transformations in URL |

---

## Sources

- Project codebase analysis (`.planning/codebase/*.md`)
- Prisma migration documentation patterns (common migration paths)
- WhatsApp Business API URL formatting specifications
- Lighthouse performance optimization best practices
- OTP/2FA implementation patterns for low-frequency users
- Monorepo splitting patterns (npm workspaces, Turborepo docs)

---

*Pitfalls research: 2026-01-30*
