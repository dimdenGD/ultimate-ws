// must support server.clients

const ws = require("ws");

const wss = new ws.WebSocketServer({ port: 8080 }, cb);

wss.on("connection", (ws, req) => {
    console.log(wss.clients.size);
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
            console.log(wss.clients.size);
            process.exit(0);
        }, 100);
    });
}