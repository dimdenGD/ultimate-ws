// must support extensions

const ws = require("ws");

const wss = new ws.WebSocketServer({ port: 8080, perMessageDeflate: true }, client);

wss.on("connection", (ws, req) => {
    console.log([ws.extensions, req.headers["sec-websocket-extensions"]]);
    process.exit(0);
});

function client() {
    new ws.WebSocket("ws://localhost:8080");
}