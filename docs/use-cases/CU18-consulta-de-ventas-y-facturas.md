# CU18 - Consulta de ventas y facturas

## Objetivo

Buscar y revisar las ventas y facturas registradas en el sistema para consulta y seguimiento.

## Actores

- A: Vendedor
- A: Administrador
- A: Propietario/Gerente
- A: Sistema de reportes

## Precondiciones

- A: El actor está autenticado en el sistema.
- A: El actor tiene permisos para consultar ventas y facturas.

## Disparador

El actor selecciona la opción "Consulta de ventas" o "Consulta de facturas" desde el menú de ventas o reportes.

## Flujo principal

1. El actor accede a la vista de consulta de ventas y facturas.
2. El sistema muestra la tabla con columnas: número de venta, fecha, cliente, vendedor, estado (pendiente/facturada/anulada), número de factura (si existe), total.
3. El actor puede buscar por número de venta, número de factura, nombre del cliente o vendedor.
4. El actor puede filtrar por estado, rango de fechas, vendedor.
5. El actor puede ordenar por cualquier columna.
6. El sistema presenta los resultados paginados (20 por página).

## Flujos alternos

### FA1 - Ver detalle de venta

- A: El actor puede seleccionar una venta para ver el detalle completo: productos, cantidades, precios, descuentos, impuestos, totales.

### FA2 - Ver factura asociada

- A: Si la venta tiene una factura asociada, el actor puede ver el detalle de la factura.

### FA3 - Sin resultados

- A: Si la búsqueda no produce resultados, el sistema muestra un mensaje indicando que no se encontraron ventas.

### FA4 - Exportación

- A: El actor puede exportar la consulta a formato Excel o PDF.

## Postcondiciones

- A: La consulta muestra información del período seleccionado.
- A: Los datos son de solo lectura.

## Reglas de negocio

- A: Las ventas anuladas se muestran con estado "anulada" pero no se eliminan del historial.
- A: Las facturas anuladas se muestran con estado "anulada" y su referencia cruzada.
- A: Los filtros combinados muestran solo las ventas que cumplan todos los criterios.

## Reglas de seguridad

- A: Todos los roles autenticados pueden consultar ventas y facturas.
- A: Los vendedores solo ven sus propias ventas.

## Implementación técnica

> **Dependencias:** CU15 (ventas), CU17 (facturas)  
> **Orden sugerido de desarrollo:** #18

### Base de datos

- [ ] No requiere modelos adicionales; usar `Sale` e `Invoice` con sus relaciones

### API (NestJS)

- [ ] `GET /sales` (ampliar endpoint de CU15) — incluir en respuesta: `invoiceNumber` (de la factura asociada si existe), todos los filtros requeridos
- [ ] Filtros: `search` (saleNumber, invoiceNumber, cliente, vendedor), `status` (PENDING_INVOICE | INVOICED | CANCELLED), rango de fechas, `sellerId`
- [ ] Aplicar scoping automático: si el usuario tiene rol `SELLER`, forzar filtro `sellerId = currentUser.id`
- [ ] `GET /sales/:id` — detalle completo con items de venta, datos de cliente, factura asociada (si existe), descuentos e impuestos
- [ ] Ocultar campos de costo y margen para rol `SELLER`

### Frontend (React)

- [ ] Crear página `/sales` para listado de ventas y facturas; accesible para todos los roles autenticados
- [ ] Tabla paginada con columnas: número de venta, fecha, cliente, vendedor, estado, número de factura, total
- [ ] Chips de estado: pendiente (amarillo), facturada (verde), anulada (rojo)
- [ ] Buscador por número de venta, factura o cliente; filtros por estado, rango de fechas, vendedor (solo visible para `ADMIN | OWNER_MANAGER`)
- [ ] Click en fila → panel lateral o modal con detalle completo de venta (productos, cantidades, precios, descuentos, impuesto, total)
- [ ] Si tiene factura: botón "Ver factura" que navega al detalle de factura o abre vista de impresión
- [ ] Integrar con TanStack Query (`useQuery`) con soporte de paginación y filtros como query params

- A: El sistema muestra todas las ventas con su información de estado.
- A: La consulta es filtrable por estado, fecha, vendedor y cliente.
- A: Los detalles de venta y factura son consultables.
- A: La consulta es paginada y exportable.
- A: Los vendedores solo ven sus propias ventas.
