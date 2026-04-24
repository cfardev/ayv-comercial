# CU26 - Reporte de productos de baja rotación

## Objetivo

Generar reportes sobre artículos con poca salida en un período determinado, facilitando decisiones sobre promociones, descuentos o descontinuación.

## Actores

- A: Encargado de inventario
- A: Administrador
- A: Propietario/Gerente
- A: Sistema de reportes

## Precondiciones

- A: El actor está autenticado en el sistema.
- A: El actor tiene permisos para generar reportes.

## Disparador

El actor selecciona la opción "Reporte de productos de baja rotación" desde el menú de reportes.

## Flujo principal

1. El actor accede a la configuración del reporte.
2. El sistema presenta las opciones: período (últimos 30, 60, 90 días o personalizado), umbral de rotación (unidades mínimas para considerar normal), formato de salida (PDF/Excel), filtros (categoría, stock actual).
3. El actor selecciona las opciones y ejecuta el reporte.
4. El sistema genera el reporte con los productos que no alcanzan el umbral de rotación.
5. El reporte incluye: código, nombre, categoría, unidades vendidas, total de ventas, stock actual, días sin movimiento, valor inventoryado.
6. El sistema presenta el reporte para visualización o descarga.

## Flujos alternos

### FA1 - Sin productos de baja rotación

- A: Si todos los productos superan el umbral, el sistema muestra un mensaje indicando que no hay productos de baja rotación en el período.

### FA2 - Exportación

- A: El actor puede exportar el reporte a formato Excel o PDF.

### FA3 - Productos agotados

- A: Si un producto tiene stock actual cero, se marca como "agotado" en el reporte.

### FA4 - Sugerencia de promoción

- A: El sistema puede sugerir la creación de una promoción para productos con bajo movimiento.

## Postcondiciones

- A: El reporte queda generado en el formato seleccionado.
- A: El reporte puede ser descargado o impreso.

## Reglas de negocio

- A: Un producto se considera de baja rotación si tiene ventas menores al umbral configurado en el período.
- A: El umbral por defecto es 2 unidades o menos en el período.
- A: Los productos sin movimiento en más de 60 días se marcan como "sin movimiento".

## Reglas de seguridad

- A: Los costos y márgenes son visibles solo para administrador y gerente.
- A: Los vendedores no tienen acceso a este reporte.

## Criterios de aceptación

- A: El sistema genera reportes precisos de productos de baja rotación.
- A: El reporte incluye el valor inventoryado de los productos.
- A: Los productos se marcan según su estado (baja rotación, sin movimiento, agotado).
- A: Los reportes son exportables a PDF o Excel.
- A: Los costos no son visibles para vendedores.