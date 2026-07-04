"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQueueSchema = void 0;
const zod_1 = require("zod");
exports.createQueueSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Queue name is required'),
    priority: zod_1.z.number().int().default(0),
    concurrencyLimit: zod_1.z.number().int().min(1).default(10),
});
//# sourceMappingURL=queue.schema.js.map