# CU06 - Gestión de proveedores

## Objetivo

Registrar, consultar, editar, desactivar y reactivar proveedores para gestionar las fuentes de abastecimiento de productos de la distribuidora de electrodomésticos y artículos para el hogar.

## Actores

- A: Administrador
- A: Encargado de inventario
- A: Sistema de proveedores

## Precondiciones

- A: El actor está autenticado en el sistema.
- A: El actor tiene permisos para gestionar proveedores.

## Disparador

El actor selecciona la opción "Gestión de proveedores" desde el menú de compras, inventario o administración.

## Flujo principal

### Registro de proveedor

1. El actor accede al formulario de nuevo proveedor.
2. El sistema presenta los campos: razón social o nombre comercial, documento fiscal (RIF o equivalente), persona de contacto, teléfono, correo electrónico, dirección, condiciones comerciales (opcional), estado.
3. El actor completa los campos obligatorios.
4. El sistema valida que no exista otro proveedor activo con el mismo documento fiscal.
5. El sistema crea el proveedor con estado activo y fecha de creación.
6. El sistema muestra un mensaje de confirmación y actualiza la lista de proveedores.

### Consulta de proveedores

1. El actor accede a la lista de proveedores.
2. El sistema muestra una tabla con columnas: razón social, documento fiscal, contacto, teléfono, correo, estado.
3. El actor puede buscar por razón social, documento fiscal o persona de contacto.
4. El actor puede filtrar por estado (activo/inactivo); por defecto se muestran solo los activos.
5. El sistema presenta los resultados paginados.

### Edición de proveedor

1. El actor selecciona un proveedor de la lista y elige "Editar".
2. El sistema presenta el formulario con los datos actuales.
3. El actor modifica los campos permitidos.
4. El sistema valida los datos modificados.
5. El sistema actualiza el registro.
6. El sistema muestra un mensaje de confirmación.

### Desactivación de proveedor

1. El actor selecciona un proveedor activo y elige "Desactivar".
2. El sistema verifica si el proveedor tiene órdenes de compra abiertas o pendientes.
3. Si existen órdenes abiertas o pendientes, el sistema rechaza la desactivación e informa la situación.
4. Si no existen órdenes abiertas o pendientes, el sistema solicita confirmación.
5. El actor confirma la desactivación.
6. El sistema cambia el estado del proveedor a inactivo.

### Reactivación de proveedor

1. El actor selecciona un proveedor inactivo y elige "Activar".
2. El sistema cambia el estado a activo.
3. El sistema muestra un mensaje de confirmación.

## Flujos alternos

### FA1 - Documento fiscal duplicado

- A: Si el documento fiscal ya existe, el sistema muestra un error indicando el duplicado.

### FA2 - Datos obligatorios incompletos

- A: Si faltan datos obligatorios, el sistema muestra validaciones y no registra el proveedor.

### FA3 - Proveedor con operaciones abiertas

- A: Si se intenta desactivar un proveedor con órdenes de compra abiertas o pendientes, el sistema rechaza la operación.

## Postcondiciones

- A: Registro exitoso: el proveedor queda disponible para ser seleccionado en órdenes de compra (referencia CU09).
- A: Edición exitosa: los cambios quedan aplicados al proveedor.
- A: Desactivación exitosa: el proveedor no puede seleccionarse en nuevas órdenes de compra (referencia CU09).
- A: Reactivación exitosa: el proveedor vuelve a estar disponible para nuevas compras.
- A: En cualquier caso fallido, no se modifica el estado del proveedor.

## Reglas de negocio

- A: No puede haber dos proveedores con el mismo documento fiscal.
- A: Un proveedor inactivo no puede utilizarse en nuevas órdenes de compra (referencia CU09).
- A: Un producto no queda ligado a un proveedor único; la relación entre productos y proveedores se materializa en las órdenes de compra (CU09) y/o entradas de inventario (CU10).
- A: Un proveedor puede abastecer múltiples productos y un mismo producto puede ser adquirido a múltiples proveedores.

## Reglas de seguridad

- A: Solo usuarios con rol administrador o encargado de inventario pueden crear, editar o desactivar proveedores.
- A: Todas las operaciones de gestión de proveedores quedan registradas con usuario responsable, fecha y hora.
- A: Los campos de texto y contacto deben validarse y sanitizarse.

## Criterios de aceptación

- A: Un usuario con permisos puede registrar un proveedor con datos válidos.
- A: El sistema impide registrar proveedores con documento fiscal duplicado.
- A: Un usuario con permisos puede editar un proveedor existente.
- A: Un usuario con permisos puede desactivar un proveedor sin operaciones abiertas.
- A: Un proveedor inactivo no aparece como opción para nuevas órdenes de compra.

## Implementación técnica

> **Dependencias:** CU01 (autenticación y guards de roles)  
> **Orden sugerido de desarrollo:** #6

### Base de datos

- [x] Crear modelo Prisma `Supplier` con campos: `id`, `companyName`, `taxId` (único), `contactPerson`, `phone`, `email?`, `address?`, `commercialTerms?`, `isActive`, `createdAt`, `updatedAt`; con `@@map("suppliers")`
- [x] Agregar índice único en `taxId`
- [x] Agregar relación `Supplier` → `PurchaseOrder[]` (se completa al crear CU09 — diferida por diseño)
- [x] Crear migración de base de datos

### API (NestJS)

- [x] Crear `SuppliersModule` con `SuppliersService` y `SuppliersController`
- [x] `POST /suppliers` — crear proveedor; validar unicidad de `taxId`; guard `ADMIN | INVENTORY_MANAGER`
- [x] `GET /suppliers` — listar paginado; filtros: `search` (razón social, taxId, contacto), `isActive`; activos por defecto
- [x] `GET /suppliers/:id` — obtener proveedor por id
- [x] `PATCH /suppliers/:id` — editar; guard `ADMIN | INVENTORY_MANAGER`
- [x] `PATCH /suppliers/:id/deactivate` — verificar que no tenga órdenes de compra abiertas o pendientes; rechazar con 409 si tiene; guard `ADMIN | INVENTORY_MANAGER`
- [x] `PATCH /suppliers/:id/activate` — reactivar; guard `ADMIN | INVENTORY_MANAGER`
- [x] `DTO CreateSupplierDto` con validaciones de campos requeridos y formato de email
- [x] Registrar operaciones con usuario responsable y timestamp

### Frontend (React)

- [x] Crear página `/suppliers` protegida para roles `ADMIN` y `INVENTORY_MANAGER`
- [x] Tabla paginada con columnas: razón social, documento fiscal, contacto, teléfono, correo, estado
- [x] Buscador por razón social, documento fiscal o contacto (debounce)
- [x] Filtro por estado; activo por defecto
- [x] Botón "Nuevo proveedor" → formulario con todos los campos (razón social, taxId, contacto, teléfono, correo, dirección, condiciones comerciales)
- [x] Validación Zod en formulario: campos requeridos, formato de email, unicidad de taxId (feedback desde API)
- [x] Botón "Editar" → formulario pre-poblado
- [x] Botón "Desactivar" con confirmación; mostrar error si tiene órdenes abiertas
- [x] Botón "Activar" para proveedores inactivos
- [x] Integrar con TanStack Query; invalidar caché tras mutaciones
