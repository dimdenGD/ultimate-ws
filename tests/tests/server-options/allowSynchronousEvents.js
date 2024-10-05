// must support allowSynchronousEvents option

const ws = require("ws");

const wss = new ws.WebSocketServer({ port: 8080, allowSynchronousEvents: false }, client);

wss.on("connection", (ws, req) => {
    ws.on("message", (data, isBinary) => {
        console.log(data, isBinary);
    });
});

function client() {
    const c = new ws.WebSocket("ws://localhost:8080");

    c.on('open', () => {
        c.send("Hello from client");
        c.send(new TextEncoder().encode("Binary hello from client"));
        setTimeout(() => {
            process.exit(0);
        }, 100);
    });
}