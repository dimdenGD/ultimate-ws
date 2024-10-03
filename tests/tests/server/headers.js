// must support headers event

const ws = require("ws");

const wss = new ws.WebSocketServer({ port: 8080 }, cb);

wss.on("connection", (ws, req) => {
    console.log("Connection event");
});

wss.on("headers", (headers) => {
    headers.push('X-Test: 123');
});


function cb() {
    const c = new ws.WebSocket("ws://localhost:8080");
    c.on("open", () => {
        console.log("Connected to server");
        c.send("Hello from client");
        process.exit(0);
    });
    c.on("upgrade", (req, socket, head) => {
        console.log("Upgrade event", req.headers['x-test']);
    });
}