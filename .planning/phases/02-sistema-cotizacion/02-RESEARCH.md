# Phase 2: Sistema de Cotización - Research

**Researched:** 2026-01-30
**Domain:** Product selection, quotation flow, WhatsApp integration
**Confidence:** HIGH

## Summary

This phase builds a public product catalog with selection capabilities and a WhatsApp-based quotation flow. The existing codebase already has a cart system (`CartProvider`, `useCart`), catalog display (`CatalogPage`), and product detail page (`ProductPage`) that can be refactored and extended for the quotation use case. The core technical challenges are: (1) adapting the cart to a "selection" concept with session-only persistence, (2) building a quotation modal with international phone input, and (3) generating correctly formatted WhatsApp `wa.me` links.

The standard approach uses the existing React Context pattern already in place, Ant Design's Modal component (already used extensively), and `react-phone-number-input` for the international phone selector. WhatsApp's Click-to-Chat API is straightforward: `https://wa.me/{phone}?text={encodedMessage}`.

**Primary recommendation:** Adapt existing `CartProvider`/`useCart` to a `SelectionProvider`/`useSelection` for session-based product selection, use Ant Design Modal for quotation flow, and use `react-phone-number-input` for the country code selector.

## Standard Stack

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.x | UI framework | Already in use |
| Ant Design | 5.29.3 | UI components (Modal, Input, Button, Spin, Select) | Already used extensively for modals and forms |
| react-toastify | 11.0.5 | Toast notifications | Already used for user feedback |
| Tailwind CSS | 4.x | Styling | Already used for layout and styling |
| Prisma | - | Database ORM | Already configured |

### New Dependencies
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|-------------|
| react-phone-number-input | 3.4.x | International phone input with country selector | 958+ GitHub stars, includes country flags, returns E.164 format, Chile (+56) support, Spanish locale available |
| libphonenumber-js | (peer dep) | Phone number parsing/validation | Included with react-phone-number-input |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-phone-number-input | react-international-phone | Fewer features, less maintained |
| react-phone-number-input | Custom country select | Hand-rolling is error-prone (240+ countries, calling codes change) |
| Session state in Context | Zustand | Adds dependency; Context is sufficient for this use case |

**Installation:**
```bash
npm install react-phone-number-input
```

## Architecture Patterns

### Recommended Project Structure
```
apps/web/src/
├── context/
│   └── SelectionProvider.jsx    # Product selection state (adapt from CartProvider)
├── hooks/
│   └── useSelection.jsx         # Selection hook (adapt from useCart)
├── components/
│   ├── catalog/
│   │   ├── ProductCard.jsx      # Card with "Agregar" → +/- controls
│   │   ├── ProductDetail.jsx    # Product detail view (modal or page)
│   │   └── CategoryFilter.jsx   # Category/tag filter component
│   ├── selection/
│   │   ├── SelectionBar.jsx     # Sticky bottom bar with selection summary
│   │   ├── SelectionList.jsx    # Expandable list of selected products
│   │   └── QuotationModal.jsx   # Modal with summary, customer form, WhatsApp button
│   └── common/
│       └── QuantityControl.jsx  # Reusable +/- quantity buttons
├── helpers/
│   └── whatsapp.helper.js       # WhatsApp link generation logic
└── pages/
    └── CatalogPage.jsx          # Main catalog page (already exists)
```

### Pattern 1: Selection Context (Adapt from CartProvider)
**What:** Session-based product selection state using React Context
**When to use:** Managing selected products across components without prop drilling
**Example:**
```typescript
// Source: Existing CartProvider pattern + sessionStorage for session persistence
import { createContext, useState, useEffect } from "react";

export const SelectionContext = createContext();

export const SelectionProvider = ({ children }) => {
  const [selection, setSelection] = useState(() => {
    // Initialize from sessionStorage if exists
    const stored = sessionStorage.getItem("PRODUCT_SELECTION");
    return stored ? JSON.parse(stored) : [];
  });

  // Sync to sessionStorage on change
  useEffect(() => {
    sessionStorage.setItem("PRODUCT_SELECTION", JSON.stringify(selection));
  }, [selection]);

  return (
    <SelectionContext.Provider value={{ selection, setSelection }}>
      {children}
    </SelectionContext.Provider>
  );
};
```

### Pattern 2: WhatsApp Link Generation
**What:** Generate properly encoded wa.me links with structured message
**When to use:** Opening WhatsApp with pre-formatted quotation message
**Example:**
```javascript
// Source: WhatsApp Click-to-Chat API (verified via wa.me)
export const generateWhatsAppLink = (
  phoneNumber,      // E.164 format: "+56912345678"
  customerName,
  customerPhone,
  products,         // Array of { name, quantity, unit, packSize, unitPrice }
  greeting,         // Configurable from admin
  showPrices,       // From admin config
  comment           // Optional customer comment
) => {
  // Remove + from phone for wa.me URL
  const cleanPhone = phoneNumber.replace('+', '');
  
  // Build message
  let message = `${greeting}\n\n`;
  message += `Cliente: ${customerName}\n`;
  message += `Celular: ${customerPhone}\n\n`;
  message += `Productos:\n`;
  
  let total = 0;
  products.forEach(p => {
    const lineTotal = p.quantity * p.unitPrice;
    total += lineTotal;
    
    if (p.unit === 'pack') {
      // "x 2 pack (6 un c/p) = $6.000 ($3.000 c/p)"
      message += `- ${p.name} x ${p.quantity} pack (${p.packSize} un c/p)`;
    } else {
      // "x 4 un = $4.000 ($1.000 c/u)"
      message += `- ${p.name} x ${p.quantity} un`;
    }
    
    if (showPrices) {
      message += ` = $${formatPrice(lineTotal)}`;
      if (p.quantity > 1) {
        message += ` ($${formatPrice(p.unitPrice)} c/${p.unit === 'pack' ? 'p' : 'u'})`;
      }
    }
    message += '\n';
  });
  
  if (showPrices) {
    message += `\nTotal a consultar: $${formatPrice(total)}\n`;
  }
  
  if (comment) {
    message += `\nComentario: ${comment}\n`;
  }
  
  message += `\nFavor confirmar stock, gracias!`;
  
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};
```

### Pattern 3: Phone Input with Country Selector
**What:** International phone input using react-phone-number-input
**When to use:** Quotation modal phone input with country code selector
**Example:**
```jsx
// Source: https://github.com/catamphetamine/react-phone-number-input
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import es from 'react-phone-number-input/locale/es';

function PhoneField({ value, onChange }) {
  return (
    <PhoneInput
      international
      defaultCountry="CL"  // Chile pre-selected
      labels={es}          // Spanish labels
      value={value}
      onChange={onChange}
      placeholder="Ingresa tu celular"
    />
  );
}
// value is in E.164 format: "+56912345678"
```

### Anti-Patterns to Avoid
- **localStorage for selection persistence:** User decided session-only. Use `sessionStorage` or just in-memory Context state.
- **Hardcoded WhatsApp number:** Must be configurable from admin. Store in database/config.
- **Inline message building:** Extract to helper function for testing and maintenance.
- **Blocking on phone validation:** Use `isPossiblePhoneNumber()` for basic validation, not strict `isValidPhoneNumber()`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Country code selector | Custom dropdown with 240+ countries | react-phone-number-input | Maintains country data, handles formatting, flag icons included |
| Phone number validation | Regex patterns | libphonenumber-js (via react-phone-number-input) | Phone formats change, library is maintained by Google data |
| Price formatting (CLP) | String concatenation | Existing `formatCLP` helper | Already in project at `helpers/formatPrice.helper.js` |
| Modal component | Custom overlay | Ant Design Modal | Already used extensively in project, handles accessibility |
| URL encoding | Manual `replace()` calls | `encodeURIComponent()` | Handles all edge cases (emojis, special chars, newlines) |

**Key insight:** Phone number handling and international dial codes are surprisingly complex. Country calling codes change, there are multiple formats (E.164, national, international), and validation rules vary by country. Always use a maintained library.

## Common Pitfalls

### Pitfall 1: WhatsApp Link Not Opening App
**What goes wrong:** Link opens web page instead of WhatsApp app, or fails entirely
**Why it happens:** Incorrect phone format, missing `https://`, or improper URL encoding
**How to avoid:** 
- Use `https://wa.me/` (not `http://` or `api.whatsapp.com`)
- Phone number must NOT include `+`, spaces, or dashes (just digits)
- Use `encodeURIComponent()` for the entire text parameter
- Test on mobile device, not just desktop browser
**Warning signs:** Link works in browser but opens web.whatsapp.com instead of app

### Pitfall 2: Message Truncation
**What goes wrong:** Long messages get cut off
**Why it happens:** URL length limits (varies by browser/app, typically ~2000 chars)
**How to avoid:** 
- Keep message concise
- For very long product lists, consider limiting items or summarizing
- Test with maximum expected items
**Warning signs:** Works with 5 products but fails with 20

### Pitfall 3: State Loss on Navigation
**What goes wrong:** User loses selection when navigating catalog
**Why it happens:** Component-level state instead of context, missing persistence
**How to avoid:** 
- Use Context at App level (like existing CartProvider)
- Use sessionStorage for tab refresh persistence (if needed)
- Never store selection in component local state
**Warning signs:** Selection resets when clicking product detail

### Pitfall 4: Phone Input Styling Conflicts
**What goes wrong:** Phone input looks broken, flag icons misaligned
**Why it happens:** Tailwind CSS reset conflicts with react-phone-number-input styles
**How to avoid:** 
- Import the library's CSS file: `import 'react-phone-number-input/style.css'`
- May need to adjust Tailwind preflight or add specific overrides
- Test with `--PhoneInput-color--focus` CSS variable
**Warning signs:** Country selector dropdown invisible or flags not showing

### Pitfall 5: Decimal Handling in Prices
**What goes wrong:** Prices show as floats like "1500.00" instead of "$1.500"
**Why it happens:** Prisma returns Decimal type, JavaScript coercion issues
**How to avoid:** 
- Use existing `formatCLP()` helper which uses `Intl.NumberFormat`
- Convert Decimal to number before calculations: `Number(price)`
- Handle null/undefined prices when admin disables price visibility
**Warning signs:** `$1.5000000000000001` displayed

## Code Examples

### Product Card with Add/Quantity Controls
```jsx
// Source: Adapting existing ProductPage pattern
import { useState } from 'react';
import { useSelection } from '../hooks/useSelection';

function ProductCard({ product }) {
  const { selection, addToSelection, updateQuantity, removeFromSelection } = useSelection();
  const selectedItem = selection.find(item => item.id === product.id);
  const isOutOfStock = !product.available;

  if (isOutOfStock) {
    return (
      <div className="opacity-50 grayscale">
        <img src={product.url_img} alt={product.product} />
        <p>{product.product}</p>
        <span className="text-gray-500">Agotado</span>
      </div>
    );
  }

  return (
    <div>
      <img src={product.url_img} alt={product.product} onClick={() => /* open detail */} />
      <p>{product.product}</p>
      {selectedItem ? (
        <div className="flex items-center gap-2">
          <button onClick={() => 
            selectedItem.quantity === 1 
              ? removeFromSelection(product.id)
              : updateQuantity(product.id, selectedItem.quantity - 1)
          }>-</button>
          <span>{selectedItem.quantity}</span>
          <button onClick={() => updateQuantity(product.id, selectedItem.quantity + 1)}>+</button>
        </div>
      ) : (
        <button onClick={() => addToSelection(product, 1)}>Agregar</button>
      )}
    </div>
  );
}
```

### Selection Bar Component
```jsx
// Source: Custom implementation following CONTEXT.md decisions
import { useSelection } from '../hooks/useSelection';
import { formatCLP } from '../helpers/formatPrice.helper';

function SelectionBar({ onQuoteClick }) {
  const { selection, clearSelection } = useSelection();
  const [expanded, setExpanded] = useState(false);

  if (selection.length === 0) return null;

  const itemCount = selection.reduce((sum, item) => sum + item.quantity, 0);
  const total = selection.reduce((sum, item) => sum + (item.quantity * Number(item.price)), 0);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t z-50">
      <div 
        className="flex justify-between items-center p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <span>{itemCount} productos</span>
        <span>{formatCLP(total)}</span>
        <button 
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={(e) => { e.stopPropagation(); onQuoteClick(); }}
        >
          Cotizar
        </button>
      </div>
      {expanded && (
        <div className="p-4 border-t">
          {/* List of selected products */}
          <button onClick={clearSelection}>Limpiar selección</button>
        </div>
      )}
    </div>
  );
}
```

### Quotation Modal Structure
```jsx
// Source: Following existing Modal patterns in project
import { Modal, Input, Button } from 'antd';
import PhoneInput from 'react-phone-number-input';
import { isPossiblePhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import es from 'react-phone-number-input/locale/es';

function QuotationModal({ open, onClose, selection, adminConfig }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    comment: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Nombre requerido';
    if (!form.phone || !isPossiblePhoneNumber(form.phone)) errs.phone = 'Celular inválido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    const link = generateWhatsAppLink(
      adminConfig.whatsappNumber,
      form.name,
      form.phone,
      selection,
      adminConfig.greeting,
      adminConfig.showPrices,
      form.comment
    );
    
    // Save customer email to DB for future promotions (async, don't block)
    saveCustomerEmail(form.email).catch(console.error);
    
    // Open WhatsApp
    window.open(link, '_blank');
    onClose();
  };

  return (
    <Modal
      title="Cotización"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>Cancelar</Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Consultar por stock
        </Button>
      ]}
    >
      {/* Selection summary with edit capabilities */}
      {/* Customer form fields */}
      <PhoneInput
        international
        defaultCountry="CL"
        labels={es}
        value={form.phone}
        onChange={(phone) => setForm({ ...form, phone })}
      />
    </Modal>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `localStorage` for all persistence | `sessionStorage` for session-only data | User decision | Selection clears when tab closes |
| api.whatsapp.com | wa.me | 2020+ | Simpler URL, better mobile support |
| Custom phone validation regex | libphonenumber-js | Ongoing | More accurate, maintained by Google data |
| Ant Design 4 Modal API | Ant Design 5 Modal (`open` prop) | 2023 | `visible` → `open` prop |

**Deprecated/outdated:**
- `api.whatsapp.com/send?phone=` — Use `wa.me/` instead
- Ant Design `visible` prop on Modal — Use `open` prop (v5+)

## Open Questions

1. **Admin Config API Endpoint**
   - What we know: Need to fetch WhatsApp number, greeting, price visibility from admin config
   - What's unclear: Is there an existing config endpoint or does one need to be created?
   - Recommendation: Create a public `/api/store/config` endpoint that returns non-sensitive config

2. **Product Unit Type in Schema**
   - What we know: Products can be "cantidad" (un) or "pack" with packSize
   - What's unclear: Current schema doesn't have unit_type or pack_size fields
   - Recommendation: Add `unit_type ENUM('unit', 'pack')` and `pack_size INT` to products table in this phase

3. **Customer Email Storage**
   - What we know: Email collected for future promotions, not included in WhatsApp message
   - What's unclear: Where to store (new table? existing table extension?)
   - Recommendation: Create `quotation_leads` table with email, phone, created_at

## Sources

### Primary (HIGH confidence)
- react-phone-number-input GitHub (https://github.com/catamphetamine/react-phone-number-input) - API, usage, features
- WhatsApp wa.me verification (tested URL format directly)
- Existing codebase analysis:
  - `apps/web/src/context/CartProvider.jsx` — Context pattern
  - `apps/web/src/hooks/useCart.jsx` — Hook pattern  
  - `apps/web/src/pages/CatalogPage.jsx` — Catalog display
  - `apps/web/src/components/admin/ProductForm.jsx` — Modal pattern
  - `apps/web/src/helpers/formatPrice.helper.js` — Price formatting

### Secondary (MEDIUM confidence)
- Ant Design 5.29.3 Modal API (already in project, verified version)
- react-toastify 11.0.5 (already in project, verified version)

### Tertiary (LOW confidence)
- None — all findings verified with primary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Based on existing project dependencies and verified library docs
- Architecture: HIGH — Patterns derived from existing codebase
- Pitfalls: MEDIUM — Based on common issues with these technologies

**Research date:** 2026-01-30
**Valid until:** 2026-03-01 (60 days — stable technologies, project-specific patterns)
