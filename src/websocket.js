const { EventEmitter } = require("tseep");

module.exports = class WebSocket extends EventEmitter {
    constructor(ws) {
        super();
        this.ws = ws;
    }
}