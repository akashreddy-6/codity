"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobDetails = exports.listJobs = exports.submitJob = void 0;
const express_1 = require("express");
const db_1 = __importDefault(require("../utils/db"));
const job_schema_1 = require("../models/job.schema");
const auth_middleware_1 = require("../middleware/auth.middleware");
const client_1 = require("@prisma/client");
const verifyQueueAccess = async (userId, queueId) => {
    const queue = await db_1.default.queue.findUnique({
        where: { id: queueId },
        include: { project: { include: { organization: { include: { users: true } } } } }
    });
    if (!queue)
        return false;
    const hasAccess = queue.project.organization.users.some(ou => ou.userId === userId);
    return hasAccess;
};
const submitJob = async (req, res) => {
    try {
        const validatedData = job_schema_1.submitJobSchema.parse(req.body);
        const queueId = req.params.queueId;
        const userId = req.user.userId;
        const hasAccess = await verifyQueueAccess(userId, queueId);
        if (!hasAccess) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        let runAt = new Date();
        let status = client_1.JobStatus.QUEUED;
        if (validatedData.delayMs && validatedData.delayMs > 0) {
            runAt = new Date(Date.now() + validatedData.delayMs);
            status = client_1.JobStatus.SCHEDULED;
        }
        const job = await db_1.default.job.create({
            data: {
                payload: validatedData.payload,
                priority: validatedData.priority,
                status: status,
                runAt: runAt,
                queueId: queueId,
            },
        });
        res.status(201).json(job);
    }
    catch (error) {
        if (error.name === 'ZodError') {
            res.status(400).json({ error: 'Validation error', details: error.errors });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
exports.submitJob = submitJob;
const listJobs = async (req, res) => {
    try {
        const queueId = req.params.queueId;
        const userId = req.user.userId;
        const statusFilter = req.query.status;
        const skip = parseInt(req.query.skip) || 0;
        const take = parseInt(req.query.take) || 50;
        const hasAccess = await verifyQueueAccess(userId, queueId);
        if (!hasAccess) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        const jobs = await db_1.default.job.findMany({
            where: {
                queueId,
                ...(statusFilter && { status: statusFilter })
            },
            orderBy: [
                { priority: 'desc' },
                { runAt: 'asc' }
            ],
            skip,
            take
        });
        res.status(200).json(jobs);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.listJobs = listJobs;
const getJobDetails = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.user.userId;
        const job = await db_1.default.job.findUnique({
            where: { id: jobId },
            include: {
                executions: { orderBy: { startedAt: 'desc' } },
                logs: { orderBy: { timestamp: 'desc' } }
            }
        });
        if (!job) {
            res.status(404).json({ error: 'Job not found' });
            return;
        }
        const hasAccess = await verifyQueueAccess(userId, job.queueId);
        if (!hasAccess) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        res.status(200).json(job);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getJobDetails = getJobDetails;
//# sourceMappingURL=job.controller.js.map