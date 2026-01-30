# Coding Conventions

**Analysis Date:** 2026-01-30

## Naming Patterns

**Files:**
- Pages: `PascalCase` with `Page` suffix (e.g., `HomePage.jsx`, `CatalogPage.jsx`, `LoginPage.jsx`)
- Components: `PascalCase.jsx` (e.g., `Header.jsx`, `Footer.jsx`, `Categories.jsx`)
- Hooks: `camelCase` with `use` prefix (e.g., `useAuth.jsx`, `useCart.jsx`, `useProducts.jsx`)
- Helpers: `camelCase` with `.helper.js` suffix (e.g., `formatPrice.helper.js`, `validateRut.helper.js`)
- Context Providers: `PascalCase` with `Provider` suffix (e.g., `AuthProvider.jsx`, `CartProvider.jsx`)
- Layouts: `PascalCase` with `Layout` suffix (e.g., `MainLayout.jsx`, `AuthLayout.jsx`)
- Guards: `PascalCase` with `Guard` suffix (e.g., `AuthGuard.jsx`)
- API Routes: `kebab-case` with `.routes.js` suffix (e.g., `auth.routes.js`, `product.routes.js`)
- Controllers: `camelCase` with `.controller.js` suffix (e.g., `auth.controller.js`, `product.controller.js`)
- Models: `PascalCase.js` (e.g., `User.js`, `Product.js`, `Address.js`)

**Functions:**
- React components: `PascalCase` (e.g., `HomePage`, `LoginForm`, `Header`)
- Hooks: `camelCase` with `use` prefix (e.g., `useAuth`, `useCart`)
- Event handlers: `handle` prefix with action (e.g., `handleSubmit`, `handleLogout`, `handleOnChange`)
- API fetch functions: `camelCase` descriptive verbs (e.g., `fetchProducts`, `getCategories`)
- Controller functions: `camelCase` action verbs (e.g., `register`, `login`, `getProducts`, `createProduct`)

**Variables:**
- State variables: `camelCase` (e.g., `session`, `isLoading`, `products`)
- Boolean state: `is` or `has` prefix (e.g., `isLoading`, `isModalOpen`, `isAvailable`)
- Constants from env: `SCREAMING_SNAKE_CASE` (e.g., `VITE_API_URL`, `VITE_CRYPTOJS_SECRET`)

**Types:**
- Not applicable (JavaScript project, no TypeScript)

## Code Style

**Formatting:**
- No Prettier config detected - relies on ESLint and editor defaults
- Indentation: 2 spaces
- Semicolons: Required (used consistently)
- Quotes: Double quotes for strings in JSX and imports

**Linting:**
- ESLint 9.x with flat config (`eslint.config.js`)
- Plugins: `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- Key rules:
  - React recommended rules enabled
  - React Hooks recommended rules enabled
  - `react/jsx-no-target-blank`: off
  - `react-refresh/only-export-components`: warn (allows constant exports)
- ECMAScript version: 2020+, ES modules
- Browser globals enabled

## Import Organization

**Order:**
1. React imports (`import { useState, useEffect } from "react"`)
2. External library imports (react-router-dom, antd, framer-motion)
3. Local context/hooks imports
4. Local components imports
5. Local helpers imports
6. Assets/data imports (images, JSON files)
7. CSS imports

**Path Aliases:**
- No path aliases configured - uses relative paths (`../`, `./`)
- Common patterns:
  - `../hooks/useAuth` from components
  - `../helpers/showUniqueToast.helper` from pages
  - `../context/AuthProvider` from hooks

## Error Handling

**Frontend Patterns:**
- Try-catch in async functions with user-facing toast notifications
- Use `showUniqueToast.error(message)` from `src/helpers/showUniqueToast.helper.js`
- Display loading state during async operations
- Pattern example:
```javascript
try {
  const response = await fetch(...);
  if (!response.ok) {
    throw new Error("Descriptive error message");
  }
  // success handling
  showUniqueToast.success("Success message", { position: "bottom-right" });
} catch (err) {
  console.error("Context:", err.message);
  showUniqueToast.error(err.message, { position: "bottom-right" });
} finally {
  setLoading(false);
}
```

**Backend Patterns:**
- Express middleware error handling with `next(err)`
- Return HTTP status codes with JSON error objects: `{ error: "message" }`
- Status codes used:
  - 400: Bad request / missing fields
  - 401: Unauthorized / invalid credentials
  - 404: Resource not found
  - 500: Server error (caught by global middleware)
- Pattern example:
```javascript
const handler = async (req, res, next) => {
  try {
    // logic
    res.json(result);
  } catch (err) {
    next(err);
  }
};
```

## Logging

**Framework:** `console` for frontend, `morgan` for backend HTTP logging

**Patterns:**
- Frontend: `console.error` for errors, commented debug logs
- Backend: Morgan 'dev' format for request logging
- Error logging uses `console.error(err.stack)` in global error middleware
- Debug logs are commented out in production code

## Comments

**When to Comment:**
- File header comment with path (e.g., `// src/components/Header.jsx`)
- Spanish language comments explaining business logic
- Commented-out debug code preserved for troubleshooting
- Swagger/JSDoc for API documentation in route files

**JSDoc/TSDoc:**
- Swagger annotations in route files for API documentation (`@swagger`)
- No JSDoc on functions - code is self-documenting

## Function Design

**Size:**
- Components can be large (100-500+ lines) when containing UI and logic
- Extract complex logic into custom hooks
- Controller functions: focused single responsibility (20-60 lines typically)

**Parameters:**
- Destructure props in function signature: `({ children, isAllow, redirectTo = "/auth/login" })`
- Use default values inline
- Event handlers receive standard event objects

**Return Values:**
- React components return JSX
- API handlers use `res.json()` or `res.status(code).json()`
- Hooks return object with named values: `{ session, isLoading, handleSession, logout }`

## Module Design

**Exports:**
- Named exports for components: `export const Header = () => {...}`
- Default exports for some components (inconsistent): `export default EditarCatalogo`
- CommonJS in backend: `module.exports = { function1, function2 }`
- ES modules in frontend: `export const functionName = ...`

**Barrel Files:**
- Not used - direct imports to specific files

## State Management

**Pattern:** React Context + Custom Hooks

**Structure:**
1. Create context: `export const AuthContext = createContext()`
2. Create provider component with state: `AuthProvider`
3. Create custom hook for consuming: `useAuth()`
4. Wrap app in provider hierarchy in `App.jsx`

**Example:**
```javascript
// Context file
export const CartContext = createContext();
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  return (
    <CartContext.Provider value={{ cart, setCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Hook file
export const useCart = () => {
  const { cart, setCart } = useContext(CartContext);
  // ... methods
  return { cart, addToCart, removeFromCart, clearCart };
};
```

## API Communication

**Frontend to Backend:**
- Use `fetch` API directly (no axios)
- API base URL from `import.meta.env.VITE_API_URL`
- Include `Authorization: Bearer ${token}` header for authenticated requests
- Content-Type: `application/json`
- Helper wrapper available at `src/helpers/api.jsx` (not widely used)

**Pattern:**
```javascript
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/endpoint`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.token}`,
  },
  body: JSON.stringify(payload),
});
```

---

*Convention analysis: 2026-01-30*
