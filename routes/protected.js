import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.get('/protected', authMiddleware, (req, res) => {
    const { user } = req.session;
    res.render('protected', { username: user.username, id: user._id });
});

export default router;
