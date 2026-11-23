import { Router } from 'express';
import { register, login, getMe, selectWorkspace, forgotPassword } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.post('/select-workspace', authenticate, selectWorkspace);
router.post('/forgot-password', forgotPassword);

export default router;
