---
phase: 05-autenticacion-otp
plan: 01
status: complete
duration: ~8 min
---

# Plan 05-01 Summary: DB Schema + Seed + Setup Flow

## What Was Built

### Task 1: Prisma Schema Updates
- Added 3 new models to `packages/database/prisma/schema.prisma`:
  - **users**: id, username (unique), email (unique), passwordHash, tempPassword, role, passwordSetupRequired, otpAttempts, otpBlockedUntil, timestamps, relations
  - **otp_tokens**: id, userId, hashedCode, purpose, expiresAt, used, createdAt, relation to users, index on [userId, used, expiresAt]
  - **trusted_devices**: id, userId, deviceToken (unique), userAgent, ipAddress, expiresAt, lastUsedAt, createdAt, relation to users, index on [userId, deviceToken]
- Prisma client generated successfully

### Task 2: Seed Script with Admin Users
- Updated `packages/database/prisma/seed.js` to include admin user seeding
- Creates 2 users on seed:
  - **dev**: role=developer, tempPassword=dev2026!Temp
  - **admin**: role=admin, tempPassword=admin2026!Temp
- Uses bcrypt for password hashing
- Uses upsert to avoid duplicates

### Task 3: Auth Controller + Validation + Routes
- Created `apps/api/src/utils/validation.js`:
  - `validatePassword()`: 8+ chars, 1 number, 1 uppercase, 1 lowercase, 1 special char
  - `validateEmail()`: basic email format validation

- Created `apps/api/src/controllers/auth.controller.js` with 4 endpoints:
  - `POST /auth/login`: Validates username+password, returns `{setupRequired: true}` for first-time users
  - `POST /auth/initiate-setup`: Validates email, generates 8-digit OTP (5 min expiry), logs to console (email in Plan 02)
  - `POST /auth/verify-setup-otp`: Validates OTP with 3 attempts / 15 min block
  - `POST /auth/complete-setup`: Sets new password with policy, clears tempPassword, redirects to login

- Created `apps/api/src/routes/auth.routes.js` with all 4 routes
- Updated `apps/api/src/routes/routes.js` to include auth routes

## Files Modified/Created
- `packages/database/prisma/schema.prisma` (modified)
- `packages/database/prisma/seed.js` (modified)
- `apps/api/src/utils/validation.js` (created)
- `apps/api/src/controllers/auth.controller.js` (created)
- `apps/api/src/routes/auth.routes.js` (created)
- `apps/api/src/routes/routes.js` (modified)

## Verification Results
```
Password validation: 
  - 'Test123!@' -> valid: true
  - 'weak' -> valid: false, errors: [8+ chars, number, uppercase, special]

Controller exports: login, initiateSetup, verifySetupOTP, completeSetup
```

## Notes
- Database push could not run (network issue) - schema is ready, will sync on next connection
- OTP email sending deferred to Plan 05-02 (currently logs to console for dev)
- Device trust logic deferred to Plan 05-02

## What's Next
Plan 05-02 will add:
- OTP email sending via Resend
- Device trust via httpOnly cookies
- Resend cooldown logic
- verifyLoginOTP and resendOTP endpoints
