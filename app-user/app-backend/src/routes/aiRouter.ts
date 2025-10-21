import { Router } from 'express';
import { AIController } from '../controllers/aiController';

const aiRouter = Router();
const aiController = new AIController();

aiRouter.post('/ask', (req, res) => aiController.ask(req, res));
aiRouter.get('/test-connection', (req, res) => aiController.testConnection(req, res));
aiRouter.post('/validate', (req, res) => aiController.validateRequest(req, res));

export default aiRouter;
