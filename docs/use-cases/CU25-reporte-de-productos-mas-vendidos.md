# CU25 - Reporte de productos más vendidos

## Objetivo

Identificar los productos con mayor rotación comercial, permitiendo analizar cuáles son los más demandados.

## Actores

- A: Vendedor
- A: Administrador
- A: Propietario/Gerente
- A: Sistema de reportes

## Precondiciones

- A: El actor está autenticado en el sistema.
- A: El actor tiene permisos para generar reportes.

## Disparador

El actor selecciona la opción "Productos más vendidos" desde el menú de reportes.

## Flujo principal

1. El actor accede a la configuración del reporte.
2. El sistema presenta las opciones: período (últimos 30, 60, 90 días o personalizado), cantidad máxima de productos a mostrar, formato de salida (PDF/Excel), filtros (categoría, vendedor).
3. El actor selecciona las opciones y ejecuta el reporte.
4. El sistema genera el reporte con los productos más vendidos ordenados por cantidad o valor de ventas.
5. El reporte incluye: posición, código, nombre, categoría, unidades vendidas, total de ventas, participación porcentual.
6. El sistema presenta el reporte para visualización o descarga.

## Flujos alternos

### FA1 - Ordenar por valor

- A: El actor puede elegir ordenar por total de ventas en lugar de unidades vendidas.

### FA2 - Sin datos

- A: Si no hay ventas en el período seleccionado, el sistema muestra un mensaje indicando que no hay datos.

### FA3 - Exportación

- A: El actor puede exportar el reporte a formato Excel o PDF.

## Postcondiciones

- A: El reporte queda generado en el formato seleccionado.
- A: El reporte puede ser descargado o impreso.

## Reglas de negocio

- A: Los productos se ordenan por cantidad vendida descending por defecto.
- A: La participación porcentual se calcula como: (ventas del producto / total de ventas) × 100.
- A: Las ventas anuladas no se incluyen en los cálculos.

## Reglas de seguridad

- A: Los vendedores solo ven los productos de sus propias ventas.
- A: Los administradores y gerentes ven todos los productos.
- A: Los costos y márgenes son visibles solo para administrador y gerente.

## Criterios de aceptación

- A: El sistema identifica correctamente los productos más vendidos del período.
- A: Los productos pueden ordenarse por cantidad o valor de ventas.
- A: El reporte incluye la participación porcentual de cada producto.
- A: Los reportes son exportables a PDF o Excel.
- A: Los vendedores solo ven información de sus propias ventas.