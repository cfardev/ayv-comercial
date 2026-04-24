# CU20 - Actualización del estado del pedido

## Objetivo

Cambiar el estado del pedido a en preparación, preparado o entregado, manteniendo trazabilidad del proceso de despacho.

## Actores

- A: Encargado de despacho
- A: Administrador
- A: Sistema de despachos

## Precondiciones

- A: Existe una orden de despacho activa (referencia CU18).
- A: El usuario tiene permisos para actualizar el estado del pedido.

## Disparador

El actor selecciona un pedido desde "Pedidos pendientes" (CU19) o "Consulta de pedidos" y elige "Actualizar estado".

## Flujo principal

1. El actor selecciona la orden de despacho a actualizar.
2. El sistema presenta el estado actual y los estados disponibles para la transición.
3. El actor selecciona el nuevo estado (en preparación → lista → en camino → entregada).
4. El actor puede ingresar observaciones sobre la actualización.
5. El actor confirma la actualización.
6. El sistema registra el cambio con fecha, hora, usuario responsable y observaciones.
7. El sistema actualiza el estado de la orden.
8. Si el estado es "entregada", el sistema actualiza el estado de la venta asociada.

## Flujos alternos

### FA1 - Estado inválido para transición

- A: Si el nuevo estado no es válido para la transición actual, el sistema muestra un error indicando los estados válidos.

### FA2 - Orden cancelada

- A: Si la orden está cancelada, no se puede actualizar el estado.

### FA3 - Observaciones requeridas

- A: Si el estado es "cancelada", el sistema requiere que el actor ingrese el motivo de cancelación.

## Postcondiciones

- A: Actualización exitosa: el estado de la orden queda actualizado.
- A: La transición queda registrada en el historial con trazabilidad completa.
- A: Si el pedido fue entregado, la venta asociada cambia a estado "entregada".

## Reglas de negocio

- A: Los estados válidos para transición son: pendiente → en preparación → lista → en camino → entregada.
- A: El estado "cancelada" puede切换 desde cualquier estado excepto "entregada".
- A: Toda transición queda registrada con fecha, hora y usuario responsable.
- A: Las transiciones inválidas son rechazadas por el sistema.

## Reglas de seguridad

- A: Solo usuarios con rol encargado de despacho o administrador pueden actualizar estados.
- A: Todas las actualizaciones quedan registradas para auditoría.
- A: El usuario solo puede actualizar pedidos asignados a él o a su área.

## Criterios de aceptación

- A: El sistema permite cambiar el estado del pedido siguiendo las transiciones válidas.
- A: El sistema rechaza transiciones inválidas.
- A: Toda actualización queda registrada con trazabilidad.
- A: Los estados posteriores a "entregada" no son permitidos.
- A: Las cancelaciones requieren motivo registrado.