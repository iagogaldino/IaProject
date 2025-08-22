import { Router } from 'express';
import { TestService } from '../services/testService';
import { TestController } from '../controllers/testController';

const router = Router();
const testController = new TestController(new TestService());

router.get('/', (req, res) => {
  res.json({ message: 'API is working!' });
});

router.get('/test', (req, res) => testController.getTest(req, res));

export default router;
