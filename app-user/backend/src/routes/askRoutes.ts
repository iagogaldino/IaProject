import { Router } from 'express';
import { askQuestion } from '../controllers/askController';

const router = Router();

router.post('/ask', askQuestion);

export default router;

