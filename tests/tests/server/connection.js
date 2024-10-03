// must support connection event

const ws = require("ws");

const wss = new ws.WebSocketServer({ port: 8080 }, cb);

wss.on("connection", (ws, req) => {
    console.log("Connection event", req.headers['host']);
});


function cb() {
    const c = new ws.WebSocket("ws://localhost:8080");
    c.on("open", () => {
        console.log("Connected to server");
        c.send("Hello from client");
        process.exit(0);
    });
}