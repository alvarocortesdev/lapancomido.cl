# Phase 5: Autenticación OTP - Context

**Gathered:** 2026-02-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin puede iniciar sesión con OTP en dispositivos nuevos. Incluye: 2 usuarios predefinidos (dev/admin), login con email/contraseña, setup inicial para establecer email y contraseña, OTP por email vía Resend en dispositivo nuevo, dispositivo confiable por 30 días, roles diferenciados.

</domain>

<decisions>
## Implementation Decisions

### Flujo de primer login
- Usuario ingresa username + contraseña temporal en login
- Vista siguiente pide email + botón "Validar Correo"
- Se envía OTP de 8 dígitos (válido 5 min) al email
- Usuario ingresa OTP + nueva contraseña (2 veces)
- Al validar, vuelve al login para confirmar datos correctos
- Después del login exitoso, pregunta si confiar en dispositivo por 30 días
- Emails NO están en seed, se piden durante setup
- Política contraseña: 8+ chars, 1 número, 1 mayúscula, 1 minúscula, 1 caracter especial

### Experiencia OTP
- 8 dígitos numéricos
- Expira en 5 minutos
- 3 intentos fallidos → bloqueo 15 minutos
- Input único (no cajitas separadas)
- Reenvío: 1er inmediato, 2do espera 15s, 3ro+ espera 30s
- Mensaje error: "Código incorrecto, te quedan X intentos" + hint "Revisa tu bandeja de spam"

### Confianza de dispositivo
- Cookie segura (HttpOnly, Secure, SameSite) con token único
- Duración: 30 días
- Checkbox explícito: "Confiar en este dispositivo por 30 días"
- Admin puede cerrar todas las sesiones desde página de configuración

### UI de login admin
- Mobile-first (webapp admin)
- Branding completo: logo La Pan Comido + colores marca (#F5E1A4, #262011)
- Errores inline bajo el campo en rojo
- Captcha: Cloudflare Turnstile

### Claude's Discretion
- Estilo visual del login (card centrada, split, minimalista) — elegir lo más cómodo/intuitivo para mobile
- Diseño exacto de la página de configuración con "Cerrar todas las sesiones"

</decisions>

<specifics>
## Specific Ideas

- El flujo post-setup vuelve al login para "confirmar datos correctos" — no entra directo al dashboard
- Página de configuración incluirá "Cerrar todas las sesiones" (no en menú de usuario)
- Emails transaccionales via Resend (ya configurado: contacto@lapancomido.cl)

</specifics>

<deferred>
## Deferred Ideas

- Gestión individual de dispositivos confiables (ver lista, revocar uno específico) — futuro
- Recuperación de contraseña olvidada — evaluar si necesario dado que solo 2 usuarios

</deferred>

---

*Phase: 05-autenticacion-otp*
*Context gathered: 2026-02-01*
