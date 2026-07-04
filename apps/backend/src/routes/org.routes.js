"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const org_controller_1 = require("../controllers/org.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.post('/', org_controller_1.createOrganization);
router.get('/', org_controller_1.listOrganizations);
exports.default = router;
//# sourceMappingURL=org.routes.js.map