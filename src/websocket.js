const { EventEmitter } = require("tseep");
const { EventTarget } = require("./event-target.js");

class WebSocket extends EventEmitter {
    constructor(ws) {
        super();
        this.ws = ws;
        this.binaryType = "nodebuffer";
    }

    parseMessage(data, isBinary) {
        data = data.slice(0); // clone data as uWS destroys data after async callback

        if(!isBinary) {
            return Buffer.from(data);
        }

        switch(this.binaryType) {
            case "nodebuffer":
                return Buffer.from(data);
            case "arraybuffer":
                return data;
            case "blob":
                return new Blob([data]);
            case "fragments":
                return [Buffer.from(data)];
            default:
                throw new Error(`Unsupported binary type: ${this.binaryType}`);
        }
    }

    addEventListener(type, listener, options) {
        return EventTarget.addEventListener.call(this, type, listener, options);
    }

    removeEventListener(type, listener, options) {
        return EventTarget.removeEventListener.call(this, type, listener, options);
    }
}

module.exports = WebSocket;