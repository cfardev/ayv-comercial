# Roadmap de desarrollo — ayv-comercial

Orden de implementación sugerido basado en dependencias entre casos de uso.  
Completar los CU en orden numérico de la columna **#** evita implementar un CU sin que sus precondiciones técnicas existan.

## Cómo usar este documento

1. El desarrollador revisa la tabla y toma el siguiente CU con estado `⬜ Pendiente` cuyas dependencias estén `✅ Completo`.
2. Cambia el estado a `🔄 En progreso` mientras trabaja.
3. Al finalizar **todos** los checkboxes de `## Implementación técnica` del archivo CU, cambia el estado a `✅ Completo`.

> **Regla:** solo un CU debería estar en estado `🔄 En progreso` por desarrollador a la vez.

---

## Tabla de CUs

| # | CU | Descripción | Dependencias | Estado |
|---|----|-------------|--------------|--------|
| 1 | [CU01](./use-cases/CU01-inicio-de-sesion.md) | Inicio de sesión | — | ✅ Completo |
| 2 | [CU02](./use-cases/CU02-gestion-de-usuarios.md) | Gestión de usuarios | CU01 | ✅ Completo |
| 3 | [CU03](./use-cases/CU03-gestion-de-roles-y-permisos.md) | Roles y permisos (estático) | CU01 | ✅ Completo |
| 4 | [CU04](./use-cases/CU04-gestion-de-categorias.md) | Gestión de categorías | CU01 | ✅ Completo |
| 5 | [CU05](./use-cases/CU05-gestion-de-marcas.md) | Gestión de marcas | CU01 | ✅ Completo |
| 6 | [CU06](./use-cases/CU06-gestion-de-proveedores.md) | Gestión de proveedores | CU01 | ✅ Completo |
| 7 | [CU07](./use-cases/CU07-gestion-de-productos.md) | Gestión de productos | CU04, CU05 | ✅ Completo |
| 8 | [CU08](./use-cases/CU08-actualizacion-de-costo-y-precio-de-producto.md) | Actualización de costo y precio | CU07 | ⬜ Pendiente |
| 9 | [CU14](./use-cases/CU14-gestion-de-clientes.md) | Gestión de clientes | CU01 | ⬜ Pendiente |
| 10 | [CU09](./use-cases/CU09-gestion-de-ordenes-de-compra.md) | Gestión de órdenes de compra | CU06, CU07 | ⬜ Pendiente |
| 11 | [CU10](./use-cases/CU10-registro-de-entrada-de-inventario.md) | Registro de entrada de inventario | CU07, CU06, CU09 | ⬜ Pendiente |
| 12 | [CU11](./use-cases/CU11-consulta-de-existencias.md) | Consulta de existencias | CU07, CU10 | ⬜ Pendiente |
| 13 | [CU12](./use-cases/CU12-ajuste-de-inventario.md) | Ajuste de inventario | CU07, CU10 | ⬜ Pendiente |
| 14 | [CU13](./use-cases/CU13-consulta-de-movimientos-de-inventario.md) | Consulta de movimientos | CU10, CU12 | ⬜ Pendiente |
| 15 | [CU15](./use-cases/CU15-registro-de-venta.md) | Registro de venta | CU07, CU11, CU14 | ⬜ Pendiente |
| 16 | [CU16](./use-cases/CU16-calculo-del-total-de-venta.md) | Cálculo del total de venta | CU15 | ⬜ Pendiente |
| 17 | [CU17](./use-cases/CU17-generacion-de-factura.md) | Generación de factura | CU15, CU16 | ⬜ Pendiente |
| 18 | [CU18](./use-cases/CU18-consulta-de-ventas-y-facturas.md) | Consulta de ventas y facturas | CU17 | ⬜ Pendiente |
| 19 | [CU19](./use-cases/CU19-reimpresion-de-factura.md) | Reimpresión de factura | CU17 | ⬜ Pendiente |
| 20 | [CU20](./use-cases/CU20-anulacion-de-factura.md) | Anulación de factura | CU17, CU10 | ⬜ Pendiente |
| 21 | [CU21](./use-cases/CU21-generacion-de-orden-de-despacho.md) | Generación de orden de despacho | CU17 | ⬜ Pendiente |
| 22 | [CU22](./use-cases/CU22-consulta-de-pedidos-pendientes.md) | Consulta de pedidos pendientes | CU21 | ⬜ Pendiente |
| 23 | [CU23](./use-cases/CU23-actualizacion-del-estado-del-pedido.md) | Actualización del estado del pedido | CU21, CU22 | ⬜ Pendiente |
| 24 | [CU24](./use-cases/CU24-alerta-de-stock-bajo.md) | Alerta de stock bajo | CU07, CU10, CU12 | ⬜ Pendiente |
| 25 | [CU25](./use-cases/CU25-consulta-de-productos-de-baja-rotacion.md) | Consulta de productos de baja rotación | CU07, CU11, CU15 | ⬜ Pendiente |
| 26 | [CU26](./use-cases/CU26-reporte-de-inventario.md) | Reporte de inventario | CU11, CU12 | ⬜ Pendiente |
| 27 | [CU27](./use-cases/CU27-reporte-de-ventas.md) | Reporte de ventas | CU15, CU17 | ⬜ Pendiente |
| 28 | [CU28](./use-cases/CU28-reporte-de-productos-mas-vendidos.md) | Reporte de productos más vendidos | CU27 | ⬜ Pendiente |
| 29 | [CU29](./use-cases/CU29-reporte-de-productos-de-baja-rotacion.md) | Reporte de productos de baja rotación | CU25, CU27 | ⬜ Pendiente |
| 30 | [CU30](./use-cases/CU30-reporte-de-rentabilidad-por-producto.md) | Reporte de rentabilidad por producto | CU08, CU27 | ⬜ Pendiente |

---

## Diagrama de dependencias

```
CU01 ─┬─► CU02
      ├─► CU03
      ├─► CU04 ─► CU07 ─┬─► CU08 ─────────────────────────────────────► CU30
      ├─► CU05 ─────────┤          │
      ├─► CU06 ─► CU09 ─┤          │
      └─► CU14          │          ▼
                        └─► CU10 ─► CU11 ─┬─► CU12 ─► CU13
                                           │           │
                                           │           └─► CU26
                                           │
                                           └─► CU15 ─► CU16 ─► CU17 ─┬─► CU18
                                                   │                  ├─► CU19
                                                   │                  ├─► CU20
                                                   │                  └─► CU21 ─► CU22 ─► CU23
                                                   │
                                                   └─► CU25 ─► CU29
                                                   │
                                                   └─► CU27 ─┬─► CU28
                                                              └─► CU29
                                                              └─► CU30

CU07 + CU10 + CU12 ─► CU24
```

---

## Estados

| Ícono | Significado |
|-------|-------------|
| ⬜ Pendiente | No iniciado |
| 🔄 En progreso | Desarrollador actualmente trabajando en este CU |
| ✅ Completo | Todos los checkboxes de `## Implementación técnica` marcados y código en rama/PR |
| 🚫 Bloqueado | Dependencia no completada; no iniciar |

---

## Notas de implementación

- **CU03** se implementa como parte de CU01 (sin pantalla propia; solo código backend).
- **CU16** se implementa como parte de CU15 (lógica de cálculo embebida en el servicio de ventas).
- **CU24** depende de la infraestructura de CU10 y CU12 para disparar verificaciones; puede desarrollarse en paralelo con CU13 una vez que CU10 exista.
- Los endpoints de **exportación** (PDF/Excel) de los reportes CU26–CU30 pueden implementarse en una segunda iteración si el tiempo es limitado; priorizar la respuesta JSON primero.
