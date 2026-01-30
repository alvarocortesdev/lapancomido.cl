# La Pan Comido — Reconstrucción

## What This Is

Sitio web para panadería artesanal de masa madre en Caldera, Chile. Dos subproyectos: (1) sitio público con catálogo de productos y sistema de cotización vía WhatsApp, (2) webapp de administración en subdominio separado para gestionar contenido, productos y consultas.

## Core Value

**Los clientes pueden seleccionar productos del catálogo y enviar una consulta estructurada por WhatsApp al dueño en menos de 30 segundos.**

## Requirements

### Validated

*Inferido del código existente:*

- ✓ Landing page con identidad visual de la panadería — existing
- ✓ Catálogo de productos con imágenes y descripciones — existing
- ✓ Sistema de filtrado por etiquetas/categorías — existing
- ✓ Diseño responsive (mobile/tablet/desktop) — existing
- ✓ Integración con Cloudinary para imágenes — existing
- ✓ API REST con Express.js — existing
- ✓ Base de datos PostgreSQL (Supabase) — existing
- ✓ Autenticación JWT con roles — existing

### Active

**Sitio Público (lapancomido.cl):**

- [ ] Barra de selección persistente mostrando productos seleccionados, cantidades y total
- [ ] Modal de cotización con: nombre, celular, resumen editable de selección
- [ ] Generación de link wa.me con mensaje pre-estructurado
- [ ] Precios configurables (visible/oculto desde admin)
- [ ] SEO optimizado para Caldera, Chile
- [ ] Lighthouse score 100/100/100/100

**Admin Panel (admin.lapancomido.cl):**

- [ ] Autenticación: 2 usuarios predefinidos (dev/admin) con registro por email + OTP
- [ ] OTP por email vía Resend en primer login de dispositivo nuevo
- [ ] Sesión de 30 días con "remember me"
- [ ] CRUD de productos (crear, editar, eliminar, habilitar/deshabilitar)
- [ ] Gestión de etiquetas/categorías
- [ ] Gestión de precios (editar, configurar visibilidad)
- [ ] Upload/gestión de imágenes vía Cloudinary
- [ ] Edición de contenido del Home
- [ ] Historial de consultas guardado en BD con IDs de productos
- [ ] Rol dev: acceso completo, feature toggles
- [ ] Rol admin: gestión de contenido y productos

**Infraestructura:**

- [ ] Migración de SQL raw a Prisma ORM
- [ ] Integración de Resend para emails transaccionales
- [ ] CI/CD con GitHub Actions → Vercel
- [ ] Proyecto separado para admin (subdominio)

### Out of Scope

- Carrito de compras — reemplazado por sistema de cotización WhatsApp
- Proceso de checkout/pago — el dueño gestiona ventas manualmente
- Pasarela de pagos (Stripe) — no se procesan pagos online
- Sistema de pedidos online — cotización solo genera consulta
- Múltiples usuarios admin — solo 1 cuenta admin + 1 dev
- App móvil nativa — webapp responsive es suficiente
- Notificaciones push — WhatsApp es el canal de comunicación
- Multi-idioma — solo español para mercado local

## Context

**Estado actual del código:**
- Frontend React 18 con Vite 6, Tailwind CSS 4, Ant Design
- Backend Express con PostgreSQL (queries SQL raw, sin ORM)
- Autenticación JWT funcionando con roles admin/developer
- Carrito de compras implementado (a eliminar)
- Stripe integrado pero no activo (a eliminar)

**Decisión de arquitectura:**
- Sitio público: mantener estética actual, reconstruir lógica
- Panel admin: proyecto completamente nuevo en subdominio separado
- Backend: reconstruir con Prisma, estructura profesional
- El dueño atiende por WhatsApp actualmente — el sitio debe facilitar ese flujo

**Target users:**
- Clientes: residentes de Caldera buscando pan artesanal
- Admin: dueño de la panadería, usuario no técnico

## Constraints

- **Stack**: Vite/React + Express/Prisma + Supabase + Cloudinary + Resend — decisión del cliente
- **Performance**: Lighthouse 100/100/100/100 — requisito explícito
- **SEO**: Optimizado para "panadería masa madre Caldera Chile" — mercado local
- **Seguridad**: Admin en subdominio separado para aislamiento
- **WhatsApp**: Número del dueño hardcodeado (no configurable desde admin)
- **Idioma commits**: Español — preferencia del cliente
- **Metodología**: Trabajo estructurado multi-agente con fases claras

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Cotización WhatsApp en lugar de e-commerce | Dueño prefiere atención personalizada por chat | — Pending |
| Admin en subdominio separado | Aislamiento de seguridad, deploy independiente | — Pending |
| Prisma en lugar de SQL raw | Mejor DX, migraciones, type safety | — Pending |
| OTP por dispositivo + sesión 30 días | Balance seguridad/usabilidad para admin no técnico | — Pending |
| Guardar consultas en BD | Habilita futuras estadísticas de productos más cotizados | — Pending |
| 2 usuarios fijos (dev/admin) | Simplicidad, no se necesita registro público | — Pending |

---
*Last updated: 2026-01-30 after initialization*
