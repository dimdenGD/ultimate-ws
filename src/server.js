const uWS = require("uWebSockets.js");
const { EventEmitter } = require("tseep");
const IncomingMessage = require("./request.js");
const WebSocket = require("./websocket.js");
const WS = require("ws");

module.exports = class WebSocketServer extends EventEmitter {
    constructor(options = {}, callback) {
        super();
        if(options.noServer) {
            throw new Error("noServer is not supported. Read documentation for how to properly setup WS server with custom http server.");
        }
        if(!options.server && !options.port) {
            throw new Error("server or port is required");
        }
        this.options = options;
        this.listenCalled = false;
        this.clientData = {};
        if(!options.path) {
            options.path = "/*";
        }
        if(!options?.uwsOptions) {
            options.uwsOptions = {};
        }
        if(typeof options.clientTracking === 'undefined') {
            options.clientTracking = true;
        }
        if(typeof options.autoPong === 'undefined') {
            options.autoPong = true;
        }
        if(typeof options.maxPayload === 'undefined') {
            options.maxPayload = 104857600; // 100mb
        }

        if(options.clientTracking) {
            this.clients = new Set();
        }

        if(!options.server) {
            if(options.uwsOptions.key_file_name && options.uwsOptions.cert_file_name) {
                this.uwsApp = uWS.SSLApp(options.uwsOptions);
                this.ssl = true;
            } else {
                this.uwsApp = uWS.App(options.uwsOptions);
                this.ssl = false;
            }
            process.nextTick(() => this.listen(options.port, callback));
        } else {
            this.uwsApp = options.server;
        }
        this.createHandler();
    }

    createHandler() {
        this.uwsApp.ws(this.options.path, {
            sendPingsAutomatically: this.options.autoPong,
            maxPayloadLength: this.options.maxPayload,
            compression: typeof this.options.perMessageDeflate === 'boolean' && this.options.perMessageDeflate ? 
                (uWS.DEDICATED_COMPRESSOR_3KB | uWS.DEDICATED_DECOMPRESSOR) : this.options.perMessageDeflate,
            upgrade: (res, req, context) => {
                if(this.options.host) {
                    const host = req.getHeader('host');
                    if(host !== this.options.host) {
                        return req.setYield(true);
                    }
                }
                const headers = [];
                const msg = new IncomingMessage(this, req, res);
                this.emit("headers", headers, msg);
                if(headers.length || this.options.handleProtocols) {
                    res.writeStatus("101 Switching Protocols");
                }
                if(headers.length) {
                    for(const header of headers) {
                        const [name, value] = header.split(": ");
                        res.writeHeader(name, value);
                    }
                }
                let protocol;
                if(this.options.handleProtocols) {
                    const protocols = new Set(req.getHeader('sec-websocket-protocol').split(","));
                    protocol = this.options.handleProtocols(protocols, msg);
                }
                res.upgrade(
                    { req: msg },
                    req.getHeader('sec-websocket-key'),
                    protocol ?? req.getHeader('sec-websocket-protocol'),
                    req.getHeader('sec-websocket-extensions'),
                    context
                );
            },
            open: (ws) => {
                ws.client = new WebSocket(ws, ws.req, this);
                if(this.clients) this.clients.add(ws.client);
                this.emit("connection", ws.client, ws.req);
            },
            close: (ws) => {
                ws.client.readyState = WS.CLOSED;
                if(this.clients) this.clients.delete(ws.client);
                ws.client.emit("close");
            },
            message: (ws, message, isBinary) => {
                if(ws.client.isPaused) {
                    ws.client.bufferIncomingMessage(message, isBinary);
                    return;
                }
                ws.client.emit("message", ws.client.parseMessage(message, isBinary), isBinary);
            },
            ping: (ws, message) => {
                ws.client.emit("ping", ws.client.parseMessage(message));
            },
            pong: (ws, message) => {
                ws.client.emit("pong", ws.client.parseMessage(message));
            },
            dropped: (ws, message, isBinary) => {
                ws.client.emit("dropped", ws.client.parseMessage(message), isBinary);
            },
            drain: (ws) => {
                ws.client.emit("drain");
            }
        });
    }

    address() {
        const host = this.options.host ?? '::';
        return { address: host, family: host.includes(':') ? 'IPv6' : 'IPv4', port: this.port };
    }

    listen(port, callback) {
        if(!callback && typeof port === 'function') {
            callback = port;
            port = 0;
        }
        let fn = 'listen';
        const onListening = (socket) => {
            if(!socket) {
                let err = new Error('Failed to listen on port ' + port + '. No permission or address already in use.');
                throw err;
            }
            this.port = uWS.us_socket_local_port(socket);
            this.emit("listening");
            if(callback) callback(this.port);
        }
        let args = [port];
        if(typeof port !== 'number') {
            if(!isNaN(Number(port))) {
                port = Number(port);
                args.push(onListening);
                if(this.options.host) {
                    args.unshift(this.options.host);
                }
            } else {
                fn = 'listen_unix';
                args.unshift(onListening);
            }
        } else {
            args.push(onListening);
            if(this.options.host) {
                args.unshift(this.options.host);
            }
        }
        this.listenCalled = true;
        this.uwsApp[fn](...args);
    }

    close(callback) {
        this.uwsApp.close();
        process.nextTick(() => {
            this.emit("close");
            if(callback) callback();
        });
    }
}