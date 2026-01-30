# External Integrations

**Analysis Date:** 2026-01-30

## APIs & External Services

### Payment Gateway

**Stripe (installed but not integrated):**
- SDKs: `@stripe/react-stripe-js`, `@stripe/stripe-js`
- Auth: `VITE_STRIPE_PUBLIC_KEY`
- Status: Dependencies installed but **no active integration found** in codebase
- Payment is currently handled via simple order creation without actual payment processing
- Files: `api/src/services/paymentService.js` returns mock data

**Current Payment Flow:**
- Orders created directly via `POST /api/orders/checkout`
- No actual payment gateway integration
- Payment method stored as string ("credito", "debito", "transferencia")

### Image Storage

**Cloudinary:**
- SDK: `cloudinary` v2.5.1
- Config: `api/cloudinaryConfig.js`
- Auth env vars:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
- Upload helper: `api/src/helpers/cloudinaryHelper.js`
- Upload route: `api/src/routes/uploadRoute.js`
- Used for: Product images upload and management
- Features: Upload via buffer stream, delete by public_id

### Authentication Service

**Appwrite (installed but not used):**
- SDK: `appwrite` v17.0.0
- Status: Listed in dependencies but **no imports found**
- Authentication is custom JWT-based, not using Appwrite

## Data Storage

### Databases

**PostgreSQL (Supabase-hosted):**
- Client: `pg` (node-postgres) v8.13.1
- Connection: Pool-based with SSL
- Connection config: `api/src/config/db.js`
- Auth env vars:
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
  - `DB_SCHEMA` (set to "pancomido")
  - `DATABASE_URL` (pooler connection)
  - `DIRECT_URL` (direct connection for migrations)
- ORM: None - raw SQL queries throughout
- Pooler: PgBouncer via Supabase

**Schema:** `pancomido`
- Tables detected: `users`, `orders`, `order_detail`, `products`, `stock`, `order_status`, `addresses`

### File Storage

- **Cloudinary** for product images (see above)
- No local filesystem storage for user uploads

### Caching

- None detected

## Authentication & Identity

**Auth Provider:** Custom JWT implementation

**Implementation:**
- Password hashing: `bcrypt` with 10 rounds
- Token generation: `jsonwebtoken` with 1hr expiry
- Token storage (frontend): localStorage with CryptoJS AES encryption
- Session storage key: `USER_SESSION`
- Token storage key: `USER_TOKEN`

**Auth Flow:**
1. Registration: `POST /api/auth/register` → creates user, returns user data
2. Login: `POST /api/auth/login` → validates credentials, returns JWT token
3. Token validation: `Authorization: Bearer <token>` header
4. Role-based access: `admin`, `customer`, `developer` roles in JWT payload

**Key Files:**
- Token generation: `api/src/models/Auth.js`
- Token validation middleware: `api/src/middlewares/validateToken.js`
- Admin check middleware: `api/src/middlewares/isAdmin.js`
- Frontend auth context: `src/context/AuthProvider.jsx`
- Auth hook: `src/hooks/useAuth.jsx`

## Monitoring & Observability

**Error Tracking:**
- None - errors logged to console only

**Logs:**
- `morgan` middleware for HTTP request logging (dev mode)
- `console.error` for error logging

**Metrics:**
- None

## CI/CD & Deployment

**Hosting:**
- Vercel (fullstack deployment)
- Config: `vercel.json`

**Build Configuration:**
- Frontend: Static build to `dist/` via `@vercel/static-build`
- Backend: Serverless function via `@vercel/node` at `api/index.js`

**Routes:**
- `/api/*` → Serverless API function
- `/*` → SPA (index.html)

**CI Pipeline:**
- None detected (no GitHub Actions, CircleCI, etc.)

**Live URL:**
- https://pancomido-seven.vercel.app/

## Environment Configuration

**Required env vars (Frontend - .env.local):**
```
VITE_API_URL=<api base url>
VITE_STRIPE_PUBLIC_KEY=<stripe publishable key>
VITE_CRYPTOJS_SECRET=<encryption secret>
```

**Required env vars (Backend - .env):**
```
# Server
PORT=3000
NODE_ENV=development|production

# Database
DB_HOST=<host>
DB_PORT=<port>
DB_USER=<user>
DB_PASSWORD=<password>
DB_NAME=<database>
DB_SCHEMA=pancomido
DATABASE_URL=<pooler url>
DIRECT_URL=<direct url>

# Auth
JWT_SECRET=<secret>

# Cloudinary
CLOUDINARY_CLOUD_NAME=<name>
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>
```

**Secrets location:**
- Environment variables (not committed)
- `.env.local` contains some dev credentials (should not be committed)

## API Endpoints

**Base URL:** `/api`

**Auth:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

**Products:**
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product

**Orders:**
- `GET /api/orders` - User's orders
- `POST /api/orders/checkout` - Create order (with stock validation)

**User:**
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

**Address:**
- `GET /api/address` - User's addresses
- `POST /api/address` - Create address

**Admin:**
- `GET /api/admin/orders/pending` - Pending orders
- `GET /api/admin/orders/history` - Order history
- Catalog management endpoints

**Upload:**
- `POST /api/upload` - Upload image to Cloudinary
- `DELETE /api/upload` - Delete image from Cloudinary

**Documentation:**
- `GET /api-docs` - Swagger UI

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

## Integration Notes

1. **Stripe is not integrated** - Dependencies installed but payment flow uses simple order creation without actual payment processing

2. **Appwrite is not used** - Dependency exists but no code references it; auth is fully custom

3. **Database uses raw SQL** - No ORM, all queries are string templates with parameterized values

4. **Cloudinary is the only active third-party integration** - Used for product image management

---

*Integration audit: 2026-01-30*
