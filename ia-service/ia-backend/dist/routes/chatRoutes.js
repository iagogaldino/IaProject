"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatController_1 = require("../controllers/chatController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.post('/api/ai/process', (0, validation_1.validateRequest)(validation_1.aiProcessSchema), chatController_1.chatController.forwardToExternalAI);
router.post('/:id/chat', (0, validation_1.validateParams)(validation_1.agentIdSchema), (0, validation_1.validateRequest)(validation_1.chatRequestSchema), auth_1.authenticateApiKey, chatController_1.chatController.chatWithAgent);
router.post('/process', (0, validation_1.validateRequest)(validation_1.aiProcessSchema), auth_1.optionalAuth, chatController_1.chatController.processAIRequest);
router.post('/:id/consult', (0, validation_1.validateParams)(validation_1.agentIdSchema), auth_1.authenticateApiKey, chatController_1.chatController.smartAgentConsultation);
exports.default = router;
//# sourceMappingURL=chatRoutes.js.map