# Codebase Structure

**Analysis Date:** 2026-01-30

## Directory Layout

```
lapancomido/
├── api/                    # Backend Express API
│   ├── index.js            # Server entry point
│   ├── package.json        # Backend dependencies
│   ├── cloudinaryConfig.js # Cloudinary SDK config
│   ├── src/
│   │   ├── server.js       # Express app setup
│   │   ├── config/
│   │   │   └── db.js       # PostgreSQL connection pool
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Database query functions
│   │   ├── routes/         # Express route definitions
│   │   ├── middlewares/    # Auth and validation middleware
│   │   ├── helpers/        # Utility functions
│   │   ├── services/       # External service integrations
│   │   └── docs/           # Swagger documentation
│   └── tests/              # Backend tests (Jest)
├── src/                    # Frontend React SPA
│   ├── main.jsx            # React entry point
│   ├── App.jsx             # Root component with providers
│   ├── App.css             # Global styles
│   ├── index.css           # Base CSS
│   ├── context/            # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── components/         # Reusable UI components
│   │   ├── admin/          # Admin-specific components
│   │   └── customer/       # Customer profile components
│   ├── pages/              # Page-level components
│   ├── layouts/            # Layout wrapper components
│   ├── router/             # React Router configuration
│   ├── guard/              # Route protection components
│   ├── helpers/            # Utility/API functions
│   ├── data/               # Static JSON data files
│   └── assets/             # Images and videos
├── public/                 # Static assets served directly
├── dist/                   # Production build output
├── index.html              # HTML entry point for Vite
├── package.json            # Frontend dependencies
├── vite.config.js          # Vite bundler config
├── eslint.config.js        # ESLint configuration
├── vercel.json             # Vercel deployment config
└── .planning/              # Project planning documents
```

## Directory Purposes

**`api/`:**
- Purpose: Complete Express.js REST API backend
- Contains: Server setup, routes, controllers, models, middleware
- Key files: `index.js` (entry), `src/server.js` (Express app)

**`api/src/controllers/`:**
- Purpose: HTTP request handlers with business logic
- Contains: One controller file per feature domain
- Key files: `auth.controller.js`, `product.controller.js`, `order.controller.js`

**`api/src/models/`:**
- Purpose: Database access functions with raw SQL queries
- Contains: Model files exporting query functions
- Key files: `User.js`, `Product.js`, `Auth.js`, `Address.js`, `Favorites.js`

**`api/src/routes/`:**
- Purpose: Express route definitions with Swagger JSDoc
- Contains: Route files per feature, main aggregator
- Key files: `routes.js` (aggregator), `auth.routes.js`, `admin.routes.js`

**`api/src/middlewares/`:**
- Purpose: Request preprocessing middleware
- Contains: Authentication and authorization checks
- Key files: `validateToken.js`, `isAdmin.js`, `validateCredentials.js`

**`src/context/`:**
- Purpose: React Context providers for global state
- Contains: Provider components wrapping children
- Key files: `AuthProvider.jsx`, `CartProvider.jsx`, `ProductProvider.jsx`

**`src/hooks/`:**
- Purpose: Custom React hooks encapsulating logic
- Contains: Hooks consuming context and exposing methods
- Key files: `useAuth.jsx`, `useCart.jsx`, `useProducts.jsx`

**`src/components/`:**
- Purpose: Reusable UI components
- Contains: Shared components, organized by domain
- Key files: `Header.jsx`, `Footer.jsx`, `SearchBar.jsx`, `Categories.jsx`

**`src/components/admin/`:**
- Purpose: Admin dashboard components
- Contains: Admin-only UI for managing store
- Key files: `EditarCatalogo.jsx`, `PedidosPendientes.jsx`, `EditarUsuarios.jsx`

**`src/components/customer/`:**
- Purpose: Customer profile components
- Contains: Profile subsections for authenticated users
- Key files: `MisDatos.jsx`, `MisDirecciones.jsx`, `MisPedidos.jsx`, `MisFavoritos.jsx`

**`src/pages/`:**
- Purpose: Page-level components (route targets)
- Contains: Full page components rendered by router
- Key files: `HomePage.jsx`, `CatalogPage.jsx`, `ProductPage.jsx`, `CheckoutPage.jsx`

**`src/layouts/`:**
- Purpose: Page layout wrappers with shared structure
- Contains: Layout components with Header/Footer + Outlet
- Key files: `MainLayout.jsx`, `AuthLayout.jsx`, `AdminLayout.jsx`

**`src/helpers/`:**
- Purpose: Utility functions and API wrappers
- Contains: API clients, formatters, validators
- Key files: `api.jsx`, `getProductData.helper.js`, `formatPrice.helper.js`

**`src/data/`:**
- Purpose: Static JSON data for UI content
- Contains: Slides, images, promotions, test data
- Key files: `slides.json`, `images.json`, `promo.json`, `statusOptions.json`

## Key File Locations

**Entry Points:**
- `src/main.jsx`: Frontend React entry, renders App
- `api/index.js`: Backend server entry, starts Express
- `index.html`: HTML template for Vite SPA

**Configuration:**
- `package.json`: Frontend dependencies (React, Vite, Tailwind)
- `api/package.json`: Backend dependencies (Express, pg, JWT)
- `vite.config.js`: Vite bundler configuration
- `eslint.config.js`: ESLint rules for frontend
- `vercel.json`: Deployment configuration
- `api/src/config/db.js`: PostgreSQL connection pool

**Core Logic:**
- `src/App.jsx`: Provider hierarchy and router mount
- `src/router/RouterManager.jsx`: All route definitions
- `api/src/server.js`: Express app with middleware chain
- `api/src/routes/routes.js`: API route aggregation

**Authentication:**
- `src/context/AuthProvider.jsx`: Session state management
- `src/guard/AuthGuard.jsx`: Protected route wrapper
- `api/src/controllers/auth.controller.js`: Login/register handlers
- `api/src/models/Auth.js`: JWT token generation/verification
- `api/src/middlewares/validateToken.js`: Token validation middleware

**Testing:**
- `api/tests/`: Backend Jest tests (placeholder)

## Naming Conventions

**Files:**
- React components: `PascalCase.jsx` (e.g., `HomePage.jsx`, `AuthGuard.jsx`)
- Backend files: `camelCase.js` or `domain.type.js` (e.g., `auth.controller.js`, `User.js`)
- Helpers: `camelCase.helper.js` (e.g., `formatPrice.helper.js`)
- Routes: `domain.routes.js` (e.g., `auth.routes.js`, `product.routes.js`)
- Config: `camelCase.js` (e.g., `db.js`, `cloudinaryConfig.js`)

**Directories:**
- Lowercase, plural for collections: `components/`, `pages/`, `hooks/`, `controllers/`
- Feature subdirectories: `components/admin/`, `components/customer/`

**Exports:**
- React components: Named exports (`export const HomePage = ...`)
- Backend modules: CommonJS (`module.exports = { ... }`)
- Models: Export object with named functions

## Where to Add New Code

**New Page:**
- Primary code: `src/pages/NewPage.jsx`
- Add route: `src/router/RouterManager.jsx`
- Use layout: Wrap with `MainLayout`, `AuthLayout`, or `AdminLayout`

**New Component:**
- Shared: `src/components/ComponentName.jsx`
- Admin-only: `src/components/admin/ComponentName.jsx`
- Customer-only: `src/components/customer/ComponentName.jsx`

**New API Endpoint:**
- Route: `api/src/routes/domain.routes.js` (add to existing or create new)
- Controller: `api/src/controllers/domain.controller.js`
- Model (if DB): `api/src/models/Domain.js`
- Register route: `api/src/routes/routes.js` (if new route file)

**New Custom Hook:**
- Location: `src/hooks/useHookName.jsx`
- Pattern: Consume context or encapsulate stateful logic

**New Context Provider:**
- Provider: `src/context/DomainProvider.jsx`
- Hook: `src/hooks/useDomain.jsx`
- Mount: Wrap in `src/App.jsx` provider hierarchy

**New Middleware:**
- Location: `api/src/middlewares/middlewareName.js`
- Apply: Add to route chain in `api/src/routes/*.routes.js`

**Utilities:**
- Frontend: `src/helpers/functionName.helper.js`
- Backend: `api/src/helpers/helperName.js`

**Static Assets:**
- Images: `src/assets/images/`
- Videos: `src/assets/videos/`
- JSON data: `src/data/`

## Special Directories

**`dist/`:**
- Purpose: Production build output from `vite build`
- Generated: Yes
- Committed: No (should be in .gitignore)

**`node_modules/`:**
- Purpose: NPM dependencies (frontend and backend have separate)
- Generated: Yes (`npm install`)
- Committed: No

**`public/`:**
- Purpose: Static files served as-is (favicon, robots.txt)
- Generated: No
- Committed: Yes

**`.planning/`:**
- Purpose: Project planning and documentation
- Generated: No (created manually or by tooling)
- Committed: Yes

**`api/tests/`:**
- Purpose: Backend test files for Jest
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-01-30*
