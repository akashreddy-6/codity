"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocket = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
let io = null;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: { origin: '*' }
    });
    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);
        // Clients can join rooms based on queueId to only receive relevant updates
        socket.on('join_queue', (queueId) => {
            socket.join(`queue_${queueId}`);
            console.log(`Socket ${socket.id} joined queue_${queueId}`);
        });
        socket.on('leave_queue', (queueId) => {
            socket.leave(`queue_${queueId}`);
        });
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getSocket = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
exports.getSocket = getSocket;
//# sourceMappingURL=socket.js.map