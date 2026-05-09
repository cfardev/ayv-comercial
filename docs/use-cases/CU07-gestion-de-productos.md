# CU07 - Gestión de productos

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
- A: Existen marcas disponibles para identificar el fabricante o línea comercial del producto (referencia CU05).

## Disparador

El actor selecciona la opción "Gestión de productos" desde el menú de inventario o ventas.

## Flujo principal

### Registro de producto

1. El actor accede al formulario de nuevo producto.
2. El sistema presenta los campos: código, nombre, descripción, categoría, marca, unidad de medida, costo, precio de venta, stock mínimo, estado.
3. El actor completa los campos obligatorios (código, nombre, categoría, marca, costo, precio de venta).
4. El sistema valida que el código no esté duplicado.
5. El sistema crea el producto con estado activo y fecha de creación.
6. El sistema muestra un mensaje de confirmación y actualiza la lista de productos.

### Consulta de productos

1. El actor accede a la lista de productos.
2. El sistema muestra la tabla con columnas: código, nombre, categoría, marca, costo, precio de venta, stock actual, stock mínimo, estado.
3. El actor puede buscar por código, nombre o descripción.
4. El actor puede filtrar por categoría, marca, estado (activo/inactivo) o rango de precios.
5. El sistema presenta los resultados paginados (20 por página).

### Edición de producto

1. El actor selecciona un producto de la lista y elige "Editar".
2. El sistema presenta el formulario pre-poblado con los datos actuales.
3. El actor modifica los campos deseados (nombre, descripción, categoría, marca, costos, precios).
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

### FA5 - Marca inexistente o inactiva

- A: Si la marca seleccionada no existe o está inactiva, el sistema muestra un error y no permite el registro o la edición.

### FA6 - Stock negativo

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
- A: Los productos activos no pueden tener marca inactiva.
- A: Un producto no queda asociado a un proveedor único dentro de su ficha maestra.
- A: La relación entre productos y proveedores se registra en las órdenes de compra (CU09) y/o entradas de inventario (CU10).

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
- A: Los productos cuya categoría está inactiva no son visibles en el catálogo de ventas (reflejo de CU04 CA6).
- A: Los productos cuya marca está inactiva no son visibles en el catálogo de ventas (reflejo de CU05).

## Implementación técnica

> **Dependencias:** CU04 (categorías), CU05 (marcas)  
> **Orden sugerido de desarrollo:** #7

### Base de datos

- [x] Crear modelo Prisma `Product` con campos: `id`, `code` (único), `name`, `description?`, `categoryId`, `brandId`, `unitOfMeasure`, `cost` (Decimal), `salePrice` (Decimal), `minStock` (Int, default 0), `currentStock` (Int, default 0), `isActive`, `createdAt`, `updatedAt`; con `@@map("products")`
- [x] Agregar índice único en `code`
- [x] Agregar relación `Product` → `Category` (FK `categoryId`) y `Product` → `Brand` (FK `brandId`)
- [x] Agregar relaciones inversas en `Category` y `Brand` (`products Product[]`)
- [x] Crear migración de base de datos

### API (NestJS)

- [x] Crear `ProductsModule` con `ProductsService` y `ProductsController`
- [x] `POST /products` — crear producto; validar `code` único; verificar que `categoryId` y `brandId` existan y estén activos; guard `ADMIN | INVENTORY_MANAGER`
- [x] `GET /products` — listar paginado (20/página); filtros: `search` (código, nombre, descripción), `categoryId`, `brandId`, `isActive`, rango de precios; activos por defecto; incluir nombre de categoría y marca en respuesta
- [x] `GET /products/:id` — detalle del producto
- [x] `PATCH /products/:id` — editar; validar `code` único si cambia; verificar categoría y marca activas; guard `ADMIN | INVENTORY_MANAGER`
- [x] `PATCH /products/:id/deactivate` — cambiar `isActive = false`; mostrar advertencia si tiene ventas; guard `ADMIN | INVENTORY_MANAGER`
- [x] `PATCH /products/:id/activate` — cambiar `isActive = true`; guard `ADMIN | INVENTORY_MANAGER`
- [x] Validar que `salePrice > cost` (advertencia, no error bloqueante)
- [x] `DTO CreateProductDto` y `UpdateProductDto` con `class-validator`: `@IsPositive` en `cost` y `salePrice`, `@Min(0)` en `minStock`
- [x] Registrar operaciones con usuario responsable y timestamp
- [ ] No exponer `cost` a usuarios con rol `SELLER` (filtrar campo en la respuesta)

### Frontend (React)

- [x] Crear página `/products` protegida para todos los roles autenticados (solo consulta para `SELLER`)
- [x] Tabla paginada con columnas: código, nombre, categoría, marca, precio de venta, stock actual, stock mínimo, estado
- [ ] Mostrar columna de costo solo para `ADMIN` e `INVENTORY_MANAGER`
- [x] Buscador por código, nombre o descripción (debounce)
- [x] Filtros por categoría, marca, estado; activo por defecto
- [x] Botón "Nuevo producto" → formulario con todos los campos; selectores de categoría y marca que solo muestran activos
- [ ] Advertencia visual si `salePrice <= cost` al completar el formulario
- [x] Botón "Editar" → formulario pre-poblado
- [x] Botón "Desactivar" / "Activar" con diálogo de confirmación
- [x] Integrar con TanStack Query; invalidar caché tras mutaciones
