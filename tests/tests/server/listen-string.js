// must listen on string port

const ws = require("ws");

const wss = new ws.WebSocketServer({ port: "8080" }, () => {
    const c = new ws.WebSocket("ws://localhost:8080");
    c.on("open", () => {
        console.log("Connected to server");
        process.exit(0);
    });
}, 500);
