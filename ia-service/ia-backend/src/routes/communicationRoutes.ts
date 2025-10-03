import { Router } from 'express';
import { communicationController } from '../controllers/communicationController';
import { authenticateApiKey } from '../middleware/auth';
import { 
  validateRequest, 
  validateParams, 
  createMessageSchema, 
  agentIdSchema 
} from '../middleware/validation';

const router = Router();

// Apply authentication to all communication routes
router.use(authenticateApiKey);

// Communication routes
router.post('/:id/communicate', 
  validateParams(agentIdSchema),
  validateRequest(createMessageSchema),
  communicationController.sendMessage
);

router.get('/:id/messages', 
  validateParams(agentIdSchema),
  communicationController.getMessages
);

router.get('/:id/messages/between', 
  validateParams(agentIdSchema),
  communicationController.getMessagesBetweenAgents
);

router.get('/:id/messages/unread', 
  validateParams(agentIdSchema),
  communicationController.getUnreadMessages
);

router.get('/:id/messages/count', 
  validateParams(agentIdSchema),
  communicationController.getMessageCount
);

router.delete('/messages/:messageId', 
  communicationController.deleteMessage
);

router.get('/communication/stats', 
  communicationController.getCommunicationStats
);

export default router;
