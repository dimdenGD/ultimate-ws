// must support verifyClient option callback false

const ws = require("ws");

const wss = new ws.WebSocketServer({
    port: 8080,
    verifyClient: (info, cb) => {
        console.log(info.origin, info.secure, info.req.headers['sec-websocket-extensions']);
        cb(false, 403, "Forbidden", {
            'x-test': 'test',
        });
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
    c.on("error", (error) => {
        console.log(error.message);
        process.exit(1);
    });
}