---
phase: 05-autenticacion-otp
plan: 03
status: complete
duration: ~12 min
---

# Plan 05-03 Summary: Turnstile + Login UI + Settings Page

## What Was Built

### Task 1: API Middlewares

**isDeveloper.js** (`apps/api/src/middlewares/isDeveloper.js`)
- Middleware that checks `req.user.role === "developer"`
- Returns 403 if not developer role
- For future developer-only features (feature toggles, diagnostics)

**verifyTurnstile.js** (`apps/api/src/middlewares/verifyTurnstile.js`)
- Validates Cloudflare Turnstile token on login
- Skips verification if `TURNSTILE_SECRET_KEY` not configured (dev mode)
- Calls Cloudflare siteverify API
- Graceful fallthrough on API errors

**Updated auth.routes.js**
- Added `verifyTurnstile` middleware to `/login` route

### Task 2: Admin Frontend Auth System

**API Client** (`apps/admin/src/api/auth.js`)
- 7 functions: login, initiateSetup, verifySetupOTP, completeSetup, verifyLoginOTP, resendOTP, logoutAll
- Uses `credentials: 'include'` for cookies
- Configurable API_URL via `VITE_API_URL`

**Auth Context** (`apps/admin/src/context/AuthContext.jsx`)
- `AuthProvider` component wraps app
- `useAuth()` hook provides: user, token, loading, isAuthenticated, isDeveloper, isAdmin, saveAuth, logout
- JWT payload parsing with expiry check
- Token persistence in localStorage

**Login Page** (`apps/admin/src/pages/LoginPage.jsx`)
- Multi-step flow: login → setup-email → setup-otp → setup-password | login-otp
- Turnstile integration with `@marsidev/react-turnstile`
- OTP input with 8-digit validation, numeric-only
- "Confiar en este dispositivo por 30 días" checkbox
- Resend with cooldown timer
- Inline error/success messages
- Mobile-first with brand colors (#F5E1A4, #262011)
- ~350 lines, handles all auth flows

**Settings Page** (`apps/admin/src/pages/SettingsPage.jsx`)
- Shows user info (username, email, role)
- "Cerrar todas las sesiones" button with confirmation
- Auto-logout after 2 seconds on success

**Main App** (`apps/admin/src/main.jsx`)
- AuthProvider wrapper
- Conditional render: LoginPage if not authenticated, Dashboard/Settings if authenticated
- Navigation tabs: Dashboard, Configuración
- Developer role indicator
- Mobile-responsive header

### Task 3: Styling & Dependencies
- Created `apps/admin/src/index.css` with Tailwind import
- Installed `@marsidev/react-turnstile`
- Admin app builds successfully (165KB JS, 13KB CSS)

## Files Created/Modified

**API (3 files):**
- `apps/api/src/middlewares/isDeveloper.js` (created)
- `apps/api/src/middlewares/verifyTurnstile.js` (created)
- `apps/api/src/routes/auth.routes.js` (modified)

**Admin Frontend (6 files):**
- `apps/admin/src/api/auth.js` (created)
- `apps/admin/src/context/AuthContext.jsx` (created)
- `apps/admin/src/pages/LoginPage.jsx` (created)
- `apps/admin/src/pages/SettingsPage.jsx` (created)
- `apps/admin/src/main.jsx` (modified)
- `apps/admin/src/index.css` (created)
- `apps/admin/package.json` (modified)

## Environment Variables

**API (.env):**
- `TURNSTILE_SECRET_KEY` - Cloudflare Turnstile secret (optional for dev)

**Admin (.env):**
- `VITE_API_URL` - API base URL (default: http://localhost:3000)
- `VITE_TURNSTILE_SITE_KEY` - Cloudflare Turnstile site key (optional for dev)

## Verification

```bash
# Admin build
npm run build → 165KB JS, 13KB CSS, 282ms

# isDeveloper middleware
typeof isDeveloper → function
```

## Auth Flow Summary

### First-time Login:
1. Login (user+pass+turnstile) → `{setupRequired: true}`
2. Enter email → OTP sent, get `setupToken`
3. Enter OTP → get `passwordSetupToken`
4. Set new password → redirected to login

### Returning User (new device):
1. Login → `{otpRequired: true, otpPendingToken}`
2. Enter OTP + check "trust device" → logged in, cookie set

### Returning User (trusted device):
1. Login → `{success: true, token}` immediately

## What's Next

Phase 5 is complete! Next:
- Phase 6: Admin Panel (product management CRUD)
- Vercel deployment of api.lapancomido.cl and admin.lapancomido.cl
