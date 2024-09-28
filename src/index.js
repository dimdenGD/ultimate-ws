const ws = require("ws");
const uws = require("uWebSockets.js");

class WebSocketServer {
    constructor(options) {
    }
}

ws.WebSocketServer = WebSocketServer;
ws.Server = WebSocketServer;
delete ws.Sender;
delete ws.Receiver;
delete ws.createWebSocketStream;

module.exports = ws;
