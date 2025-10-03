"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const healthController_1 = require("../controllers/healthController");
const router = (0, express_1.Router)();
router.get('/', (req, res, next) => healthController_1.healthController.getHealthStatus(req, res, next));
router.get('/metrics', (req, res, next) => healthController_1.healthController.getMetrics(req, res, next));
router.get('/config', (req, res, next) => healthController_1.healthController.getConfigStatus(req, res, next));
exports.default = router;
//# sourceMappingURL=healthRoutes.js.map