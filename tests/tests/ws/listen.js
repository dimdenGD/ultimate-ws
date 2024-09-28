// must listen on port

const ws = require("ws");

const wss = new ws.WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
    ws.on("message", (message) => {
        console.log(message);
    });
});

setTimeout(() => {
    const c = new ws.WebSocket("ws://localhost:8080");
    c.on("open", () => {
        console.log("Connected to server");
        c.send("Hello from client");
    });
}, 500);
