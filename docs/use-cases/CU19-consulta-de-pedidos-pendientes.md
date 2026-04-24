# CU19 - Consulta de pedidos pendientes

## Objetivo

Visualizar los pedidos que aún no han sido preparados o entregados, permitiendo hacer seguimiento y priorización.

## Actores

- A: Encargado de despacho
- A: Vendedor
- A: Administrador
- A: Propietario/Gerente

## Precondiciones

- A: El actor está autenticado en el sistema.
- A: El actor tiene permisos para consultar pedidos.

## Disparador

El actor selecciona la opción "Pedidos pendientes" desde el menú de despacho o ventas.

## Flujo principal

1. El actor accede a la vista de pedidos pendientes.
2. El sistema muestra la tabla con columnas: número de orden, fecha de creación, cliente, productos pendientes, prioridad, estado, tiempo en espera.
3. El actor puede filtrar por estado (pendiente, en preparación), prioridad, rango de fechas.
4. El actor puede ordenar por prioridad, fecha o tiempo en espera.
5. El sistema presenta los resultados paginados (20 por página).
6. Los pedidos con más de 48 horas en estado pendiente se marcan con alerta visual.

## Flujos alternos

### FA1 - Ver detalle del pedido

- A: El actor puede seleccionar un pedido para ver el detalle completo, incluyendo productos, cantidades y dirección de entrega.

### FA2 - Cambiar prioridad

- A: El actor puede modificar la prioridad de un pedido (normal/urgente) desde la lista.

### FA3 - Sin resultados

- A: Si no hay pedidos pendientes, el sistema muestra un mensaje indicando que no hay pedidos en espera.

## Postcondiciones

- A: La consulta muestra información actualizada al momento.
- A: Los datos son de solo lectura para consulta; para modificar se debe usar la actualización de estado (CU20).

## Reglas de negocio

- A: Los pedidos pendientes incluyen: pendiente de preparación y en preparación.
- A: El tiempo en espera se calcula desde la fecha de creación de la orden de despacho.
- A: Los pedidos urgentes se muestran primero en el orden por defecto.

## Reglas de seguridad

- A: Todos los roles autenticados pueden consultar pedidos pendientes.
- A: Los vendedores solo ven los pedidos de sus clientes.
- A: Los administradores y gerentes ven todos los pedidos.

## Criterios de aceptación

- A: El sistema muestra todos los pedidos pendientes con su información.
- A: Los pedidos se pueden filtrar por estado y prioridad.
- A: Los pedidos con más de 48 horas se marcan con alerta visual.
- A: La consulta es paginada y ordenable.
- A: Los vendedores solo ven los pedidos de sus clientes.