"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitJobSchema = void 0;
const zod_1 = require("zod");
exports.submitJobSchema = zod_1.z.object({
    payload: zod_1.z.record(zod_1.z.any()),
    priority: zod_1.z.number().int().default(0),
    delayMs: zod_1.z.number().int().min(0).optional(),
});
//# sourceMappingURL=job.schema.js.map