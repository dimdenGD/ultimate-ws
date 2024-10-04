// must support readyState

const ws = require("ws");

const wss = new ws.WebSocketServer({ port: 8080 }, client);

wss.on("connection", (ws, req) => {
    console.log(ws.readyState, ws.CONNECTING);
    ws.on("close", () => {
        console.log(ws.readyState, ws.CLOSED);
        process.exit(0);
    });
});

function client() {
    const w = new ws.WebSocket("ws://localhost:8080");
    w.on("open", () => {
        console.log(w.readyState, w.OPEN);
        w.close();
    });
}