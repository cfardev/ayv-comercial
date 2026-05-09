# CU26 - Reporte de inventario

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
- A: El filtro por proveedor se aplica sobre movimientos de abastecimiento o entradas de inventario asociadas a ese proveedor, no sobre un proveedor fijo del producto.

## Reglas de seguridad

- A: Solo usuarios con rol administrador, encargado de inventario o gerente pueden generar reportes de inventario.
- A: Los costos unitarios son visibles solo para administrador y gerente.

## Criterios de aceptación

- A: El sistema genera reportes de inventario con información completa y precisa.
- A: Los reportes pueden ser en formato PDF o Excel.
- A: El reporte incluye resumen general y detalle por categoría.
- A: Los productos en alerta de stock bajo se incluyen en sección especial.
- A: Los costos son visibles solo para roles autorizados.

## Implementación técnica

> **Dependencias:** CU07 (productos), CU11 (stock), CU12 (ajustes)  
> **Orden sugerido de desarrollo:** #26

### Base de datos

- [ ] No requiere modelos adicionales; consulta sobre `Product`, `Category`, `Brand`, `InventoryMovement`

### API (NestJS)

- [ ] `GET /reports/inventory` — generar datos del reporte de inventario; guard `ADMIN | INVENTORY_MANAGER | OWNER_MANAGER`
- [ ] Query params: `type` (SUMMARY | DETAILED), `categoryId?`, `stockStatus?` (LOW | OUT_OF_STOCK | NORMAL), `includeInactive` (boolean)
- [ ] Incluir en respuesta: para cada producto: `code`, `name`, `categoryName`, `currentStock`, `minStock`, `stockStatus`; solo para ADMIN/MANAGER: `unitCost`, `totalInventoryValue` (currentStock × unitCost)
- [ ] Sección de alertas: productos con `stockStatus !== NORMAL`
- [ ] Resumen general: total de productos, total de unidades, valor total del inventario (solo ADMIN/MANAGER)
- [ ] Endpoint de exportación: `GET /reports/inventory/export?format=pdf|excel` — generar archivo descargable (usar librería `exceljs` para Excel, `pdfkit` o `puppeteer` para PDF)

### Frontend (React)

- [ ] Crear página `/reports/inventory` protegida para `ADMIN | INVENTORY_MANAGER | OWNER_MANAGER`
- [ ] Panel de filtros: tipo (resumido/detallado), categoría, estado de stock
- [ ] Botón "Generar reporte" que carga la tabla con los resultados
- [ ] Sección de resumen: total productos, total unidades, valor total del inventario (si autorizado)
- [ ] Tabla de productos con columnas configuradas según tipo de reporte
- [ ] Sección separada de alertas de stock bajo al final del reporte
- [ ] Botones "Exportar Excel" y "Exportar PDF" que disparan descarga del archivo
- [ ] Integrar con TanStack Query
