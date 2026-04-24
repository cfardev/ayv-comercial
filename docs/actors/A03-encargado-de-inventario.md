# Actor 03: Encargado de Inventario

## Descripción

Es la persona responsable del control de las existencias de productos dentro del negocio. Registra entradas de mercancía, realiza ajustes y consulta movimientos del inventario para mantener el stock en niveles óptimos.

## Responsabilidades

- Controlar las existencias de productos
- Registrar las entradas de mercancía
- Realizar ajustes de inventario cuando sea necesario
- Monitorear los niveles de stock bajo
- Mantener la trazabilidad de los movimientos de inventario

## Permisos

| Acción | Permitido |
|--------|-----------|
| Consultar productos | Sí |
| Consultar existencias | Sí |
| Consultar movimientos de inventario | Sí |
| Registrar entrada de inventario | Sí |
| Ajustar inventario | Sí |
| Ver alertas de stock bajo | Sí |
| Registrar productos | Sí (con aprobación) |
| Actualizar costos y precios | No |
| Anular facturas | No |

## Relaciones con otros actores

- Reporta a: Administrador, Propietario o Gerente
- Coordina con: Vendedor (para consulta de disponibilidad), Encargado de Despacho (para confirmar stock de pedidos)

## Casos de uso asociados

| Caso de uso | Descripción |
|-------------|-------------|
| CU01 | Inicio de sesión |
| CU05 | Gestión de productos |
| CU07 | Registro de entrada de inventario |
| CU08 | Consulta de existencias |
| CU09 | Ajuste de inventario |
| CU10 | Consulta de movimientos de inventario |
| CU21 | Alerta de stock bajo |