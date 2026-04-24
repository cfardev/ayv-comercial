# CU03 - Gestión de roles y permisos

## Objetivo

Definir y administrar los roles disponibles en el sistema, asignando permisos que controlen qué acciones puede realizar cada tipo de usuario.

## Actores

- A: Administrador
- A: Sistema de permisos

## Precondiciones

- A: El actor está autenticado en el sistema con rol de administrador.
- A: El sistema cuenta con al menos un rol base definido.

## Disparador

El administrador selecciona la opción "Gestión de roles y permisos" desde el panel de administración.

## Flujo principal

### Creación de rol

1. El administrador accede al formulario de creación de nuevo rol.
2. El sistema presenta los campos: nombre del rol, descripción, lista de permisos disponibles.
3. El administrador completa el nombre y descripción obligatorios.
4. El administrador selecciona los permisos que tendrá el rol (lectura, creación, edición, eliminación, reportes, etc.).
5. El sistema valida que el nombre del rol no esté duplicado.
6. El sistema crea el rol con los permisos asignados y fecha de creación.
7. El sistema muestra un mensaje de confirmación y actualiza la lista de roles.

### Consulta de roles

1. El administrador accede a la lista de roles.
2. El sistema muestra la tabla con columnas: nombre, descripción, cantidad de permisos, cantidad de usuarios asociados, fecha de creación.
3. El administrador puede buscar por nombre o descripción.
4. El sistema presenta los resultados paginados (20 por página).

### Edición de rol

1. El administrador selecciona un rol de la lista y elige "Editar".
2. El sistema presenta el formulario pre-poblado con los datos actuales.
3. El administrador modifica el nombre, descripción o permisos deseados.
4. El sistema valida los datos modificados (nombre único, al menos un permiso).
5. El sistema actualiza el registro con la nueva información.
6. El sistema muestra un mensaje de confirmación.

### Desactivación de rol

1. El administrador selecciona un rol de la lista y elige "Desactivar".
2. El sistema verifica que no existan usuarios asociados al rol.
3. Si hay usuarios asociados, el sistema muestra un error indicando que debe reasignar los usuarios primero.
4. Si no hay usuarios asociados, el sistema solicita confirmación.
5. El administrador confirma la desactivación.
6. El sistema cambia el estado del rol a inactivo.
7. Los permisos asociados al rol permanecen para referencia histórica.

## Flujos alternos

### FA1 - Nombre de rol duplicado

- A: Si el nombre del rol ya existe, el sistema muestra un mensaje de error y no permite la creación.

### FA2 - Rol con usuarios asociados

- A: Si se intenta desactivar un rol que tiene usuarios asociados, el sistema rechaza la operación e indica que se deben reasignar los usuarios primero.

### FA3 - Desactivar rol con permisos críticos

- A: Si el rol tiene permisos críticos para la operación del sistema, el sistema muestra una advertencia y solicita confirmación adicional.

### FA4 - Edición de rol en uso

- A: Si el rol está siendo utilizado por usuarios activos, el sistema permite la edición pero muestra una advertencia sobre el impacto potencial.

## Postcondiciones

- A: Creación exitosa: el nuevo rol queda disponible para ser asignado a usuarios.
- A: Edición exitosa: los cambios quedan aplicados al rol y afectan a todos los usuarios asociados.
- A: Desactivación exitosa: el rol no puede ser asignado a nuevos usuarios; los usuarios existentes mantienen sus permisos hasta ser reasignados.
- A: En cualquier caso fallido, no se modifica el estado del rol.

## Reglas de negocio

- A: Todo usuario debe tener al menos un rol asignado.
- A: No puede haber dos roles con el mismo nombre.
- A: Un rol debe tener al menos un permiso asignado.
- A: Los roles no pueden ser eliminados, solo desactivados.
- A: El rol "Administrador" no puede ser desactivado ni tener sus permisos reducidos.

## Reglas de seguridad

- A: Solo usuarios con rol administrador pueden crear, editar o desactivar roles.
- A: Los permisos se asignan de forma granular para cumplir el principio de mínimo privilegio.
- A: Todas las operaciones de gestión de roles quedan registradas con usuario responsable, fecha y hora.
- A: No se permite asignar permisos que el propio administrador no posea.

## Criterios de aceptación

- A: Un administrador puede crear un nuevo rol con permisos específicos y recibe confirmación.
- A: Un administrador puede editar los permisos de un rol existente.
- A: Un administrador puede desactivar un rol que no tenga usuarios asociados.
- A: El sistema rechaza la desactivación de un rol con usuarios activos.
- A: Los permisos de un rol se aplican inmediatamente a todos los usuarios asociados.
- A: Un rol sin permisos no puede ser creado.