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
- **node-cron**: tareas programadas para actualizar asistencias.
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

## Estado del desarrollo y próximos pasos

El repositorio contiene funcionalidades clave, pero aún se continúan realizando mejoras (por ejemplo, reportes adicionales y listados de eventos). Entre los próximos pasos se contempla:

1. Completar el dashboard de métricas por evento.
2. Mejorar el sistema de notificaciones WebSocket.
3. Revisar la gestión de roles y permisos para nuevos escenarios.
4. Documentar con más detalle los procesos de despliegue.

## Gestión del código y colaboración

El proyecto se aloja en GitHub. En los últimos commits se observa la participación de distintos integrantes, por ejemplo `Ismael110599` y `RicardoRios07` según el historial de `git log`. Cada funcionalidad se agrega mediante commits identificables y se realiza merge a la rama principal.

Para el trabajo en equipo se recomienda continuar utilizando ramas por funcionalidad y revisar los pull requests antes de integrarlos.

