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
        this.clients = new Set();
        this.clientData = {};
        if(!options.path) {
            options.path = "/*";
        }
        if(!options?.uwsOptions) {
            options.uwsOptions = {};
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
                ws.client = new WebSocket(ws);
                this.emit("connection", ws.client, ws.req);
            },
            message: (ws, message, isBinary) => {
                const data = isBinary ? message : Buffer.from(message);
                ws.client.emit("message", data);
            }
        });
    }

    listen(port, callback) {
        if(!callback && typeof port === 'function') {
            callback = port;
            port = 0;
        }
        let fn = 'listen';
        if(typeof port !== 'number') {
            if(!isNaN(Number(port))) {
                port = Number(port);
            } else {
                fn = 'listen_unix';
            }
        }
        this.listenCalled = true;
        this.uwsApp[fn](port, socket => {
            if(!socket) {
                let err = new Error('Failed to listen on port ' + port + '. No permission or address already in use.');
                throw err;
            }
            this.port = uWS.us_socket_local_port(socket);
            this.emit("listening");
            if(callback) callback(this.port);
        });
    }

    close(callback) {
        this.uwsApp.close();
        process.nextTick(() => {
            this.emit("close");
            if(callback) callback();
        });
    }
}