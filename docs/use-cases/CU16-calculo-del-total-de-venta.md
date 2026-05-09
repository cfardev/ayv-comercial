# CU16 - Cálculo del total de venta

## Objetivo

Calcular el subtotal y total de la venta en tiempo real a partir de los productos seleccionados, incluyendo impuestos y descuentos aplicables.

## Actores

- A: Sistema de ventas
- A: Vendedor

## Precondiciones

- A: Existe una venta en proceso de registro (referencia CU15).
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

## Implementación técnica

> **Dependencias:** CU15 (modelo `Sale` y `SaleItem`)  
> **Orden sugerido de desarrollo:** #16 (implementar como parte de CU15)

### Base de datos

- [ ] Los campos `subtotal`, `discountAmount`, `taxAmount` y `total` del modelo `Sale` (creado en CU15) almacenan el resultado del cálculo
- [ ] El campo `discount` y `subtotal` en `SaleItem` almacenan el desglose por línea

### API (NestJS)

- [ ] Implementar método de servicio `calculateSaleTotals(items: SaleItemInput[]): SaleTotals` en `SalesService` que calcule:
  - [ ] Subtotal por item: `quantity × appliedPrice`
  - [ ] Descuento por item (si aplica): porcentual o fijo
  - [ ] Subtotal general: suma de subtotales por item menos descuentos
  - [ ] Impuesto (IVA o configurado): `subtotal × taxRate` (variable de entorno `TAX_RATE`)
  - [ ] Total final: `subtotal - discountAmount + taxAmount`
  - [ ] Redondeo a 2 decimales en cada valor
- [ ] Crear endpoint `POST /sales/calculate` (no persiste) para preview del total desde el frontend antes de confirmar
- [ ] Asegurar que el cálculo final se realiza en el servidor al confirmar la venta (no confiar en el cliente)

### Frontend (React)

- [ ] Hook `useSaleTotals(items)` que llame a `POST /sales/calculate` con debounce cada vez que cambia la lista de items
- [ ] Panel de desglose visible en el formulario de venta: subtotal, descuento total, impuesto, **total**
- [ ] Actualizar panel en tiempo real al agregar, eliminar o modificar items o cantidades
- [ ] Mostrar cada subtotal por línea de item en la tabla de productos
