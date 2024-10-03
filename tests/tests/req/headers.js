// must support req.headers

const ws = require("ws");

const wss = new ws.WebSocketServer({ port: 8080 }, cb);

wss.on("connection", (ws, req) => {
    delete req.headers['sec-websocket-key'];
    console.log(req.headers);
});


function cb() {
    const c = new ws.WebSocket("ws://localhost:8080");
    c.on("open", () => {
        console.log("Connected to server");
        c.send("Hello from client");
        process.exit(0);
    });
}