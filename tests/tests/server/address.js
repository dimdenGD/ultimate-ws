// must support server.address()

const ws = require("ws");

const wss = new ws.WebSocketServer({ port: '/test' });

wss.on("listening", () => {
    process.exit(0);
});
