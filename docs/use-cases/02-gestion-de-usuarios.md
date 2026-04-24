# CU02 - Gestión de usuarios

Permite registrar, consultar, editar y desactivar usuarios que utilizarán el sistema.

## Objetivo

Registrar, consultar, modificar y desactivar usuarios que accederán al sistema, asignándoles un rol que determinará sus permisos.

## Actores

- Administrador
- Sistema de usuarios

## Precondiciones

- El actor está autenticado en el sistema.
- El actor tiene permiso para gestionar usuarios.
- Existe al menos un rol definido en el sistema (referencia CU03).

## Disparador

El actor selecciona la opción "Gestión de usuarios" desde su menú de administración.

## Flujo principal

### Registro de usuario

1. El actor accede al formulario de registro de nuevo usuario.
2. El sistema presenta los campos: nombre completo, correo electrónico, nombre de usuario, contraseña inicial, rol.
3. El actor completa los campos obligatorios.
4. El sistema valida que el correo y nombre de usuario no estén duplicados.
5. El sistema encripta la contraseña antes de almacenarla.
6. El sistema crea el usuario con estado activo y fecha de creación.
7. El sistema muestra un mensaje de confirmación y actualiza la lista de usuarios.

### Consulta de usuarios

1. El actor accede a la lista de usuarios.
2. El sistema muestra la tabla con columnas: nombre, correo, usuario, rol, estado, fecha de creación.
3. El actor puede buscar por nombre, correo o usuario.
4. El actor puede filtrar por rol o estado (activo/inactivo).
5. El sistema presenta los resultados paginados (20 por página).

### Edición de usuario

1. El actor selecciona un usuario de la lista y elige "Editar".
2. El sistema presenta el formulario pre-poblado con los datos actuales.
3. El actor modifica los campos deseados (nombre, correo, rol).
4. El sistema valida los datos modificados (correo único, campos obligatorios).
5. El sistema actualiza el registro con la nueva información.
6. El sistema muestra un mensaje de confirmación.

### Desactivación de usuario

1. El actor selecciona un usuario de la lista y elige "Desactivar".
2. El sistema solicita confirmación indicando que el usuario perderá acceso.
3. El actor confirma la desactivación.
4. El sistema cambia el estado del usuario a inactivo sin eliminar el registro.
5. El usuario inactivo no podrá iniciar sesión.

### Reactivación de usuario

1. El actor selecciona un usuario inactivo de la lista y elige "Activar".
2. El sistema cambia el estado a activo.
3. El sistema muestra un mensaje de confirmación.

## Flujos alternos

### FA1 - Correo o usuario duplicado

- Si el correo o nombre de usuario ya existe, el sistema muestra un mensaje de error indicando cuál campo está duplicado y no permite el registro.

### FA2 - Datos incompletos en registro/edición

- Si faltan campos obligatorios, el sistema muestra validaciones en el formulario y no envía la solicitud.

### FA3 - Desactivar su propia cuenta

- Si el actor intenta desactivarse a sí mismo, el sistema muestra un error indicando que no puede realizar esta acción sobre su propia cuenta.

### FA4 - Contraseña débil

- Si la contraseña no cumple con requisitos mínimos (8 caracteres, mayúscula, número), el sistema muestra el requisito específico y no permite el registro.

## Postcondiciones

- Registro exitoso: el nuevo usuario queda creado con estado activo y puede iniciar sesión.
- Edición exitosa: los cambios quedan aplicados al usuario.
- Desactivación exitosa: el usuario no puede iniciar sesión; sus datos permanecen en la base de datos.
- En cualquier caso fallido, no se modifica el estado del usuario.

## Reglas de negocio

- Todo usuario debe tener un rol asignado.
- No puede haber dos usuarios con el mismo correo electrónico.
- No puede haber dos usuarios con el mismo nombre de usuario.
- Los usuarios desactivados no pueden iniciar sesión.
- Un usuario administrador no puede ser desactivado por sí mismo.
- La contraseña debe tener mínimo 8 caracteres, al menos una mayúscula y un número.

## Reglas de seguridad

- Las contraseñas se almacenan utilizando hashbcrypt con costo 12.
- No se muestra el mensaje de error diferenciado para correo o usuario inexistente (prevenir enumeración).
- Solo usuarios con rol administrador pueden crear, editar o desactivar usuarios.
- Todas las operaciones de gestión de usuarios quedan registradas con usuario responsable, fecha y hora.

## Criterios de aceptación

- Un administrador puede crear un nuevo usuario con datos válidos y recibe confirmación.
- Un administrador puede editar los datos de un usuario existente.
- Un administrador puede desactivar un usuario y este pierde acceso.
- Un administrador puede reactivar un usuario inactivo.
- Un usuario inactivo no puede iniciar sesión.
- El sistema rechaza registro con correo o usuario duplicado.
- El sistema muestra errores claros cuando los campos no cumplen validación.
- Un usuario no puede desactivarse a sí mismo.