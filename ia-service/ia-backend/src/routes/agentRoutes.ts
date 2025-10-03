import { Router } from 'express';
import { agentController } from '../controllers/agentController';
import { authenticateApiKey } from '../middleware/auth';
import { 
  validateRequest, 
  validateParams, 
  createAgentSchema, 
  updateAgentSchema, 
  updateAgentStatusSchema,
  agentIdSchema 
} from '../middleware/validation';

const router = Router();

// Apply authentication to all agent routes
router.use(authenticateApiKey);

// Agent CRUD routes
router.post('/', 
  validateRequest(createAgentSchema),
  agentController.createAgent
);

router.get('/', 
  agentController.getAllAgents
);

router.get('/active', 
  agentController.getActiveAgents
);

router.get('/:id', 
  validateParams(agentIdSchema),
  agentController.getAgentById
);

router.put('/:id', 
  validateParams(agentIdSchema),
  validateRequest(updateAgentSchema),
  agentController.updateAgent
);

router.patch('/:id/status', 
  validateParams(agentIdSchema),
  validateRequest(updateAgentStatusSchema),
  agentController.updateAgentStatus
);

router.delete('/:id', 
  validateParams(agentIdSchema),
  agentController.deleteAgent
);

export default router;
