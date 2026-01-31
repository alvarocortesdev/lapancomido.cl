# Roadmap: La Pan Comido

## Overview

Reconstrucción del sitio web de panadería artesanal desde e-commerce tradicional hacia un flujo de cotización vía WhatsApp. El proyecto migra la base de datos a Prisma ORM, implementa un sistema de selección de productos con cotización estructurada, separa el panel admin en subdominio propio con autenticación OTP, y optimiza para Lighthouse 100/100/100/100.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

**Parallelization Notes:**
- Phases 1-3 are sequential (foundation dependencies)
- Phase 4 and Phase 5 can run partially in parallel (auth backend || admin UI components)
- Phase 6 and Phase 7 can run in parallel (historial es independiente de SEO)

- [x] **Phase 1: Fundación & Migración DB** - Turborepo + Prisma ORM + CI/CD pipeline ✓
- [x] **Phase 2: Sistema de Cotización** - Catálogo público + selección + cotización WhatsApp ✓
- [ ] **Phase 3: Arquitectura Split** - Separación en subdominios (web/admin/api)
- [ ] **Phase 4: Autenticación OTP** - Login admin con OTP por dispositivo nuevo
- [ ] **Phase 5: Panel Admin** - CRUD productos, categorías y contenido
- [ ] **Phase 6: Historial de Consultas** - Guardar y visualizar consultas WhatsApp
- [ ] **Phase 7: SEO & Performance** - Lighthouse 100/100/100/100 + SEO local

## Phase Details

### Phase 1: Fundación & Migración DB
**Goal**: Infraestructura base lista con Prisma, Turborepo y CI/CD con Lighthouse
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-07, INFRA-08
**Success Criteria** (what must be TRUE):
  1. Proyecto Turborepo con estructura apps/web, apps/admin, apps/api, packages/database, packages/shared
  2. Prisma conecta a Supabase y todas las queries existentes funcionan igual que antes
  3. GitHub Actions ejecuta build + lint + tests en cada PR
  4. Lighthouse CI reporta scores en cada PR
  5. Deploy automático a Vercel funciona para cada app

**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Turborepo setup con estructura monorepo (Wave 1) ✓
- [x] 01-02-PLAN.md — Migración Prisma schema + queries (Wave 2) ✓
- [x] 01-03-PLAN.md — CI/CD pipeline GitHub Actions + Lighthouse CI (Wave 2) ✓

### Phase 2: Sistema de Cotización
**Goal**: Clientes pueden seleccionar productos y enviar cotización por WhatsApp
**Depends on**: Phase 1
**Requirements**: CAT-01, CAT-02, CAT-03, CAT-04, CAT-05, SEL-01, SEL-02, SEL-03, SEL-04, SEL-05, COT-01, COT-02, COT-03, COT-04, COT-05, COT-06, COT-07
**Success Criteria** (what must be TRUE):
  1. Usuario ve catálogo con productos, imágenes, precios (si habilitados) y disponibilidad ✓
  2. Usuario puede filtrar productos por categorías/etiquetas ✓
  3. Usuario puede seleccionar/deseleccionar productos y ajustar cantidades ✓
  4. Barra de selección muestra items seleccionados y persiste en sessionStorage ✓
  5. Modal de cotización muestra resumen editable con campos nombre/celular ✓
  6. Botón genera link wa.me que abre WhatsApp con mensaje estructurado ✓

**Plans**: 4 plans in 3 waves

Plans:
- [x] 02-01-PLAN.md — Database schema + Store config API (Wave 1) ✓
- [x] 02-02-PLAN.md — Selection state + WhatsApp helper (Wave 1) ✓
- [x] 02-03-PLAN.md — Catalog UI with selection controls (Wave 2) ✓
- [x] 02-04-PLAN.md — Quotation modal + integration (Wave 3) ✓

### Phase 3: Arquitectura Split
**Goal**: Apps separadas desplegadas en subdominios propios
**Depends on**: Phase 2
**Requirements**: INFRA-04, INFRA-05, INFRA-06
**Success Criteria** (what must be TRUE):
  1. lapancomido.cl sirve el sitio público de cotización
  2. admin.lapancomido.cl sirve shell del panel admin (sin auth aún)
  3. api.lapancomido.cl responde a requests de ambos frontends
  4. CORS configurado correctamente entre subdominios

**Plans**: 2 plans

Plans:
- [ ] 03-01: Configuración Vercel multi-proyecto
- [ ] 03-02: CORS y routing entre subdominios

### Phase 4: Autenticación OTP
**Goal**: Admin puede iniciar sesión con OTP en dispositivos nuevos
**Depends on**: Phase 3
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, AUTH-08, AUTH-09
**Success Criteria** (what must be TRUE):
  1. Existen 2 usuarios predefinidos (dev y admin) en la base de datos
  2. Usuario puede iniciar sesión con email/contraseña
  3. Primer login requiere establecer contraseña y email
  4. Login desde dispositivo nuevo envía OTP por email (Resend)
  5. Dispositivo confiable mantiene sesión 30 días sin pedir OTP
  6. Rol dev tiene acceso completo, rol admin acceso limitado

**Plans**: 3 plans

Plans:
- [ ] 04-01: Usuarios predefinidos y login básico
- [ ] 04-02: OTP por email con Resend + device fingerprinting
- [ ] 04-03: Sesiones de 30 días y roles

### Phase 5: Panel Admin
**Goal**: Admin puede gestionar productos, categorías y contenido del sitio
**Depends on**: Phase 4
**Requirements**: PROD-01, PROD-02, PROD-03, PROD-04, PROD-05, PROD-06, PROD-07, CATG-01, CATG-02, CATG-03, CATG-04, CONT-01, CONT-02, CONT-03
**Success Criteria** (what must be TRUE):
  1. Admin puede crear, editar, eliminar y habilitar/deshabilitar productos
  2. Admin puede marcar productos como "agotado"
  3. Admin puede subir/cambiar imágenes de productos vía Cloudinary
  4. Admin puede crear, editar, eliminar categorías y asignarlas a productos
  5. Admin puede editar contenido del Home (textos, imágenes, info contacto)
  6. Admin puede configurar visibilidad de precios (mostrar/ocultar globalmente)

**Plans**: 3 plans

Plans:
- [ ] 05-01: CRUD productos con upload Cloudinary
- [ ] 05-02: Gestión de categorías
- [ ] 05-03: Edición contenido Home + configuración precios

### Phase 6: Historial de Consultas
**Goal**: Sistema guarda consultas y admin puede verlas
**Depends on**: Phase 2, Phase 4
**Requirements**: COT-08, HIST-01, HIST-02, HIST-03, HIST-04
**Success Criteria** (what must be TRUE):
  1. Cada cotización enviada se guarda en BD con fecha, nombre, celular, productos
  2. Consulta almacena IDs de productos (no solo texto)
  3. Admin puede ver listado de consultas recientes
  4. Admin puede ver detalle de cada consulta con productos

**Plans**: 2 plans

Plans:
- [ ] 06-01: API y modelo para guardar consultas
- [ ] 06-02: Vista admin de historial

### Phase 7: SEO & Performance
**Goal**: Lighthouse 100/100/100/100 y SEO optimizado para búsquedas locales
**Depends on**: Phase 2, Phase 5
**Requirements**: SEO-01, SEO-02, SEO-03, SEO-04, SEO-05, SEO-06, SEO-07
**Success Criteria** (what must be TRUE):
  1. Lighthouse Performance ≥ 95 (idealmente 100)
  2. Lighthouse Accessibility = 100
  3. Lighthouse Best Practices = 100
  4. Lighthouse SEO = 100
  5. Schema.org LocalBusiness y Bakery markup implementado
  6. Meta tags optimizados para "panadería masa madre Caldera Chile"

**Plans**: 2 plans

Plans:
- [ ] 07-01: Optimización Lighthouse (bundle, imágenes, a11y)
- [ ] 07-02: SEO local (schema.org, meta tags, keywords)

## Progress

**Execution Order:**
1 → 2 → 3 → 4 → 5 → 6 (can parallel with 5) → 7 (can parallel with 6)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Fundación & Migración DB | 3/3 | Complete ✓ | 2026-01-30 |
| 2. Sistema de Cotización | 4/4 | Complete ✓ | 2026-01-31 |
| 3. Arquitectura Split | 0/2 | Not started | - |
| 4. Autenticación OTP | 0/3 | Not started | - |
| 5. Panel Admin | 0/3 | Not started | - |
| 6. Historial de Consultas | 0/2 | Not started | - |
| 7. SEO & Performance | 0/2 | Not started | - |

**Total Plans:** 19
**Completed:** 7/19 (37%)
**Total Requirements:** 60

---
*Roadmap created: 2026-01-30*
*Last updated: 2026-01-31*
