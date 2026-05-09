# CU10 - Registro de entrada de inventario

## Objetivo

Registrar el ingreso de nuevas existencias al inventario, ya sea stock inicial, compras a proveedores o devoluciones de clientes.

## Actores

- A: Encargado de inventario
- A: Administrador
- A: Sistema de inventario

## Precondiciones

- A: El actor está autenticado en el sistema.
- A: El actor tiene permisos para registrar entradas de inventario.
- A: Los productos a ingresar existen en el catálogo (referencia CU07).
- A: Si la entrada corresponde a una compra, el proveedor seleccionado existe y está activo en el sistema (referencia CU06).
- A: Si la entrada proviene de una orden de compra, dicha orden existe y se encuentra en estado enviada o parcial (referencia CU09).

## Disparador

El actor selecciona la opción "Registrar entrada" desde el módulo de inventario.

## Flujo principal

1. El actor accede al formulario de nueva entrada de inventario.
2. El sistema presenta los campos: tipo de entrada (compra, devolución, ajuste inicial), número de documento de referencia, proveedor (condicional), fecha de entrada, observaciones.
3. El actor completa los campos y agrega los productos a ingresar.
4. Para cada producto, el sistema presenta: selector de producto, cantidad recibida, número de serie/lote (opcional), fecha de vencimiento (opcional).
5. El actor ingresa las cantidades y productos.
6. El sistema valida que los productos existan y estén activos.
7. El actor confirma la entrada.
8. El sistema crea el registro de entrada y actualiza el stock de cada producto.
9. El sistema muestra un mensaje de confirmación con el número de entrada generada.

## Flujos alternos

### FA1 - Producto no existe

- A: Si se intenta agregar un producto que no existe en el catálogo, el sistema muestra un mensaje de error.

### FA2 - Cantidad inválida

- A: Si la cantidad ingresada es menor o igual a cero, el sistema muestra un error indicando que la cantidad debe ser positiva.

### FA3 - Entrada sin productos

- A: Si el actor intenta guardar una entrada sin productos, el sistema muestra un error indicando que debe agregar al menos un producto.

### FA4 - Producto inactivo

- A: Si se intenta agregar un producto inactivo, el sistema muestra una advertencia indicando que el producto está inactivo; puede agregarlo de todas formas con confirmación.

### FA5 - Documento duplicado

- A: Si el número de documento de referencia ya fue registrado, el sistema muestra una advertencia indicando duplicado y solicita confirmación.

## Postcondiciones

- A: Entrada exitosa: el stock de los productos queda incrementado con las cantidades registradas.
- A: Entrada fallida: no se modifica el stock de ningún producto.
- A: El registro de entrada queda disponible para consulta en el historial de movimientos de inventario.

## Reglas de negocio

- A: Toda entrada debe tener al menos un producto con cantidad mayor a cero.
- A: El tipo de entrada "compra" requiere informar el proveedor.
- A: El proveedor informado en una entrada por compra corresponde a la operación de abastecimiento y no implica una asociación exclusiva entre el producto y dicho proveedor.
- A: Un mismo producto puede aparecer en entradas asociadas a distintos proveedores.
- A: El stock se incrementa inmediatamente tras la confirmación.
- A: Cada entrada genera un movimiento de inventario con tipo "ENTRADA".
- A: Las entradas pueden estar asociadas a una orden de compra (referencia CU09) o ser independientes.

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

- [ ] Crear enum `InventoryEntryType` (`PURCHASE`, `RETURN`, `INITIAL_STOCK`); registrar en `schema.prisma`
- [ ] Crear modelo Prisma `InventoryEntry` con campos: `id`, `entryType` (InventoryEntryType), `referenceDocument?`, `supplierId?`, `purchaseOrderId?`, `entryDate`, `notes?`, `createdBy` (userId), `createdAt`; con `@@map("inventory_entries")`
- [ ] Crear modelo `InventoryEntryItem` con campos: `id`, `inventoryEntryId`, `productId`, `quantityReceived` (Int), `lotNumber?`, `expirationDate?`; con `@@map("inventory_entry_items")`
- [ ] Crear modelo `InventoryMovement` con campos: `id`, `productId`, `movementType` (enum: `ENTRY`, `EXIT`, `ADJUSTMENT_POSITIVE`, `ADJUSTMENT_NEGATIVE`), `quantity` (Int), `previousStock` (Int), `newStock` (Int), `referenceId?`, `referenceType?`, `createdBy` (userId), `createdAt`; con `@@map("inventory_movements")`
- [ ] Relaciones: `InventoryEntry` → `Supplier?`, `PurchaseOrder?`, `User`, `InventoryEntryItem[]`
- [ ] Crear migración de base de datos

### API (NestJS)

- [ ] Crear `InventoryModule` con `InventoryService` y `InventoryController`
- [ ] `POST /inventory/entries` — crear entrada; validar productos activos, cantidades > 0; si `entryType === PURCHASE` requerir `supplierId`; si `purchaseOrderId` proporcionado, validar que la orden exista y esté en SENT o PARTIAL; guard `ADMIN | INVENTORY_MANAGER`
- [ ] Actualizar `currentStock` de cada producto en transacción Prisma: `currentStock += quantityReceived`
- [ ] Crear registros `InventoryMovement` tipo `ENTRY` por cada item, con `previousStock` y `newStock`
- [ ] Si entrada vinculada a `PurchaseOrder`, evaluar si actualizar estado de la orden a `PARTIAL` o `RECEIVED`
- [ ] `GET /inventory/entries` — listar paginado con filtros; guard `ADMIN | INVENTORY_MANAGER`
- [ ] `GET /inventory/entries/:id` — detalle con items
- [ ] `DTO CreateInventoryEntryDto` con `items: CreateEntryItemDto[]`; `@ArrayMinSize(1)`

### Frontend (React)

- [ ] Crear página `/inventory/entries` protegida para `ADMIN | INVENTORY_MANAGER`
- [ ] Formulario de nueva entrada: selector de tipo (compra, devolución, stock inicial), número de documento, proveedor (si compra), fecha, observaciones
- [ ] Sección de items: agregar/eliminar productos con cantidad, número de lote (opcional), fecha de vencimiento (opcional)
- [ ] Opción de vincular a una orden de compra existente (selector de órdenes en estado SENT o PARTIAL)
- [ ] Confirmar entrada; mostrar mensaje de éxito con número de entrada generado
- [ ] Integrar con TanStack Query; invalidar caché de existencias (CU11) tras mutaciones
