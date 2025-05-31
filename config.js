import dotenv from 'dotenv';

dotenv.config();

// Configuración de la aplicación
export const CONFIG = {
  // Puerto del servidor
  PORT: process.env.PORT,

  // Configuración de hash para contraseñas
  SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS),

  // Clave secreta para JWT
  JWT_SECRET: process.env.JWT_SECRET,

  // Clave secreta para JWT Refresh Token
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

  // Tiempo de expiración de tokens
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,

  // Entorno de la aplicación
  NODE_ENV: process.env.NODE_ENV,
};

// Exportar variables individuales para mantener compatibilidad
export const PORT = CONFIG.PORT;
export const SALT_ROUNDS = CONFIG.SALT_ROUNDS;
export const JWT_SECRET = CONFIG.JWT_SECRET;
export const JWT_REFRESH_SECRET = CONFIG.JWT_REFRESH_SECRET;
export const ACCESS_TOKEN_EXPIRY = CONFIG.ACCESS_TOKEN_EXPIRY;
export const REFRESH_TOKEN_EXPIRY = CONFIG.REFRESH_TOKEN_EXPIRY;
export const NODE_ENV = CONFIG.NODE_ENV;
