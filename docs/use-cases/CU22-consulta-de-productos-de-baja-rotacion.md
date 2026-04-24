# CU22 - Consulta de productos de baja rotación

## Objetivo

Identificar los productos que tienen poco movimiento en ventas durante un período determinado, permitiendo tomar decisiones sobre descuentos, promociones o descontinuación.

## Actores

- A: Encargado de inventario
- A: Administrador
- A: Propietario/Gerente
- A: Sistema de reportes

## Precondiciones

- A: El actor está autenticado en el sistema.
- A: El actor tiene permisos para consultar reportes.

## Disparador

El actor selecciona la opción "Productos de baja rotación" desde el menú de reportes o inventario.

## Flujo principal

1. El actor accede a la vista de productos de baja rotación.
2. El sistema presenta los campos de filtro: período (últimos 30, 60, 90 días), categoría, stock mínimo de ventas para considerar rotación.
3. El actor define los filtros y ejecuta la consulta.
4. El sistema muestra la tabla con columnas: código de producto, nombre, categoría, unidades vendidas en el período, total de ventas en el período, stock actual, días sin movimiento.
5. Los productos se ordenan por menor cantidad vendida o mayor tiempo sin movimiento.
6. El sistema presenta los resultados paginados (20 por página).

## Flujos alternos

### FA1 - Sin resultados

- A: Si no hay productos que cumplan los criterios, el sistema muestra un mensaje indicando que no se encontraron productos de baja rotación.

### FA2 - Ver detalle del producto

- A: El actor puede seleccionar un producto para ver el historial de ventas detallado.

### FA3 - Exportación

- A: El actor puede exportar la consulta a formato Excel o PDF.

### FA4 - Generar promoción

- A: Desde la lista, el actor puede seleccionar productos para crear una promoción o descuento.

## Postcondiciones

- A: La consulta muestra información del período seleccionado.
- A: Los datos son de solo lectura.

## Reglas de negocio

- A: Los productos de baja rotación son aquellos con ventas menores al umbral configurado en el período.
- A: El umbral por defecto es 2 unidades o menos en el período seleccionado.
- A: Los productos sin movimiento en más de 60 días se marcan como "sin movimiento".

## Reglas de seguridad

- A: Todos los roles autenticados pueden consultar productos de baja rotación.
- A: Los costos y márgenes solo son visibles para administrador y gerente.

## Criterios de aceptación

- A: El sistema identifica productos con baja rotación según el período y umbral configurado.
- A: La consulta es filtrable por categoría y período.
- A: Los productos se ordenan por menor venta o mayor tiempo sin movimiento.
- A: La consulta es paginada y exportable.
- A: Los costos no son visibles para vendedores.