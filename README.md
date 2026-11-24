# Gestor Pro — Paquete Corregido

Este paquete contiene una estructura limpia y funcional para la pantalla inicial y el flujo de acceso de **Gestor Pro**:

- **Pantalla inicial de acceso (`#auth-screen`)**: se muestra primero cuando no hay sesión activa, con botones para **Crear cuenta / Registrarse**, **Ya tengo una cuenta**, **Conectar mediante código QR** y **selector de idioma** (`ES`, `EN`, `PT`).
- **Menú lateral cerrado por defecto**: el panel interno y el menú lateral permanecen ocultos hasta que el usuario completa el acceso o vincula por QR, y se cierra limpiamente al tocar `✕` o fuera del menú.
- **Diseño adaptable sin desborde horizontal**: `box-sizing: border-box` y `overflow-x: hidden` en móvil para evitar cortes o desplazamientos laterales.
- **Atribución**: © Joelvy José Salazar Vargas.
