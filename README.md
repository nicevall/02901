# Back-M-vil

## Nombre del Proyecto y Objetivo General

**Geoasistencia** es una API desarrollada en Node.js que permite gestionar eventos y registrar la asistencia de los participantes mediante geolocalización. El objetivo es facilitar a docentes y administradores el control de asistencia en actividades académicas o institucionales, ofreciendo a los estudiantes una forma sencilla y segura de registrar su presencia.

## ¿Qué problema resuelve?

La aplicación atiende la necesidad de verificar la asistencia presencial de los estudiantes en un evento (clases, seminarios, conferencias, etc.) validando que se encuentren físicamente dentro de un radio permitido. Automatiza el registro y genera métricas para los organizadores.

## Público objetivo

- **Docentes y administradores** que necesitan crear eventos y llevar el control de asistencia.
- **Estudiantes** que registran su participación en cada evento.

## Arquitectura de Implementación

El proyecto sigue el patrón **MVC** (Model–View–Controller) adaptado para servicios REST. Las vistas se omiten y la comunicación se realiza por JSON. Esta separación facilita el mantenimiento y la escalabilidad del código.

### Estructura del proyecto

```
src/
  config/        # Conexión a MongoDB, logger y WebSocket
  controllers/   # Lógica de negocio (usuarios, eventos, asistencia, etc.)
  cron/          # Tareas programadas (marcado de ausentes)
  middlewares/   # Autenticación JWT y otras validaciones
  models/        # Esquemas de Mongoose
  routes/        # Definición de endpoints REST
  utils/         # Funciones auxiliares (correo, PDF, geolocalización, métricas)
```

```
app.js           # Punto de entrada de la aplicación
swagger.js       # Generación de documentación Swagger
```

### Descripción de carpetas y archivos

#### src/config
- `db.js`: establece la conexión a MongoDB y maneja errores de conexión.
- `logger.js`: configura el logger de Winston con etiquetas y colores.
- `websocket.js`: inicia el servidor WebSocket y expone una función para emitir eventos a los clientes.

#### src/controllers
- `asistencia.controller.js`: registro de asistencia del estudiante verificando la geolocalización y el estado del evento.
- `dashboard.controller.js`: calcula y expone métricas globales y por evento.
- `evento.controller.js`: CRUD de eventos, gestión de estados y generación de reportes PDF.
- `justificacion.controller.js`: creación, aprobación y rechazo de justificativos.
- `location.Controller.js`: actualiza en tiempo real la ubicación de los usuarios y controla la geocerca.
- `usuarios.controller.js`: registro, autenticación, verificación de correo y administración de usuarios.

#### src/cron
- `eventoCron.js`: tareas que cambian el estado de los eventos (activo, en proceso, en espera, finalizado).
- `asistenciaCron.js`: marca como ausentes las asistencias pendientes después del tiempo de gracia.

#### src/middlewares
- `auth.js`: middleware de autenticación JWT y verificación de roles.

#### src/models
- `Model.user.js`: esquema de usuarios.
- `pendingUser.model.js`: usuarios pendientes de verificación.
- `model.evento.js`: esquema de eventos.
- `asistencia.model.js`: registro de asistencias.
- `dashboard.model.js` y `eventMetric.model.js`: métricas globales y por evento.
- `justificacion.model.js`: justificativos de ausencia.
- `model.UserLocation.js`: historial de ubicaciones para la geocerca.

#### src/routes
- `usuarios.routes.js`: endpoints de registro, login, perfil y gestión de docentes.
- `eventos.routes.js`: rutas CRUD de eventos y generación de reportes.
- `asistencia.routes.js`: endpoint para registrar asistencias.
- `location.routes.js`: actualización de ubicación.
- `dashboard.routes.js`: obtención y actualización de métricas.
- `justificaciones.routes.js`: gestión de justificativos.
- `test.routes.js`: ruta de prueba de conectividad.

#### src/utils
- `dashboard.metrics.js` y `event.metrics.js`: funciones para incrementar métricas y emitir actualizaciones vía WebSocket.
- `email.util.js`: envío de correos mediante Nodemailer.
- `eventReport.util.js` y `pdf.util.js`: utilidades para generar gráficos y reportes PDF.
- `geo.util.js`: helpers de geolocalización.

#### Archivos raíz
- `app.js`: configura Express, conecta a MongoDB, registra rutas, middlewares y WebSocket.
- `ecosystem.config.js`: configuración de PM2 para despliegue.
- `swagger.js` y `swagger_output.json`: generan y exponen la documentación Swagger.

### Justificación

Se eligió MVC con Express y Mongoose por ser una arquitectura simple y conocida para aplicaciones web en Node.js. Permite organizar las lógicas de negocio en controladores, mantener los modelos desacoplados y exponer rutas limpias. Además, la capa de utilidades añade funcionalidades como envío de correos, generación de PDF y manejo de métricas.

### Diagrama de flujo simplificado

```
Estudiante/Docente ---> (Routes) ---> (Controller) ---> (Model - MongoDB)
                                   ^
                                   |
                               (Middleware - JWT)
```

Este esquema muestra el flujo de una petición: el usuario realiza una solicitud a un endpoint, pasa por el middleware de autenticación y llega al controlador, el cual consulta o modifica los modelos en MongoDB.

## Tecnologías y librerías principales

- **Express**: framework web para definir rutas y middlewares.
- **Mongoose**: ODM para conectarse a MongoDB.
- **JWT (jsonwebtoken)**: autenticación de usuarios.
- **bcryptjs**: cifrado de contraseñas.
- **Nodemailer**: envío de correos de verificación.
- **node-cron**: tareas programadas para actualizar asistencias y eventos.
- **ws**: canal WebSocket para enviar actualizaciones en tiempo real.
- **pdfkit**: generación de reportes en PDF.
- **swagger-jsdoc / swagger-ui-express**: documentación interactiva de la API.

Cada una de estas dependencias se puede consultar en `package.json`.

## Demostración funcional

- Iniciar el servidor:
  ```bash
  npm start
  ```
- Acceder a la documentación en `http://localhost:80/api-docs` para probar los endpoints.
- Funcionalidades implementadas:
  - Registro de usuarios con verificación por correo.
  - Inicio de sesión y generación de token JWT.
  - Creación y gestión de eventos (docentes/administradores).
  - Registro de asistencia validando la ubicación del estudiante.
  - Módulo de justificaciones y generación de reportes en PDF.
- Endpoint `/dashboard/overview` para visualizar métricas generales del sistema.
- Se encuentran en progreso ajustes en el dashboard de métricas y mejoras en las notificaciones en tiempo real.

## Cron de eventos

Una tarea programada (`src/cron/eventoCron.js`) se ejecuta cada minuto usando `node-cron`. Revisa los eventos con estado `activo` cuya `fechaInicio` y `horaInicio` ya ocurrieron y cambia su estado a `En proceso`. También monitorea los eventos `En proceso` y los marca como `finalizado` cuando su `fechaFin` y `horaFin` han concluido. Al iniciar la aplicación, esta tarea se carga automáticamente desde `app.js`.

Si un evento abarca varios días, tras finalizar la hora configurada de la jornada actual cambia a `En espera` para indicar formalmente que continuará al día siguiente hasta llegar a su `fechaFin`.

Los eventos pueden tener los siguientes estados:

- `activo`: creado y pendiente de iniciar.
- `En proceso`: la fecha y hora de inicio ya pasaron.
- `En espera`: la jornada actual terminó y continuará al día siguiente.
- `finalizado`: concluyó con normalidad.
- `cancelado`: fue suspendido antes de iniciar o concluir.

## Estado del desarrollo y próximos pasos

El repositorio contiene funcionalidades clave, pero aún se continúan realizando mejoras (por ejemplo, reportes adicionales y listados de eventos). Entre los próximos pasos se contempla:

1. Completar el dashboard de métricas por evento.
2. Mejorar el sistema de notificaciones WebSocket.
3. Revisar la gestión de roles y permisos para nuevos escenarios.
4. Documentar con más detalle los procesos de despliegue.

## Gestión del código y colaboración

El proyecto se aloja en GitHub. En los últimos commits se observa la participación de distintos integrantes, por ejemplo `Ismael110599` y `RicardoRios07` según el historial de `git log`. Cada funcionalidad se agrega mediante commits identificables y se realiza merge a la rama principal.

Para el trabajo en equipo se recomienda continuar utilizando ramas por funcionalidad y revisar los pull requests antes de integrarlos.

