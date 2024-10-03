const uWS = require("uWebSockets.js");
const { EventEmitter } = require("tseep");
const IncomingMessage = require("./request.js");
const WebSocket = require("./websocket.js");
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
            upgrade: (res, req, context) => {
                const headers = [];
                const msg = new IncomingMessage(this, req, res);
                this.emit("headers", headers, msg);
                if(headers.length) {
                    res.writeStatus("101 Switching Protocols");
                    for(const header of headers) {
                        const [name, value] = header.split(": ");
                        res.writeHeader(name, value);
                    }
                }
                res.upgrade(
                    { req: msg },
                    req.getHeader('sec-websocket-key'),
                    req.getHeader('sec-websocket-protocol'),
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
            }
        });
    }

    address() {
        return { address: '::', family: 'IPv6', port: this.port };
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
            } else {
                fn = 'listen_unix';
                args.unshift(onListening);
            }
        } else {
            args.push(onListening);
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