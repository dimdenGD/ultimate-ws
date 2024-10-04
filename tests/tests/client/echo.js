// echo test

const ws = require("ws");

const wss = new ws.WebSocketServer({ port: 13333 }, client);

wss.on("connection", (ws, req) => {
    ws.on("message", (data, isBinary) => {
        ws.send(data, { binary: isBinary });
    });
});

function client() {
    const c = new ws.WebSocket("ws://localhost:13333");

    c.on("message", (data, isBinary) => {
        console.log(data, isBinary);
    });

    c.on('open', () => {
        c.send("Hello from client");
        c.send(new TextEncoder().encode("Binary hello from client"));
        setTimeout(() => {
            process.exit(0);
        }, 100);
    });
}