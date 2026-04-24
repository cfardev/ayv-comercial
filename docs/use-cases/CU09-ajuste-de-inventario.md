# CU09 - Ajuste de inventario

## Objetivo

Corregir diferencias entre el inventario físico y el inventario registrado en el sistema, registrando el motivo del ajuste para mantener trazabilidad.

## Actores

- A: Encargado de inventario
- A: Administrador
- A: Sistema de inventario

## Precondiciones

- A: El actor está autenticado en el sistema.
- A: El actor tiene permisos para realizar ajustes de inventario.
- A: Los productos a ajustar existen en el catálogo.

## Disparador

El actor selecciona la opción "Ajuste de inventario" desde el módulo de inventario.

## Flujo principal

1. El actor accede al formulario de ajuste.
2. El sistema presenta los campos: tipo de ajuste (positivo, negativo), motivo del ajuste, fecha del ajuste, observaciones.
3. El actor selecciona el tipo de ajuste e ingresa el motivo.
4. El actor selecciona los productos a ajustar.
5. Para cada producto, el sistema presenta: selector de producto, stock actual, cantidad del ajuste (positiva o negativa), stock resultante (calculado).
6. El actor ingresa las cantidades de ajuste.
7. El sistema valida que el stock resultante no sea negativo para ajustes negativos.
8. El actor confirma el ajuste.
9. El sistema crea el registro de ajuste y actualiza el stock de cada producto.
10. El sistema muestra un mensaje de confirmación con el número de ajuste generado.

## Flujos alternos

### FA1 - Stock negativo resultante

- A: Si al aplicar un ajuste negativo el stock resultante sería menor a cero, el sistema muestra un error indicando que no es posible; el usuario debe hacer un ajuste positivo o corregir la cantidad.

### FA2 - Sin motivo de ajuste

- A: Si el actor intenta guardar sin ingresar el motivo del ajuste, el sistema muestra un error indicando que el motivo es obligatorio.

### FA3 - Cantidad de ajuste cero

- A: Si la cantidad de ajuste es cero, el sistema muestra un error indicando que debe ingresar una cantidad diferente a cero.

### FA4 - Producto no existe

- A: Si se intenta agregar un producto que no existe, el sistema muestra un mensaje de error.

### FA5 - Ajuste sin productos

- A: Si el actor intenta guardar un ajuste sin productos, el sistema muestra un error indicando que debe agregar al menos un producto.

## Postcondiciones

- A: Ajuste exitoso: el stock de los productos queda corregido con las cantidades registradas.
- A: Ajuste fallido: no se modifica el stock de ningún producto.
- A: El registro de ajuste queda disponible para consulta en el historial de movimientos de inventario.

## Reglas de negocio

- A: Toda ajuste debe tener al menos un producto con cantidad diferente a cero.
- A: El motivo del ajuste es obligatorio y debe ser seleccionado de una lista predefinida o ingresado como texto.
- A: El stock resultante no puede ser negativo.
- A: Cada ajuste genera un movimiento de inventario con tipo "AJUSTE".
- A: Los ajustes quedan registrados con trazabilidad completa (usuario, fecha, hora, valores anteriores y nuevos).

## Reglas de seguridad

- A: Solo usuarios con rol administrador o encargado de inventario pueden realizar ajustes.
- A: El sistema registra el usuario responsable, fecha, hora, productos ajustados y valores antes/después.
- A: Los ajustes significativos (que cambien el stock en más de un 20%) requieren justificación adicional.
- A: Todas las operaciones de ajuste quedan registradas para auditoría.

## Criterios de aceptación

- A: Un usuario con permisos puede registrar un ajuste de inventario con productos válidos.
- A: El stock de los productos se actualiza correctamente tras la confirmación.
- A: El sistema impide que el stock resultante sea negativo.
- A: El sistema requiere un motivo para cada ajuste.
- A: El sistema genera un registro en el historial de movimientos de inventario.
- A: Los ajustes quedan vinculados al usuario que los realiza.