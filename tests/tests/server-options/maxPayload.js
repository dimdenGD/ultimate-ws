// must support maxPayload option

const ws = require("ws");

const wss = new ws.WebSocketServer({ port: 8080, maxPayload: 10 }, cb);

wss.on("connection", (ws, req) => {
    ws.on("message", (message) => {
        console.log(message);
    });
    ws.on("error", () => {})
});


function cb() {
    const c = new ws.WebSocket("ws://localhost:8080");
    c.on("open", () => {
        c.send("Hello from client!!!!!!!!!!!!!!!!!!!!!!!");
        setTimeout(() => {
            process.exit(0);
        }, 100);
    });
}