"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.clear();
const config_1 = __importDefault(require("../config/config"));
const client_1 = require("./structures/client");
const client = new client_1.Client();
client.start(config_1.default.token);
