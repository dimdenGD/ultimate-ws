// must support pause and resume

const ws = require("ws");

const wss = new ws.WebSocketServer({ port: 8080 }, client);

let w;
wss.on("connection", (ws, req) => {
    w = ws;
    ws.on("message", (data) => {
        console.log(data);
    });
    ws.pause();
});

function client() {
    const c = new ws.WebSocket("ws://localhost:8080");
    c.on("open", () => {
        c.send("test");
        setTimeout(() => {
            console.log("resuming", w.isPaused);
            w.resume();
        }, 100);
    });
}