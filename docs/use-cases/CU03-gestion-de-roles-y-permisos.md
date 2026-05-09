# CU03 - Roles y permisos (modelo estático)

Este caso de uso **no aplica** como pantalla ni flujo de administración dinámica.

## Comportamiento del sistema

- Los roles son un conjunto **fijo** definido en el enum Prisma `UserRole` (`apps/api/prisma/schema.prisma`): `ADMIN`, `SELLER`, `INVENTORY_MANAGER`, `DISPATCH_MANAGER`, `OWNER_MANAGER`.
- La relación entre cada rol y los permisos de API es **estática** en código (`apps/api/src/auth/permissions/role-permissions.map.ts`), no en base de datos.
- Un administrador **asigna** uno de esos roles al crear o editar un usuario (CU02); no puede crear roles nuevos ni alterar el catálogo de permisos desde la aplicación.

## Nota de alcance

La documentación histórica que describía CRUD de roles, desactivación de roles con usuarios asociados, auditoría de cambios de rol en tablas dedicadas, etc., quedó **obsoleta** con este modelo.

## Implementación técnica

> **Dependencias:** CU01 (modelo `User` con campo `role`)  
> **Orden sugerido de desarrollo:** #3 (implementar junto con CU01/CU02)

### Base de datos

- [x] Confirmar que el enum `UserRole` existe en `schema.prisma` con los valores: `ADMIN`, `SELLER`, `INVENTORY_MANAGER`, `DISPATCH_MANAGER`, `OWNER_MANAGER`
- [x] Verificar que el campo `role UserRole` está presente en el modelo `User`
- [x] No crear tablas dinámicas de roles; el control es estático en código

### API (NestJS)

- [x] Crear archivo `src/auth/permissions/role-permissions.map.ts` que exporte un mapa `Record<UserRole, string[]>` con los permisos o recursos que puede acceder cada rol
- [x] Crear decorador `@Roles(...roles: UserRole[])` en `src/auth/decorators/roles.decorator.ts` (implementado como `@RequirePermissions` en `require-permissions.decorator.ts`)
- [x] Implementar `RolesGuard` en `src/auth/guards/roles.guard.ts` (implementado como `PermissionsGuard` en `permissions.guard.ts`)
- [x] Registrar `RolesGuard` como guard global o aplicarlo por módulo según convenga al proyecto (`JwtAuthGuard` global + `PermissionsGuard` por ruta)
- [x] Crear endpoint `GET /auth/roles` que retorne el listado de roles disponibles y sus etiquetas para uso en formularios del frontend

### Frontend (React)

- [x] Crear hook `useCurrentUser()` que exponga el rol del usuario autenticado desde el contexto de autenticación (implementado como `useAuth().user` en `auth-context.tsx`)
- [x] Crear utilidad `hasRole(role: UserRole)` para condicionar visibilidad de elementos de UI (implementado como `hasPermission` + `hasPermissionOrSystemAdmin` en `permission-keys.ts`)
- [x] Crear componente `<RoleGate roles={[...]}>` que renderice hijos solo si el usuario tiene el rol requerido (implementado como checks inline con `hasPermissionOrSystemAdmin` en cada página)
- [x] Asegurar que las rutas protegidas redirijan con mensaje claro si el rol no tiene acceso
