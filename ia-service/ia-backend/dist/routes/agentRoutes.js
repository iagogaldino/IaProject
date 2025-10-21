"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agentController_1 = require("../controllers/agentController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateApiKey);
router.post('/', (0, validation_1.validateRequest)(validation_1.createAgentSchema), agentController_1.agentController.createAgent);
router.get('/', agentController_1.agentController.getAllAgents);
router.get('/active', agentController_1.agentController.getActiveAgents);
router.get('/collections/available', agentController_1.agentController.getAvailableCollections);
router.get('/:id', (0, validation_1.validateParams)(validation_1.agentIdSchema), agentController_1.agentController.getAgentById);
router.put('/:id', (0, validation_1.validateParams)(validation_1.agentIdSchema), (0, validation_1.validateRequest)(validation_1.updateAgentSchema), agentController_1.agentController.updateAgent);
router.patch('/:id/status', (0, validation_1.validateParams)(validation_1.agentIdSchema), (0, validation_1.validateRequest)(validation_1.updateAgentStatusSchema), agentController_1.agentController.updateAgentStatus);
router.delete('/:id', (0, validation_1.validateParams)(validation_1.agentIdSchema), agentController_1.agentController.deleteAgent);
exports.default = router;
//# sourceMappingURL=agentRoutes.js.map