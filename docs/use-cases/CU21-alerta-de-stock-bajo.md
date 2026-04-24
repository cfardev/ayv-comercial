# CU21 - Alerta de stock bajo

## Objetivo

Identificar y notificar automáticamente los productos cuya existencia ha caído por debajo del nivel mínimo configurado, permitiendo gestionar reabastecimiento.

## Actores

- A: Encargado de inventario
- A: Administrador
- A: Sistema de alertas

## Precondiciones

- A: Los productos tienen configurado un stock mínimo (referencia CU05).
- A: El actor tiene permisos para ver alertas.

## Disparador

El sistema verifica el stock de todos los productos:
- A: Al registrar cada movimiento de inventario (entrada o salida).
- A: Diariamente a una hora configurada.
- A: El actor accede manualmente a la vista de alertas.

## Flujo principal

1. El sistema compara el stock actual con el stock mínimo de cada producto.
2. Los productos con stock actual menor al stock mínimo se incluyen en la lista de alerta.
3. El sistema notifica a los usuarios con rol encargado de inventario y administrador.
4. La alerta incluye: producto, stock actual, stock mínimo, déficit calculado, última fecha de movimiento.
5. El actor puede filtrar las alertas por categoría o producto.
6. El actor puede marcar una alerta como "atendida" o "ignorada" con备注.

## Flujos alternos

### FA1 - Producto agotado

- A: Si el stock actual es cero, la alerta se marca como "crítica" con prioridad alta.

### FA2 - Alerta ya atendida

- A: Si el actor marca la alerta como atendida, esta ya no aparece en la lista principal.

### FA3 - Reabastecimiento registrado

- A: Cuando se registra una entrada de inventario (CU07) que supera el stock mínimo, la alerta se cierra automáticamente.

### FA4 - Sin alertas

- A: Si no hay productos con stock bajo, el sistema muestra un mensaje indicando que no hay alertas activas.

## Postcondiciones

- A: Las alertas activas permanecen until que el stock supere el mínimo o el actor las marque como atendidas.
- A: Las alertas críticas requieren atención inmediata.

## Reglas de negocio

- A: Un producto genera alerta cuando: stock actual < stock mínimo.
- A: Las alertas pueden marcarse como atendidas o ignoradas con备注.
- A: Las alertas se generan automáticamente ante movimientos de inventario.
- A: El stock mínimo es configurable por producto.

## Reglas de seguridad

- A: Las notificaciones de alerta se envían a usuarios con rol encargado de inventario y administrador.
- A: Las alertas pueden ser vistas por cualquier usuario autenticado.

## Criterios de aceptación

- A: El sistema identifica automáticamente productos con stock bajo.
- A: Los productos agotados se marcan como alerta crítica.
- A: Las alertas son notificables a los responsables.
- A: El actor puede marcar alertas como atendidas o ignoradas.
- A: Las alertas se cierran automáticamente cuando el stock supera el mínimo.