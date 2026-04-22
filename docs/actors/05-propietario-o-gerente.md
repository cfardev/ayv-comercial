# Actor 05: Propietario o Gerente

## Descripción

Es la persona encargada de supervisar el negocio y utilizar la información del sistema para la toma de decisiones. Generalmente consulta reportes e indicadores relacionados con inventario, ventas y rentabilidad para evaluar el desempeño del negocio.

## Responsabilidades

- Tomar decisiones estratégicas basadas en datos
- Supervisar el rendimiento del negocio
- Evaluar reportes de ventas, inventario y rentabilidad
- Identificar tendencias y oportunidades de mejora

## Permisos

| Acción | Permitido |
|--------|-----------|
| Consultar inventario | Sí |
| Consultar existencias | Sí |
| Consultar movimientos de inventario | Sí |
| Consultar ventas y facturas | Sí |
| Consultar reportes | Sí |
| Revisar productos más vendidos | Sí |
| Revisar productos de baja rotación | Sí |
| Consultar rentabilidad por producto | Sí |
| Ver alertas de stock bajo | Sí |
| Anular facturas | Sí |

## Permisos limitados

Las siguientes acciones requieren aprobación adicional o son únicamente de consulta:

| Acción | Nivel de acceso |
|--------|-----------------|
| Ajustar inventario | Solo consulta |
| Gestionar usuarios | No |
| Gestionar productos | No |
| Gestionar categorías | No |

## Relaciones con otros actores

- Supervisa a: Administrador, Vendedor, Encargado de Inventario, Encargado de Despacho
- Recibe reportes de: Administrador

## Notas

Este actor tiene acceso predominantemente a consultas y reportes. No realiza operaciones transaccionales directas como registro de ventas o entradas de inventario.

## Casos de uso asociados

| Caso de uso | Descripción |
|-------------|-------------|
| CU01 | Inicio de sesión |
| CU08 | Consulta de existencias |
| CU15 | Consulta de ventas y facturas |
| CU21 | Alerta de stock bajo |
| CU22 | Consulta de productos de baja rotación |
| CU23 | Reporte de inventario |
| CU24 | Reporte de ventas |
| CU25 | Reporte de productos más vendidos |
| CU26 | Reporte de productos de baja rotación |
| CU27 | Reporte de rentabilidad por producto |