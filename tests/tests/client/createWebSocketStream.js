// must support createWebSocketStream

const ws = require("ws");

const wss = new ws.WebSocketServer({ port: 8080 }, client);

wss.on("connection", (wsc, req) => {
    const stream = ws.createWebSocketStream(wsc);
    stream.on("data", (data) => {
        console.log("server", data.toString());
        stream.write("Hello from server!!!!!!!!!!!!!!!!!!!!!!!");
    });
});

function client() {
    const c = new ws.WebSocket("ws://localhost:8080");
    c.on("open", () => {
        c.send("Hello from client!!!!!!!!!!!!!!!!!!!!!!!");
    });

    c.on("message", (message) => {
        console.log("client", message.toString());
        process.exit(0);
    });
}