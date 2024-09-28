const ws = require("ws");
const uWS = require("uWebSockets.js");

class WebSocketServer {
    constructor(options = {}, callback) {
        if(!settings?.uwsOptions) {
            settings.uwsOptions = {};
        }

        if(settings.uwsOptions.key_file_name && settings.uwsOptions.cert_file_name) {
            this.uwsApp = uWS.SSLApp(settings.uwsOptions);
            this.ssl = true;
        } else {
            this.uwsApp = uWS.App(settings.uwsOptions);
            this.ssl = false;
        }
    }
}

ws.WebSocketServer = WebSocketServer;
ws.Server = WebSocketServer;
delete ws.Sender;
delete ws.Receiver;
delete ws.createWebSocketStream;

module.exports = ws;
