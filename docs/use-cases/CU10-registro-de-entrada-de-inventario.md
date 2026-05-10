# CU10 - Registro de entrada de inventario

## Objetivo

Registrar el ingreso de nuevas existencias al inventario exclusivamente mediante la recepción de mercadería asociada a una orden de compra.

## Actores

- A: Encargado de inventario
- A: Administrador
- A: Sistema de inventario

## Precondiciones

- A: El actor está autenticado en el sistema.
- A: El actor tiene permisos para registrar entradas de inventario.
- A: Los productos a ingresar existen en el catálogo (referencia CU07).
- A: La orden de compra asociada existe y se encuentra en estado enviada o parcial (referencia CU09).

## Disparador

El actor selecciona la opción "Registrar entrada" desde el módulo de inventario.

## Flujo principal

1. El actor accede al formulario de nueva entrada de inventario.
2. El sistema presenta los campos: orden de compra (obligatoria), fecha de entrada, observaciones.
3. El actor selecciona la orden de compra pendiente o parcial a recibir.
4. El sistema carga automáticamente los productos y cantidades de la orden.
5. Para cada producto, el sistema presenta: producto, cantidad ordenada, cantidad recibida (editable), número de serie/lote (opcional), fecha de vencimiento (opcional).
6. El actor confirma las cantidades recibidas.
7. El sistema valida que la orden esté en estado enviado o parcial y que las cantidades sean mayores a cero.
8. El actor confirma la entrada.
9. El sistema crea el registro de entrada y actualiza el stock de cada producto.
10. El sistema actualiza el estado de la orden de compra a parcial o recibida según las cantidades.
11. El sistema muestra un mensaje de confirmación con el número de entrada generada.

## Flujos alternos

### FA1 - Orden de compra no existe o no está en estado válido

- A: Si la orden de compra seleccionada no existe o no está en estado enviada o parcial, el sistema muestra un error y no permite registrar la entrada.

### FA2 - Cantidad recibida inválida

- A: Si la cantidad recibida es menor o igual a cero, el sistema muestra un error indicando que la cantidad debe ser positiva.

### FA3 - Cantidad recibida mayor a la ordenada

- A: Si la cantidad recibida supera la cantidad ordenada, el sistema muestra una advertencia y solicita confirmación antes de proceder.

### FA4 - Orden sin productos

- A: Si la orden de compra no tiene productos, el sistema muestra un error indicando que no es posible registrar la entrada.

## Postcondiciones

- A: Entrada exitosa: el stock de los productos queda incrementado con las cantidades registradas.
- A: Entrada fallida: no se modifica el stock de ningún producto.
- A: El registro de entrada queda disponible para consulta en el historial de movimientos de inventario.

## Reglas de negocio

- A: Toda entrada debe estar asociada a una orden de compra en estado enviada o parcial.
- A: Toda entrada debe tener al menos un producto con cantidad mayor a cero.
- A: El proveedor de la entrada corresponde al proveedor de la orden de compra asociada.
- A: Un mismo producto puede aparecer en entradas asociadas a distintas órdenes de compra.
- A: El stock se incrementa inmediatamente tras la confirmación.
- A: Cada entrada genera un movimiento de inventario con tipo "ENTRADA".
- A: No existen entradas de inventario independientes; toda entrada requiere una orden de compra.

## Reglas de seguridad

- A: Solo usuarios con rol administrador o encargado de inventario pueden registrar entradas.
- A: El sistema registra el usuario responsable, fecha, hora y productos ingresados.
- A: Los campos numéricos deben validarse para prevenir inyecciones.
- A: Las entradas quedan registradas con trazabilidad completa en el historial.

## Criterios de aceptación

- A: Un usuario con permisos puede registrar una entrada de inventario con productos válidos.
- A: El stock de los productos se actualiza correctamente tras la confirmación.
- A: El sistema impide registrar cantidades no numéricas o negativas.
- A: El sistema genera un registro en el historial de movimientos de inventario.
- A: Las entradas quedan vinculadas al usuario que las registra.

## Implementación técnica

> **Dependencias:** CU07 (productos), CU06 (proveedores), CU09 (órdenes de compra)  
> **Orden sugerido de desarrollo:** #11

### Base de datos

- [ ] Crear modelo Prisma `InventoryEntry` con campos: `id`, `purchaseOrderId` (requerido), `entryDate`, `notes?`, `createdBy` (userId), `createdAt`; con `@@map("inventory_entries")`
- [ ] Crear modelo `InventoryEntryItem` con campos: `id`, `inventoryEntryId`, `productId`, `quantityReceived` (Int), `lotNumber?`, `expirationDate?`; con `@@map("inventory_entry_items")`
- [ ] Crear modelo `InventoryMovement` con campos: `id`, `productId`, `movementType` (enum: `ENTRY`, `EXIT`), `quantity` (Int), `previousStock` (Int), `newStock` (Int), `referenceId?`, `referenceType?`, `createdBy` (userId), `createdAt`; con `@@map("inventory_movements")`
- [ ] Relaciones: `InventoryEntry` → `PurchaseOrder`, `InventoryEntry` → `User`, `InventoryEntry` → `InventoryEntryItem[]`
- [ ] Crear migración de base de datos

### API (NestJS)

- [ ] Crear `InventoryModule` con `InventoryService` y `InventoryController`
- [ ] `POST /inventory/entries` — crear entrada; requerir `purchaseOrderId`; validar que la orden exista y esté en SENT o PARTIAL; validar productos activos, cantidades > 0; guard `ADMIN | INVENTORY_MANAGER`
- [ ] Actualizar `currentStock` de cada producto en transacción Prisma: `currentStock += quantityReceived`
- [ ] Crear registros `InventoryMovement` tipo `ENTRY` por cada item, con `previousStock` y `newStock`
- [ ] Actualizar estado de la orden a `PARTIAL` o `RECEIVED` según cantidades recibidas vs ordenadas
- [ ] `GET /inventory/entries` — listar paginado con filtros; guard `ADMIN | INVENTORY_MANAGER`
- [ ] `GET /inventory/entries/:id` — detalle con items
- [ ] `DTO CreateInventoryEntryDto` con `purchaseOrderId`, `items: CreateEntryItemDto[]`; `@ArrayMinSize(1)`

### Frontend (React)

- [ ] Crear página `/inventory/entries` protegida para `ADMIN | INVENTORY_MANAGER`
- [ ] Formulario de nueva entrada: selector de orden de compra (solo órdenes en estado SENT o PARTIAL), fecha de entrada, observaciones
- [ ] Al seleccionar orden, cargar automáticamente los productos y cantidades ordenadas
- [ ] Sección de items: editar cantidad recibida por producto, número de lote (opcional), fecha de vencimiento (opcional)
- [ ] Confirmar entrada; mostrar mensaje de éxito con número de entrada generado
- [ ] Integrar con TanStack Query; invalidar caché de existencias (CU11) tras mutaciones
