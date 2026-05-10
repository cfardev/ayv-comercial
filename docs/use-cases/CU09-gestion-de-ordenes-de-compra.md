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
2. El sistema presenta el campo: proveedor (obligatorio).
3. El actor selecciona el proveedor.
4. El sistema filtra y muestra únicamente los productos activos asociados a ese proveedor.
5. El sistema presenta los campos adicionales: fecha estimada de recepción, condiciones de pago (opcional), observaciones.
6. El actor agrega uno o más productos del listado filtrado.
7. Para cada producto, el sistema presenta: producto, cantidad solicitada, costo unitario esperado y subtotal.
8. El actor completa el detalle de la orden.
9. El sistema valida que el proveedor esté activo, que los productos existan, pertenezcan al proveedor seleccionado y que las cantidades sean mayores a cero.
10. El sistema calcula el total estimado de la orden.
11. El actor confirma el registro.
12. El sistema genera la orden de compra con estado "pendiente" y número de referencia.
13. El sistema muestra un mensaje de confirmación y actualiza la lista de órdenes.

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
2. El sistema redirige al formulario de entrada de inventario vinculando la orden de compra.
3. El actor confirma la recepción total o parcial desde el formulario de entrada de inventario.
4. El sistema actualiza el estado de la orden a "parcial" o "recibida" según las cantidades recibidas.
5. El sistema incrementa el stock de los productos recibidos (única vía de entrada de inventario).

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
- A: Solo se pueden incluir productos que estén asociados al proveedor seleccionado en la orden.
- A: Solo se pueden incluir proveedores activos y productos existentes.
- A: Las transiciones válidas de estado son: pendiente -> enviada -> parcial/recibida; pendiente -> anulada; enviada -> anulada si aún no tiene recepción.
- A: Una orden recibida no puede editarse ni anularse.

## Reglas de seguridad

- A: Solo usuarios con rol administrador o encargado de inventario pueden crear, editar, enviar, anular o cerrar órdenes de compra.
- A: Todas las operaciones sobre órdenes de compra quedan registradas con usuario responsable, fecha y hora.
- A: Los montos y costos de compra son visibles solo para roles autorizados.

## Criterios de aceptación

- A: Un usuario con permisos puede registrar una orden de compra seleccionando primero un proveedor activo.
- A: El sistema filtra los productos disponibles según el proveedor seleccionado.
- A: El sistema impide agregar productos que no pertenezcan al proveedor seleccionado.
- A: El sistema calcula correctamente el total estimado de la orden.
- A: El sistema impide registrar órdenes sin productos o con cantidades inválidas.
- A: El sistema permite actualizar el estado de la orden según reglas válidas.
- A: Una orden puede vincularse con una entrada de inventario al momento de la recepción.

## Implementación técnica

> **Dependencias:** CU06 (proveedores), CU07 (productos)  
> **Orden sugerido de desarrollo:** #10

### Base de datos

- [ ] Crear enum `PurchaseOrderStatus` (`PENDING`, `SENT`, `PARTIAL`, `RECEIVED`, `CANCELLED`); registrar en `schema.prisma`
- [ ] Crear modelo Prisma `PurchaseOrder` con campos: `id`, `supplierId`, `referenceNumber` (único, auto-generado), `estimatedReceiptDate?`, `paymentTerms?`, `notes?`, `status` (PurchaseOrderStatus, default PENDING), `totalEstimated` (Decimal), `createdBy` (userId), `createdAt`, `updatedAt`; con `@@map("purchase_orders")`
- [ ] Crear modelo `PurchaseOrderItem` con campos: `id`, `purchaseOrderId`, `productId`, `quantityOrdered` (Int), `unitCost` (Decimal), `subtotal` (Decimal, calculado); con `@@map("purchase_order_items")`
- [ ] Relaciones: `PurchaseOrder` → `Supplier`, `PurchaseOrder` → `PurchaseOrderItem[]`, `PurchaseOrder` → `User`
- [ ] Crear migración de base de datos

### API (NestJS)

- [ ] Crear `PurchaseOrdersModule` con `PurchaseOrdersService` y `PurchaseOrdersController`
- [ ] `POST /purchase-orders` — crear orden; validar proveedor activo, productos existentes, que todos los productos pertenezcan al proveedor seleccionado, cantidades > 0; calcular `totalEstimated`; guard `ADMIN | INVENTORY_MANAGER`
- [ ] `GET /purchase-orders` — listar paginado; filtros: `search` (número, proveedor), rango de fechas, `status`; por defecto mostrar PENDING y SENT
- [ ] `GET /purchase-orders/:id` — detalle con items
- [ ] `PATCH /purchase-orders/:id/status` — actualizar estado; validar transiciones permitidas; registrar trazabilidad; guard `ADMIN | INVENTORY_MANAGER`
- [ ] Validar transiciones de estado: `PENDING → SENT`, `SENT → PARTIAL | RECEIVED`, `PENDING → CANCELLED`, `SENT → CANCELLED`; `RECEIVED` es estado final
- [ ] `GET /purchase-orders/products-by-supplier?supplierId=:id` — listar productos activos asociados a un proveedor; para uso en el formulario de nueva orden
- [ ] `DTO CreatePurchaseOrderDto` con `items: CreatePurchaseOrderItemDto[]`; `@ArrayMinSize(1)` en items
- [ ] Retornar costos y montos solo para `ADMIN | INVENTORY_MANAGER` (ocultar para otros roles)

### Frontend (React)

- [ ] Crear página `/purchase-orders` protegida para `ADMIN | INVENTORY_MANAGER`
- [ ] Tabla paginada con columnas: número, proveedor, fecha, total estimado, estado, fecha estimada de recepción
- [ ] Buscador por número o proveedor; filtro por estado (PENDING y SENT por defecto)
- [ ] Botón "Nueva orden" → formulario con selector de proveedor (solo activos) como primer paso
- [ ] Al seleccionar proveedor, cargar dinámicamente la lista de productos asociados a ese proveedor
- [ ] Sección de items en el formulario: agregar/eliminar productos del proveedor seleccionado con cantidad y costo unitario; mostrar subtotal y total en tiempo real
- [ ] Botón "Actualizar estado" desde el detalle de la orden con los estados disponibles según estado actual
- [ ] Flujo de recepción: enlazar con entrada de inventario (CU10)
- [ ] Integrar con TanStack Query; invalidar caché tras mutaciones
