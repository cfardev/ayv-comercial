# CU13 - Cálculo del total de venta

## Objetivo

Calcular el subtotal y total de la venta en tiempo real a partir de los productos seleccionados, incluyendo impuestos y descuentos aplicables.

## Actores

- A: Sistema de ventas
- A: Vendedor

## Precondiciones

- A: Existe una venta en proceso de registro (referencia CU12).
- A: Los productos agregados a la venta tienen precios válidos.

## Disparador

El sistema calcula automáticamente el total cada vez que se agrega, modifica o elimina un producto de la venta, o cuando se modifica algún valor.

## Flujo principal

1. El sistema identifica los productos agregados a la venta.
2. Para cada producto, el sistema obtiene: cantidad, precio unitario.
3. El sistema calcula el subtotal por producto (cantidad × precio unitario).
4. El sistema calcula el subtotal general (suma de subtotales por producto).
5. El sistema aplica los descuentos configurados (por producto o por venta total).
6. El sistema calcula el impuesto aplicable (IVA u otro según configuración).
7. El sistema calcula el total final (subtotal - descuentos + impuestos).
8. El sistema presenta el desglose: subtotal, descuentos, impuesto, total.

## Flujos alternos

### FA1 - Descuento por cantidad

- A: Si la cantidad de un producto supera el umbral configurado, el sistema aplica automáticamente el descuento por cantidad.

### FA2 - Descuento por cliente preferencial

- A: Si el cliente tiene categoría de cliente preferencial, el sistema aplica el descuento configurado para esa categoría.

### FA3 - Producto con promoción activa

- A: Si un producto tiene una promoción vigente, el sistema aplica el precio promocional en lugar del precio regular.

### FA4 - Error en cálculo

- A: Si ocurre un error en el cálculo, el sistema muestra un mensaje de error y no permite continuar con la venta.

## Postcondiciones

- A: El total calculado queda asociado a la venta en proceso.
- A: Los precios y totales son de solo lectura hasta que se confirme la venta.

## Reglas de negocio

- A: El impuesto se calcula sobre el subtotal menos los descuentos.
- A: Los descuentos pueden ser porcentuales o fijos.
- A: Los descuentos por cantidad tienen prioridad sobre los descuentos generales.
- A: Los precios promocionales tienen prioridad sobre los precios regulares.
- A: El redondeo se realiza a dos decimales para la presentación.

## Reglas de seguridad

- A: Los cálculos se realizan en el servidor para garantizar integridad.
- A: Los precios no pueden ser modificados directamente por el cliente.
- A: Los descuentos requieren permisos específicos del vendedor.

## Criterios de aceptación

- A: El sistema calcula correctamente el subtotal por producto.
- A: El sistema aplica los descuentos configurados en el orden correcto de prioridad.
- A: El sistema calcula correctamente el impuesto sobre la base imponible.
- A: El sistema muestra el desglose completo del cálculo.
- A: El total calculado coincide con la suma de los componentes.