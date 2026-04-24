# CU06 - Actualización de costo y precio de producto

## Objetivo

Permitir modificar el costo y el precio de venta de un producto ya registrado en el sistema, manteniendo trazabilidad de los cambios realizados.

## Actores

- A: Administrador
- A: Encargado de inventario
- A: Sistema de precios

## Precondiciones

- A: El actor está autenticado en el sistema.
- A: El actor tiene permisos para actualizar costos y precios.
- A: El producto que se desea modificar existe y está activo.

## Disparador

El actor selecciona un producto desde "Gestión de productos" (CU05) y elige la opción "Actualizar precio" o "Actualizar costo y precio".

## Flujo principal

1. El actor selecciona el producto a modificar.
2. El sistema presenta la información actual: nombre del producto, código, costo actual, precio de venta actual, margen actual (diferencia porcentual entre costo y precio).
3. El actor ingresa el nuevo costo y/o el nuevo precio de venta.
4. El sistema valida que los valores sean numéricos positivos.
5. El sistema calcula y muestra el nuevo margen o pérdida.
6. El actor puede ingresar una justificación del cambio (opcional según configuración).
7. El sistema registra el cambio con fecha, hora, usuario responsable, valores anteriores y nuevos valores.
8. El sistema muestra un mensaje de confirmación y actualiza la información del producto.

## Flujos alternos

### FA1 - Precio menor o igual al costo

- A: Si el nuevo precio de venta es menor o igual al nuevo costo, el sistema muestra una advertencia de margen negativo y solicita confirmación antes de aplicar el cambio.

### FA2 - Variación excesiva

- A: Si la variación porcentual entre el precio anterior y el nuevo supera el 50%, el sistema muestra una advertencia indicando el porcentaje de cambio y solicita confirmación adicional.

### FA3 - Producto inactivo

- A: Si el producto está inactivo, el sistema muestra un error indicando que no se puede modificar un producto inactivo; debe reactivarlo primero.

### FA4 - Campos vacíos

- A: Si el actor intenta guardar sin ingresar nuevos valores, el sistema muestra un error indicando que debe ingresar al menos un valor a cambiar.

### FA5 - Valores no numéricos

- A: Si los valores ingresados contienen caracteres no numéricos, el sistema muestra un error de formato y no permite el envío.

## Postcondiciones

- A: Cambio exitoso: el costo y/o precio de venta del producto quedan actualizados.
- A: Cambio no aplicado: el producto mantiene sus valores anteriores.
- A: El historial de cambios queda registrado para auditoría.

## Reglas de negocio

- A: El costo y precio de venta deben ser valores numéricos positivos.
- A: El precio de venta debe ser mayor que el costo (margen positivo), salvo autorización especial.
- A: Toda actualización debe generar un registro en el historial de cambios de precio.
- A: Los cambios de precio aplican inmediatamente a nuevas ventas.
- A: No se permiten cambios retroactivos en facturas ya emitidas.

## Reglas de seguridad

- A: Solo usuarios con rol administrador o encargado de inventario pueden actualizar costos y precios.
- A: El sistema registra el usuario responsable, fecha, hora, valores anteriores y nuevos valores de cada cambio.
- A: Si el margen se vuelve negativo, se requiere confirmación explícita del usuario.
- A: Las variaciones significativas (>50%) requieren justificación y generan notificación interna.

## Criterios de aceptación

- A: Un usuario con permisos puede actualizar el costo de un producto activo.
- A: Un usuario con permisos puede actualizar el precio de venta de un producto activo.
- A: El sistema muestra el margen actual y nuevo margen antes de confirmar.
- A: El sistema impide guardar valores no numéricos o negativos.
- A: El sistema registra cada cambio en el historial con trazabilidad completa.
- A: Las facturas existentes no se ven afectadas por cambios de precio posteriores.