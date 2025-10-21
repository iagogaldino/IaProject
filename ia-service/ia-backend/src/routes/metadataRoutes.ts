import { Router } from 'express';
import { metadataController } from '../controllers/metadataController';
import { authenticateApiKey } from '../middleware/auth';
import { errorHandler } from '../middleware/errorHandler';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateApiKey);

// Get metadata by file ID
router.get('/files/:fileId/metadata', 
  metadataController.getMetadataByFile.bind(metadataController)
);

// Get metadata by agent ID
router.get('/agents/:agentId/metadata', 
  metadataController.getMetadataByAgent.bind(metadataController)
);

// Search metadata
router.get('/metadata/search', 
  metadataController.searchMetadata.bind(metadataController)
);

// Get metadata statistics
router.get('/metadata/stats', 
  metadataController.getMetadataStats.bind(metadataController)
);

// Create metadata
router.post('/metadata', 
  metadataController.createMetadata.bind(metadataController)
);

// Update metadata
router.put('/metadata/:metadataId', 
  metadataController.updateMetadata.bind(metadataController)
);

// Delete metadata
router.delete('/metadata/:metadataId', 
  metadataController.deleteMetadata.bind(metadataController)
);

// Delete metadata by file ID
router.delete('/files/:fileId/metadata', 
  metadataController.deleteMetadataByFile.bind(metadataController)
);

// Search similar metadata using embeddings
router.get('/metadata/search/similar', 
  metadataController.searchSimilarMetadata.bind(metadataController)
);

// Search metadata by semantic theme
router.get('/metadata/search/theme', 
  metadataController.searchBySemanticTheme.bind(metadataController)
);

// Generate missing embeddings for existing metadata
router.post('/metadata/embeddings/generate', 
  metadataController.generateMissingEmbeddings.bind(metadataController)
);

// Update embedding for specific metadata
router.put('/metadata/:metadataId/embedding', 
  metadataController.updateMetadataEmbedding.bind(metadataController)
);

// Error handling middleware
router.use(errorHandler);

export default router;
