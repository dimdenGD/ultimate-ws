// must support ping

const ws = require("ws");

const wss = new ws.WebSocketServer({ port: 8080 }, client);

wss.on("connection", (ws, req) => {
    ws.ping();
});

function client() {
    const c = new ws.WebSocket("ws://localhost:8080");
    
    c.on("ping", () => {
        console.log("ping");
        process.exit(0);
    });
}