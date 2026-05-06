# Actor 02: Vendedor

## Descripción

Es la persona encargada de atender a los clientes y registrar las operaciones de venta dentro del sistema. Utiliza el sistema para consultar productos, registrar clientes, realizar ventas y generar facturas.

## Responsabilidades

- Atender a los clientes del negocio
- Registrar ventas de forma precisa
- Mantener los datos de clientes actualizados
- Generar facturas conforme a las transacciones

## Permisos

| Acción | Permitido |
|--------|-----------|
| Consultar productos | Sí |
| Consultar existencias | Sí |
| Registrar clientes | Sí |
| Consultar clientes | Sí |
| Actualizar datos de clientes | Sí |
| Calcular total de venta | Sí |
| Registrar ventas | Sí |
| Generar facturas | Sí |
| Consultar ventas y facturas | Sí |
| Reimprimir facturas | Sí |

## Relaciones con otros actores

- Atiende a: Cliente (externo)
- Coordina con: Administrador, Encargado de Inventario (para consulta de stock)

## Notas

No tiene acceso a ajustes de inventario, gestión de usuarios ni reportes financieros avanzados.

## Casos de uso asociados

| Caso de uso | Descripción |
|-------------|-------------|
| CU01 | Inicio de sesión |
| CU06 | Gestión de productos |
| CU09 | Consulta de existencias |
| CU12 | Gestión de clientes |
| CU13 | Registro de venta |
| CU14 | Cálculo del total de venta |
| CU15 | Generación de factura |
| CU16 | Consulta de ventas y facturas |
| CU17 | Reimpresión de factura |