"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const metadataController_1 = require("../controllers/metadataController");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateApiKey);
router.get('/files/:fileId/metadata', metadataController_1.metadataController.getMetadataByFile.bind(metadataController_1.metadataController));
router.get('/agents/:agentId/metadata', metadataController_1.metadataController.getMetadataByAgent.bind(metadataController_1.metadataController));
router.get('/metadata/search', metadataController_1.metadataController.searchMetadata.bind(metadataController_1.metadataController));
router.get('/metadata/stats', metadataController_1.metadataController.getMetadataStats.bind(metadataController_1.metadataController));
router.put('/metadata/:metadataId', metadataController_1.metadataController.updateMetadata.bind(metadataController_1.metadataController));
router.delete('/metadata/:metadataId', metadataController_1.metadataController.deleteMetadata.bind(metadataController_1.metadataController));
router.delete('/files/:fileId/metadata', metadataController_1.metadataController.deleteMetadataByFile.bind(metadataController_1.metadataController));
router.use(errorHandler_1.errorHandler);
exports.default = router;
//# sourceMappingURL=metadataRoutes.js.map