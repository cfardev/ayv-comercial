# CU08 - Consulta de existencias

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
2. El sistema muestra la tabla con columnas: código de producto, nombre, categoría, stock actual, stock mínimo, estado (normal/bajo/agotado), última actualización.
3. El actor puede buscar por código, nombre o categoría.
4. El actor puede filtrar por estado de stock (todos, bajo, agotado, normal) o por categoría.
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
- A: Los datos son de solo lectura; para modificar stock se debe usar el registro de entrada (CU07) o ajuste de inventario (CU09).

## Reglas de negocio

- A: El stock actual se actualiza en tiempo real tras cada movimiento de inventario.
- A: El stock mínimo es configurable por producto (referencia CU05).
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