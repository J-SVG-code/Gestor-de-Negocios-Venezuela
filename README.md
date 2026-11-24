# Gestor Pro v2 — Firebase Auth, Verificación de Correo y Firestore

Este paquete conecta **Gestor Pro** con el proyecto Firebase `gestor-pro-venezuela` (`firebasejs/13.4.0`):

- **Pantalla inicial de acceso (`#auth-screen`)**: muestra primero las opciones para **Crear cuenta / Registrarse**, **Ya tengo una cuenta**, **Conectar mediante código QR** y **selector de idioma** (`ES`, `EN`, `PT`).
- **Confirmación de correo obligatoria**: al registrarse, llama a `sendEmailVerification(user)` y guarda el perfil en `users/{uid}`; al iniciar sesión, verifica `user.emailVerified` antes de abrir el panel principal y permite reenviar el correo de confirmación si aún no se ha validado.
- **Guardado de registros en Firestore**: guarda los movimientos del negocio en `users/{uid}/registros` y actualiza los indicadores visibles.
- **Atribución**: © Joelvy José Salazar Vargas.
