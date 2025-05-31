//Auth Middleware
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_REFRESH_SECRET, ACCESS_TOKEN_EXPIRY } from '../config.js';
import { findRefreshToken, revokeRefreshToken } from '../models/refresh-token.js';

// Middleware para verificar el token JWT
export const verifyToken = (req, res, next) => {
  try {
    // Obtener el token del header o de las cookies
    const token = req.cookies.access_token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // Verificar el token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        // Si el token ha expirado pero hay un refresh token, intentar renovar
        if (err.name === 'TokenExpiredError' && req.cookies.refresh_token) {
          return res.status(401).json({ error: 'Token expired', refreshRequired: true });
        }
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      // Guardar la información del usuario en el objeto de solicitud
      req.user = decoded;
      next();
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error verifying token' });
  }
};

// Middleware para renovar el token JWT usando el refresh token
export const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }
    
    // Verificar si el refresh token existe en la base de datos
    const storedToken = await findRefreshToken(refreshToken);
    
    if (!storedToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    
    // Verificar si el token ha sido revocado o ha expirado
    if (storedToken.isRevoked || new Date() > storedToken.expiresAt) {
      return res.status(401).json({ error: 'Refresh token expired or revoked' });
    }
    
    // Verificar la firma del refresh token
    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }
      
      // Crear un nuevo token de acceso
      const newAccessToken = jwt.sign(
        { id: decoded.id, username: decoded.username },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
      );
      
      // Establecer el nuevo token de acceso en las cookies
      res.cookie('access_token', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      // Guardar la información del usuario en el objeto de solicitud
      req.user = decoded;
      next();
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error refreshing token' });
  }
};

// Middleware para verificar si el usuario está autenticado (para rutas protegidas)
export const isAuthenticated = (req, res, next) => {
  // Verificar si hay un usuario en la sesión
  if (req.session && req.session.user) {
    return next();
  }
  
  // Redirigir al login si no hay usuario autenticado
  res.redirect('/');
};

// Middleware para revocar el refresh token (logout)
export const revokeToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }
    
    // Limpiar las cookies
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Error revoking token' });
  }
};
