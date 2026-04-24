# CU27 - Reporte de rentabilidad por producto

## Objetivo

Analizar la utilidad estimada de los productos en función del costo y precio de venta, identificando los de mayor y menor margen.

## Actores

- A: Administrador
- A: Propietario/Gerente
- A: Sistema de reportes

## Precondiciones

- A: El actor está autenticado en el sistema.
- A: El actor tiene permisos para generar reportes de rentabilidad.

## Disparador

El actor selecciona la opción "Rentabilidad por producto" desde el menú de reportes.

## Flujo principal

1. El actor accede a la configuración del reporte.
2. El sistema presenta las opciones: período (últimos 30, 60, 90 días o personalizado), formato de salida (PDF/Excel), ordenar por (margen porcentual, margen absoluto), filtros (categoría, proveedor).
3. El actor selecciona las opciones y ejecuta el reporte.
4. El sistema genera el reporte con los productos ordenados por el criterio seleccionado.
5. El reporte incluye: código, nombre, categoría, precio unitario, costo unitario, margen unitario, margen porcentual, unidades vendidas, utilidad total estimada.
6. El sistema presenta el reporte para visualización o descarga.

## Flujos alternos

### FA1 - Productos con margen negativo

- A: Los productos con margen negativo se destacan en rojo para atención prioritaria.

### FA2 - Sin datos

- A: Si no hay ventas en el período seleccionado, el sistema muestra un mensaje indicando que no hay datos.

### FA3 - Exportación

- A: El actor puede exportar el reporte a formato Excel o PDF.

### FA4 - Filtro por rango de margen

- A: El actor puede filtrar para mostrar solo productos con margen dentro de un rango específico.

## Postcondiciones

- A: El reporte queda generado en el formato seleccionado.
- A: El reporte puede ser descargado o impreso.

## Reglas de negocio

- A: El margen unitario se calcula como: precio - costo.
- A: El margen porcentual se calcula como: ((precio - costo) / precio) × 100.
- A: La utilidad total estimada se calcula como: margen unitario × unidades vendidas.
- A: Los productos sin ventas no se incluyen en el cálculo de utilidad total.

## Reglas de seguridad

- A: Solo usuarios con rol administrador o gerente tienen acceso a este reporte.
- A: Los vendedores no tienen acceso a reportes de rentabilidad.

## Criterios de aceptación

- A: El sistema calcula correctamente el margen unitario y porcentual.
- A: Los productos se ordenan según el criterio seleccionado.
- A: Los productos con margen negativo se destacan visualmente.
- A: El reporte incluye la utilidad total estimada por producto.
- A: Los reportes son exportables a PDF o Excel.