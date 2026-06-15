"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const bootstrap_1 = require("../src/bootstrap");
let server;
async function handler(req, res) {
    if (!server) {
        server = await (0, bootstrap_1.createApp)();
    }
    return server(req, res);
}
//# sourceMappingURL=index.js.map