const ws = require("ws");
const WebSocketServer = require("./server.js");

ws.WebSocketServer = WebSocketServer;
ws.Server = WebSocketServer;
delete ws.Sender;
delete ws.Receiver;
delete ws.createWebSocketStream;

module.exports = ws;
