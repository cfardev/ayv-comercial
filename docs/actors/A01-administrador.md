# Actor 01: Administrador

## Descripción

Es la persona encargada de la administración general del sistema. Tiene acceso a las funciones principales de configuración y control del backoffice.

## Responsabilidades

- Garantizar la correcta configuración del sistema
- Administrar usuarios y roles del sistema
- Mantener el catálogo de productos y categorías actualizado
- Controlar la integridad del inventario

## Permisos

| Acción | Permitido |
|--------|-----------|
| Gestionar usuarios | Sí |
| Asignar roles y permisos | Sí |
| Gestionar categorías | Sí |
| Gestionar productos | Sí |
| Actualizar costos y precios | Sí |
| Ajustar inventario | Sí |
| Registrar entradas de inventario | Sí |
| Consultar movimientos de inventario | Sí |
| Registrar ventas | Sí |
| Generar facturas | Sí |
| Consultar ventas y facturas | Sí |
| Anular facturas | Sí |
| Consultar pedidos pendientes | Sí |
| Generar órdenes de despacho | Sí |
| Actualizar estado del pedido | Sí |
| Consultar reportes | Sí |
| Reimprimir facturas | Sí |

## Relaciones con otros actores

- Supervisa a: Vendedor, Encargado de Inventario, Encargado de Despacho
- Coordina con: Propietario o Gerente (reportes e indicadores)

## Casos de uso asociados

| Caso de uso | Descripción |
|-------------|-------------|
| CU01 | Inicio de sesión |
| CU02 | Gestión de usuarios |
| CU03 | Gestión de roles y permisos |
| CU04 | Gestión de categorías |
| CU05 | Gestión de productos |
| CU06 | Actualización de costo y precio de producto |
| CU07 | Registro de entrada de inventario |
| CU09 | Ajuste de inventario |
| CU12 | Registro de venta |
| CU14 | Generación de factura |
| CU15 | Consulta de ventas y facturas |
| CU16 | Reimpresión de factura |
| CU17 | Anulación de factura |
| CU18 | Generación de orden de despacho |
| CU19 | Consulta de pedidos pendientes |
| CU20 | Actualización del estado del pedido |
| CU24 | Reporte de ventas |
| CU25 | Reporte de productos más vendidos |
| CU26 | Reporte de productos de baja rotación |
| CU27 | Reporte de rentabilidad por producto |