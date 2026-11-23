# GestorPro — Guía Rápida de Despliegue y Distribución

## Enlace de Descarga / Instalación
`https://j-svg-code.github.io/Gestor-de-Negocios-Venezuela/`

## Archivos incluidos en este ZIP
1. `index.html` — Aplicación completa optimizada (sin bloqueos de pantalla blanca, QR/códigos de barras libres, fotos bloqueadas hasta suscripción activa, cálculo en moneda local y USD en ventas y abonos de fiados, respaldo y recuperación en Firebase con limpieza de imágenes huérfanas y botón para compartir enlace por WhatsApp).
2. `sw.js` — Service Worker con caché rápido y sin pantalla blanca.
3. `manifest.json` — Configuración PWA con íconos locales (`icono-192.png` e `icono-512.png`).
4. `firestore.rules` — Reglas permanentes de seguridad para Cloud Firestore (`users`, `stores`, `subscriptions`).
5. `PRIVACIDAD_Y_TERMINOS.md` — Términos y condiciones actualizados.

## Nota sobre íconos y QR de pago
Asegúrate de mantener en la raíz de tu repositorio `icono-192.png`, `icono-512.png` y `qr-pagomovil.jpg` para que carguen junto con `index.html`, `manifest.json` y `sw.js`.

## Control de activación / suspensión por negocio en Firebase
En la colección `stores/{storeId}` en Firestore puedes controlar cada negocio de forma individual mediante:
- `estadoCuenta`: `"activa"` o `"inactiva"` (o `activa: true/false`)
- `suscripcionActiva`: `true` o `false` (habilita/bloquea agregar fotos a productos)
