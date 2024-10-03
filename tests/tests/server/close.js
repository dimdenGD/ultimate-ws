// must support close event

const ws = require("ws");

const wss = new ws.WebSocketServer({ port: 8080 }, cb);

wss.on("close", () => {
    console.log("Closed server");
    process.exit(0);
});

function cb() {
    const c = new ws.WebSocket("ws://localhost:8080");
    c.on("open", () => {
        console.log("Connected to server");
        c.close();
    });
    c.on("close", () => {
        console.log("Closed connection");
        process.exit(0);
    });
};