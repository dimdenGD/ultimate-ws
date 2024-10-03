const { EventEmitter } = require("tseep");
const { EventTarget } = require("./event-target.js");

class WebSocket extends EventEmitter {
    constructor(ws, req, server) {
        super();
        this.ws = ws;
        this.req = req;
        this.server = server;
        this.binaryType = "nodebuffer";
        this.incomingMessages = [];
        this.incomingMessagesSize = 0;
        this.isPaused = false;
        this.maxPayload = 1024 * 1024 * 100; // 100 MB
        this.extensions = '';
        if(this.server.options.perMessageDeflate && req.headers["sec-websocket-extensions"] && req.headers["sec-websocket-extensions"].includes("permessage-deflate")) {
            this.extensions = "permessage-deflate";
        }
    }

    get bufferedAmount() {
        return this.ws.getBufferedAmount();
    }

    close(code, reason) {
        this.ws.end(code, reason);
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
        this.incomingMessages.forEach(({ message, isBinary }) => {
            this.emit("message", message, isBinary);
        });
        this.incomingMessages = [];
        this.incomingMessagesSize = 0;
    }

    bufferIncomingMessage(message, isBinary) {
        this.incomingMessages.push({message: this.parseMessage(message, isBinary), isBinary});
        this.incomingMessagesSize += message.byteLength;
        if(this.incomingMessagesSize > this.maxPayload) {
            this.close(1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH");
        }
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