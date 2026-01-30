# Codebase Concerns

**Analysis Date:** 2026-01-30

## Tech Debt

**Duplicate Helper Files:**
- Issue: Two versions of cloudinaryUpload helper exist with same logic
- Files: `src/helpers/cloudinaryUpload.js`, `src/helpers/cloudinaryUpload.jsx`
- Impact: Confusion about which to use, potential divergence in logic
- Fix approach: Remove duplicate, consolidate into single file

**Inconsistent File Extensions:**
- Issue: Helper files use mix of `.js` and `.jsx` extensions even when not containing JSX
- Files: `src/helpers/*.js`, `src/helpers/*.jsx`
- Impact: Inconsistent codebase, unclear when to use which extension
- Fix approach: Standardize - use `.js` for non-JSX, `.jsx` only for React components

**Stub Payment Service:**
- Issue: Payment service returns hardcoded fake payment data, not connected to real payment processor
- Files: `api/src/services/paymentService.js`
- Impact: No real payment processing despite Stripe dependencies in package.json
- Fix approach: Implement actual Stripe integration or remove stub

**Cart State Not Persisted:**
- Issue: Cart is stored only in React state (CartProvider), not synced to localStorage or backend
- Files: `src/context/CartProvider.jsx`, `src/hooks/useCart.jsx`
- Impact: Cart contents lost on page refresh or browser close
- Fix approach: Add localStorage persistence or sync cart to backend for logged-in users

**Large Monolithic Components:**
- Issue: Several admin components exceed 500 lines with mixed concerns
- Files: `src/components/admin/EditarCatalogo.jsx` (558 lines), `src/components/admin/PedidosHistoricos.jsx` (552 lines), `src/components/admin/PedidosPendientes.jsx` (529 lines)
- Impact: Difficult to maintain, test, and understand
- Fix approach: Extract into smaller focused components, separate UI from business logic

**Console Statements in Production Code:**
- Issue: 68+ console.log/error/warn calls throughout codebase
- Files: Multiple files across `src/` and `api/src/`
- Impact: Noise in browser console, potential information leakage
- Fix approach: Implement proper logging service, remove debug statements, or use environment-conditional logging

**Commented Debug Code:**
- Issue: Multiple blocks of commented-out debug code left in source
- Files: `api/src/server.js`, `api/src/controllers/auth.controller.js`, `src/hooks/useFavorites.jsx`, `src/components/LoginForm.jsx`
- Impact: Code clutter, unclear if needed or obsolete
- Fix approach: Remove commented code; use version control for history

## Known Bugs

**ForgotPasswordPage Non-Functional:**
- Symptoms: Password reset flow appears incomplete
- Files: `src/pages/ForgotPasswordPage.jsx`
- Trigger: Click "Forgot Password" link
- Workaround: No backend endpoint implemented for `/api/auth/reset-password/request`

**Session Token Storage Inconsistency:**
- Symptoms: Two different localStorage keys used for token storage
- Files: `src/helpers/api.jsx` (uses `USER_TOKEN`), `src/context/AuthProvider.jsx` (uses `USER_SESSION`)
- Trigger: Making API calls through `src/helpers/api.jsx`
- Workaround: The api.jsx helper may not find the token, breaking authenticated requests

## Security Considerations

**No Rate Limiting:**
- Risk: API endpoints vulnerable to brute force attacks, DoS
- Files: `api/src/server.js` (no rate limiting middleware)
- Current mitigation: None
- Recommendations: Add express-rate-limit middleware, especially on auth endpoints

**No Input Sanitization:**
- Risk: XSS attacks possible if user input rendered without sanitization
- Files: All API controllers accept user input directly (e.g., `api/src/controllers/auth.controller.js`, `api/src/controllers/address.controller.js`)
- Current mitigation: Parameterized SQL queries protect against SQL injection
- Recommendations: Add input validation library (joi, zod), sanitize HTML content

**No CSRF Protection:**
- Risk: Cross-site request forgery attacks possible
- Files: `api/src/server.js` (no CSRF middleware)
- Current mitigation: JWT in Authorization header provides some protection
- Recommendations: Add CSRF tokens for state-changing operations

**CORS Wide Open:**
- Risk: Any origin can make requests to API
- Files: `api/src/server.js` - `app.use(cors())` with no configuration
- Current mitigation: None
- Recommendations: Configure allowed origins based on environment

**SSL Certificate Validation Disabled:**
- Risk: Man-in-the-middle attacks possible on database connection
- Files: `api/src/config/db.js` - `ssl: { rejectUnauthorized: false }`
- Current mitigation: None
- Recommendations: Use proper SSL certificates in production

**JWT Secret in Environment:**
- Risk: If secret is weak or leaked, all tokens compromised
- Files: `api/src/models/Auth.js`, `api/src/middlewares/validateToken.js`
- Current mitigation: Using environment variable (JWT_SECRET)
- Recommendations: Ensure strong secret, rotate periodically, consider asymmetric keys

**Client-Side Encryption Secret Exposed:**
- Risk: VITE_CRYPTOJS_SECRET is bundled into client-side code
- Files: `src/hooks/useEncrypt.jsx`, `src/context/AuthProvider.jsx`
- Current mitigation: Session data encrypted in localStorage
- Recommendations: Consider if client-side encryption adds real security; sensitive data should stay server-side

**No Missing .gitignore at Root:**
- Risk: Sensitive files (`.env`, credentials) could be committed
- Files: Root directory (no `.gitignore` found)
- Current mitigation: `.env` files exist but may not be ignored
- Recommendations: Add comprehensive `.gitignore` for node_modules, .env files, build artifacts

## Performance Bottlenecks

**N+1 Query Pattern in Favorites:**
- Problem: Each favorite product fetched individually in loop
- Files: `src/hooks/useFavorites.jsx` (lines 28-72)
- Cause: Sequential API calls for each favorite item
- Improvement path: Create batch endpoint to fetch multiple products by IDs

**N+1 Query Pattern in Orders:**
- Problem: Product details fetched individually for each order item
- Files: `src/components/customer/MisPedidos.jsx`, `src/components/admin/PedidosPendientes.jsx`, `src/components/admin/PedidosHistoricos.jsx`
- Cause: Frontend loops making individual product detail requests
- Improvement path: Include product details in order response from backend

**No Pagination:**
- Problem: All products/orders loaded at once
- Files: `api/src/controllers/product.controller.js`, `api/src/controllers/order.controller.js`
- Cause: Queries return all matching records
- Improvement path: Add LIMIT/OFFSET pagination with cursor-based option for large datasets

**Complex Admin Product Query:**
- Problem: Heavy query with multiple subqueries and aggregations
- Files: `api/src/controllers/adminProducts.controller.js` (getAdminProducts)
- Cause: Joining multiple tables with array aggregation
- Improvement path: Consider caching, materialized views, or denormalization

## Fragile Areas

**Auth Provider Session Restoration:**
- Files: `src/context/AuthProvider.jsx`
- Why fragile: Synchronous localStorage read on mount, JWT decoded client-side, expired tokens detected client-side only
- Safe modification: Test token expiration edge cases thoroughly
- Test coverage: No tests for auth flow

**Order Checkout Transaction:**
- Files: `api/src/controllers/order.controller.js` (confirmPurchase)
- Why fragile: Complex transaction with stock locks, multiple inserts; rollback on any failure
- Safe modification: Test with concurrent orders, edge cases on stock
- Test coverage: Not covered by existing tests

**Role-Based Access Control:**
- Files: `api/src/middlewares/isAdmin.js`, `api/src/middlewares/validateToken.js`
- Why fragile: Role derived from JWT payload, not re-verified against database
- Safe modification: If role changes, user must re-login to get new token
- Test coverage: No middleware tests

**Product Image Upload Flow:**
- Files: `src/hooks/useProductImages.jsx`, `api/src/routes/uploadRoute.js`, `api/src/controllers/adminProducts.controller.js`
- Why fragile: Multi-step process: upload to Cloudinary, save to DB, handle reordering
- Safe modification: Test image CRUD operations thoroughly
- Test coverage: None

## Scaling Limits

**Database Connection Pool:**
- Current capacity: Default pg pool settings (10 connections)
- Limit: Under high load, connection pool exhausted
- Scaling path: Configure pool size, consider connection pooler (PgBouncer)

**In-Memory Cart:**
- Current capacity: Works for single user session
- Limit: Cart lost on refresh, no multi-device sync
- Scaling path: Backend cart storage with user association

**Cloudinary Image Storage:**
- Current capacity: Depends on Cloudinary plan
- Limit: Storage and bandwidth limits per plan
- Scaling path: Monitor usage, upgrade plan, or implement image optimization

## Dependencies at Risk

**appwrite Dependency Unused:**
- Risk: Unnecessary dependency bloat
- Files: `package.json` lists appwrite@17.0.0 but no usage found in codebase
- Impact: Larger bundle size, potential security surface
- Migration plan: Remove if unused

**swagger Package Deprecated:**
- Risk: swagger@0.7.5 is very old (2014)
- Files: `api/package.json`
- Impact: May have unpatched vulnerabilities
- Migration plan: Use only swagger-jsdoc and swagger-ui-express (already present)

**Jest in Production Dependencies:**
- Risk: Test framework included in production dependencies
- Files: `api/package.json` - jest listed under dependencies, not devDependencies
- Impact: Larger production bundle
- Migration plan: Move jest to devDependencies

## Missing Critical Features

**Email Notifications:**
- Problem: No email system for order confirmations, password reset
- Blocks: Password reset functionality, order status notifications

**Payment Processing:**
- Problem: Stripe SDK installed but not integrated
- Blocks: Real e-commerce transactions; currently placeholder only

**Error Monitoring:**
- Problem: No error tracking service (Sentry, etc.)
- Blocks: Visibility into production errors

## Test Coverage Gaps

**Frontend Tests - None:**
- What's not tested: All React components, hooks, pages
- Files: Entire `src/` directory
- Risk: UI regressions go unnoticed
- Priority: High

**API Integration Tests - Minimal:**
- What's not tested: Most endpoints; only auth register tested
- Files: `api/tests/server.test.js` contains only 2 tests
- Risk: API changes can break silently
- Priority: High

**Authentication Flow:**
- What's not tested: Login, token validation, role checks
- Files: `api/src/controllers/auth.controller.js`, `api/src/middlewares/validateToken.js`, `api/src/middlewares/isAdmin.js`
- Risk: Security regressions possible
- Priority: Critical

**Order Processing:**
- What's not tested: Checkout, stock management, order status updates
- Files: `api/src/controllers/order.controller.js`
- Risk: Financial/inventory errors possible
- Priority: Critical

**Data Models:**
- What's not tested: User, Product, Address, Favorites models
- Files: `api/src/models/*.js`
- Risk: Data integrity issues
- Priority: Medium

---

*Concerns audit: 2026-01-30*
