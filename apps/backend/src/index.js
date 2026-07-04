"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const org_routes_1 = __importDefault(require("./routes/org.routes"));
const project_routes_1 = __importDefault(require("./routes/project.routes"));
const queue_routes_1 = __importDefault(require("./routes/queue.routes"));
const job_routes_1 = __importDefault(require("./routes/job.routes"));
const metrics_routes_1 = __importDefault(require("./routes/metrics.routes"));
const http_1 = require("http");
const socket_1 = require("./utils/socket");
const engine_1 = require("./workers/engine");
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
const httpServer = (0, http_1.createServer)(app);
// Initialize Socket.io
(0, socket_1.initSocket)(httpServer);
// Start Worker Engine
const engine = new engine_1.WorkerEngine();
engine.start();
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
// Routes
app.use('/auth', auth_routes_1.default);
app.use('/api/organizations', org_routes_1.default);
app.use('/api/projects', project_routes_1.default);
app.use('/api/queues', queue_routes_1.default);
app.use('/api/jobs', job_routes_1.default);
app.use('/api/metrics', metrics_routes_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});
httpServer.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map