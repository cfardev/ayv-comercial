# CU09 - Gestión de órdenes de compra

## Objetivo

Registrar, consultar, aprobar, enviar, actualizar y cerrar órdenes de compra para formalizar el abastecimiento de productos desde uno o más proveedores.

## Actores

- A: Administrador
- A: Encargado de inventario
- A: Sistema de compras

## Precondiciones

- A: El actor está autenticado en el sistema.
- A: El actor tiene permisos para gestionar compras.
- A: Existen proveedores activos disponibles para compra (referencia CU06).
- A: Existen productos activos disponibles para ser incluidos en la orden (referencia CU07).

## Disparador

El actor selecciona la opción "Órdenes de compra" desde el menú de compras o inventario.

## Flujo principal

### Registro de orden de compra

1. El actor accede al formulario de nueva orden de compra.
2. El sistema presenta los campos: proveedor, fecha estimada de recepción, condiciones de pago (opcional), observaciones y detalle de productos.
3. El actor selecciona el proveedor y agrega uno o más productos.
4. Para cada producto, el sistema presenta: producto, cantidad solicitada, costo unitario esperado y subtotal.
5. El actor completa el detalle de la orden.
6. El sistema valida que el proveedor esté activo, que los productos existan y que las cantidades sean mayores a cero.
7. El sistema calcula el total estimado de la orden.
8. El actor confirma el registro.
9. El sistema genera la orden de compra con estado "pendiente" y número de referencia.
10. El sistema muestra un mensaje de confirmación y actualiza la lista de órdenes.

### Consulta de órdenes de compra

1. El actor accede a la lista de órdenes de compra.
2. El sistema muestra una tabla con columnas: número, proveedor, fecha, total estimado, estado y fecha estimada de recepción.
3. El actor puede buscar por número, proveedor o rango de fechas.
4. El actor puede filtrar por estado (pendiente, enviada, parcial, recibida, anulada); por defecto se muestran pendientes y enviadas.
5. El sistema presenta los resultados paginados.

### Actualización de estado de la orden

1. El actor selecciona una orden y elige "Actualizar estado".
2. El sistema presenta los estados permitidos según el estado actual.
3. El actor selecciona el nuevo estado y agrega observaciones si corresponde.
4. El sistema valida la transición.
5. El sistema actualiza la orden y registra la trazabilidad del cambio.

### Cierre por recepción

1. El actor selecciona una orden enviada o parcial y elige "Registrar recepción".
2. El sistema permite vincular la recepción con una entrada de inventario.
3. El actor confirma la recepción total o parcial.
4. El sistema actualiza el estado de la orden a "parcial" o "recibida" según las cantidades recibidas.
5. El sistema deja disponible la referencia de la orden para el proceso de entrada de inventario (referencia CU10).

## Flujos alternos

### FA1 - Proveedor inactivo

- A: Si el proveedor está inactivo, el sistema muestra un error y no permite registrar la orden.

### FA2 - Orden sin productos

- A: Si el actor intenta guardar una orden sin productos, el sistema muestra un error indicando que debe agregar al menos un producto.

### FA3 - Cantidad o costo inválido

- A: Si alguna línea tiene cantidad menor o igual a cero o costo inválido, el sistema rechaza la orden e informa el detalle.

### FA4 - Orden anulada

- A: Si la orden ya fue anulada, no puede volver a pasar a estados operativos.

## Postcondiciones

- A: Registro exitoso: la orden queda disponible para seguimiento y recepción.
- A: Actualización exitosa: el estado de la orden refleja la situación actual del abastecimiento.
- A: Recepción parcial o total: la orden queda lista para ser vinculada con movimientos de entrada de inventario.
- A: En cualquier caso fallido, no se modifica el estado ni el detalle de la orden.

## Reglas de negocio

- A: Toda orden de compra debe estar asociada a un único proveedor.
- A: Una orden de compra debe contener al menos un producto.
- A: Un mismo producto puede aparecer en órdenes de compra de distintos proveedores.
- A: Solo se pueden incluir proveedores activos y productos existentes.
- A: Las transiciones válidas de estado son: pendiente -> enviada -> parcial/recibida; pendiente -> anulada; enviada -> anulada si aún no tiene recepción.
- A: Una orden recibida no puede editarse ni anularse.

## Reglas de seguridad

- A: Solo usuarios con rol administrador o encargado de inventario pueden crear, editar, enviar, anular o cerrar órdenes de compra.
- A: Todas las operaciones sobre órdenes de compra quedan registradas con usuario responsable, fecha y hora.
- A: Los montos y costos de compra son visibles solo para roles autorizados.

## Criterios de aceptación

- A: Un usuario con permisos puede registrar una orden de compra con proveedor activo y uno o más productos.
- A: El sistema calcula correctamente el total estimado de la orden.
- A: El sistema impide registrar órdenes sin productos o con cantidades inválidas.
- A: El sistema permite actualizar el estado de la orden según reglas válidas.
- A: Una orden puede vincularse con una entrada de inventario al momento de la recepción.
