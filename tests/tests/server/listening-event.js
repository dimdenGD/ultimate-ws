// must emit listening event

const ws = require("ws");

const wss = new ws.WebSocketServer({ port: 8080 });

wss.on("listening", () => {
    console.log("Listening event");
    process.exit(0);
});
