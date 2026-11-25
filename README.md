# GestorPro & Gestor Pro (Control de Cobros) — Paquete Actualizado

Este paquete reúne los archivos actualizados y listos para desplegar:

- `index.html`: Aplicación principal **GestorPro** (PWA de gestión empresarial, inventario, ventas, fiados, caja multimoneda, vinculación por QR y escucha en tiempo real del estado de suscripción).
- `manifest.json`: Manifiesto PWA apuntando a `./index.html` y a los íconos `./icono-192.png` y `./icono-512.png`.
- `sw.js`: Service Worker actualizado (`gestorpro-v7-github`) con caché de recursos base.
- `icono-192.png` y `icono-512.png`: Íconos PWA generados para instalación en dispositivos.
- `admin-cobros.html`, `app.js` y `styles.css`: Panel **Gestor Pro · Control de Cobros** para registro de negocios (1er mes gratis), validación de referencias de pago sin duplicados, revisión de vencimientos y bloqueo/reactivación de cuentas en Firebase.
- `firestore.rules`: Reglas de seguridad estructuradas que mantienen activo el control de suscripciones/bloqueos desde el panel administrador y permiten la sincronización en tiempo real de las cuentas habilitadas.
- `assets/qr-pago-movil.jpg` (si existía imagen válida embebida): Respaldo de imagen QR.

## Despliegue rápido
1. Sube los archivos de **GestorPro** (`index.html`, `manifest.json`, `sw.js`, `icono-192.png`, `icono-512.png`) a tu hosting / GitHub Pages.
2. Publica `firestore.rules` en Firebase Console → Firestore Database → Reglas.
3. Abre `admin-cobros.html` (servido por HTTP/HTTPS para módulos ES6 `app.js`) e inicia sesión con tu cuenta de administrador.
