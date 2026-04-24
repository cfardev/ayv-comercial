# CU16 - Reimpresión de factura

## Objetivo

Volver a emitir una factura previamente generada, generando una copia con la información original para casos de pérdida o requerimiento del cliente.

## Actores

- A: Vendedor
- A: Administrador
- A: Sistema de facturación

## Precondiciones

- A: Existe una factura generada previamente (referencia CU14).
- A: El usuario tiene permisos para reimprimir facturas.

## Disparador

El actor selecciona una venta facturada o una factura existente y elige la opción "Reimprimir factura".

## Flujo principal

1. El actor selecciona la factura a reimprimir.
2. El sistema presenta la información de la factura original: número, fecha, datos del cliente, detalle de productos.
3. El actor confirma la reimpresión.
4. El sistema genera una copia de la factura con la leyenda "COPIA" visible.
5. El sistema registra la reimpresión con fecha, hora y usuario responsable.
6. El sistema muestra la copia de la factura para impresión.

## Flujos alternos

### FA1 - Factura anulada

- A: Si la factura está anulada, el sistema muestra un error indicando que no se puede reimprimir una factura anulada.

### FA2 - Factura no existe

- A: Si la factura no existe, el sistema muestra un error indicando que no se encontró la factura.

### FA3 - Límite de reimpresiones

- A: Si se supera el límite de reimpresiones configurado, el sistema muestra una advertencia indicando el límite y solicita confirmación adicional.

## Postcondiciones

- A: La reimpresión queda registrada en el historial con trazabilidad.
- A: La copia generada tiene valor fiscal igual al original.

## Reglas de negocio

- A: Toda reimpresión genera un registro de auditoría.
- A: El documento reimpreso debe incluir la leyenda "COPIA" de forma visible.
- A: El número de reimpresión se registra para control interno.
- A: No existe límite técnico para reimpresiones, pero cada una queda registrada.

## Reglas de seguridad

- A: Solo usuarios con rol administrador o vendedor pueden reimprimir facturas.
- A: Todas las reimpresiones quedan registradas con usuario, fecha, hora y motivo (si se requiere).
- A: Las reimpresiones excesivas pueden generar alertas internas.

## Criterios de aceptación

- A: El sistema genera una copia fiel de la factura original.
- A: La copia incluye la leyenda "COPIA".
- A: La reimpresión queda registrada en el historial.
- A: El sistema impide reimprimir facturas anuladas.
- A: El sistema registra el usuario y fecha de cada reimpresión.