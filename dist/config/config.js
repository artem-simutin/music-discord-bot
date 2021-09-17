"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require('dotenv');
dotenv.config();
const config = {
    token: process.env.BOT_TOKEN,
    prefix: '!!',
};
exports.default = config;
