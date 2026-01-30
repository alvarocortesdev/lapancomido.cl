# Requirements: La Pan Comido

**Defined:** 2026-01-30
**Core Value:** Los clientes pueden seleccionar productos del catálogo y enviar una consulta estructurada por WhatsApp al dueño en menos de 30 segundos.

## v1 Requirements

Requirements para release inicial. Cada uno mapea a fases del roadmap.

### Catálogo Público

- [ ] **CAT-01**: Usuario puede ver catálogo de productos con imágenes, nombres y descripciones
- [ ] **CAT-02**: Usuario puede filtrar productos por categorías/etiquetas
- [ ] **CAT-03**: Usuario puede ver precios de productos (si admin los habilita)
- [ ] **CAT-04**: Usuario puede ver estado de disponibilidad del producto ("disponible"/"agotado")
- [ ] **CAT-05**: Usuario puede ver información del negocio (horario, ubicación, teléfono)

### Selección de Productos

- [ ] **SEL-01**: Usuario puede seleccionar/deseleccionar productos del catálogo
- [ ] **SEL-02**: Usuario puede ajustar cantidad de cada producto seleccionado
- [ ] **SEL-03**: Usuario ve barra de selección persistente con cantidad de items y total
- [ ] **SEL-04**: Selección persiste en localStorage al navegar/refrescar
- [ ] **SEL-05**: Usuario puede limpiar toda la selección desde la barra

### Cotización WhatsApp

- [ ] **COT-01**: Usuario puede abrir modal de cotización desde barra de selección
- [ ] **COT-02**: Modal muestra resumen de productos seleccionados con cantidades y precios
- [ ] **COT-03**: Usuario puede editar cantidades en el modal
- [ ] **COT-04**: Usuario puede eliminar productos del resumen en el modal
- [ ] **COT-05**: Usuario debe ingresar nombre completo y celular
- [ ] **COT-06**: Botón "Consultar por stock" genera link wa.me con mensaje pre-estructurado
- [ ] **COT-07**: Link wa.me abre WhatsApp con mensaje listo para enviar al dueño
- [ ] **COT-08**: Consulta se guarda en base de datos con IDs de productos

### SEO y Performance

- [ ] **SEO-01**: Sitio optimizado para búsquedas locales "panadería masa madre Caldera Chile"
- [ ] **SEO-02**: Markup schema.org LocalBusiness y Bakery implementado
- [ ] **SEO-03**: Meta tags optimizados para cada página
- [ ] **SEO-04**: Lighthouse Performance score ≥ 95
- [ ] **SEO-05**: Lighthouse Accessibility score = 100
- [ ] **SEO-06**: Lighthouse Best Practices score = 100
- [ ] **SEO-07**: Lighthouse SEO score = 100

### Autenticación Admin

- [ ] **AUTH-01**: Sistema tiene 2 usuarios predefinidos (dev y admin)
- [ ] **AUTH-02**: Usuario puede iniciar sesión con email y contraseña
- [ ] **AUTH-03**: Primer login requiere registro de email y cambio de contraseña
- [ ] **AUTH-04**: Login desde dispositivo nuevo requiere código OTP por email
- [ ] **AUTH-05**: OTP se envía vía Resend al email registrado
- [ ] **AUTH-06**: Dispositivo confiable mantiene sesión por 30 días sin OTP
- [ ] **AUTH-07**: Usuario puede solicitar OTP para recuperar acceso
- [ ] **AUTH-08**: Rol dev tiene acceso completo incluyendo feature toggles
- [ ] **AUTH-09**: Rol admin tiene acceso solo a gestión de contenido

### Gestión de Productos (Admin)

- [ ] **PROD-01**: Admin puede crear nuevos productos con nombre, descripción, precio
- [ ] **PROD-02**: Admin puede editar productos existentes
- [ ] **PROD-03**: Admin puede eliminar productos
- [ ] **PROD-04**: Admin puede habilitar/deshabilitar productos (visible en catálogo)
- [ ] **PROD-05**: Admin puede marcar productos como "agotado"
- [ ] **PROD-06**: Admin puede subir/cambiar imágenes de productos vía Cloudinary
- [ ] **PROD-07**: Admin puede configurar visibilidad de precios (mostrar/ocultar globalmente)

### Gestión de Categorías (Admin)

- [ ] **CATG-01**: Admin puede crear nuevas categorías/etiquetas
- [ ] **CATG-02**: Admin puede editar categorías existentes
- [ ] **CATG-03**: Admin puede eliminar categorías
- [ ] **CATG-04**: Admin puede asignar/quitar categorías a productos

### Gestión de Contenido (Admin)

- [ ] **CONT-01**: Admin puede editar textos del Home (título, descripción, historia)
- [ ] **CONT-02**: Admin puede cambiar imágenes del Home
- [ ] **CONT-03**: Admin puede editar información de contacto (horario, ubicación, teléfono)

### Historial de Consultas (Admin)

- [ ] **HIST-01**: Sistema registra cada consulta enviada por WhatsApp
- [ ] **HIST-02**: Consulta incluye: fecha, nombre, celular, productos con cantidades
- [ ] **HIST-03**: Admin puede ver listado de consultas recientes
- [ ] **HIST-04**: Admin puede ver detalle de cada consulta

### Infraestructura

- [x] **INFRA-01**: Base de datos migrada de SQL raw a Prisma ORM ✓
- [x] **INFRA-02**: Estructura Turborepo con apps/web, apps/admin, apps/api ✓
- [x] **INFRA-03**: Paquetes compartidos: packages/database, packages/shared ✓
- [ ] **INFRA-04**: API desplegada en api.lapancomido.cl
- [ ] **INFRA-05**: Sitio público desplegado en lapancomido.cl
- [ ] **INFRA-06**: Admin desplegado en admin.lapancomido.cl
- [x] **INFRA-07**: CI/CD configurado con GitHub Actions → Vercel ✓
- [x] **INFRA-08**: Lighthouse CI ejecutándose en cada PR ✓

## v2 Requirements

Diferidos para release futuro. Tracked pero no en roadmap actual.

### Analytics

- **ANAL-01**: Dashboard con estadísticas de productos más cotizados
- **ANAL-02**: Comparativa cotizados vs comprados (requiere tracking manual)
- **ANAL-03**: Gráficos de consultas por período

### Historial Avanzado

- **HIST-05**: Admin puede filtrar consultas por fecha, producto, estado
- **HIST-06**: Admin puede exportar consultas a CSV
- **HIST-07**: Admin puede marcar consultas como "atendida"/"pendiente"

### Catálogo Avanzado

- **CAT-06**: Galería de múltiples imágenes por producto
- **CAT-07**: Sección de productos destacados/temporada
- **CAT-08**: Campo de notas personalizadas en cotización

### Notificaciones

- **NOTF-01**: Admin recibe email cuando hay nueva consulta
- **NOTF-02**: Resumen diario de consultas por email

## Out of Scope

Explícitamente excluido. Documentado para prevenir scope creep.

| Feature | Razón |
|---------|-------|
| Carrito de compras | Reemplazado por sistema de cotización WhatsApp |
| Checkout/Pago online | Dueño gestiona ventas manualmente por WhatsApp |
| Pasarela Stripe | No se procesan pagos online |
| Sistema de pedidos | Cotización solo genera consulta, no pedido |
| Múltiples usuarios admin | Solo 1 cuenta admin + 1 dev es suficiente |
| App móvil nativa | Webapp responsive cubre necesidades |
| Notificaciones push | WhatsApp es el canal de comunicación |
| Multi-idioma | Solo español para mercado local chileno |
| Sistema de inventario | Demasiado complejo, solo toggle disponible/agotado |
| Chat en tiempo real | WhatsApp maneja la comunicación |
| Reviews/valoraciones | No aplica para modelo de cotización |
| Cuentas de usuario cliente | No necesario, cotización es anónima |

## Traceability

Qué fases cubren qué requisitos.

### Phase 1: Fundación & Migración DB
| Requirement | Status |
|-------------|--------|
| INFRA-01 | Complete ✓ |
| INFRA-02 | Complete ✓ |
| INFRA-03 | Complete ✓ |
| INFRA-07 | Complete ✓ |
| INFRA-08 | Complete ✓ |

### Phase 2: Sistema de Cotización
| Requirement | Status |
|-------------|--------|
| CAT-01 | Pending |
| CAT-02 | Pending |
| CAT-03 | Pending |
| CAT-04 | Pending |
| CAT-05 | Pending |
| SEL-01 | Pending |
| SEL-02 | Pending |
| SEL-03 | Pending |
| SEL-04 | Pending |
| SEL-05 | Pending |
| COT-01 | Pending |
| COT-02 | Pending |
| COT-03 | Pending |
| COT-04 | Pending |
| COT-05 | Pending |
| COT-06 | Pending |
| COT-07 | Pending |

### Phase 3: Arquitectura Split
| Requirement | Status |
|-------------|--------|
| INFRA-04 | Pending |
| INFRA-05 | Pending |
| INFRA-06 | Pending |

### Phase 4: Autenticación OTP
| Requirement | Status |
|-------------|--------|
| AUTH-01 | Pending |
| AUTH-02 | Pending |
| AUTH-03 | Pending |
| AUTH-04 | Pending |
| AUTH-05 | Pending |
| AUTH-06 | Pending |
| AUTH-07 | Pending |
| AUTH-08 | Pending |
| AUTH-09 | Pending |

### Phase 5: Panel Admin
| Requirement | Status |
|-------------|--------|
| PROD-01 | Pending |
| PROD-02 | Pending |
| PROD-03 | Pending |
| PROD-04 | Pending |
| PROD-05 | Pending |
| PROD-06 | Pending |
| PROD-07 | Pending |
| CATG-01 | Pending |
| CATG-02 | Pending |
| CATG-03 | Pending |
| CATG-04 | Pending |
| CONT-01 | Pending |
| CONT-02 | Pending |
| CONT-03 | Pending |

### Phase 6: Historial de Consultas
| Requirement | Status |
|-------------|--------|
| COT-08 | Pending |
| HIST-01 | Pending |
| HIST-02 | Pending |
| HIST-03 | Pending |
| HIST-04 | Pending |

### Phase 7: SEO & Performance
| Requirement | Status |
|-------------|--------|
| SEO-01 | Pending |
| SEO-02 | Pending |
| SEO-03 | Pending |
| SEO-04 | Pending |
| SEO-05 | Pending |
| SEO-06 | Pending |
| SEO-07 | Pending |

**Coverage:**
- v1 requirements: 60 total
- Mapped to phases: 60 ✓
- Unmapped: 0

---
*Requirements defined: 2026-01-30*
*Traceability updated: 2026-01-30 after roadmap creation*
