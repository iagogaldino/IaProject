import { Router } from 'express';
import { createAskController } from '../controllers/askController';
import { WorkflowService } from '../services/WorkflowService';
import { MockWorkflowService } from '../services/MockWorkflowService';
import { AgentConfigService } from '../services/AgentConfigService';
import { LoggerService } from '../services/LoggerService';

const router = Router();

// Initialize services (Dependency Injection)
const logger = new LoggerService();
const useMocks = process.env.USE_MOCKS === 'true' || process.env.NODE_ENV === 'mock';

console.log('🔧 Backend - USE_MOCKS:', useMocks);
console.log('🔧 Backend - process.env.USE_MOCKS:', process.env.USE_MOCKS);

// Use mock service if USE_MOCKS is true, otherwise use real service
const workflowService = useMocks
  ? new MockWorkflowService()
  : new WorkflowService(new AgentConfigService(), logger);

const askController = createAskController(workflowService, logger);

router.post('/ask', (req, res, next) => {
  console.log('📥 POST /ask recebido');
  console.log('📥 Body:', req.body);
  askController.askQuestion(req, res, next);
});

export default router;

