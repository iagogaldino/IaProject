import { Router } from 'express';
import { chatController } from '../controllers/chatController';
import { authenticateApiKey, optionalAuth } from '../middleware/auth';
import { 
  validateRequest, 
  validateParams, 
  chatRequestSchema, 
  aiProcessSchema,
  agentIdSchema 
} from '../middleware/validation';

const router = Router();

// Public AI processing endpoint (no authentication required)
router.post('/api/ai/process', 
  validateRequest(aiProcessSchema),
  chatController.forwardToExternalAI
);

// Agent chat endpoints (authentication required)
router.post('/:id/chat', 
  validateParams(agentIdSchema),
  validateRequest(chatRequestSchema),
  authenticateApiKey,
  chatController.chatWithAgent
);

// Alternative AI processing endpoint (authentication optional)
router.post('/process', 
  validateRequest(aiProcessSchema),
  optionalAuth,
  chatController.processAIRequest
);

// Smart agent consultation endpoint
router.post('/:id/consult', 
  validateParams(agentIdSchema),
  authenticateApiKey,
  chatController.smartAgentConsultation
);

export default router;
