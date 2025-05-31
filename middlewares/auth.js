import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_REFRESH_SECRET } from '../config.js';
import { findRefreshToken } from '../models/refresh-token.js';

//Auth Middleware
export async function authMiddleware(req, res, next) {
    const accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;
    
    // Si no hay token de acceso, verificar si hay refresh token
    if (!accessToken) {
        if (refreshToken) {
            // Intentar usar el refresh token para generar un nuevo access token
            try {
                // Verificar si el refresh token existe en la base de datos
                const storedToken = await findRefreshToken(refreshToken);
                
                // Verificar si el token ha sido revocado o ha expirado
                const now = Date.now();
                if (!storedToken || storedToken.isRevoked || now > storedToken.expiresAtTimestamp) {
                    return res.redirect('/');
                }
                
                // Verificar la firma del refresh token
                const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
                
                // Crear un nuevo token de acceso
                const newAccessToken = jwt.sign(
                    { id: decoded.id, username: decoded.username },
                    JWT_SECRET,
                    { expiresIn: '15m' }
                );
                
                // Establecer el nuevo token de acceso en las cookies
                res.cookie('access_token', newAccessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict'
                });
                
                // Actualizar la sesión
                req.session.user = { _id: decoded.id, username: decoded.username };
                return next();
            } catch (error) {
                return res.redirect('/');
            }
        } else {
            return res.redirect('/');
        }
    }
    
    // Si hay token de acceso, verificarlo
    try {
        const payload = jwt.verify(accessToken, JWT_SECRET);
        req.session.user = { _id: payload.id, username: payload.username };
        next();
    } catch (error) {
        // Si el token ha expirado pero hay un refresh token, intentar renovarlo
        if (error.name === 'TokenExpiredError' && refreshToken) {
            // Redirigir a la página actual después de renovar el token
            const currentUrl = req.originalUrl;
            return res.redirect(`/api/refresh-token?redirect=${encodeURIComponent(currentUrl)}`);
        }
        return res.redirect('/');
    }
}
