import { Router } from 'express';
import { fileController } from '../controllers/fileController';
import { authenticateApiKey } from '../middleware/auth';
import { errorHandler } from '../middleware/errorHandler';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateApiKey);

// File upload endpoint
router.post('/agents/:agentId/files/upload', 
  fileController.uploadMiddleware,
  fileController.uploadFile.bind(fileController)
);

// File processing endpoints
router.post('/agents/:agentId/files/:fileId/process', 
  fileController.processFile.bind(fileController)
);

// File information endpoints
router.get('/agents/:agentId/files', 
  fileController.listAgentFiles.bind(fileController)
);

router.get('/files', 
  fileController.listAllFiles.bind(fileController)
);

router.get('/files/:fileId', 
  fileController.getFileInfo.bind(fileController)
);

// File deletion endpoint
router.delete('/agents/:agentId/files/:fileId', 
  fileController.deleteFile.bind(fileController)
);

// AI Content Analysis endpoint
router.post('/agents/:agentId/files/:fileId/analyze', 
  fileController.analyzeContentWithAI.bind(fileController)
);

// External API health and connection endpoints
router.get('/external-api/health', 
  fileController.getExternalApiHealth.bind(fileController)
);

router.get('/external-api/test-connection', 
  fileController.testExternalApiConnection.bind(fileController)
);

// Error handling middleware
router.use(errorHandler);

export default router;
