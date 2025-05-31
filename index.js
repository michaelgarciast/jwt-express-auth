import express from "express";
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import { JWT_SECRET } from './config.js';
import authRoutes from './routes/auth.js';
import protectedRoutes from './routes/protected.js';
import './models/user.js'; // Importar el modelo para que se registre

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware: siempre intenta poblar req.session.user si hay JWT válido
app.use((req, res, next) => {
    req.session = { user: null };
    const token = req.cookies.access_token;
    if (token) {
        try {
            const payload = jwt.verify(token, JWT_SECRET);
            req.session.user = { _id: payload.id, username: payload.username };
        } catch {}
    }
    next();
});

// Ruta principal
app.get('/', (req, res) => {
    const { user } = req.session;
    res.render('index', { user: user || null });
});

// Rutas
app.use(authRoutes);
app.use(protectedRoutes);

import { PORT } from "./config.js";
const port = PORT || 3000;

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Usando base de datos: db-local`);
});
