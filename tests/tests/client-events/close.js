// must support client close event

const ws = require("ws");

const wss = new ws.WebSocketServer({ port: 8080 }, client);

wss.on("connection", (ws, req) => {
    ws.on("message", data => {
        console.log('1');
    });
    ws.on("close", () => {
        console.log("Client disconnected");
        process.exit(0);
    });
});

function client() {
    const c = new ws.WebSocket("ws://localhost:8080");

    c.on('open', () => {
        c.send("Hello from client");
        c.close();
    });
}