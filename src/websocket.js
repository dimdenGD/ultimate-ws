/*
Copyright 2024 dimden.dev

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const { EventEmitter } = require("tseep");
const { EventTarget } = require("./event-target.js");
const WS = require("ws");

class WebSocket extends EventEmitter {
    #onmessage = null;
    #onclose = null;
    #onerror = null;
    #onopen = null;
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
        this.readyState = WS.OPEN;
        if(this.server.options.perMessageDeflate && req.headers["sec-websocket-extensions"] && req.headers["sec-websocket-extensions"].includes("permessage-deflate")) {
            this.extensions = "permessage-deflate";
        }
        this.OPEN = WS.OPEN;
        this.CLOSING = WS.CLOSING;
        this.CLOSED = WS.CLOSED;
        this.CONNECTING = WS.CONNECTING;
    }

    get bufferedAmount() {
        return this.ws.getBufferedAmount();
    }

    get protocol() {
        return this.req.headers["sec-websocket-protocol"] ? this.req.headers["sec-websocket-protocol"].split(',')[0].trim() : '';
    }

    ping() {
        this.ws.ping();
    }

    pong() {
        // unsupported by uws
        console.warn("pong is not supported by uws, as its handled automatically");
    }

    close(code, reason) {
        this.ws.end(code, reason);
    }

    send(data, options = {}, callback) {
        if(typeof options === "function") {
            callback = options;
            options = {};
        }
        if(options.compress === undefined) options.compress = this.server.options.perMessageDeflate;
        const res = this.ws.send(data, options.binary, options.compress);
        if(callback) callback(res === 2 ? new Error("Dropped due to backpressure limit") : null);
        return res;
    }
    
    terminate() {
        this.ws.close();
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
        this.incomingMessagesSize += message.byteLength;
        if(this.incomingMessagesSize > this.maxPayload) {
            this.close(1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH");
        }
        this.incomingMessages.push({message: this.parseMessage(message, isBinary), isBinary});
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

    get onmessage() {
        return this.#onmessage;
    }

    set onmessage(listener) {
        if(this.#onmessage) {
            this.removeEventListener("message", this.#onmessage);
        }
        this.#onmessage = listener;
        this.addEventListener("message", listener);
    }

    get onclose() {
        return this.#onclose;
    }

    set onclose(listener) {
        if(this.#onclose) {
            this.removeEventListener("close", this.#onclose);
        }
        this.#onclose = listener;
        this.addEventListener("close", listener);
    }

    get onerror() {
        return this.#onerror;
    }

    set onerror(listener) {
        if(this.#onerror) {
            this.removeEventListener("error", this.#onerror);
        }
        this.#onerror = listener;
        this.addEventListener("error", listener);
    }

    get onopen() {
        return this.#onopen;
    }

    set onopen(listener) {
        if(this.#onopen) {
            this.removeEventListener("open", this.#onopen);
        }
        this.#onopen = listener;
        this.addEventListener("open", listener);
    }

    addEventListener(type, listener, options) {
        return EventTarget.addEventListener.call(this, type, listener, options);
    }

    removeEventListener(type, listener, options) {
        return EventTarget.removeEventListener.call(this, type, listener, options);
    }
}

module.exports = WebSocket;