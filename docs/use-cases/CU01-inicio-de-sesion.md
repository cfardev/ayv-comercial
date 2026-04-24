# CU01 - Inicio de sesión

## Objetivo

Permitir que un usuario registrado acceda al sistema de forma segura, aplicando permisos según su rol.

## Actores

- A: A: Usuario del sistema (administrador, vendedor, encargado de inventario, encargado de despacho, propietario/gerente)
- A: A: Sistema de autenticación

## Precondiciones

- A: El usuario está registrado en el sistema.
- A: El usuario tiene un rol asignado.
- A: La cuenta del usuario está activa.

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

- A: Si las credenciales no son válidas, el sistema rechaza el acceso y muestra un mensaje genérico de autenticación fallida.

### A2 - Usuario inactivo

- A: Si la cuenta está desactivada, el sistema deniega el acceso e informa que debe contactar al administrador.

### A3 - Datos incompletos o inválidos

- A: Si faltan datos o el formato es incorrecto, el sistema muestra validaciones de formulario y no envía la solicitud.

### A4 - Error técnico

- A: Si el servicio de autenticación no está disponible, el sistema informa un error temporal y permite reintentar.

## Postcondiciones

- A: Si el flujo es exitoso, el usuario queda autenticado y con permisos cargados según su rol.
- A: Si el flujo falla, no se crea sesión y el usuario permanece fuera del sistema.

## Reglas de negocio

- A: Solo usuarios activos pueden iniciar sesión.
- A: Las credenciales son obligatorias para autenticar.
- A: El acceso a módulos depende del rol asignado.
- A: El token de sesión debe tener tiempo de expiración configurado.

## Reglas de seguridad

- A: El sistema registra cada intento fallido con marca de tiempo e IP de origen.
- A: Tras 5 intentos fallidos consecutivos, la cuenta se bloquea automáticamente por 15 minutos.
- A: El mensaje de error debe ser genérico e idéntico независимо de si el usuario existe o no, para prevenir enumeración de cuentas.
- A: El API aplica rate limiting: máximo 10 solicitudes por minuto por IP en el endpoint de autenticación.

## Criterios de aceptación

- A: Con credenciales válidas y usuario activo, el sistema permite acceso y redirige según rol.
- A: Con credenciales inválidas, el sistema no permite acceso y no revela si el usuario existe.
- A: Con cuenta inactiva, el sistema no permite acceso e informa el estado de la cuenta.
- A: Con campos inválidos o vacíos, el formulario bloquea el envío y muestra errores.
