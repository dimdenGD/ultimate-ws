// must support client addEventListener

const ws = require("ws");

const wss = new ws.WebSocketServer({ port: 8080 }, client);

wss.on("connection", (ws, req) => {
    const fn = (event) => {
        console.log(event.data);
    };
    ws.addEventListener("message", fn);
    ws.removeEventListener("message", fn);
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