// must support verifyClient option callback

const ws = require("ws");

const wss = new ws.WebSocketServer({
    port: 8080,
    verifyClient: (info, cb) => {
        console.log(info.origin, info.secure, info.req.headers['sec-websocket-extensions']);
        cb(true);
    }
}, cb);

wss.on("connection", (ws, req) => {
    ws.on("message", (message) => {
        console.log('server', message);
        ws.send("Hello from server!!!!!!!!!!!!!!!!!!!!!!!");
    });
});


function cb() {
    const c = new ws.WebSocket("ws://localhost:8080", {
        finishRequest: (req) => {
            req.setHeader('origin', 'http://localhost:8080');
            req.end();
        }
    });
    c.on("open", () => {
        c.send("Hello from client!!!!!!!!!!!!!!!!!!!!!!!");
        console.log(c.extensions);
    });
    c.on("message", (message) => {
        console.log('client', message);
        setTimeout(() => {
            process.exit(0);
        }, 100);
    });
}