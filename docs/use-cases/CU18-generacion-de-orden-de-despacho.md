# CU18 - Generación de orden de despacho

## Objetivo

Crear una orden interna para preparar y entregar el pedido vendido, asignando recursos para la preparación y envío.

## Actores

- A: Encargado de despacho
- A: Vendedor
- A: Administrador
- A: Sistema de despachos

## Precondiciones

- A: Existe una venta facturada lista para despacho (referencia CU14).
- A: El usuario tiene permisos para generar órdenes de despacho.

## Disparador

El actor selecciona una venta facturada y elige la opción "Generar orden de despacho".

## Flujo principal

1. El actor selecciona la venta a despachar.
2. El sistema presenta la información: datos del cliente, productos, cantidades, dirección de entrega, observaciones.
3. El actor confirma o modifica la dirección de entrega.
4. El actor asigna la orden a un prepara dor y define la prioridad (normal/urgente).
5. El actor confirma la generación de la orden.
6. El sistema crea la orden de despacho con estado "pendiente de preparación".
7. El sistema muestra un mensaje de confirmación con el número de orden generada.

## Flujos alternos

### FA1 - Venta sin factura

- A: Si la venta no está facturada, el sistema muestra un error indicando que no se puede despachar una venta sin factura.

### FA2 - Orden ya generada

- A: Si la venta ya tiene una orden de despacho asociada, el sistema muestra un error indicando que ya fue generada.

### FA3 - productos no disponibles en almacén

- A: Si algún producto no está disponible en el almacén de donde se despachará, el sistema muestra una advertencia.

### FA4 - Dirección de entrega incompleta

- A: Si la dirección de entrega está incompleta, el sistema solicita completarla antes de generar la orden.

## Postcondiciones

- A: Orden de despacho exitosa: la orden queda creada con productos y prioridades.
- A: La venta asociada cambia a estado "en despacho".
- A: La orden queda disponible para seguimiento y actualización de estado.

## Reglas de negocio

- A: Toda orden de despacho está asociada a una venta facturada.
- A: Una venta solo puede tener una orden de despacho activa.
- A: Los estados de la orden son: pendiente, en preparación, lista, en camino, entregada, cancelada.
- A: La orden incluye los productos, cantidades y dirección de entrega.

## Reglas de seguridad

- A: Solo usuarios con rol encargado de despacho, vendedor o administrador pueden generar órdenes de despacho.
- A: Las órdenes de despacho quedan registradas con trazabilidad completa.

## Criterios de aceptación

- A: El sistema genera una orden de despacho para una venta facturada.
- A: La orden incluye productos, cantidades y dirección de entrega.
- A: La venta asociada cambia de estado a "en despacho".
- A: El sistema impide generar órdenes para ventas sin factura o ya despachadas.