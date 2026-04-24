# CU05 - Gestión de productos

## Objetivo

Registrar, consultar, editar y desactivar productos del catálogo de la distribuidora de electrodomésticos y artículos para el hogar.

## Actores

- A: Administrador
- A: Encargado de inventario
- A: Vendedor
- A: Sistema de productos

## Precondiciones

- A: El actor está autenticado en el sistema.
- A: El actor tiene permisos para gestionar productos.
- A: Existen categorías disponibles para clasificar los productos (referencia CU04).

## Disparador

El actor selecciona la opción "Gestión de productos" desde el menú de inventario o ventas.

## Flujo principal

### Registro de producto

1. El actor accede al formulario de nuevo producto.
2. El sistema presenta los campos: código, nombre, descripción, categoría, unidad de medida, costo, precio de venta, stock mínimo, proveedor.
3. El actor completa los campos obligatorios (código, nombre, categoría, costo, precio de venta).
4. El sistema valida que el código no esté duplicado.
5. El sistema crea el producto con estado activo y fecha de creación.
6. El sistema muestra un mensaje de confirmación y actualiza la lista de productos.

### Consulta de productos

1. El actor accede a la lista de productos.
2. El sistema muestra la tabla con columnas: código, nombre, categoría, costo, precio de venta, stock actual, stock mínimo, estado.
3. El actor puede buscar por código, nombre o descripción.
4. El actor puede filtrar por categoría, estado (activo/inactivo) o rango de precios.
5. El sistema presenta los resultados paginados (20 por página).

### Edición de producto

1. El actor selecciona un producto de la lista y elige "Editar".
2. El sistema presenta el formulario pre-poblado con los datos actuales.
3. El actor modifica los campos deseados (nombre, descripción, categoría, costos, precios).
4. El sistema valida los datos modificados (código único si cambia, precios numéricos positivos).
5. El sistema actualiza el registro con la nueva información.
6. El sistema muestra un mensaje de confirmación.

### Desactivación de producto

1. El actor selecciona un producto de la lista y elige "Desactivar".
2. El sistema verifica que no existan ventas asociadas al producto.
3. Si hay ventas asociadas, el sistema permite la desactivación mostrando una advertencia.
4. El sistema solicita confirmación.
5. El actor confirma la desactivación.
6. El sistema cambia el estado del producto a inactivo.
7. El producto inactivo no aparecerá en el catálogo ni podrá ser agregado a nuevas ventas.

### Reactivación de producto

1. El actor selecciona un producto inactivo de la lista y elige "Activar".
2. El sistema cambia el estado a activo.
3. El sistema muestra un mensaje de confirmación.

## Flujos alternos

### FA1 - Código duplicado

- A: Si el código del producto ya existe, el sistema muestra un mensaje de error indicando el duplicado.

### FA2 - Datos incompletos

- A: Si faltan campos obligatorios, el sistema muestra validaciones en el formulario y no envía la solicitud.

### FA3 - Precio o costo inválido

- A: Si el precio de venta es menor o igual al costo, el sistema muestra una advertencia indicando posible margen negativo.

### FA4 - Categoría inexistente

- A: Si la categoría seleccionada no existe o está inactiva, el sistema muestra un error y no permite el registro.

### FA5 - Stock negativo

- A: Si al editar se intenta establecer un stock negativo, el sistema muestra un error indicando que el stock no puede ser negativo.

## Postcondiciones

- A: Registro exitoso: el nuevo producto queda disponible en el catálogo.
- A: Edición exitosa: los cambios quedan aplicados al producto.
- A: Desactivación exitosa: el producto no aparece en ventas nuevas pero permanece en el historial.
- A: Reactivación exitosa: el producto vuelve a estar disponible para ventas.
- A: En cualquier caso fallido, no se modifica el estado del producto.

## Reglas de negocio

- A: El código de producto debe ser único en el sistema.
- A: El precio de venta debe ser mayor que el costo.
- A: El stock mínimo debe ser un número mayor o igual a cero.
- A: Los productos desactivados no aparecen en el catálogo ni en nuevas ventas.
- A: Los productos activos no pueden tener categoría inactiva.

## Reglas de seguridad

- A: Solo usuarios con rol administrador, encargado de inventario o vendedor pueden consultar productos.
- A: Solo usuarios con rol administrador o encargado de inventario pueden crear, editar o desactivar productos.
- A: Los campos numéricos deben validarse para prevenir inyecciones.
- A: Todas las operaciones de gestión de productos quedan registradas con usuario responsable, fecha y hora.

## Criterios de aceptación

- A: Un usuario con permisos puede crear un nuevo producto con datos válidos y recibe confirmación.
- A: Un usuario con permisos puede editar los datos de un producto existente.
- A: Un usuario con permisos puede desactivar un producto.
- A: El sistema rechaza el registro con código duplicado.
- A: El sistema muestra advertencias cuando el precio de venta es menor al costo.
- A: Los productos desactivados no aparecen en el catálogo de ventas.