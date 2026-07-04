"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const queue_controller_1 = require("../controllers/queue.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.post('/:projectId', queue_controller_1.createQueue);
router.get('/:projectId', queue_controller_1.listQueues);
router.put('/:id/pause', queue_controller_1.pauseQueue);
router.put('/:id/resume', queue_controller_1.resumeQueue);
router.delete('/:id', queue_controller_1.deleteQueue);
exports.default = router;
//# sourceMappingURL=queue.routes.js.map