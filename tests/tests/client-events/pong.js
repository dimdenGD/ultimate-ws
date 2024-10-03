// must support client pong event

const ws = require("ws");

const wss = new ws.WebSocketServer({ port: 8080 }, client);

wss.on("connection", (ws, req) => {
    ws.on("pong", data => {
        console.log(data.toString());
    });
});

function client() {
    const c = new ws.WebSocket("ws://localhost:8080");

    c.on('open', () => {
        c.send("Hello from client");
        c.pong("Pong from client");
        setTimeout(() => {
            process.exit(0);
        }, 100);
    });
}