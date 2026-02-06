# Lighthouse Fixes - Analisis y Propuestas

## Analisis de los 14 fallos

Los problemas mas criticos y sus causas raiz:

### 1. **Unused JavaScript (score: 0)** - EL MAS GRAVE
El `PageLoader` en `RouterManager.jsx` importa `Spin` de antd, lo que fuerza a cargar el chunk `vendor-antd` (622KB) **en cada pagina**, incluso HomePage que no usa antd. Esto anula todo el code splitting.

**Fix**: Reemplazar `Spin` de antd por un spinner CSS puro en el fallback de Suspense.

### 2. **CLS (0.33) / Unsized images (0.5)**
Al quitar `width/height` de los logos para arreglar el "achatado", volvio el layout shift. Tambien el slider carga imagenes dinamicas sin dimensiones conocidas.

**Fix**: Devolver `width/height` a los logos pero con la clase CSS correcta (`object-contain` en vez de dejar que se deforme). Para el slider, ya tiene aspect-ratio en el contenedor.

### 3. **Legacy JavaScript (0.5)**
Vite por defecto transpila a ES2015. Podemos targetear navegadores modernos.

**Fix**: Agregar `build.target: 'esnext'` en vite.config.js.

### 4. **LCP (0.51) / FCP (0.37)**
La imagen mas grande (slider) no tiene `fetchpriority="high"`. El CSS se carga como render-blocking.

**Fix**: Agregar `fetchpriority="high"` al primer slide.

### 5. **Modern image formats / Responsive images (0, 0.5)**
Las imagenes vienen de Cloudinary sin transformaciones de formato ni tamano.

**Fix**: Agregar `f_auto,q_auto` y `w_XXX` en las URLs de Cloudinary para servir WebP/AVIF automaticamente y tamanos apropiados.

### 6. **Render-blocking resources (0.5)**
Los CSS se cargan bloqueando el render.

**Fix**: Esto se mitiga significativamente al resolver el unused JS (antd no se carga) y mejorar el target.

### 7. **Total byte weight (0.5)**
Consecuencia directa de cargar antd innecesariamente en HomePage.

---

**Los 3 cambios con mayor impacto serian: (1) quitar antd del PageLoader, (2) build target moderno, (3) fetchpriority + Cloudinary f_auto.**
