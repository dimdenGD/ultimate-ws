// must support protocol

const ws = require("ws");

const wss = new ws.WebSocketServer({ port: 8080 }, client);

wss.on("connection", (ws, req) => {
    console.log([ws.protocol, req.headers["sec-websocket-protocol"]]);
    process.exit(0);
});

function client() {
    new ws.WebSocket("ws://localhost:8080", ["test", "test2"]);
}