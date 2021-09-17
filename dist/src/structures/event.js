"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
class Event {
    constructor(event, eventHandler) {
        this.event = event;
        this.handler = eventHandler;
    }
}
exports.Event = Event;
