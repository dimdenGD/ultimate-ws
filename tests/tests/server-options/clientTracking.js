// must support clientTracking option

const ws = require("ws");

const wss = new ws.WebSocketServer({ port: 8080, clientTracking: false }, cb);

wss.on("connection", (ws, req) => {
    console.log(wss.clients);
});


function cb() {
    const c = new ws.WebSocket("ws://localhost:8080");
    c.on("open", () => {
        console.log("Connected to server");
        c.send("Hello from client");
        c.close();
    });
    c.on("close", () => {
        setTimeout(() => {
            console.log(wss.clients);
            process.exit(0);
        }, 100);
    });
}