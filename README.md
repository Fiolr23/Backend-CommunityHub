# Backend CommunityHub

Este proyecto contiene el backend de CommunityHub, una plataforma para publicar, consultar y administrar actividades comunitarias. Su función principal es exponer una API REST que permite manejar usuarios, autenticación, actividades, categorías, inscripciones, favoritos, notificaciones y carga de imágenes.

El backend trabaja junto con el frontend del proyecto. Para usar la aplicación completa de forma local, este servidor debe estar ejecutándose y el frontend debe apuntar a su URL de API.

## Tecnologías principales

- Node.js: entorno donde se ejecuta el servidor.
- Express: framework usado para definir la API REST y sus rutas.
- MongoDB con Mongoose: base de datos y modelos principales del sistema.
- JSON Web Token: manejo de sesiones mediante tokens.
- bcryptjs: encriptación de contraseñas antes de guardarlas.
- Multer: carga de imágenes para perfiles y actividades.
- cors: configuración de acceso desde el frontend.
- dotenv: lectura de variables desde el archivo `.env`.

## Requisitos

- Node.js
- npm
- Acceso a una base de datos MongoDB
- Archivo `.env` configurado

## Instalación

Desde la carpeta del backend:

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto. Este archivo debe contener las variables necesarias para conectar la base de datos, configurar la autenticación y permitir la comunicación con el frontend.

No se deben subir ni compartir credenciales reales.

Variables utilizadas por el proyecto:

- `PORT`: puerto donde se ejecuta el servidor.
- `MONGODB_URI`: cadena de conexión a MongoDB.
- `JWT_SECRET`: clave secreta para firmar los tokens.
- `JWT_EXPIRES_IN`: tiempo de expiración del token.
- `CORS_ORIGIN`: origen permitido para las peticiones del frontend.
- `ADMIN_SEED_EMAIL`: correo del administrador inicial.
- `ADMIN_SEED_PASSWORD`: contraseña del administrador inicial.

Ejemplo de estructura del archivo, sin valores reales:

```env
PORT=
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=
CORS_ORIGIN=
ADMIN_SEED_EMAIL=
ADMIN_SEED_PASSWORD=
```

## Ejecución local

Para ejecutar en modo desarrollo:

```bash
npm run dev
```

Para ejecutar con Node:

```bash
npm start
```

Por defecto, el servidor usa el puerto definido en `PORT`. Si no existe, usa el puerto `3000`.

## Scripts disponibles

- `npm run dev`: ejecuta el servidor con `nodemon`.
- `npm start`: ejecuta el servidor con Node.
- `npm run seed:admin`: crea el administrador inicial.
- `npm test`: script de prueba definido en el proyecto, actualmente sin pruebas configuradas.

## Crear administrador inicial

El proyecto incluye un seeder para crear un usuario administrador inicial. Antes de ejecutarlo, deben estar configuradas las variables `ADMIN_SEED_EMAIL` y `ADMIN_SEED_PASSWORD`.

```bash
npm run seed:admin
```

Este comando no se ejecuta automáticamente.

## Roles del sistema

El backend maneja tres roles principales:

- `user`: puede consultar actividades, inscribirse y marcar favoritos.
- `organizer`: puede crear y administrar sus propias actividades.
- `admin`: puede administrar usuarios, categorías y actividades.

## Funcionalidades principales

- Registro, inicio de sesión, consulta de sesión actual y cierre de sesión.
- Manejo de roles: `user`, `organizer` y `admin`.
- Consulta pública de actividades y categorías.
- Creación, edición y eliminación de actividades por organizadores o administradores.
- Gestión de categorías por administradores.
- Inscripción y cancelación de inscripción en actividades.
- Marcado y eliminación de actividades favoritas.
- Consulta de dashboard según el rol del usuario autenticado.
- Consulta y marcado de notificaciones como leídas.
- Carga de imágenes en formato JPG, PNG o WEBP.

## Rutas principales de la API

Todas las rutas principales se exponen bajo el prefijo `/api`.

- `/api/auth`: registro, inicio de sesión, sesión actual y cierre de sesión.
- `/api/events`: consulta y administración de actividades.
- `/api/categories`: consulta y administración de categorías.
- `/api/users`: consulta y administración de usuarios.
- `/api/registrations`: consulta general de inscripciones para roles permitidos.
- `/api/notifications`: consulta y marcado de notificaciones.
- `/api/uploads`: carga de imágenes.
- `/api/dashboard`: información resumida según el rol del usuario.

Además, las imágenes subidas se sirven desde `/uploads`.

## Estructura principal

- `src/server.js`: inicia el servidor y conecta con MongoDB.
- `src/app.js`: configura Express, CORS, rutas y manejo de errores.
- `src/routes`: define los endpoints de la API.
- `src/controllers`: recibe las peticiones y devuelve las respuestas.
- `src/services`: contiene la lógica principal de cada módulo.
- `src/models`: modelos de datos de MongoDB.
- `src/middleware`: autenticación, autorización y carga de archivos.
- `src/seeders`: scripts de carga inicial de datos.
- `uploads`: carpeta donde se guardan las imágenes subidas.

## Relación con el frontend

El frontend consume esta API para mostrar la información y ejecutar las acciones de los usuarios. Para trabajar localmente, se recomienda ejecutar ambos proyectos al mismo tiempo:

- Backend: `npm run dev`, normalmente en `http://localhost:3000`.
- Frontend: `npm run dev`, normalmente en `http://localhost:3001`.

El frontend debe tener configurada la variable `NUXT_PUBLIC_API_BASE_URL` apuntando a este backend, por ejemplo:

```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```
