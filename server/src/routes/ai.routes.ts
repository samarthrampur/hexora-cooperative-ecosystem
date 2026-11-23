import { Router } from 'express';
import { handleAIChat } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/chat', authenticate, handleAIChat);

export default router;
