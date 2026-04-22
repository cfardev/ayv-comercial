# CU01 - Inicio de sesión

## Objetivo

Permitir que un usuario registrado acceda al sistema de forma segura, aplicando permisos según su rol.

## Actores

- Usuario del sistema (administrador, vendedor, encargado de inventario, encargado de despacho, propietario/gerente)
- Sistema de autenticación

## Precondiciones

- El usuario está registrado en el sistema.
- El usuario tiene un rol asignado.
- La cuenta del usuario está activa.

## Disparador

El usuario abre la pantalla de acceso e intenta iniciar sesión con sus credenciales.

## Flujo principal

1. El usuario ingresa su identificador (correo o usuario) y contraseña.
2. El sistema valida que los campos estén completos y en formato correcto.
3. El sistema envía las credenciales al servicio de autenticación.
4. El servicio verifica las credenciales contra la base de datos.
5. El servicio valida que la cuenta esté activa y con rol vigente.
6. El sistema genera un token de sesión (JWT) con expiración.
7. El cliente almacena la sesión según la política de seguridad definida.
8. El sistema redirige al usuario al módulo inicial permitido por su rol.

## Flujos alternos

### A1 - Credenciales inválidas

- Si las credenciales no son válidas, el sistema rechaza el acceso y muestra un mensaje genérico de autenticación fallida.

### A2 - Usuario inactivo

- Si la cuenta está desactivada, el sistema deniega el acceso e informa que debe contactar al administrador.

### A3 - Datos incompletos o inválidos

- Si faltan datos o el formato es incorrecto, el sistema muestra validaciones de formulario y no envía la solicitud.

### A4 - Error técnico

- Si el servicio de autenticación no está disponible, el sistema informa un error temporal y permite reintentar.

## Postcondiciones

- Si el flujo es exitoso, el usuario queda autenticado y con permisos cargados según su rol.
- Si el flujo falla, no se crea sesión y el usuario permanece fuera del sistema.

## Reglas de negocio

- Solo usuarios activos pueden iniciar sesión.
- Las credenciales son obligatorias para autenticar.
- El acceso a módulos depende del rol asignado.
- El token de sesión debe tener tiempo de expiración configurado.

## Reglas de seguridad

- El sistema registra cada intento fallido con marca de tiempo e IP de origen.
- Tras 5 intentos fallidos consecutivos, la cuenta se bloquea automáticamente por 15 minutos.
- El mensaje de error debe ser genérico e idéntico независимо de si el usuario existe o no, para prevenir enumeración de cuentas.
- El API aplica rate limiting: máximo 10 solicitudes por minuto por IP en el endpoint de autenticación.

## Criterios de aceptación

- Con credenciales válidas y usuario activo, el sistema permite acceso y redirige según rol.
- Con credenciales inválidas, el sistema no permite acceso y no revela si el usuario existe.
- Con cuenta inactiva, el sistema no permite acceso e informa el estado de la cuenta.
- Con campos inválidos o vacíos, el formulario bloquea el envío y muestra errores.
