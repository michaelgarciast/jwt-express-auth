import express from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../user-repository.js';
import { 
    JWT_SECRET, 
    JWT_REFRESH_SECRET, 
    NODE_ENV, 
    ACCESS_TOKEN_EXPIRY, 
    REFRESH_TOKEN_EXPIRY 
} from '../config.js';
import { createRefreshToken, findRefreshToken } from '../models/refresh-token.js';
import { revokeToken } from '../middlewares/auth-middleware.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
    const {username, password} = req.body;
    try {
        const userId = await UserRepository.login({username, password});
        
        // Crear access token (corta duración)
        const accessToken = jwt.sign(
            { id: userId, username }, 
            JWT_SECRET, 
            { expiresIn: ACCESS_TOKEN_EXPIRY }
        );
        
        // Crear refresh token (larga duración)
        const refreshToken = jwt.sign(
            { id: userId, username },
            JWT_REFRESH_SECRET,
            { expiresIn: REFRESH_TOKEN_EXPIRY }
        );
        
        // Guardar el refresh token en la base de datos
        await createRefreshToken(userId, refreshToken, 7); // 7 días de validez
        
        // Establecer cookies
        res.cookie('access_token', accessToken, {
            httpOnly: true, 
            secure: NODE_ENV === 'production', 
            sameSite: 'strict'
        });
        
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true, 
            secure: NODE_ENV === 'production', 
            sameSite: 'strict',
            path: '/api/refresh-token' // Solo accesible en la ruta de refresh
        });
        
        res.status(200).json({ userId, accessToken });
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

// Register
router.post('/register', async (req, res) => {
    const {username, password} = req.body;
    try {
        const id = await UserRepository.create({username, password});
        res.status(201).json({id});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

// Refresh Token - Ruta para renovar el access token usando el refresh token (POST)
router.post('/api/refresh-token', async (req, res) => {
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
        const now = Date.now();
        if (storedToken.isRevoked || now > storedToken.expiresAtTimestamp) {
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
                secure: NODE_ENV === 'production',
                sameSite: 'strict'
            });
            
            res.status(200).json({ accessToken: newAccessToken });
        });
    } catch (error) {
        return res.status(500).json({ error: 'Error refreshing token' });
    }
});

// Refresh Token - Ruta GET para renovar el token y redirigir (usado por el middleware)
router.get('/api/refresh-token', async (req, res) => {
    try {
        const refreshToken = req.cookies.refresh_token;
        const redirectUrl = req.query.redirect || '/';
        
        if (!refreshToken) {
            return res.redirect('/');
        }
        
        // Verificar si el refresh token existe en la base de datos
        const storedToken = await findRefreshToken(refreshToken);
        
        if (!storedToken) {
            return res.redirect('/');
        }
        
        // Verificar si el token ha sido revocado o ha expirado
        const now = Date.now();
        if (storedToken.isRevoked || now > storedToken.expiresAtTimestamp) {
            return res.redirect('/');
        }
        
        // Verificar la firma del refresh token
        jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, decoded) => {
            if (err) {
                return res.redirect('/');
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
                secure: NODE_ENV === 'production',
                sameSite: 'strict'
            });
            
            // Redirigir a la URL original
            res.redirect(redirectUrl);
        });
    } catch (error) {
        return res.redirect('/');
    }
});

// Logout
router.post('/logout', revokeToken, (req, res) => {
    res.status(200).json({message: 'Logout successful'});
});

export default router;
