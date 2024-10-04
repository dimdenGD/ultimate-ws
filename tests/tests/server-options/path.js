// must support path option

const ws = require("ws");

const wss = new ws.WebSocketServer({ path: "/test", port: 8080 }, cb);

wss.on("connection", (ws, req) => {
    ws.on("message", (message) => {
        console.log(message);
    });
    ws.on("error", () => {})
});


function cb() {
    const c = new ws.WebSocket("ws://localhost:8080/test");
    c.on("open", () => {
        c.send("Hello from client!!!!!!!!!!!!!!!!!!!!!!!");
        setTimeout(() => {
            const c2 = new ws.WebSocket("ws://localhost:8080/test2");
            c2.on("error", (error) => {
                console.log(error.message.split(":")[0]);
                process.exit(0);
            });
        }, 100);
    });
}