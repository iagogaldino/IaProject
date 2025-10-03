"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const communicationController_1 = require("../controllers/communicationController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateApiKey);
router.post('/:id/communicate', (0, validation_1.validateParams)(validation_1.agentIdSchema), (0, validation_1.validateRequest)(validation_1.createMessageSchema), communicationController_1.communicationController.sendMessage);
router.get('/:id/messages', (0, validation_1.validateParams)(validation_1.agentIdSchema), communicationController_1.communicationController.getMessages);
router.get('/:id/messages/between', (0, validation_1.validateParams)(validation_1.agentIdSchema), communicationController_1.communicationController.getMessagesBetweenAgents);
router.get('/:id/messages/unread', (0, validation_1.validateParams)(validation_1.agentIdSchema), communicationController_1.communicationController.getUnreadMessages);
router.get('/:id/messages/count', (0, validation_1.validateParams)(validation_1.agentIdSchema), communicationController_1.communicationController.getMessageCount);
router.delete('/messages/:messageId', communicationController_1.communicationController.deleteMessage);
router.get('/communication/stats', communicationController_1.communicationController.getCommunicationStats);
exports.default = router;
//# sourceMappingURL=communicationRoutes.js.map