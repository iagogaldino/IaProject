import { Router } from 'express';
import { OpenAIController } from '../controllers/openAIController';

const askIaRouter = Router();
const apiKey = process.env.OPENAI_API_KEY || '';
const openAIController = new OpenAIController();

askIaRouter.post('/ask', (req, res) => openAIController.ask(req, res));

export default askIaRouter;
