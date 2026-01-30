# Technology Stack

**Analysis Date:** 2026-01-30

## Languages

**Primary:**
- JavaScript (ES2020+) - Frontend React SPA and Backend Node.js API

**Secondary:**
- SQL - PostgreSQL database queries (raw SQL, no ORM)

## Runtime

**Environment:**
- Node.js (not pinned, no .nvmrc file detected)
- Browser (Vite-served React SPA)

**Package Manager:**
- npm
- Lockfile: present (`package-lock.json` for both frontend and backend)

## Frameworks

**Core:**
- React 18.3.1 - Frontend UI framework
- Express 4.21.2 - Backend API framework
- Vite 6.0.5 - Frontend build tool and dev server

**Testing:**
- Jest 29.7.0 - Backend testing (`api/jest.config.js`)

**Build/Dev:**
- Vite 6.0.5 - Frontend bundler with HMR
- Nodemon 3.1.9 - Backend hot reload in development
- ESLint 9.17.0 - Linting with React plugins

## Key Dependencies

### Frontend (`package.json`)

**UI & Components:**
- `antd` 5.23.3 - Ant Design component library
- `react-icons` 5.4.0 - Icon library
- `swiper` 11.2.2 - Carousel/slider component

**Styling:**
- `tailwindcss` 4.0.1 - Utility-first CSS framework
- `@tailwindcss/vite` 4.0.1 - Vite plugin for Tailwind CSS 4

**Routing & State:**
- `react-router-dom` 7.1.3 - Client-side routing
- Context API (built-in) - State management

**Animation:**
- `framer-motion` 12.0.6 - Animation library

**Utilities:**
- `crypto-js` 4.2.0 - Client-side encryption (session storage)
- `react-toastify` 11.0.3 - Toast notifications

**Payment (installed but not actively used):**
- `@stripe/react-stripe-js` 3.1.1 - Stripe React components
- `@stripe/stripe-js` 5.6.0 - Stripe JS SDK

**Unused/Dormant:**
- `appwrite` 17.0.0 - Listed in dependencies but no imports found

### Backend (`api/package.json`)

**Core:**
- `express` 4.21.2 - HTTP server framework
- `pg` 8.13.1 - PostgreSQL client (raw SQL)
- `dotenv` 16.4.7 - Environment variables

**Authentication:**
- `bcrypt` 5.1.1 - Password hashing
- `jsonwebtoken` 9.0.2 - JWT token generation/verification

**Media:**
- `cloudinary` 2.5.1 - Image hosting
- `multer` 1.4.5-lts.1 - File upload handling

**Middleware:**
- `cors` 2.8.5 - Cross-origin requests
- `morgan` 1.10.0 - HTTP request logging

**Documentation:**
- `swagger-jsdoc` 6.2.8 - Swagger doc generation
- `swagger-ui-express` 5.0.1 - Swagger UI hosting

## Configuration

**Environment:**
- `.env.local` - Frontend environment (Vite `VITE_*` prefix)
- `.env` (backend, not committed) - Backend environment
- Required env vars:
  - `VITE_API_URL` - API base URL for frontend
  - `VITE_STRIPE_PUBLIC_KEY` - Stripe publishable key
  - `VITE_CRYPTOJS_SECRET` - Encryption secret for session storage
  - `DATABASE_URL` / `DIRECT_URL` - PostgreSQL connection strings
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SCHEMA` - Database config
  - `JWT_SECRET` - JWT signing secret
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - Cloudinary config

**Build:**
- `vite.config.js` - Vite configuration (React plugin, Tailwind CSS plugin)
- `eslint.config.js` - ESLint flat config with React rules
- `vercel.json` - Vercel deployment configuration

**Backend Config:**
- `api/jest.config.js` - Jest test configuration
- `api/src/docs/routes/swaggerConfig.js` - Swagger/OpenAPI configuration

## Scripts

**Frontend:**
```bash
npm start          # vite (dev server)
npm run dev        # vite --open
npm run build      # vite build
npm run lint       # eslint
npm run preview    # vite preview
```

**Backend:**
```bash
cd api
npm run dev        # nodemon index.js
npm start          # node index.js
npm test           # jest --coverage
```

## Platform Requirements

**Development:**
- Node.js (recommend 18+)
- npm
- PostgreSQL database (Supabase hosted)

**Production:**
- Vercel (hosting both frontend and API functions)
- Supabase PostgreSQL (database)
- Cloudinary (image storage)

---

*Stack analysis: 2026-01-30*
