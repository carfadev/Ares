# Módulo de Operaciones — Manual

## 1. Login

El usuario ingresa con email y contraseña en `/login`.

- Firebase Auth valida credenciales
- Al autenticarse, `AuthGate` redirige al home (`/`)
- Si ya hay sesión activa, el login redirige automáticamente al home

## 2. Nombre de usuario en el saludo

En el home (`/`) se muestra:

> Buenos días, **Monitoreo**

Ese nombre se lee de `Firestore → usuarios → {uid} → campo nombre`.

Si no tiene `nombre`, muestra el email. Si no tiene email, muestra "Usuario".

Para cambiar el nombre: Firebase Console → Firestore → `usuarios/{uid}` → editar campo `nombre`.

## 3. Asignación de sede

La sede **no la elige el usuario**. La asigna el administrador desde Firebase Console.

### Cómo asignar:

1. Ve a Firebase Console → Firestore → colección `usuarios`
2. Busca el documento con el UID del usuario (o el email si usas ese ID)
3. Agrega o edita el campo `sede` con el nombre exacto de la sede

### Sedes disponibles (definidas en `src/data/sedes.js`):

| Clave | Bodegas que ve el usuario |
|-------|---------------------------|
| `ZONA FRANCA` | ZONA FRANCA 2, 4, 5, 6 |
| `CELTA` | BODEGA 79, 29, 78, 61, 98/2, 31/502, 116 |
| `INTEXZONA` | BODEGA 13, 40, 95A, 95B |
| `RECODO` | RECODO |
| `RIV` | BODEGA 5i, 2i, 13i |
| `YUMBO CORTIJO` | YUMBO CORTIJO |
| `TLC PISA` | TLC PISA |
| `LA ESTRELLA MEDELLIN` | LA ESTRELLA MEDELLIN |
| `CARTAGENA` | CARTAGENA |
| `SAN CAYETANO` | BODEGA 5 |

> ⚠️ La clave debe escribirse **exacto** (mayúsculas, tildes, espacios).

### ¿Qué pasa si el usuario no tiene sede?

Se muestra una pantalla bloqueante:

> **Sin sede asignada** — No tienes una sede asignada. Contacta a tu supervisor o administrador.

### ¿Qué pasa si el admin cambia la sede mientras el usuario está autenticado?

El sistema detecta el cambio en tiempo real gracias a `onSnapshot` y **cierra la sesión del usuario automáticamente**. Al volver a ingresar, carga la nueva sede.

Esto permite que un vigilante que rota a otra sede reciba la asignación nueva al re-autenticarse.

### Cache de sede

La sede se guarda en `sessionStorage` con expiración de 12 horas. Al cerrar la pestaña o pasar 12h, se limpia y se vuelve a leer desde Firestore.

## Seguridad de sesión

### Duración máxima de sesión

Al iniciar sesión, se guarda la hora exacta en `localStorage` (`ares_login_time`). Un proceso en segundo plano (`SessionManager`) verifica cada minuto si han pasado **12 horas**. Si es así, cierra sesión automáticamente.

Esto evita que una sesión quede activa para siempre aunque el usuario nunca cierre el navegador.

### Cierre por inactividad

Si el usuario no mueve el mouse, escribe o hace clic durante **30 minutos**, la sesión se cierra automáticamente.

Los eventos que reinician el contador de inactividad:
- `mousemove` — mover el mouse
- `keydown` — teclear
- `click` — hacer clic
- `touchstart` — tocar la pantalla (móvil)
- `scroll` — hacer scroll

### ¿Qué pasa cuando se cierra la sesión?

1. `signOut(auth)` limpia la autenticación de Firebase
2. El store de Zustand se limpia solo (`user: null`)
3. `localStorage` se limpia (`ares_login_time`)
4. AuthGate redirige al login
5. En el login se muestra un mensaje explicando el motivo:
   - *"Tu sesión cerró por inactividad. Ingresa de nuevo."* (30min sin actividad)
   - *"Tu sesión expiró. Ingresa de nuevo."* (12h de duración máxima)

### Resumen de temporizadores

| Temporizador | Duración | ¿Se reinicia? | Al vencer |
|---|---|---|---|
| Sesión máxima | 12h desde login | No, es fijo | Cierra sesión |
| Inactividad | 30min sin interacción | Sí, con cada acción | Cierra sesión |
| Cache de sede | 12h desde que se guardó | No, es fijo | Vuelve a leer de Firestore |