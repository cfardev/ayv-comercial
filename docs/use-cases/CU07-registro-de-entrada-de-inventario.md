# CU07 - Registro de entrada de inventario

## Objetivo

Registrar el ingreso de nuevas existencias al inventario, ya sea stock inicial, compras a proveedores o devoluciones de clientes.

## Actores

- A: Encargado de inventario
- A: Administrador
- A: Sistema de inventario

## Precondiciones

- A: El actor está autenticado en el sistema.
- A: El actor tiene permisos para registrar entradas de inventario.
- A: Los productos a ingresar existen en el catálogo (referencia CU05).

## Disparador

El actor selecciona la opción "Registrar entrada" desde el módulo de inventario.

## Flujo principal

1. El actor accede al formulario de nueva entrada de inventario.
2. El sistema presenta los campos: tipo de entrada (compra, devolución, ajuste inicial), número de documento de referencia, proveedor (opcional), fecha de entrada, observaciones.
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
- A: El stock se incrementa inmediatamente tras la confirmación.
- A: Cada entrada genera un movimiento de inventario con tipo "ENTRADA".
- A: Las entradas pueden estar asociadas a una orden de compra o ser independientes.

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