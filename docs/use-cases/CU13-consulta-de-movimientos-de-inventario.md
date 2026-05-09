# CU13 - Consulta de movimientos de inventario

## Objetivo

Revisar el historial completo de entradas, ajustes y salidas de productos para mantener trazabilidad y control del inventario.

## Actores

- A: Encargado de inventario
- A: Administrador
- A: Propietario/Gerente
- A: Sistema de auditoría

## Precondiciones

- A: El actor está autenticado en el sistema.
- A: El actor tiene permisos para consultar movimientos de inventario.

## Disparador

El actor selecciona la opción "Movimientos de inventario" o "Historial de inventario" desde el menú de inventario.

## Flujo principal

1. El actor accede a la vista de movimientos de inventario.
2. El sistema muestra la tabla con columnas: fecha y hora, tipo de movimiento (entrada, ajuste positivo, ajuste negativo, salida), producto, cantidad, documento de referencia, usuario responsable.
3. El actor puede filtrar por tipo de movimiento, rango de fechas, producto o usuario.
4. El actor puede ordenar por fecha, producto o cantidad.
5. El sistema presenta los resultados paginados (20 por página).

## Flujos alternos

### FA1 - Sin resultados

- A: Si la búsqueda no produce resultados, el sistema muestra un mensaje indicando que no se encontraron movimientos.

### FA2 - Detalle de movimiento

- A: El actor puede seleccionar un movimiento específico para ver el detalle completo, incluyendo valores anteriores y nuevos del stock.

### FA3 - Exportación

- A: El actor puede exportar la consulta a formato Excel o PDF para reportes externos.

### FA4 - Movimiento de ajuste

- A: Si el movimiento es un ajuste, el sistema muestra el motivo del ajuste y las cantidades antes y después.

## Postcondiciones

- A: La consulta muestra información del período seleccionado.
- A: Los datos son de solo lectura.

## Reglas de negocio

- A: Los movimientos se registran cronológicamente con todos los datos de trazabilidad.
- A: Solo se muestran movimientos de productos activos, salvo que el filtro incluya inactivos.
- A: Los movimientos incluyen: entrada, ajuste positivo, ajuste negativo, salida por venta, salida por ajuste.

## Reglas de seguridad

- A: Todos los roles autenticados pueden consultar movimientos de inventario.
- A: Los datos de costo son visibles solo para administrador y encargado de inventario.
- A: Todas las consultas quedan registradas para auditoría.

## Criterios de aceptación

- A: El sistema muestra todos los movimientos con su información completa.
- A: La consulta es filtrable por tipo, fecha, producto y usuario.
- A: Los movimientos de ajuste muestran el motivo y los valores antes/después.
- A: La consulta es paginada y exportable.

## Implementación técnica

> **Dependencias:** CU10 (modelo `InventoryMovement`), CU12 (ajustes)  
> **Orden sugerido de desarrollo:** #14

### Base de datos

- [ ] Verificar que el modelo `InventoryMovement` (creado en CU10) contiene: `id`, `productId`, `movementType`, `quantity`, `previousStock`, `newStock`, `referenceId?`, `referenceType?`, `createdBy`, `createdAt`
- [ ] Agregar relación `InventoryMovement` → `Product` y `InventoryMovement` → `User` para joins en consulta

### API (NestJS)

- [ ] `GET /inventory/movements` — listar movimientos paginado; filtros: `movementType`, rango de fechas (`startDate`, `endDate`), `productId`, `createdBy`; guard: todos los roles autenticados
- [ ] Incluir en respuesta: fecha/hora, tipo, producto (nombre + código), cantidad, documento de referencia, usuario responsable, stock anterior, stock nuevo
- [ ] Ocultar campos de costo en respuesta para rol `SELLER`
- [ ] Soporte de ordenamiento por fecha, producto o cantidad
- [ ] `GET /inventory/movements/:id` — detalle de un movimiento (incluir motivo si es ajuste)

### Frontend (React)

- [ ] Crear página `/inventory/movements` protegida para todos los roles autenticados
- [ ] Tabla paginada con columnas: fecha/hora, tipo, producto, cantidad, documento de referencia, usuario
- [ ] Chips de tipo de movimiento: entrada (verde), ajuste positivo (azul), ajuste negativo (naranja), salida (rojo)
- [ ] Filtros por tipo de movimiento, rango de fechas, producto y usuario
- [ ] Click en fila para ver detalle (modal o página): incluir motivo del ajuste y valores antes/después
- [ ] Integrar con TanStack Query (`useQuery`)
