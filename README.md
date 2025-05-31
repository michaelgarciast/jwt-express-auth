# JWT Express Auth

Esta es una aplicación de autenticación basada en JSON Web Tokens (JWT) utilizando Express.js. Proporciona un sistema seguro para manejar la autenticación de usuarios en aplicaciones web.

## Características

- Registro de usuarios.
- Inicio de sesión con generación de JWT.
- Protección de rutas mediante autenticación.
- Renovación de tokens.

## Requisitos

- Node.js (v14 o superior).
- npm (v6 o superior).

## Instalación

1. Clona este repositorio:
   ```bash
   git clone https://github.com/tu-usuario/jwt-express-auth.git
   ```
2. Navega al directorio del proyecto:
   ```bash
   cd jwt-express-auth
   ```
3. Instala las dependencias:
   ```bash
   npm install
   ```

## Uso

1. Configura las variables de entorno en un archivo `.env`. Ejemplo:
   ```
   PORT=3000
   JWT_SECRET=tu_secreto
   DB_URI=mongodb://localhost:27017/tu_base_de_datos
   ```
2. Inicia la aplicación:
   ```bash
   npm start
   ```
3. Accede a la aplicación en `http://localhost:3000`.

## Endpoints

- **POST /register**: Registro de nuevos usuarios.
- **POST /login**: Inicio de sesión y generación de JWT.
- **GET /protected**: Ruta protegida que requiere autenticación.

## Contribuciones

¡Las contribuciones son bienvenidas! Por favor, abre un issue o envía un pull request.

## Licencia

Este proyecto está bajo la licencia MIT.
