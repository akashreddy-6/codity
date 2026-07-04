"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.listProjects = exports.createProject = void 0;
const express_1 = require("express");
const db_1 = __importDefault(require("../utils/db"));
const org_schema_1 = require("../models/org.schema");
const auth_middleware_1 = require("../middleware/auth.middleware");
const createProject = async (req, res) => {
    try {
        const validatedData = org_schema_1.createProjectSchema.parse(req.body);
        const organizationId = req.params.orgId;
        const userId = req.user.userId;
        // Verify user belongs to the organization
        const orgUser = await db_1.default.organizationUser.findUnique({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId,
                }
            }
        });
        if (!orgUser) {
            res.status(403).json({ error: 'Forbidden: You do not have access to this organization' });
            return;
        }
        const project = await db_1.default.project.create({
            data: {
                name: validatedData.name,
                organizationId: organizationId,
            },
        });
        res.status(201).json(project);
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
exports.createProject = createProject;
const listProjects = async (req, res) => {
    try {
        const organizationId = req.params.orgId;
        const userId = req.user.userId;
        // Verify user belongs to the organization
        const orgUser = await db_1.default.organizationUser.findUnique({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId,
                }
            }
        });
        if (!orgUser) {
            res.status(403).json({ error: 'Forbidden: You do not have access to this organization' });
            return;
        }
        const projects = await db_1.default.project.findMany({
            where: { organizationId },
            include: {
                _count: {
                    select: { queues: true }
                }
            }
        });
        res.status(200).json(projects);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.listProjects = listProjects;
const deleteProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        const userId = req.user.userId;
        const project = await db_1.default.project.findUnique({
            where: { id: projectId },
            include: { organization: true }
        });
        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        // Verify user belongs to the organization
        const orgUser = await db_1.default.organizationUser.findUnique({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId: project.organizationId,
                }
            }
        });
        if (!orgUser) {
            res.status(403).json({ error: 'Forbidden: You do not have access to this project' });
            return;
        }
        await db_1.default.project.delete({
            where: { id: projectId }
        });
        res.status(200).json({ message: 'Project deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteProject = deleteProject;
//# sourceMappingURL=project.controller.js.map