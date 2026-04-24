# Actor 04: Encargado de Despacho

## Descripción

Es la persona responsable de preparar y dar seguimiento a los pedidos realizados por los clientes. Su participación es importante cuando el negocio realiza entregas o maneja pedidos apartados.

## Responsabilidades

- Preparar los pedidos para despacho
- Gestionar las órdenes de despacho
- Confirmar la entrega de productos al cliente
- Dar seguimiento al estado de los pedidos
- Coordinar con el área de inventario para confirmar disponibilidad

## Permisos

| Acción | Permitido |
|--------|-----------|
| Consultar pedidos pendientes | Sí |
| Consultar existencias | Sí |
| Generar órdenes de despacho | Sí |
| Actualizar estado del pedido | Sí |
| Confirmar entrega | Sí |
| Consultar productos | Sí |

## Relaciones con otros actores

- Coordina con: Vendedor (estado de pedidos), Encargado de Inventario (disponibilidad de productos)
- Reporta a: Administrador

## Notas

No tiene acceso a registros financieros, ajustes de inventario ni gestión de usuarios.

## Casos de uso asociados

| Caso de uso | Descripción |
|-------------|-------------|
| CU01 | Inicio de sesión |
| CU08 | Consulta de existencias |
| CU18 | Generación de orden de despacho |
| CU19 | Consulta de pedidos pendientes |
| CU20 | Actualización del estado del pedido |