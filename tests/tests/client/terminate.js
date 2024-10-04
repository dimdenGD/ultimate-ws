// must support terminate

const ws = require("ws");

const wss = new ws.WebSocketServer({ port: 8080 }, client);

wss.on("connection", (ws, req) => {
    ws.on("close", () => {
        console.log('server closed');
    });
    ws.terminate();
});

function client() {
    const c = new ws.WebSocket("ws://localhost:8080");
    c.on("close", () => {
        console.log('client closed');
        process.exit(0);
    });
    c.on("error", () => {});
}