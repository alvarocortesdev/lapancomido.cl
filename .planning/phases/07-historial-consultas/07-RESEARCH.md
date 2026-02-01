# Phase 7: Historial de Consultas - Research

**Researched:** 2026-02-01
**Domain:** Consultation history, data capture, admin dashboard, Prisma 7 relations
**Confidence:** HIGH

## Summary

This phase implements a consultation history system that captures every WhatsApp quotation at button click (silently, non-blocking) and provides an admin view to browse and inspect historical consultations. The system stores product IDs plus snapshot data (name/price at consultation time) for historical accuracy.

The implementation leverages the existing stack: Express + Prisma 7 for the API, Antd 6 Table/Modal for the admin UI, and the existing authentication middleware. The core technical challenges are: (1) designing a proper schema for consultations with product snapshots, (2) implementing silent save-before-WhatsApp flow without blocking, (3) building a filterable/paginated admin view with date range default to last 30 days.

The existing codebase patterns (admin pages using Antd, API controllers using Prisma, auth middleware, API helpers) provide clear blueprints for implementation. No new dependencies are required.

**Primary recommendation:** Create `consultations` and `consultation_items` tables with product snapshots, modify the QuotationModal to fire a non-blocking save before WhatsApp redirect, and build an admin ConsultationsPage with Antd Table + DatePicker.RangePicker filtering.

## Standard Stack

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Prisma | 7.3.0 | Database ORM with relations | Already configured with PrismaPg adapter |
| Express | 5.2.1 | API server | Already used for all routes |
| Antd | 6.2.2 | UI components (Table, Modal, DatePicker, Pagination, Input, Empty) | Already used in admin panel |
| React | 18.3.1 | Frontend framework | Already in use |
| dayjs | (via Antd) | Date manipulation | Antd 6 uses dayjs internally for DatePicker |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| formatPhone.helper | existing | Phone formatting for display | Format Chilean phone numbers in history view |
| formatPrice.helper | existing | CLP currency formatting | Format totals and prices in history |

### New Dependencies Required
None - all functionality can be achieved with existing stack.

**Installation:**
```bash
# No new packages needed
# Only database migration for new tables
npx prisma migrate dev --name add_consultations
```

## Architecture Patterns

### Recommended Project Structure
```
packages/database/prisma/
├── schema.prisma          # Add consultations and consultation_items models

apps/api/src/
├── controllers/
│   └── consultations.controller.js    # New: CRUD for consultations
├── routes/
│   └── admin.routes.js               # Add consultation routes

apps/admin/src/
├── pages/
│   └── ConsultationsPage.jsx         # New: History list view
├── components/
│   └── ConsultationDetailModal.jsx   # New: Detail modal
├── api/
│   └── consultations.js              # New: API calls

apps/web/src/
├── components/selection/
│   └── QuotationModal.jsx            # Modify: Add silent save before WhatsApp
├── helpers/
│   └── api.jsx                       # Add saveConsultation function if needed
```

### Pattern 1: Prisma Schema for Consultation with Product Snapshots
**What:** Store consultation header + line items with snapshot data
**When to use:** Recording historical data that shouldn't change when products are modified/deleted
**Example:**
```prisma
// Source: Existing codebase patterns + Prisma 7 documentation
model consultations {
  id          Int       @id @default(autoincrement())
  customer_name   String
  customer_phone  String    // E.164 format with country code
  total_amount    Decimal   @db.Decimal(10, 2)
  product_count   Int       // Cached count for list display
  created_at      DateTime  @default(now())

  // Relations
  items consultation_items[]

  @@schema("pancomido")
}

model consultation_items {
  id              Int       @id @default(autoincrement())
  consultation_id Int
  product_id      Int       // Reference to products.id (nullable if product deleted)
  product_name    String    // Snapshot at consultation time
  unit_price      Decimal   @db.Decimal(10, 2)  // Snapshot at consultation time
  quantity        Int
  subtotal        Decimal   @db.Decimal(10, 2)  // Cached: qty × unit_price

  // Relations
  consultation consultations @relation(fields: [consultation_id], references: [id], onDelete: Cascade)

  @@schema("pancomido")
}
```

### Pattern 2: Silent Save Before WhatsApp (Non-Blocking)
**What:** Fire API call before opening WhatsApp, don't wait for response
**When to use:** When save should not block user experience
**Example:**
```javascript
// Source: Existing saveCustomerLead pattern in QuotationModal.jsx
const saveConsultation = async (data) => {
  try {
    await fetch(`${import.meta.env.VITE_API_URL}/api/store/consultation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  } catch (error) {
    // Don't block WhatsApp flow if save fails
    console.error("Failed to save consultation:", error);
  }
};

const handleSubmit = async () => {
  if (!validate()) return;
  setSubmitting(true);

  try {
    // Fire and forget - save consultation before WhatsApp
    const consultationData = {
      customerName: form.name.trim(),
      customerPhone: `${form.countryCode} ${form.phone}`,
      products: selection.map(item => ({
        productId: item.id,
        productName: item.product,
        unitPrice: Number(item.price),
        quantity: item.quantity
      }))
    };
    saveConsultation(consultationData);  // No await - fire and forget
    
    // Open WhatsApp immediately
    const link = generateWhatsAppLink(...);
    window.open(link, "_blank");
    
    clearSelection();
    onClose();
  } finally {
    setSubmitting(false);
  }
};
```

### Pattern 3: Admin Table with Date Range Filter (Default 30 Days)
**What:** Antd Table with DatePicker.RangePicker defaulting to last 30 days
**When to use:** History/log views with date filtering
**Example:**
```jsx
// Source: Antd 6 documentation + existing admin patterns
import { Table, DatePicker, Input, Empty } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

function ConsultationsPage() {
  const { token } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 15, total: 0 });
  
  // Default to last 30 days
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);
  const [searchName, setSearchName] = useState('');
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  useEffect(() => {
    loadConsultations();
  }, [pagination.current, dateRange, searchName]);

  const loadConsultations = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: pagination.current,
      limit: pagination.pageSize,
      from: dateRange[0]?.toISOString(),
      to: dateRange[1]?.endOf('day').toISOString(),
      search: searchName
    });
    
    const data = await consultationsApi.getConsultations(token, params);
    setConsultations(data.items);
    setPagination(prev => ({ ...prev, total: data.total }));
    setLoading(false);
  };

  const columns = [
    { title: 'Fecha', dataIndex: 'created_at', render: (d) => dayjs(d).format('DD/MM/YYYY HH:mm') },
    { title: 'Cliente', dataIndex: 'customer_name' },
    { title: 'Celular', dataIndex: 'customer_phone', render: formatPhoneDisplay },
    { title: 'Productos', dataIndex: 'product_count' },
    { title: 'Total', dataIndex: 'total_amount', render: formatCLP }
  ];

  return (
    <div>
      <div className="filters">
        <RangePicker 
          value={dateRange} 
          onChange={setDateRange}
          format="DD/MM/YYYY"
        />
        <Input.Search
          placeholder="Buscar por nombre"
          onSearch={setSearchName}
          allowClear
        />
      </div>
      
      <Table
        columns={columns}
        dataSource={consultations}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={(p) => setPagination(p)}
        onRow={(record) => ({ onClick: () => setSelectedConsultation(record) })}
        locale={{ emptyText: <Empty description="No hay consultas en este periodo" /> }}
      />
      
      <ConsultationDetailModal
        open={!!selectedConsultation}
        consultation={selectedConsultation}
        onClose={() => setSelectedConsultation(null)}
      />
    </div>
  );
}
```

### Pattern 4: Detail Modal with Product Line Items
**What:** Modal showing full consultation detail with product table
**When to use:** Viewing detailed information in overlay without navigation
**Example:**
```jsx
// Source: Antd 6 Modal + existing patterns
import { Modal, Table, Descriptions } from 'antd';

function ConsultationDetailModal({ open, consultation, onClose }) {
  if (!consultation) return null;

  const columns = [
    { title: 'Producto', dataIndex: 'product_name' },
    { title: 'Cantidad', dataIndex: 'quantity' },
    { title: 'Precio Unit.', dataIndex: 'unit_price', render: formatCLP },
    { title: 'Subtotal', dataIndex: 'subtotal', render: formatCLP }
  ];

  return (
    <Modal
      title="Detalle de Consulta"
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Descriptions column={2}>
        <Descriptions.Item label="Cliente">{consultation.customer_name}</Descriptions.Item>
        <Descriptions.Item label="Celular">{formatPhoneDisplay(consultation.customer_phone)}</Descriptions.Item>
        <Descriptions.Item label="Fecha">{dayjs(consultation.created_at).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
        <Descriptions.Item label="Total">{formatCLP(consultation.total_amount)}</Descriptions.Item>
      </Descriptions>
      
      <Table
        columns={columns}
        dataSource={consultation.items}
        rowKey="id"
        pagination={false}
        size="small"
      />
    </Modal>
  );
}
```

### Anti-Patterns to Avoid
- **Storing only product IDs without snapshots:** Products change/delete; historical data becomes meaningless
- **Blocking WhatsApp on save failure:** User experience suffers; save is secondary to conversion
- **Loading all consultations without pagination:** Performance degrades with data growth
- **Fetching all data then filtering client-side:** Server-side filtering is more efficient
- **Using inline expand for details:** Modal is cleaner for this use case per user decision

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date range picker | Custom date inputs | Antd DatePicker.RangePicker | Localization, presets, keyboard navigation included |
| Table with pagination | Custom list + paging | Antd Table with pagination prop | Sorting, loading states, empty states built-in |
| Modal with detail view | New page or custom overlay | Antd Modal | Focus trap, animation, keyboard handling included |
| Phone number formatting | String concatenation | Existing formatPhone helpers | Already handles Chilean format correctly |
| Price formatting | toFixed/toLocaleString | Existing formatCLP helper | Already handles CLP formatting correctly |
| Date calculations | Manual Date math | dayjs | Timezone handling, relative dates, formatting |

**Key insight:** The admin panel already uses Antd extensively. Use the same components for consistency and to leverage existing patterns.

## Common Pitfalls

### Pitfall 1: Product Data Changes After Consultation
**What goes wrong:** Historical consultation shows wrong product name/price
**Why it happens:** Only storing product_id, then JOINing to current product data
**How to avoid:** 
- Store `product_name` and `unit_price` as snapshot columns in `consultation_items`
- Store `product_id` for reference but don't rely on JOIN for display
- Calculate and store `subtotal` at write time
**Warning signs:** Historical totals don't match displayed line items

### Pitfall 2: Product Deleted, Consultation Breaks
**What goes wrong:** Consultation shows error or blank product
**Why it happens:** Hard dependency on products table via foreign key
**How to avoid:** 
- Don't use foreign key constraint (or use ON DELETE SET NULL)
- Always display from snapshot columns, not product relation
- Consider marking product_id nullable in schema
**Warning signs:** Consultations referencing deleted products show errors

### Pitfall 3: Blocking WhatsApp on Network Error
**What goes wrong:** User can't send WhatsApp if save fails
**Why it happens:** await saveConsultation() before window.open()
**How to avoid:** 
- Fire and forget: `saveConsultation().catch(console.error)` without await
- Always open WhatsApp regardless of save result
- Log errors for debugging but don't block flow
**Warning signs:** Users report "frozen" modal when offline

### Pitfall 4: Date Filtering Timezone Issues
**What goes wrong:** Filter shows wrong consultations at day boundaries
**Why it happens:** Mixing UTC and local time, or not using end-of-day for "to" date
**How to avoid:** 
- Store created_at in UTC (Prisma default)
- Convert date range to UTC for API query
- Use `endOf('day')` for "to" date to include entire day
- Display dates in local timezone using dayjs
**Warning signs:** Consultation from 11pm missing when filtering that day

### Pitfall 5: Empty State Not Handled
**What goes wrong:** Table looks broken with no data
**Why it happens:** No empty state configured for filtered results
**How to avoid:** 
- Use Antd Table's `locale.emptyText` prop
- Show helpful message: "No hay consultas en este periodo"
- Consider suggesting broader date range
**Warning signs:** Blank table area with no explanation

### Pitfall 6: Pagination State Sync Issues
**What goes wrong:** Filters change but showing wrong page of results
**Why it happens:** Pagination current page not reset when filters change
**How to avoid:** 
- Reset pagination to page 1 when dateRange or searchName changes
- Use controlled pagination with `onChange` handler
**Warning signs:** Empty results after filtering (actually on page 5 of new results)

## Code Examples

### API Controller for Consultations
```javascript
// Source: Following existing adminProducts.controller.js pattern
import { prisma } from '@lapancomido/database';

// Save consultation (public endpoint)
const saveConsultation = async (req, res, next) => {
  try {
    const { customerName, customerPhone, products } = req.body;

    if (!customerName || !customerPhone || !products?.length) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate totals
    const items = products.map(p => ({
      product_id: p.productId,
      product_name: p.productName,
      unit_price: p.unitPrice,
      quantity: p.quantity,
      subtotal: p.unitPrice * p.quantity
    }));
    
    const totalAmount = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

    const consultation = await prisma.consultations.create({
      data: {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        total_amount: totalAmount,
        product_count: products.length,
        items: {
          create: items
        }
      }
    });

    res.status(201).json({ id: consultation.id });
  } catch (error) {
    next(error);
  }
};

// Get consultations (admin endpoint with filters)
const getConsultations = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, from, to, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    
    if (from || to) {
      where.created_at = {};
      if (from) where.created_at.gte = new Date(from);
      if (to) where.created_at.lte = new Date(to);
    }
    
    if (search) {
      where.customer_name = { contains: search, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      prisma.consultations.findMany({
        where,
        include: { items: true },
        orderBy: { created_at: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.consultations.count({ where })
    ]);

    res.json({ items, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    next(error);
  }
};

export { saveConsultation, getConsultations };
```

### Phone Display Formatting for Chile
```javascript
// Source: Existing formatPhone.helper.js + Chilean format requirements
export const formatPhoneForDisplay = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digits except leading +
  const clean = phone.replace(/[^\d+]/g, '');
  
  // Format: +56 9 1234 5678
  if (clean.startsWith('+56') && clean.length >= 12) {
    const digits = clean.slice(3); // Remove +56
    return `+56 ${digits.slice(0, 1)} ${digits.slice(1, 5)} ${digits.slice(5, 9)}`;
  }
  
  // Return as-is if not Chilean format
  return phone;
};
```

### Admin Navigation Update
```jsx
// Source: Existing main.jsx pattern
// Add to nav in main.jsx:
<button
  onClick={() => setCurrentPage('consultations')}
  className={`py-3 px-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
    currentPage === 'consultations' 
      ? 'border-[#262011] text-[#262011]' 
      : 'border-transparent text-[#262011]/60 hover:text-[#262011]'
  }`}
>
  Historial
</button>

// Add to main render:
{currentPage === 'consultations' && <ConsultationsPage />}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Antd 5 `visible` prop | Antd 6 `open` prop | Antd 6 (2024) | Modal uses `open` instead of `visible` |
| Moment.js with Antd | dayjs with Antd 6 | Antd 5+ | Smaller bundle, dayjs is tree-shakeable |
| Prisma 6 | Prisma 7 | 2025 | New generator syntax, driver adapters |
| Custom pagination | Antd Table pagination | Current | Built-in pagination config |

**Deprecated/outdated:**
- Antd `List` component — Marked deprecated in Antd 6, use Table for structured data
- Moment.js — dayjs is the standard for Antd date handling

## Open Questions

1. **Handling Deleted Products in History**
   - What we know: Products may be deleted after consultation is recorded
   - What's unclear: Should we show "Producto eliminado" or just the snapshot name?
   - Recommendation: Show snapshot name always; product_id is for internal reference only, no visual indication of deletion needed since snapshot is authoritative

2. **Dayjs Locale Configuration**
   - What we know: Antd 6 uses dayjs for DatePicker, admin already works
   - What's unclear: Is Spanish locale already configured globally?
   - Recommendation: Check if locale is set in ConfigProvider; if not, add `import 'dayjs/locale/es'` and `dayjs.locale('es')` in admin entry point

## Sources

### Primary (HIGH confidence)
- Existing codebase analysis:
  - `apps/admin/src/pages/ProductsPage.jsx` — Admin table patterns
  - `apps/admin/src/main.jsx` — Navigation structure
  - `apps/api/src/controllers/adminProducts.controller.js` — Controller patterns
  - `apps/api/src/routes/admin.routes.js` — Route patterns with auth middleware
  - `apps/web/src/components/selection/QuotationModal.jsx` — Existing save pattern
  - `packages/database/prisma/schema.prisma` — Schema patterns
- Antd 6.2.2 official documentation:
  - Table component — https://ant.design/components/table
  - Modal component — https://ant.design/components/modal
  - DatePicker.RangePicker — https://ant.design/components/date-picker

### Secondary (MEDIUM confidence)
- Prisma 7 relation patterns — verified via existing codebase usage

### Tertiary (LOW confidence)
- None — all findings verified with primary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Based on existing project dependencies, no new packages
- Architecture: HIGH — Patterns derived from existing codebase, well-established
- Pitfalls: HIGH — Common issues with history/audit systems, verified against requirements

**Research date:** 2026-02-01
**Valid until:** 2026-03-03 (30 days — stable technologies, project-specific patterns)
