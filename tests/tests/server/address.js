// must support server.address()

const ws = require("ws");

const wss = new ws.WebSocketServer({ port: 8080 });

wss.on("listening", () => {
    console.log(wss.address());
    process.exit(0);
});
