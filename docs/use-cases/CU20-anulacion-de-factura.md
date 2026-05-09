# CU20 - Anulación de factura

## Objetivo

Anular una factura emitida por error o por solicitud del cliente, registrando la causa de la anulación y generando la nota de crédito correspondiente.

## Actores

- A: Vendedor
- A: Administrador
- A: Sistema de facturación

## Precondiciones

- A: Existe una factura generada y no anulada (referencia CU17).
- A: El usuario tiene permisos para anular facturas.

## Disparador

El actor selecciona una factura y elige la opción "Anular factura".

## Flujo principal

1. El actor selecciona la factura a anular.
2. El sistema presenta la información de la factura: número, fecha, cliente, total.
3. El actor ingresa el motivo de la anulación (seleccionado de lista predefinida o texto).
4. El sistema solicita confirmación con mensaje de advertencia.
5. El actor confirma la anulación.
6. El sistema genera una nota de crédito asociada a la factura.
7. El sistema cambia el estado de la factura a "anulada".
8. El sistema registra la anulación con fecha, hora, usuario responsable y motivo.
9. El sistema presenta la nota de crédito generada.

## Flujos alternos

### FA1 - Factura ya anulada

- A: Si la factura ya está anulada, el sistema muestra un error indicando que no se puede anular nuevamente.

### FA2 - Sin motivo de anulación

- A: Si el actor intenta anular sin ingresar el motivo, el sistema muestra un error indicando que el motivo es obligatorio.

### FA3 - Venta con movimientos de inventario relacionados

- A: Si la anulación requiere reversión de inventario, el sistema muestra una advertencia indicando que se revertirá el stock.

### FA4 - Factura con más de 30 días

- A: Si la factura tiene más de 30 días desde su emisión, el sistema muestra una advertencia y requiere confirmación adicional del gerente.

## Postcondiciones

- A: Anulación exitosa: la factura cambia a estado "anulada" y genera una nota de crédito.
- A: El inventario se revierte si la anulación lo requiere.
- A: La nota de crédito queda disponible para consulta e impresión.
- A: En caso de fallo, la factura permanece en su estado original.

## Reglas de negocio

- A: Toda anulación debe tener un motivo registrado.
- A: Una vez anulada, la factura no puede ser reactivada.
- A: La anulación genera una nota de crédito con el valor total de la factura.
- A: El inventario se revierte para productos que no han sido despachados.
- A: Las facturas anuladas no se eliminan del historial.

## Reglas de seguridad

- A: Solo usuarios con rol administrador pueden anular facturas.
- A: Las anulaciones requieren confirmación explícita.
- A: Toda anulación queda registrada con usuario, fecha, hora y motivo.
- A: Las anulaciones de facturas mayores a un umbral configurado requieren aprobación del gerente.

## Criterios de aceptación

- A: El sistema permite anular una factura con motivo registrado.
- A: La anulación genera una nota de crédito asociada.
- A: El sistema impide anular una factura ya anulada.
- A: El inventario se revierte tras la anulación.
- A: Toda anulación queda registrada para auditoría.

## Implementación técnica

> **Dependencias:** CU17 (modelo `Invoice`), CU10 (movimientos de inventario para reversión)  
> **Orden sugerido de desarrollo:** #20

### Base de datos

- [ ] Crear enum `CancellationReason` con motivos predefinidos: `CUSTOMER_REQUEST`, `BILLING_ERROR`, `PRODUCT_RETURN`, `OTHER`; registrar en `schema.prisma`
- [ ] Crear modelo Prisma `CreditNote` con campos: `id`, `creditNoteNumber` (único, secuencial), `invoiceId` (único, FK), `reason` (CancellationReason), `reasonDetail?`, `cancellationDate`, `total` (Decimal, igual al total de la factura), `createdBy` (userId), `createdAt`; con `@@map("credit_notes")`
- [ ] Relaciones: `CreditNote` → `Invoice`, `CreditNote` → `User`
- [ ] Agregar campo `cancelledAt DateTime?` y `cancellationReason?` en modelo `Invoice`
- [ ] Crear migración de base de datos

### API (NestJS)

- [ ] `POST /invoices/:id/cancel` — anular factura; guard `ADMIN` only
- [ ] Validar que factura exista y esté en estado `ACTIVE`
- [ ] Requerir `reason` (CancellationReason) y `reasonDetail?` en el body
- [ ] En transacción Prisma:
  - [ ] Cambiar `Invoice.status` a `CANCELLED`, registrar `cancelledAt` y `cancellationReason`
  - [ ] Cambiar `Sale.status` a `CANCELLED`
  - [ ] Revertir `currentStock` de cada item de la venta (+cantidad) si los productos no fueron despachados
  - [ ] Crear `InventoryMovement` tipo `ENTRY` (reversión) por cada item revertido
  - [ ] Crear `CreditNote` con `creditNoteNumber` secuencial
- [ ] Si la factura tiene más de 30 días, retornar advertencia (flag `forceOldInvoice: true` requerido en body)
- [ ] `GET /invoices/:id/credit-note` — obtener nota de crédito asociada

### Frontend (React)

- [ ] En el detalle de factura, agregar botón "Anular factura" visible solo para rol `ADMIN`
- [ ] Modal de anulación: mostrar datos de factura (número, fecha, total), selector de motivo (lista predefinida), campo de detalle (texto libre)
- [ ] Mostrar advertencia si factura tiene más de 30 días
- [ ] Mostrar advertencia si la anulación revertirá stock
- [ ] Confirmar anulación con botón explícito; llamar `POST /invoices/:id/cancel` con `useMutation`
- [ ] Tras éxito: mostrar nota de crédito generada con opción de imprimir
- [ ] Integrar con TanStack Query; invalidar caché de facturas y ventas
