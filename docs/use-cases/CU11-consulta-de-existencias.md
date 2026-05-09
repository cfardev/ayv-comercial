# CU11 - Consulta de existencias

## Objetivo

Visualizar la disponibilidad actual de los productos registrados en el inventario, incluyendo stock actual, stock mínimo y alertas de nivel bajo.

## Actores

- A: Encargado de inventario
- A: Vendedor
- A: Administrador
- A: Sistema de alertas

## Precondiciones

- A: El actor está autenticado en el sistema.
- A: El actor tiene permisos para consultar existencias.

## Disparador

El actor selecciona la opción "Consulta de existencias" o "Stock" desde el menú de inventario.

## Flujo principal

1. El actor accede a la vista de existencias.
2. El sistema muestra la tabla con columnas: código de producto, nombre, categoría, marca, stock actual, stock mínimo, estado (normal/bajo/agotado), última actualización.
3. El actor puede buscar por código, nombre o categoría.
4. El actor puede filtrar por estado de stock (todos, bajo, agotado, normal), por categoría o por marca.
5. El actor puede ordenar por cualquier columna.
6. El sistema presenta los resultados paginados (20 por página).

## Flujos alternos

### FA1 - Producto agotado

- A: Si un producto tiene stock actual igual a cero, el sistema muestra el estado como "agotado" con alerta visual distintiva.

### FA2 - Stock bajo

- A: Si el stock actual es menor al stock mínimo, el sistema muestra el estado como "bajo" con alerta visual.

### FA3 - Sin resultados

- A: Si la búsqueda no produce resultados, el sistema muestra un mensaje indicando que no se encontraron productos.

### FA4 - Exportación

- A: El actor puede exportar la consulta a formato Excel o PDF para uso en reportes externos.

## Postcondiciones

- A: La consulta muestra información actualizada al momento de la consulta.
- A: Los datos son de solo lectura; para modificar stock se debe usar el registro de entrada (CU10) o ajuste de inventario (CU12).

## Reglas de negocio

- A: El stock actual se actualiza en tiempo real tras cada movimiento de inventario.
- A: El stock mínimo es configurable por producto (referencia CU07).
- A: Se consideran tres estados: normal (stock >= mínimo), bajo (0 < stock < mínimo), agotado (stock = 0).
- A: Los productos inactivos se muestran solo si el filtro incluye estados inactivos.

## Reglas de seguridad

- A: Todos los roles autenticados pueden consultar existencias.
- A: Los datos de costo no son visibles para vendedores (solo precio de venta).
- A: Solo usuarios con rol administrador o encargado de inventario pueden ver el costo de los productos.

## Criterios de aceptación

- A: El sistema muestra todos los productos con su stock actual y mínimo.
- A: Los productos con stock bajo se marcan claramente con alerta visual.
- A: Los productos agotados se muestran con estado "agotado".
- A: La consulta es paginada y filtrable.
- A: Los vendedores no pueden ver los costos de los productos.

## Implementación técnica

> **Dependencias:** CU07 (modelo `Product` con `currentStock`, `minStock`), CU10 (movimientos actualizan stock)  
> **Orden sugerido de desarrollo:** #12

### Base de datos

- [ ] Verificar que el modelo `Product` tiene `currentStock` y `minStock` (creados en CU07)
- [ ] Calcular estado del stock como campo derivado en la capa de servicio: `NORMAL` (currentStock >= minStock), `LOW` (0 < currentStock < minStock), `OUT_OF_STOCK` (currentStock = 0)

### API (NestJS)

- [ ] `GET /inventory/stock` — listar existencias paginado; filtros: `search` (código, nombre), `categoryId`, `brandId`, `stockStatus` (NORMAL | LOW | OUT_OF_STOCK), `isActive`; guard: todos los roles autenticados
- [ ] Incluir en respuesta: `code`, `name`, `categoryName`, `brandName`, `currentStock`, `minStock`, `stockStatus`, `updatedAt`
- [ ] Ocultar campo `cost` para usuarios con rol `SELLER`
- [ ] Soporte de ordenamiento por cualquier columna (query param `sortBy`, `sortOrder`)
- [ ] `GET /inventory/stock/:productId` — detalle de existencia de un producto

### Frontend (React)

- [ ] Crear página `/inventory/stock` accesible para todos los roles autenticados
- [ ] Tabla paginada con columnas: código, nombre, categoría, marca, stock actual, stock mínimo, estado, última actualización
- [ ] Mostrar columna de costo solo para `ADMIN` e `INVENTORY_MANAGER`
- [ ] Chips visuales de estado: verde (NORMAL), amarillo (LOW), rojo (OUT_OF_STOCK)
- [ ] Buscador por código, nombre o categoría (debounce)
- [ ] Filtros por estado de stock, categoría, marca
- [ ] Soporte de ordenamiento por clic en columna de la tabla
- [ ] Integrar con TanStack Query (`useQuery`) con refetch automático configurable
