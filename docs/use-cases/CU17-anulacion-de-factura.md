# CU17 - Anulación de factura

## Objetivo

Anular una factura emitida por error o por solicitud del cliente, registrando la causa de la anulación y generando la nota de crédito correspondiente.

## Actores

- A: Vendedor
- A: Administrador
- A: Sistema de facturación

## Precondiciones

- A: Existe una factura generada y no anulada (referencia CU14).
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