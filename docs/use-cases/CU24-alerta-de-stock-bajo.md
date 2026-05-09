# CU24 - Alerta de stock bajo

## Objetivo

Identificar y notificar automáticamente los productos cuya existencia ha caído por debajo del nivel mínimo configurado, permitiendo gestionar reabastecimiento.

## Actores

- A: Encargado de inventario
- A: Administrador
- A: Sistema de alertas

## Precondiciones

- A: Los productos tienen configurado un stock mínimo (referencia CU07).
- A: El actor tiene permisos para ver alertas.

## Disparador

El sistema verifica el stock de todos los productos:
- A: Al registrar cada movimiento de inventario (entrada o salida).
- A: Diariamente a una hora configurada.
- A: El actor accede manualmente a la vista de alertas.

## Flujo principal

1. El sistema compara el stock actual con el stock mínimo de cada producto.
2. Los productos con stock actual menor al stock mínimo se incluyen en la lista de alerta.
3. El sistema notifica a los usuarios con rol encargado de inventario y administrador.
4. La alerta incluye: producto, stock actual, stock mínimo, déficit calculado, última fecha de movimiento.
5. El actor puede filtrar las alertas por categoría o producto.
6. El actor puede marcar una alerta como "atendida" o "ignorada" con备注.

## Flujos alternos

### FA1 - Producto agotado

- A: Si el stock actual es cero, la alerta se marca como "crítica" con prioridad alta.

### FA2 - Alerta ya atendida

- A: Si el actor marca la alerta como atendida, esta ya no aparece en la lista principal.

### FA3 - Reabastecimiento registrado

- A: Cuando se registra una entrada de inventario (CU10) que supera el stock mínimo, la alerta se cierra automáticamente.

### FA4 - Sin alertas

- A: Si no hay productos con stock bajo, el sistema muestra un mensaje indicando que no hay alertas activas.

## Postcondiciones

- A: Las alertas activas permanecen until que el stock supere el mínimo o el actor las marque como atendidas.
- A: Las alertas críticas requieren atención inmediata.

## Reglas de negocio

- A: Un producto genera alerta cuando: stock actual < stock mínimo.
- A: Las alertas pueden marcarse como atendidas o ignoradas con备注.
- A: Las alertas se generan automáticamente ante movimientos de inventario.
- A: El stock mínimo es configurable por producto.

## Reglas de seguridad

- A: Las notificaciones de alerta se envían a usuarios con rol encargado de inventario y administrador.
- A: Las alertas pueden ser vistas por cualquier usuario autenticado.

## Criterios de aceptación

- A: El sistema identifica automáticamente productos con stock bajo.
- A: Los productos agotados se marcan como alerta crítica.
- A: Las alertas son notificables a los responsables.
- A: El actor puede marcar alertas como atendidas o ignoradas.
- A: Las alertas se cierran automáticamente cuando el stock supera el mínimo.

## Implementación técnica

> **Dependencias:** CU07 (campo `minStock` en `Product`), CU11 (stock actual), CU10 y CU12 (movimientos que disparan verificación)  
> **Orden sugerido de desarrollo:** #24

### Base de datos

- [ ] Crear enum `AlertStatus` (`ACTIVE`, `ATTENDED`, `IGNORED`, `RESOLVED`); registrar en `schema.prisma`
- [ ] Crear modelo Prisma `StockAlert` con campos: `id`, `productId`, `stockAtAlert` (Int), `minStock` (Int), `deficit` (Int, calculado), `severity` (`CRITICAL` si stock=0, `LOW` si 0 < stock < minStock), `status` (AlertStatus, default ACTIVE), `notes?`, `resolvedAt?`, `createdAt`, `updatedAt`; con `@@map("stock_alerts")`
- [ ] Relaciones: `StockAlert` → `Product`
- [ ] Crear migración de base de datos

### API (NestJS)

- [ ] Implementar método de servicio `checkAndCreateStockAlerts(productIds: string[])` que compare `currentStock` vs `minStock` y cree o resuelva alertas según corresponda
- [ ] Llamar `checkAndCreateStockAlerts` desde `InventoryService` al finalizar cada entrada (CU10), ajuste (CU12) y salida por venta (CU15)
- [ ] `GET /stock-alerts` — listar alertas activas con filtros: `severity` (CRITICAL | LOW), `categoryId`, `productId`; guard: todos los roles autenticados
- [ ] `PATCH /stock-alerts/:id/attend` — marcar alerta como `ATTENDED` con `notes`; guard `ADMIN | INVENTORY_MANAGER`
- [ ] `PATCH /stock-alerts/:id/ignore` — marcar como `IGNORED` con `notes`; guard `ADMIN | INVENTORY_MANAGER`
- [ ] Resolver (`RESOLVED`) alertas automáticamente cuando `currentStock >= minStock` en `checkAndCreateStockAlerts`

### Frontend (React)

- [ ] Crear página `/inventory/alerts` accesible para todos los roles autenticados
- [ ] Tabla con columnas: producto, stock actual, stock mínimo, déficit, severidad, última actualización
- [ ] Badge rojo "CRÍTICA" para stock = 0; badge naranja "BAJO" para stock < mínimo
- [ ] Filtros por severidad y categoría
- [ ] Acciones por alerta: "Marcar como atendida" (con campo de nota) y "Ignorar"
- [ ] Indicador numérico de alertas activas en el menú de navegación (badge rojo)
- [ ] Integrar con TanStack Query con `refetchInterval` para actualización periódica
