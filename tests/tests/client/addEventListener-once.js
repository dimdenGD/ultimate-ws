// must support client addEventListener once

const ws = require("ws");

const wss = new ws.WebSocketServer({ port: 8080 }, client);

wss.on("connection", (ws, req) => {
    ws.addEventListener("message", (event) => {
        console.log(event.data);
    }, { once: true });
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