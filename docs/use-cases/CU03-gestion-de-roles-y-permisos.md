# CU03 - Roles y permisos (modelo estático)

Este caso de uso **no aplica** como pantalla ni flujo de administración dinámica.

## Comportamiento del sistema

- Los roles son un conjunto **fijo** definido en el enum Prisma `UserRole` (`apps/api/prisma/schema.prisma`): `ADMIN`, `SELLER`, `INVENTORY_MANAGER`, `DISPATCH_MANAGER`, `OWNER_MANAGER`.
- La relación entre cada rol y los permisos de API es **estática** en código (`apps/api/src/auth/permissions/role-permissions.map.ts`), no en base de datos.
- Un administrador **asigna** uno de esos roles al crear o editar un usuario (CU02); no puede crear roles nuevos ni alterar el catálogo de permisos desde la aplicación.

## Nota de alcance

La documentación histórica que describía CRUD de roles, desactivación de roles con usuarios asociados, auditoría de cambios de rol en tablas dedicadas, etc., quedó **obsoleta** con este modelo.
