// must support ping

const ws = require("ws");

const wss = new ws.WebSocketServer({ port: 8080 }, client);

wss.on("connection", (ws, req) => {
    ws.send("test", {}, (err) => {
        console.log(err);
    });
});

function client() {
    const c = new ws.WebSocket("ws://localhost:8080");
    
    c.on("message", (msg) => {
        console.log(msg);
        process.exit(0);
    });
}