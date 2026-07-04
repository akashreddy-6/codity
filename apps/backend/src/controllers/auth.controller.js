"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.login = exports.register = void 0;
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("../utils/db"));
const jwt_1 = require("../utils/jwt");
const auth_schema_1 = require("../models/auth.schema");
const register = async (req, res) => {
    try {
        const validatedData = auth_schema_1.registerSchema.parse(req.body);
        const existingUser = await db_1.default.user.findUnique({ where: { email: validatedData.email } });
        if (existingUser) {
            res.status(400).json({ error: 'User already exists' });
            return;
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const passwordHash = await bcrypt_1.default.hash(validatedData.password, salt);
        const user = await db_1.default.user.create({
            data: {
                email: validatedData.email,
                passwordHash,
            },
        });
        const token = (0, jwt_1.generateToken)(user.id, user.role);
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: user.id, email: user.email, role: user.role }
        });
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
exports.register = register;
const login = async (req, res) => {
    try {
        const validatedData = auth_schema_1.loginSchema.parse(req.body);
        const user = await db_1.default.user.findUnique({ where: { email: validatedData.email } });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const isMatch = await bcrypt_1.default.compare(validatedData.password, user.passwordHash);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = (0, jwt_1.generateToken)(user.id, user.role);
        res.status(200).json({
            message: 'Login successful',
            token,
            user: { id: user.id, email: user.email, role: user.role }
        });
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
exports.login = login;
const me = async (req, res) => {
    try {
        const user = await db_1.default.user.findUnique({ where: { id: req.user.userId } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.status(200).json({ id: user.id, email: user.email, role: user.role });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.me = me;
//# sourceMappingURL=auth.controller.js.map