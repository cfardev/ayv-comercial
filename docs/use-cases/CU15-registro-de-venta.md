# CU15 - Registro de venta

## Objetivo

Registrar una venta asociando el cliente, los productos seleccionados, cantidades y precios, generando el movimiento de salida de inventario correspondiente. La venta es la única vía de salida de stock del sistema.

## Actores

- A: Vendedor
- A: Administrador
- A: Sistema de ventas

## Precondiciones

- A: El actor está autenticado en el sistema.
- A: El actor tiene permisos para registrar ventas.
- A: Existen productos activos con stock disponible (referencia CU11).
- A: Si se requiere factura, el cliente debe estar activo.

## Disparador

El actor selecciona la opción "Nueva venta" desde el módulo de ventas.

## Flujo principal

1. El actor accede al formulario de nueva venta.
2. El sistema presenta los campos: fecha de venta, vendedor (automático con usuario logueado), cliente (buscador), forma de pago.
3. El actor selecciona o registra un nuevo cliente.
4. El actor agrega los productos a la venta.
5. Para cada producto, el sistema presenta: selector de producto, cantidad solicitada, precio unitario (del catálogo), subtotal (calculado).
6. El sistema verifica el stock disponible de cada producto.
7. Si el stock es insuficiente, el sistema muestra una advertencia.
8. El actor confirma la venta.
9. El sistema valida que todos los campos sean correctos.
10. El sistema crea el registro de venta con estado "pendiente" de facturación.
11. El sistema genera los movimientos de inventario (salida) para cada producto.
12. El sistema muestra un mensaje de confirmación con el número de venta generada.

## Flujos alternos

### FA1 - Producto sin stock

- A: Si un producto no tiene stock disponible, el sistema muestra una advertencia y no permite agregarlo a la venta.

### FA2 - Cliente inactivo

- A: Si se intenta registrar una venta para un cliente inactivo, el sistema muestra un error indicando que debe seleccionar un cliente activo o reactivarlo.

### FA3 - Venta sin productos

- A: Si el actor intenta guardar una venta sin productos, el sistema muestra un error indicando que debe agregar al menos un producto.

### FA4 - Datos incompletos

- A: Si faltan campos obligatorios, el sistema muestra validaciones y no permite el registro.

### FA5 - Precio modificado manualmente

- A: Si el vendedor modifica el precio unitario, el sistema registra el precio original y el precio aplicado para trazabilidad.

## Postcondiciones

- A: Venta exitosa: el registro de venta queda creado con productos y cantidades.
- A: El stock de los productos queda decrementado según las cantidades vendidas.
- A: La venta queda pendiente de facturación (referencia CU17) o asociada a factura existente.
- A: En caso de fallo, no se modifica el stock.

## Reglas de negocio

- A: Toda venta debe tener al menos un producto con cantidad mayor a cero.
- A: El cliente es obligatorio para la venta.
- A: El stock se decrementa al momento de registrar la venta, no al facturar.
- A: Las ventas pueden registrarse sin factura y fakturarse posteriormente.
- A: El precio de venta registrado es el del catálogo al momento de la venta.

## Reglas de seguridad

- A: Solo usuarios con rol administrador o vendedor pueden registrar ventas.
- A: Los precios modificados manualmente quedan registrados para auditoría.
- A: Todas las operaciones de venta quedan registradas con usuario responsable, fecha y hora.
- A: Las ventas no pueden eliminarse, solo anularse.

## Criterios de aceptación

- A: Un usuario con permisos puede registrar una venta con productos válidos y stock disponible.
- A: El stock de los productos se decrementa correctamente tras la confirmación.
- A: El sistema impide registrar ventas sin productos o sin cliente activo.
- A: El sistema muestra advertencias cuando el stock es bajo o insuficiente.
- A: El sistema genera un número único de venta para referencia.

## Implementación técnica

> **Dependencias:** CU07 (productos con stock), CU11 (consulta de existencias), CU14 (clientes)  
> **Orden sugerido de desarrollo:** #15

### Base de datos

- [ ] Crear enum `SaleStatus` (`PENDING_INVOICE`, `INVOICED`, `CANCELLED`); registrar en `schema.prisma`
- [ ] Crear enum `PaymentMethod` (`CASH`, `CARD`, `TRANSFER`, `CREDIT`); registrar en `schema.prisma`
- [ ] Crear modelo Prisma `Sale` con campos: `id`, `saleNumber` (único, auto-generado), `customerId`, `sellerId` (userId), `saleDate`, `paymentMethod` (PaymentMethod), `status` (SaleStatus, default PENDING_INVOICE), `subtotal` (Decimal), `discountAmount` (Decimal, default 0), `taxAmount` (Decimal, default 0), `total` (Decimal), `notes?`, `createdAt`, `updatedAt`; con `@@map("sales")`
- [ ] Crear modelo `SaleItem` con campos: `id`, `saleId`, `productId`, `quantity` (Int), `originalPrice` (Decimal), `appliedPrice` (Decimal), `discount` (Decimal, default 0), `subtotal` (Decimal); con `@@map("sale_items")`
- [ ] Relaciones: `Sale` → `Customer`, `Sale` → `User` (seller), `Sale` → `SaleItem[]`
- [ ] Crear migración de base de datos

### API (NestJS)

- [ ] Crear `SalesModule` con `SalesService` y `SalesController`
- [ ] `POST /sales` — registrar venta; validar cliente activo, al menos un item, stock suficiente por producto; guard `ADMIN | SELLER`
- [ ] En transacción Prisma: crear `Sale`, crear `SaleItem[]`, decrementar `currentStock` de cada producto, crear `InventoryMovement` tipo `EXIT` por cada item
- [ ] Generar `saleNumber` secuencial (ej. `SALE-00001`)
- [ ] Registrar `originalPrice` (precio del catálogo) y `appliedPrice` (precio usado) en cada `SaleItem`; si difieren, marcar para auditoría
- [ ] `GET /sales` — listar paginado; filtros: `search` (saleNumber, cliente, vendedor), `status`, rango de fechas, `sellerId`; sellers ven solo sus ventas
- [ ] `GET /sales/:id` — detalle de venta con items
- [ ] `DTO CreateSaleDto` con `items: CreateSaleItemDto[]`; `@ArrayMinSize(1)`

### Frontend (React)

- [ ] Crear página `/sales/new` protegida para `ADMIN | SELLER`
- [ ] Buscador de cliente con autocompletado (solo clientes activos); opción de registrar cliente nuevo inline (CU14)
- [ ] Selector de productos con buscador; mostrar stock disponible por producto
- [ ] Tabla de items con: producto, cantidad (input), precio unitario, subtotal; botón de eliminar item
- [ ] Advertencia visual si stock insuficiente al ingresar cantidad
- [ ] Panel de resumen: subtotal, descuento, impuesto, total (actualizado en tiempo real al modificar items)
- [ ] Selector de forma de pago
- [ ] Botón "Confirmar venta"; mostrar mensaje de éxito con número de venta generado
- [ ] Integrar con TanStack Query (`useMutation`); invalidar caché de stock e inventario tras éxito
