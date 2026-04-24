# CU14 - Generación de factura

## Objetivo

Emitir la factura correspondiente a una venta realizada, generando el documento fiscal requerido y actualizando el estado de la venta.

## Actores

- A: Vendedor
- A: Administrador
- A: Sistema de facturación

## Precondiciones

- A: Existe una venta registrada con estado "pendiente de facturación" (referencia CU12).
- A: El cliente asociado a la venta está activo.
- A: Los productos de la venta tienen precios configurados.

## Disparador

El actor selecciona una venta pendiente y elige la opción "Generar factura" o "Facturar".

## Flujo principal

1. El actor selecciona la venta a facturar.
2. El sistema presenta el resumen de la venta: cliente, productos, cantidades, precios, totales.
3. El actor puede seleccionar o ingresar datos de la dirección de facturación si difieren del cliente.
4. El actor confirma los datos de la factura.
5. El sistema genera el número de factura secuencial.
6. El sistema crea el registro de factura asociado a la venta.
7. El sistema actualiza el estado de la venta a "facturada".
8. El sistema muestra la factura generada con opción de imprimir.

## Flujos alternos

### FA1 - Venta ya facturada

- A: Si la venta ya tiene una factura asociada, el sistema muestra un error indicando que ya fue facturada.

### FA2 - Datos de cliente incompletos

- A: Si el cliente no tiene datos de facturación completos, el sistema solicita completar los datos antes de facturar.

### FA3 - productos no disponibles

- A: Si algún producto de la venta ya no está disponible, el sistema muestra una advertencia y permite excluir el producto o cancelar la facturación.

### FA4 - Error en generación de número

- A: Si ocurre un error al generar el número de factura, el sistema muestra un error y permite reintentar.

## Postcondiciones

- A: Factura exitosa: la factura queda creada y la venta cambia a estado "facturada".
- A: La factura queda disponible para consulta (referencia CU15), reimpresión (CU16) o anulación (CU17).
- A: En caso de fallo, la venta permanece en estado "pendiente de facturación".

## Reglas de negocio

- A: Cada factura tiene un número secuencial único.
- A: Una venta solo puede tener una factura asociada.
- A: La factura debe incluir: número, fecha, datos del cliente, detalle de productos, precios, impuesto, total.
- A: El número de factura sigue la secuencia establecida por la autoridad fiscal.

## Reglas de seguridad

- A: Solo usuarios con rol administrador o vendedor pueden generar facturas.
- A: Las facturas no pueden modificarse una vez generadas.
- A: La anulación de facturas sigue el proceso legal establecido.
- A: Todas las operaciones de facturación quedan registradas para auditoría.

## Criterios de aceptación

- A: El sistema genera una factura con número único y datos completos.
- A: La venta asociada cambia de estado a "facturada".
- A: El sistema impide facturar una venta ya facturada.
- A: Los datos de la factura son correctos y coinciden con la venta.
- A: La factura queda disponible para consulta e impresión.