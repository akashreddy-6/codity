"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQueue = exports.resumeQueue = exports.pauseQueue = exports.listQueues = exports.createQueue = void 0;
const express_1 = require("express");
const db_1 = __importDefault(require("../utils/db"));
const queue_schema_1 = require("../models/queue.schema");
const auth_middleware_1 = require("../middleware/auth.middleware");
// Middleware or helper to verify user has access to the project
const verifyProjectAccess = async (userId, projectId) => {
    const project = await db_1.default.project.findUnique({
        where: { id: projectId },
        include: { organization: { include: { users: true } } }
    });
    if (!project)
        return false;
    const hasAccess = project.organization.users.some(ou => ou.userId === userId);
    return hasAccess;
};
const createQueue = async (req, res) => {
    try {
        const validatedData = queue_schema_1.createQueueSchema.parse(req.body);
        const projectId = req.params.projectId;
        const userId = req.user.userId;
        const hasAccess = await verifyProjectAccess(userId, projectId);
        if (!hasAccess) {
            res.status(403).json({ error: 'Forbidden: You do not have access to this project' });
            return;
        }
        const queue = await db_1.default.queue.create({
            data: {
                name: validatedData.name,
                priority: validatedData.priority,
                concurrencyLimit: validatedData.concurrencyLimit,
                projectId: projectId,
            },
        });
        res.status(201).json(queue);
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
exports.createQueue = createQueue;
const listQueues = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const userId = req.user.userId;
        const hasAccess = await verifyProjectAccess(userId, projectId);
        if (!hasAccess) {
            res.status(403).json({ error: 'Forbidden: You do not have access to this project' });
            return;
        }
        const queues = await db_1.default.queue.findMany({
            where: { projectId },
            include: {
                _count: {
                    select: { jobs: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(queues);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.listQueues = listQueues;
const pauseQueue = async (req, res) => {
    try {
        const queueId = req.params.id;
        const userId = req.user.userId;
        const queue = await db_1.default.queue.findUnique({ where: { id: queueId } });
        if (!queue) {
            res.status(404).json({ error: 'Queue not found' });
            return;
        }
        const hasAccess = await verifyProjectAccess(userId, queue.projectId);
        if (!hasAccess) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        const updatedQueue = await db_1.default.queue.update({
            where: { id: queueId },
            data: { isPaused: true }
        });
        res.status(200).json(updatedQueue);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.pauseQueue = pauseQueue;
const resumeQueue = async (req, res) => {
    try {
        const queueId = req.params.id;
        const userId = req.user.userId;
        const queue = await db_1.default.queue.findUnique({ where: { id: queueId } });
        if (!queue) {
            res.status(404).json({ error: 'Queue not found' });
            return;
        }
        const hasAccess = await verifyProjectAccess(userId, queue.projectId);
        if (!hasAccess) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        const updatedQueue = await db_1.default.queue.update({
            where: { id: queueId },
            data: { isPaused: false }
        });
        res.status(200).json(updatedQueue);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.resumeQueue = resumeQueue;
const deleteQueue = async (req, res) => {
    try {
        const queueId = req.params.id;
        const userId = req.user.userId;
        const queue = await db_1.default.queue.findUnique({ where: { id: queueId } });
        if (!queue) {
            res.status(404).json({ error: 'Queue not found' });
            return;
        }
        const hasAccess = await verifyProjectAccess(userId, queue.projectId);
        if (!hasAccess) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        await db_1.default.queue.delete({ where: { id: queueId } });
        res.status(200).json({ message: 'Queue deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteQueue = deleteQueue;
//# sourceMappingURL=queue.controller.js.map