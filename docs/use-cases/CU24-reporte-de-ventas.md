# CU24 - Reporte de ventas

## Objetivo

Generar reportes de ventas por fecha, cliente, producto o vendedor, permitiendo analizar el desempeño comercial.

## Actores

- A: Vendedor
- A: Administrador
- A: Propietario/Gerente
- A: Sistema de reportes

## Precondiciones

- A: El actor está autenticado en el sistema.
- A: El actor tiene permisos para generar reportes.

## Disparador

El actor selecciona la opción "Reporte de ventas" desde el menú de reportes o ventas.

## Flujo principal

1. El actor accede a la configuración del reporte de ventas.
2. El sistema presenta las opciones: período (fecha inicio, fecha fin), tipo de reporte (resumido/detallado), formato de salida (PDF/Excel), agrupar por (fecha/cliente/vendedor/producto), filtros adicionales.
3. El actor selecciona las opciones y ejecuta el reporte.
4. El sistema genera el reporte con los datos del período seleccionado.
5. El reporte incluye: número de ventas, total de ventas, promedio por venta, productos más vendidos, vendedores destacados.
6. El sistema presenta el reporte para visualización o descarga.

## Flujos alternos

### FA1 - Agrupar por período

- A: Si se agrupa por fecha, el reporte muestra totales diarios, semanales o mensuales.

### FA2 - Filtro por vendedor

- A: Si se filtra por vendedor, solo se incluyen las ventas de ese vendedor.

### FA3 - Sin datos

- A: Si no hay ventas en el período seleccionado, el sistema muestra un mensaje indicando que no hay datos.

### FA4 - Exportación

- A: El actor puede cambiar el formato de salida (PDF/Excel) antes de generar el reporte.

## Postcondiciones

- A: El reporte queda generado en el formato seleccionado.
- A: El reporte puede ser descargado o impreso.

## Reglas de negocio

- A: Las ventas anuladas no se incluyen en los cálculos del reporte.
- A: Los filtros pueden combinarse para reportes más específicos.
- A: El promedio por venta se calcula como: total de ventas / número de ventas.

## Reglas de seguridad

- A: Los vendedores solo ven sus propias ventas en el reporte.
- A: Los administradores y gerentes ven todas las ventas.
- A: Los costos y márgenes son visibles solo para administrador y gerente.

## Criterios de aceptación

- A: El sistema genera reportes de ventas con información precisa del período.
- A: Los reportes pueden agruparse por fecha, cliente, vendedor o producto.
- A: El sistema permite filtrar por múltiples criterios.
- A: Los reportes son exportables a PDF o Excel.
- A: Los vendedores solo ven sus propias ventas.