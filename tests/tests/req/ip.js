// must support req.ip

const ws = require("ws");

const wss = new ws.WebSocketServer({ port: 8080 }, cb);

wss.on("connection", (ws, req) => {
    console.log(req.connection.remoteAddress.replace('0000:0000:0000:0000:0000:0000:0000:000', "::"));
});


function cb() {
    const c = new ws.WebSocket("ws://localhost:8080");
    c.on("open", () => {
        console.log("Connected to server");
        process.exit(0);
    });
}