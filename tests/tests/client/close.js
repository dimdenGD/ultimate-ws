// must support close

const ws = require("ws");

const wss = new ws.WebSocketServer({ port: 8080 }, client);

wss.on("connection", (ws, req) => {
    ws.close(1000, "test");
});

function client() {
    const c = new ws.WebSocket("ws://localhost:8080");
    c.on("close", (code, reason) => {
        console.log(code, reason);
        process.exit(0);
    });
}