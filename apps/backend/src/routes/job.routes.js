"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const job_controller_1 = require("../controllers/job.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.post('/:queueId', job_controller_1.submitJob);
router.get('/:queueId', job_controller_1.listJobs);
router.get('/detail/:id', job_controller_1.getJobDetails);
exports.default = router;
//# sourceMappingURL=job.routes.js.map