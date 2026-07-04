"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetrics = void 0;
const express_1 = require("express");
const db_1 = __importDefault(require("../utils/db"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const getMetrics = async (req, res) => {
    try {
        const orgId = req.params.orgId;
        const userId = req.user.userId;
        // Verify user belongs to the organization
        const orgUser = await db_1.default.organizationUser.findUnique({
            where: { userId_organizationId: { userId, organizationId: orgId } }
        });
        if (!orgUser) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        // Get overall counts for the org's projects -> queues -> jobs
        const jobsCountByStatus = await db_1.default.job.groupBy({
            by: ['status'],
            where: {
                queue: {
                    project: {
                        organizationId: orgId
                    }
                }
            },
            _count: true,
        });
        // We can also fetch the active workers
        const activeWorkers = await db_1.default.worker.count({
            where: { status: 'ACTIVE' }
        });
        // We can fetch a simple timeseries of completed jobs today
        // For simplicity, we just return the raw aggregated data
        res.status(200).json({
            jobStats: jobsCountByStatus,
            activeWorkers
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getMetrics = getMetrics;
//# sourceMappingURL=metrics.controller.js.map