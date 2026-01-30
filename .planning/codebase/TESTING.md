# Testing Patterns

**Analysis Date:** 2026-01-30

## Test Framework

**Runner:**
- Jest 29.7.0
- Config: `api/jest.config.js`

**Assertion Library:**
- Jest built-in (`expect`)

**Run Commands:**
```bash
cd api && npm test         # Run all tests with coverage
cd api && npm run test     # Same as above
```

## Test File Organization

**Location:**
- Separate `tests/` directory in API project: `api/tests/`

**Naming:**
- Pattern: `*.test.js`
- Example: `server.test.js`

**Structure:**
```
api/
├── tests/
│   └── server.test.js    # API endpoint tests
├── jest.config.js        # Jest configuration
└── src/                  # Source code
```

## Test Structure

**Suite Organization:**
```javascript
// tests/server.test.js
const request = require('supertest');
const app = require('../src/server');

describe('POST /api/auth/register', () => {
    it('debería registrar un usuario nuevo', async () => {
        const newUser = {
            name: "Test",
            lastname: "User",
            mail: "testuser@example.com",
            password: "password123"
        };
        const res = await request(app)
            .post('/api/auth/register')
            .send(newUser);
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("id");
    });

    it('debería retornar error si faltan campos obligatorios', async () => {
        const incompleteUser = {
            name: "Test",
            mail: "testuser@example.com",
            password: "password123"
        };
        const res = await request(app)
            .post('/api/auth/register')
            .send(incompleteUser);
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("error");
    });
});
```

**Patterns:**
- Describe blocks group related endpoints
- Test descriptions in Spanish (matching codebase comments)
- Each test is independent
- Use `async/await` for async tests

## Mocking

**Framework:** Jest built-in mocking (not heavily used)

**Patterns:**
- Tests hit actual database (integration tests)
- No mocking detected in current test suite
- Environment loaded via `dotenv/config` in jest setup

**What to Mock (recommendations):**
- External services (Stripe, Cloudinary) - not currently mocked
- Email sending - not currently tested

**What NOT to Mock:**
- Database operations in integration tests

## Fixtures and Factories

**Test Data:**
```javascript
// Inline test data in test files
const newUser = {
    name: "Test",
    lastname: "User",
    mail: "testuser@example.com",
    password: "password123"
};
```

**Location:**
- Test data defined inline within test files
- No separate fixtures directory
- No factory functions detected

## Coverage

**Requirements:** None enforced (no threshold configured)

**View Coverage:**
```bash
cd api && npm test    # Generates coverage in api/coverage/
```

**Configuration:**
```javascript
// api/jest.config.js
module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    setupFiles: ['dotenv/config'],
};
```

## Test Types

**Unit Tests:**
- Not detected - focus is on integration tests

**Integration Tests:**
- API endpoint tests using supertest
- Tests hit actual Express app
- Database interactions included

**E2E Tests:**
- Not implemented
- No Playwright, Cypress, or similar detected

## Common Patterns

**Async Testing:**
```javascript
it('description', async () => {
    const res = await request(app)
        .post('/api/endpoint')
        .send(payload);
    expect(res.statusCode).toEqual(200);
});
```

**Error Testing:**
```javascript
it('debería retornar error si faltan campos obligatorios', async () => {
    const incompleteData = { /* missing required fields */ };
    const res = await request(app)
        .post('/api/endpoint')
        .send(incompleteData);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error");
});
```

## Testing Gaps

**Frontend:**
- No React component tests detected
- No testing library (React Testing Library) installed
- No Vitest or Jest configured for frontend

**Backend:**
- Only one test file exists: `api/tests/server.test.js`
- Limited endpoint coverage
- No mocking of external services (Stripe, Cloudinary)

## Adding New Tests

**Backend API Tests:**
1. Create test file in `api/tests/` with `.test.js` extension
2. Import supertest and app: `const request = require('supertest'); const app = require('../src/server');`
3. Use `describe` blocks to group related tests
4. Use `it` with async functions for each test case
5. Run with `cd api && npm test`

**Recommended Frontend Testing Setup (not yet implemented):**
1. Install: `npm install -D vitest @testing-library/react @testing-library/jest-dom`
2. Add vitest config to `vite.config.js`
3. Create tests as `*.test.jsx` files co-located with components

---

*Testing analysis: 2026-01-30*
