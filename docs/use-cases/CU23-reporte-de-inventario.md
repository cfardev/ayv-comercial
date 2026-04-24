# CU23 - Reporte de inventario

## Objetivo

Generar reportes detallados del inventario actual, incluyendo existencias, valuations y estado general del stock.

## Actores

- A: Encargado de inventario
- A: Administrador
- A: Propietario/Gerente
- A: Sistema de reportes

## Precondiciones

- A: El actor está autenticado en el sistema.
- A: El actor tiene permisos para generar reportes.

## Disparador

El actor selecciona la opción "Reporte de inventario" desde el menú de reportes o inventario.

## Flujo principal

1. El actor accede a la configuración del reporte de inventario.
2. El sistema presenta las opciones: tipo de reporte (resumido/detallado), formato de salida (PDF/Excel), filtros (categoría, proveedor, estado del stock).
3. El actor selecciona las opciones y ejecuta el reporte.
4. El sistema genera el reporte con las secciones: resumen general, detalle por categoría, detalle por producto, productos en alerta.
5. El reporte incluye: código, nombre, categoría, stock actual, stock mínimo, costo unitario, valor total del inventario.
6. El sistema presenta el reporte para visualización o descarga.

## Flujos alternos

### FA1 - Resumen general

- A: El reporte resumido muestra solo totales y categorías con alertas de stock bajo.

### FA2 - Detalle completo

- A: El reporte detallado incluye cada producto con todas sus métricas.

### FA3 - Sin datos

- A: Si no hay productos en los filtros seleccionados, el sistema muestra un mensaje indicando que no hay datos para el reporte.

### FA4 - Exportación fallida

- A: Si la exportación falla, el sistema permite reintentar o cambiar el formato.

## Postcondiciones

- A: El reporte queda generado en el formato seleccionado.
- A: El reporte puede ser descargado o impreso.

## Reglas de negocio

- A: El valor total del inventario se calcula como: suma(stock actual × costo unitario) por producto.
- A: Los productos inactivos se incluyen solo si el filtro los especifica.
- A: El reporte incluye productos con stock bajo como sección de alerta.

## Reglas de seguridad

- A: Solo usuarios con rol administrador, encargado de inventario o gerente pueden generar reportes de inventario.
- A: Los costos unitarios son visibles solo para administrador y gerente.

## Criterios de aceptación

- A: El sistema genera reportes de inventario con información completa y precisa.
- A: Los reportes pueden ser en formato PDF o Excel.
- A: El reporte incluye resumen general y detalle por categoría.
- A: Los productos en alerta de stock bajo se incluyen en sección especial.
- A: Los costos son visibles solo para roles autorizados.