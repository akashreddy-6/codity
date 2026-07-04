"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listOrganizations = exports.createOrganization = void 0;
const express_1 = require("express");
const db_1 = __importDefault(require("../utils/db"));
const org_schema_1 = require("../models/org.schema");
const auth_middleware_1 = require("../middleware/auth.middleware");
const createOrganization = async (req, res) => {
    try {
        const validatedData = org_schema_1.createOrganizationSchema.parse(req.body);
        const userId = req.user.userId;
        const organization = await db_1.default.organization.create({
            data: {
                name: validatedData.name,
                users: {
                    create: {
                        userId: userId,
                    }
                }
            },
        });
        res.status(201).json(organization);
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
exports.createOrganization = createOrganization;
const listOrganizations = async (req, res) => {
    try {
        const userId = req.user.userId;
        const organizations = await db_1.default.organization.findMany({
            where: {
                users: {
                    some: {
                        userId: userId
                    }
                }
            },
            include: {
                _count: {
                    select: { projects: true }
                }
            }
        });
        res.status(200).json(organizations);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.listOrganizations = listOrganizations;
//# sourceMappingURL=org.controller.js.map