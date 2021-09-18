"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
console.clear();
const config_1 = (0, tslib_1.__importDefault)(require("../config/config"));
const client_1 = require("./structures/client");
const client = new client_1.Client();
console.log(process.env.BUILD_MODE);
if (config_1.default.token) {
    client.start(config_1.default.token);
}
else {
    console.error('Please, provide bot token as env variable (info: .env.example)');
}
