// must support bufferedAmount

const ws = require("ws");

const wss = new ws.WebSocketServer({ port: 8080 }, client);

wss.on("connection", (ws, req) => {
    console.log(ws.bufferedAmount);
    process.exit(0);
});

function client() {
    const c = new ws.WebSocket("ws://localhost:8080");

}