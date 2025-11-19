import { Router } from 'express';
import { createAskController } from '../controllers/askController';
import { WorkflowService } from '../services/WorkflowService';
import { AgentConfigService } from '../services/AgentConfigService';
import { LoggerService } from '../services/LoggerService';

const router = Router();

// Initialize services (Dependency Injection)
const logger = new LoggerService();
const agentConfigService = new AgentConfigService();
const workflowService = new WorkflowService(agentConfigService, logger);
const askController = createAskController(workflowService, logger);

router.post('/ask', askController.askQuestion);

export default router;

