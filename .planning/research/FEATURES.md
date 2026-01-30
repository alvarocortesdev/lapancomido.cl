# Feature Landscape: Local Bakery Catalog with WhatsApp Quotation

**Domain:** Local business catalog with WhatsApp-based quotation/ordering
**Market:** Caldera, Chile (small town, local SEO focus)
**Researched:** 2026-01-30

## Table Stakes

Features users expect. Missing = product feels incomplete or unprofessional.

### Customer-Facing Catalog

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Product grid with images | Users expect visual browsing for food/bakery | Low | Cards with photo, name, price |
| Category filtering | Bakeries have multiple product types (pan, pasteles, tortas, etc.) | Low | Simple category tabs or sidebar |
| Product detail view | Users want to see larger image, description, options | Low | Modal or dedicated page |
| Mobile-first responsive design | 80%+ of local users browse on mobile | Medium | Must work perfectly on phone |
| WhatsApp quotation button | Core conversion mechanism | Low | wa.me link with pre-filled message |
| Clear pricing display | Chilean consumers expect transparent pricing | Low | CLP currency, formatted correctly |
| Business info (hours, location, phone) | Basic trust signals for local business | Low | Footer or dedicated section |
| Google Maps integration | Local customers need directions | Low | Embed or link to Google Maps |

### WhatsApp Quotation Flow

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Product selection mechanism | Users need to select multiple items | Medium | Selection bar, checkboxes, or quantity inputs |
| Quotation summary modal | Review before sending to WhatsApp | Medium | Show all selected items, quantities, subtotal |
| Pre-formatted WhatsApp message | Owner needs structured inquiries | Low | Itemized list with quantities and customer intent |
| wa.me link generation | Standard WhatsApp contact method | Low | `https://wa.me/56XXXXXXXXX?text=<encoded>` |
| Clear call-to-action | Users must understand how to order | Low | "Cotizar por WhatsApp" prominent button |

### Admin Panel - Content Management

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Product CRUD | Admin must manage catalog | Medium | Create, edit, delete products |
| Image upload | Products need photos | Medium | Upload, crop, optimize images |
| Category management | Organize products logically | Low | Simple category CRUD |
| Price updates | Prices change frequently in bakeries | Low | Quick inline editing preferred |
| Content editing | Update business info, announcements | Low | Homepage text, hours, etc. |
| Authentication | Secure admin access | Medium | Login system for admin users |

## Differentiators

Features that set product apart. Not expected by users, but add significant value.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Selection persistence** | Selection survives page navigation/refresh | Low | LocalStorage-based, prevents frustration |
| **Floating selection bar** | Always visible count of selected items | Low | Bottom bar showing "3 items selected - Ver cotizacion" |
| **Quick quantity adjustment** | +/- buttons without opening modal | Low | Inline quantity controls on product cards |
| **Product availability toggle** | Mark items as "agotado" (sold out) | Low | Admin can quickly disable items, shows to customers |
| **Seasonal/featured products** | Highlight special items | Low | "Destacado" badge, separate featured section |
| **Inquiry history (admin)** | Track WhatsApp quotation clicks | Medium | Log timestamp, products, source for analytics |
| **Local SEO optimization** | Structured data, optimized meta tags | Medium | Schema.org LocalBusiness, Bakery markup |
| **Image gallery per product** | Multiple photos per item | Medium | Carousel for products needing multiple angles |
| **Custom order notes** | Customer can add notes to quotation | Low | Text field in summary modal |
| **WhatsApp Business profile link** | Direct link to verified business profile | Low | Builds trust, shows verified status |

## Anti-Features

Features to explicitly NOT build. Common mistakes in this domain.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Full e-commerce checkout** | Owner handles orders manually via WhatsApp; payment processing adds complexity, fees, and liability | Quotation only - let WhatsApp handle the negotiation |
| **User accounts/registration** | Local bakery customers don't want to create accounts; adds friction | Anonymous browsing + WhatsApp contact |
| **Shopping cart with payments** | Overengineered for manual order handling; owner needs to confirm availability | Simple quotation list, not a cart |
| **Inventory management system** | Owner knows inventory in their head; system would be ignored | Simple "available/unavailable" toggle at most |
| **Automated order confirmation** | Owner wants personal touch, needs to confirm times | WhatsApp conversation is the confirmation |
| **Delivery tracking** | Beyond scope; bakery likely does pickup or simple local delivery | Just show pickup address or note delivery availability |
| **Reviews/ratings system** | Requires moderation, can be gamed, Google reviews already serve this | Link to Google Business reviews instead |
| **Complex product variants** | Bakery products are simple (no size/color matrix) | Simple product descriptions; variants as separate products |
| **Newsletter/email marketing** | Owner won't maintain it; WhatsApp Status serves this purpose | Maybe just a WhatsApp Business catalog link |
| **Real-time chat widget** | Owner is baking, can't monitor web chat; WhatsApp already handles this | WhatsApp is the chat |
| **Complex CMS (WYSIWYG editor)** | Admin just needs to update text and products | Simple form fields for content |
| **Multi-language support** | Local bakery in Chile serves Spanish speakers | Spanish only |
| **Complex role permissions** | Only two roles needed (dev/admin) | Simple role check, not a full RBAC system |

## Feature Dependencies

```
Core Dependencies:
  Products DB → Product Display → Product Selection → Quotation Modal → wa.me Link

Admin Dependencies:
  Authentication → Admin Panel → (Product CRUD, Category CRUD, Content Edit)
  Product CRUD → Image Upload

Selection Flow:
  Category Filter → Product Grid → Selection Mechanism → Selection Bar → Summary Modal → WhatsApp Message

Local SEO:
  Business Info Content → Schema.org Markup → Meta Tags
```

### Dependency Diagram

```
[Auth] ─────────────────────────────────────────────┐
                                                     │
[Categories] ──→ [Products] ──→ [Images]            │
      │              │                               │
      │              ▼                               ▼
      └────────→ [Product Grid] ◄─────────── [Admin Panel]
                      │
                      ▼
              [Selection Mechanism]
                      │
                      ▼
              [Selection Bar/State]
                      │
                      ▼
              [Summary Modal]
                      │
                      ▼
              [wa.me Link Generation]
                      │
                      ▼
              [Inquiry Logging] (optional)
```

## MVP Recommendation

For MVP, prioritize all table stakes plus select differentiators:

### Must Have (Launch Blockers)

1. Product catalog with images, categories, prices
2. Mobile-responsive design
3. Product selection mechanism (checkboxes or add buttons)
4. Selection bar showing item count
5. Quotation summary modal
6. wa.me link with formatted message
7. Business info (hours, location, phone, map)
8. Admin authentication (simple, two roles)
9. Product CRUD with image upload
10. Category management

### Should Have (First Week Post-Launch)

1. Selection persistence (localStorage)
2. Product availability toggle
3. Local SEO optimization (schema.org)
4. Inquiry click logging (basic analytics)

### Defer to Post-MVP

- **Image gallery per product**: Single image is sufficient initially
- **Seasonal/featured section**: Can be added once catalog is populated
- **Custom order notes**: Nice to have, not critical
- **Inquiry history dashboard**: Basic logging first, dashboard later

## Complexity Estimates

| Feature Group | Complexity | Time Estimate |
|---------------|------------|---------------|
| Product catalog display | Low | 2-3 days |
| Category filtering | Low | 0.5 day |
| Selection mechanism + bar | Medium | 1-2 days |
| Summary modal + wa.me | Medium | 1 day |
| Admin authentication | Medium | 1-2 days |
| Product CRUD | Medium | 2-3 days |
| Image upload/management | Medium | 1-2 days |
| Category CRUD | Low | 0.5-1 day |
| Content editing | Low | 0.5-1 day |
| Local SEO markup | Medium | 1 day |

**Total MVP Estimate:** 10-15 days of focused development

## WhatsApp Message Format

Recommended pre-filled message structure:

```
Hola! Me gustaria cotizar los siguientes productos:

- Pan de campo (x2)
- Torta de mil hojas (x1)
- Empanadas de queso (x6)

Total estimado: $12.500

Gracias!
```

**wa.me URL format:**
```
https://wa.me/56XXXXXXXXX?text=Hola!%20Me%20gustaria%20cotizar...
```

Note: Phone number without + or spaces. Message URL-encoded.

## Sources

| Source | Confidence | Notes |
|--------|------------|-------|
| wa.me URL format | HIGH | Verified via direct test of https://wa.me/?text=Hello |
| WhatsApp Business features | MEDIUM | Based on known WhatsApp Business capabilities |
| Local bakery UX patterns | MEDIUM | Based on domain knowledge of Latin American local business sites |
| Chilean market patterns | MEDIUM | Based on knowledge of Chilean e-commerce and local business practices |
| Admin panel requirements | HIGH | Standard content management patterns |

## Quality Gate Checklist

- [x] Categories are clear (table stakes vs differentiators vs anti-features)
- [x] Complexity noted for each feature
- [x] Dependencies between features identified
