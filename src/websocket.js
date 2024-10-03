const { EventEmitter } = require("tseep");
const { EventTarget } = require("./event-target.js");

class WebSocket extends EventEmitter {
    constructor(ws) {
        super();
        this.ws = ws;
    }

    addEventListener(type, listener, options) {
        return EventTarget.addEventListener.call(this, type, listener, options);
    }

    removeEventListener(type, listener, options) {
        return EventTarget.removeEventListener.call(this, type, listener, options);
    }
}

module.exports = WebSocket;