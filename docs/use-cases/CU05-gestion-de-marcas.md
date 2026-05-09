# CU05 - Gestión de marcas

## Objetivo

Crear, consultar, editar y desactivar marcas comerciales para agrupar y filtrar productos del catálogo de la distribuidora de electrodomésticos y artículos para el hogar.

## Actores

- A: Administrador
- A: Encargado de inventario
- A: Sistema de marcas

## Precondiciones

- A: El actor está autenticado en el sistema.
- A: El actor tiene permisos para gestionar marcas.

## Disparador

El actor selecciona la opción "Gestión de marcas" desde el menú de inventario o administración.

## Flujo principal

### Creación de marca

1. El actor accede al formulario de nueva marca.
2. El sistema presenta los campos: nombre, descripción (opcional), estado.
3. El actor completa los campos obligatorios (nombre).
4. El sistema valida que el nombre no esté duplicado respecto al resto de marcas.
5. El sistema crea la marca con estado activo y fecha de creación.
6. El sistema muestra un mensaje de confirmación y actualiza la lista de marcas.

### Consulta de marcas

1. El actor accede a la lista de marcas.
2. El sistema muestra una tabla con columnas: nombre, descripción, cantidad de productos, estado.
3. El actor puede buscar por nombre o descripción.
4. El actor puede filtrar por estado (activo/inactivo); por defecto se muestran solo las activas.
5. El sistema presenta los resultados paginados (20 por página).

### Edición de marca

1. El actor selecciona una marca de la lista y elige "Editar".
2. El sistema presenta el formulario pre-poblado con los datos actuales.
3. El actor modifica los campos deseados (nombre, descripción).
4. El sistema valida los datos modificados (nombre único).
5. El sistema actualiza el registro con la nueva información.
6. El sistema muestra un mensaje de confirmación.

### Desactivación de marca

1. El actor selecciona una marca de la lista y elige "Desactivar".
2. El sistema verifica que no existan productos activos asociados a la marca.
3. Si hay productos activos asociados, el sistema muestra un error indicando que debe reasignar los productos o desactivarlos primero.
4. Si no hay productos activos asociados (o solo productos inactivos, según política del sistema), el sistema solicita confirmación.
5. El actor confirma la desactivación.
6. El sistema cambia el estado de la marca a inactivo.

### Reactivación de marca

1. El actor selecciona una marca inactiva de la lista y elige "Activar".
2. El sistema cambia el estado a activo.
3. El sistema muestra un mensaje de confirmación.

## Flujos alternos

### FA1 - Nombre duplicado

- A: Si el nombre de la marca ya existe, el sistema muestra un mensaje de error indicando el duplicado.

### FA2 - Productos asociados

- A: Si se intenta desactivar una marca con productos activos asociados, el sistema rechaza la operación e indica la cantidad de productos afectados.

## Postcondiciones

- A: Creación exitosa: la nueva marca queda disponible para asignar a productos (referencia CU07).
- A: Edición exitosa: los cambios quedan aplicados a la marca.
- A: Desactivación exitosa: la marca no puede asignarse a nuevos productos; los productos existentes deben haber sido reasignados o quedar validados según reglas de negocio.
- A: Reactivación exitosa: la marca vuelve a estar disponible para productos.
- A: En cualquier caso fallido, no se modifica el estado de la marca.

## Reglas de negocio

- A: No puede haber dos marcas con el mismo nombre.
- A: Una marca desactivada no debe usarse en altas nuevas de producto.
- A: Los productos activos no pueden referenciar una marca inactiva (alineado con categorías en CU07).

## Reglas de seguridad

- A: Solo usuarios con rol administrador o encargado de inventario pueden crear, editar o desactivar marcas.
- A: Los nombres deben sanitizarse para prevenir inyecciones.
- A: Todas las operaciones de gestión de marcas quedan registradas con usuario responsable, fecha y hora.

## Criterios de aceptación

- A: Un usuario con permisos puede crear una nueva marca con datos válidos y recibe confirmación.
- A: Un usuario con permisos puede editar los datos de una marca existente.
- A: Un usuario con permisos puede desactivar una marca sin productos activos asociados.
- A: El sistema rechaza la desactivación de una marca que aún tiene productos activos asociados.
- A: El sistema muestra errores claros cuando los campos no cumplen validación.
- A: Las marcas inactivas no aparecen como opción al crear o editar productos en el catálogo de ventas (reflejo coherente con CU07).

## Implementación técnica

> **Dependencias:** CU01 (autenticación y guards de roles)  
> **Orden sugerido de desarrollo:** #5

### Base de datos

- [x] Crear modelo Prisma `Brand` con campos: `id`, `name` (único), `description?`, `isActive`, `createdAt`, `updatedAt`; con `@@map("brands")`
- [x] Agregar índice único en `name`
- [x] Agregar relación `Brand` → `Product[]` (se completa al crear CU07)
- [x] Crear migración de base de datos

### API (NestJS)

- [x] Crear `BrandsModule` con `BrandsService` y `BrandsController`
- [x] `POST /brands` — crear marca; validar nombre único; guard `ADMIN | INVENTORY_MANAGER`
- [x] `GET /brands` — listar paginado; filtros: `search`, `isActive`; incluir conteo de productos activos asociados; accesible para todos los roles autenticados
- [x] `GET /brands/:id` — obtener marca por id
- [x] `PATCH /brands/:id` — editar; validar nombre único si cambia; guard `ADMIN | INVENTORY_MANAGER`
- [x] `PATCH /brands/:id/deactivate` — verificar que no tenga productos activos; rechazar con 409 si los tiene; guard `ADMIN | INVENTORY_MANAGER`
- [x] `PATCH /brands/:id/activate` — reactivar; guard `ADMIN | INVENTORY_MANAGER`
- [x] `DTO CreateBrandDto` y `UpdateBrandDto` con `class-validator`
- [x] Registrar operaciones con usuario responsable y timestamp

### Frontend (React)

- [x] Crear página `/brands` protegida para roles `ADMIN` y `INVENTORY_MANAGER`
- [x] Tabla paginada con columnas: nombre, descripción, cantidad de productos, estado
- [x] Buscador por nombre o descripción (debounce)
- [x] Filtro por estado; activo por defecto
- [x] Botón "Nueva marca" → formulario (modal) con nombre (requerido) y descripción (opcional)
- [x] Botón "Editar" → formulario pre-poblado
- [x] Botón "Desactivar" con confirmación; mostrar error con conteo si tiene productos activos
- [x] Botón "Activar" para marcas inactivas
- [x] Integrar con TanStack Query; invalidar caché tras mutaciones
