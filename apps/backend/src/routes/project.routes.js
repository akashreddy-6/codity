"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const project_controller_1 = require("../controllers/project.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.post('/:orgId', project_controller_1.createProject);
router.get('/:orgId', project_controller_1.listProjects);
router.delete('/:id', project_controller_1.deleteProject);
exports.default = router;
//# sourceMappingURL=project.routes.js.map