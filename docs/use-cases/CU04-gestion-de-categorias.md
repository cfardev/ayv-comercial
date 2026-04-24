# CU04 - Gestión de categorías

## Objetivo

Crear, consultar, editar y desactivar categorías para clasificar y organizar los electrodomésticos y productos del hogar en el catálogo.

## Actores

- A: Administrador
- A: Encargado de inventario
- A: Sistema de categorías

## Precondiciones

- A: El actor está autenticado en el sistema.
- A: El actor tiene permisos para gestionar categorías.
- A: Existe al menos una categoría padre si se van a crear subcategorías.

## Disparador

El actor selecciona la opción "Gestión de categorías" desde el menú de inventario o administración.

## Flujo principal

### Creación de categoría

1. El actor accede al formulario de nueva categoría.
2. El sistema presenta los campos: nombre, descripción, categoría padre (opcional), estado.
3. El actor completa los campos obligatorios (nombre obligatorio; descripción y categoría padre opcionales).
4. El sistema valida que el nombre no esté duplicado en el mismo nivel de jerarquía.
5. El sistema crea la categoría con estado activo y fecha de creación.
6. El sistema muestra un mensaje de confirmación y actualiza el árbol de categorías.

### Consulta de categorías

1. El actor accede a la lista de categorías.
2. El sistema muestra la vista en árbol o tabla con columnas: nombre, descripción, categoría padre, cantidad de productos, estado.
3. El actor puede buscar por nombre o descripción.
4. El actor puede filtrar por categoría padre o estado (activo/inactivo).
5. El sistema presenta los resultados paginados (20 por página).

### Edición de categoría

1. El actor selecciona una categoría de la lista y elige "Editar".
2. El sistema presenta el formulario pre-poblado con los datos actuales.
3. El actor modifica los campos deseados (nombre, descripción, categoría padre).
4. El sistema valida los datos modificados (nombre único, no crear referencia circular).
5. El sistema actualiza el registro con la nueva información.
6. El sistema muestra un mensaje de confirmación.

### Desactivación de categoría

1. El actor selecciona una categoría de la lista y elige "Desactivar".
2. El sistema verifica que no existan productos asociados a la categoría.
3. Si hay productos asociados, el sistema muestra un error indicando que debe reasignar o eliminar los productos primero.
4. Si no hay productos asociados, el sistema solicita confirmación.
5. El actor confirma la desactivación.
6. El sistema cambia el estado de la categoría a inactivo.
7. Las subcategorías también se desactivan si el actor confirma.

### Reactivación de categoría

1. El actor selecciona una categoría inactiva de la lista y elige "Activar".
2. El sistema verifica que la categoría padre esté activa (si existe).
3. Si la categoría padre está inactiva, el sistema muestra un error indicando que debe activar la categoría padre primero.
4. Si la categoría padre está activa, el sistema cambia el estado a activo.
5. El sistema muestra un mensaje de confirmación.

## Flujos alternos

### FA1 - Nombre duplicado

- A: Si el nombre de la categoría ya existe en el mismo nivel de jerarquía, el sistema muestra un mensaje de error indicando el duplicado.

### FA2 - Productos asociados

- A: Si se intenta desactivar una categoría con productos asociados, el sistema rechaza la operación e indica la cantidad de productos afectados.

### FA3 - Referencia circular

- A: Si al editar se intenta establecer como categoría padre una categoría hija o la misma categoría, el sistema muestra un error indicando que no se permite la referencia circular.

### FA4 - Categoría padre inactiva

- A: Si se intenta crear una subcategoría de una categoría inactiva, el sistema muestra un error indicando que debe activar la categoría padre primero.

### FA5 - Jerarquía demasiado profunda

- A: Si se intenta crear una subcategoría con más de 3 niveles de profundidad, el sistema muestra un error indicando el límite de niveles.

## Postcondiciones

- A: Creación exitosa: la nueva categoría queda disponible para clasificar productos.
- A: Edición exitosa: los cambios quedan aplicados a la categoría.
- A: Desactivación exitosa: la categoría no puede ser asignada a nuevos productos; los productos existentes mantienen su categoría hasta ser reasignados.
- A: Reactivación exitosa: la categoría vuelve a estar disponible para productos.
- A: En cualquier caso fallido, no se modifica el estado de la categoría.

## Reglas de negocio

- A: Las categorías pueden tener hasta 3 niveles de profundidad (categoría > subcategoría > sub-subcategoría).
- A: No puede haber dos categorías con el mismo nombre en el mismo nivel de jerarquía.
- A: Una categoría desactivada no puede tener productos asociados.
- A: Al desactivar una categoría padre, las subcategorías también se desactivan.
- A: Las categorías inactivas no son visibles para usuarios normales en el catálogo.

## Reglas de seguridad

- A: Solo usuarios con rol administrador o encargado de inventario pueden crear, editar o desactivar categorías.
- A: Los nombres de categorías deben sanitizarse para prevenir inyecciones.
- A: Todas las operaciones de gestión de categorías quedan registradas con usuario responsable, fecha y hora.

## Criterios de aceptación

- A: Un usuario con permisos puede crear una nueva categoría con datos válidos y recibe confirmación.
- A: Un usuario con permisos puede editar los datos de una categoría existente.
- A: Un usuario con permisos puede desactivar una categoría sin productos asociados.
- A: El sistema rechaza la desactivación de una categoría con productos activos.
- A: El sistema muestra errores claros cuando los campos no cumplen validación.
- A: Las categorías inactivas no aparecen en el catálogo público pero sí en la gestión.