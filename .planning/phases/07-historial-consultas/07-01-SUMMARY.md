---
phase: 07-historial-consultas
plan: 01
subsystem: database, api
tags: [prisma, express, consultation-history, whatsapp]

# Dependency graph
requires:
  - phase: 02-sistema-cotizacion
    provides: QuotationModal, store routes, WhatsApp integration
provides:
  - consultations and consultation_items Prisma models
  - POST /api/store/consultation endpoint
  - Fire-and-forget consultation save from QuotationModal
affects: [07-02 (admin history view), future analytics]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Fire-and-forget API calls for non-blocking saves
    - Product snapshots for historical accuracy (no FK to products)

key-files:
  created:
    - apps/api/src/controllers/consultations.controller.js
  modified:
    - packages/database/prisma/schema.prisma
    - apps/api/src/routes/store.routes.js
    - apps/web/src/components/selection/QuotationModal.jsx

key-decisions:
  - "No FK from consultation_items to products - products may be deleted but history must remain"
  - "Product name and price snapshotted at consultation time"
  - "Fire-and-forget pattern - consultation save doesn't block WhatsApp flow"

patterns-established:
  - "Snapshot pattern: Store denormalized data for historical accuracy"
  - "Fire-and-forget: Non-critical saves don't block user flow"

# Metrics
duration: 2min
completed: 2026-02-01
---

# Phase 7 Plan 1: API y modelo para guardar consultas Summary

**Consultation history schema and API with fire-and-forget save from WhatsApp modal**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-01T21:34:55Z
- **Completed:** 2026-02-01T21:37:18Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Added `consultations` and `consultation_items` tables to Prisma schema
- Created POST /api/store/consultation endpoint with nested item creation
- Integrated fire-and-forget consultation save in QuotationModal before WhatsApp opens
- Product data snapshots (name, price) stored for historical accuracy

## Task Commits

Each task was committed atomically:

1. **Task 1: Schema consultations + consultation_items** - `343380d` (feat)
2. **Task 2: API endpoint to save consultation** - `075843d` (feat)
3. **Task 3: QuotationModal fire-and-forget save** - `3bd031f` (feat)

**Plan metadata:** (pending)

## Files Created/Modified
- `packages/database/prisma/schema.prisma` - Added consultations and consultation_items models
- `apps/api/src/controllers/consultations.controller.js` - New controller for saving consultations
- `apps/api/src/routes/store.routes.js` - Added POST /consultation route with Swagger docs
- `apps/web/src/components/selection/QuotationModal.jsx` - Added saveConsultation fire-and-forget call

## Decisions Made
- **No FK to products table:** Products may be deleted but consultation history must remain intact. The `product_id` field is reference-only, and `product_name` + `unit_price` are the source of truth for display.
- **Fire-and-forget pattern:** Both `saveCustomerLead()` and `saveConsultation()` are called without await, ensuring WhatsApp opens immediately regardless of API response.
- **Subtotal calculation server-side:** API calculates subtotal and total_amount from provided data for consistency.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**Database push not executed:** The `npx prisma db push` command could not run because the Supabase database is not reachable from this environment. The schema is validated (Prisma client generated successfully) but needs to be pushed when database is accessible.

**Workaround:** Run `cd packages/database && npx prisma db push` when network access to Supabase is available.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Schema ready for Phase 7 Plan 2 (admin history view)
- Consultation data will be saved once schema is pushed to production
- API endpoint ready for use

---
*Phase: 07-historial-consultas*
*Completed: 2026-02-01*
