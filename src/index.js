const ws = require("ws");
const WebSocketServer = require("./server.js");

ws.WebSocketServer = WebSocketServer;
ws.Server = WebSocketServer;

module.exports = ws;
