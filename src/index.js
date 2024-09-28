const ws = require("ws");
const uWS = require("uWebSockets.js");

class WebSocketServer {
    constructor(options = {}, callback) {
        if(options.noServer) {
            throw new Error("noServer is not supported. Read documentation for how to properly setup WS server with custom http server.");
        }
        if(!options.server && !options.port) {
            throw new Error("server or port is required");
        }
        this.listenCalled = false;
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
            this.listen(options.port, callback);
        } else {
            this.uwsApp = options.server;
        }
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
            if(callback) callback(this.port);
        });
    }
}

ws.WebSocketServer = WebSocketServer;
ws.Server = WebSocketServer;
delete ws.Sender;
delete ws.Receiver;
delete ws.createWebSocketStream;

module.exports = ws;
