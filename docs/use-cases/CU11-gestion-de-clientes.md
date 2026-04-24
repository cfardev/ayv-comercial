# CU11 - Gestión de clientes

## Objetivo

Registrar, consultar, editar y desactivar la información de los clientes que realizan compras en la distribuidora.

## Actores

- A: Vendedor
- A: Administrador
- A: Sistema de clientes

## Precondiciones

- A: El actor está autenticado en el sistema.
- A: El actor tiene permisos para gestionar clientes.

## Disparador

El actor selecciona la opción "Gestión de clientes" desde el menú de ventas o administración.

## Flujo principal

### Registro de cliente

1. El actor accede al formulario de nuevo cliente.
2. El sistema presenta los campos: tipo de persona (natural/jurídica), nombre o razón social, identificación (RUC/Cédula), dirección, teléfono, correo electrónico.
3. El actor completa los campos obligatorios.
4. El sistema valida que la identificación no esté duplicada.
5. El sistema crea el cliente con estado activo y fecha de creación.
6. El sistema muestra un mensaje de confirmación y actualiza la lista de clientes.

### Consulta de clientes

1. El actor accede a la lista de clientes.
2. El sistema muestra la tabla con columnas: identificación, nombre o razón social, tipo de persona, teléfono, correo, estado, fecha de creación.
3. El actor puede buscar por identificación, nombre o razón social.
4. El actor puede filtrar por tipo de persona o estado (activo/inactivo).
5. El sistema presenta los resultados paginados (20 por página).

### Edición de cliente

1. El actor selecciona un cliente de la lista y elige "Editar".
2. El sistema presenta el formulario pre-poblado con los datos actuales.
3. El actor modifica los campos deseados.
4. El sistema valida los datos modificados (identificación única si cambia, formato de correo).
5. El sistema actualiza el registro con la nueva información.
6. El sistema muestra un mensaje de confirmación.

### Desactivación de cliente

1. El actor selecciona un cliente de la lista y elige "Desactivar".
2. El sistema verifica que no existan ventas asociadas al cliente.
3. Si hay ventas asociadas, el sistema permite la desactivación mostrando una advertencia.
4. El sistema solicita confirmación.
5. El actor confirma la desactivación.
6. El sistema cambia el estado del cliente a inactivo.
7. El cliente inactivo no podrá ser seleccionado en nuevas ventas.

## Flujos alternos

### FA1 - Identificación duplicada

- A: Si la identificación ya existe, el sistema muestra un mensaje de error indicando el duplicado.

### FA2 - Datos incompletos

- A: Si faltan campos obligatorios, el sistema muestra validaciones en el formulario y no envía la solicitud.

### FA3 - Formato de correo inválido

- A: Si el correo no tiene formato válido, el sistema muestra un error de formato.

### FA4 - Formato de identificación inválido

- A: Si la identificación no cumple con el formato esperado (cédula: 10 dígitos, RUC: 13 dígitos), el sistema muestra un error de formato.

## Postcondiciones

- A: Registro exitoso: el nuevo cliente queda disponible para ser asociado a ventas.
- A: Edición exitosa: los cambios quedan aplicados al cliente.
- A: Desactivación exitosa: el cliente no puede ser asociado a nuevas ventas; las ventas existentes permanecen.
- A: En cualquier caso fallido, no se modifica el estado del cliente.

## Reglas de negocio

- A: La identificación debe ser única en el sistema.
- A: Para personas naturales se requiere cédula de identidad (10 dígitos).
- A: Para personas jurídicas se requiere RUC (13 dígitos).
- A: Los clientes desactivados no pueden ser seleccionados en nuevas ventas.
- A: Un cliente puede tener múltiples ventas asociadas.

## Reglas de seguridad

- A: Solo usuarios con rol administrador o vendedor pueden gestionar clientes.
- A: Los datos personales se almacenan de acuerdo a las políticas de privacidad.
- A: Todas las operaciones de gestión de clientes quedan registradas con usuario responsable, fecha y hora.

## Criterios de aceptación

- A: Un usuario con permisos puede registrar un nuevo cliente con datos válidos.
- A: Un usuario con permisos puede editar los datos de un cliente existente.
- A: Un usuario con permisos puede desactivar un cliente.
- A: El sistema rechaza registro con identificación duplicada.
- A: El sistema valida el formato de correo y identificación.
- A: Los clientes desactivados no aparecen en el selector de clientes para nuevas ventas.