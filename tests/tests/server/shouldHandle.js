// must support server.shouldHandle

const ws = require("ws");

const wss = new ws.WebSocketServer({ port: 8080 }, cb);

wss.shouldHandle = (req) => {
    return false;
}

wss.on("connection", (ws, req) => {
    console.log('connected');
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
            console.log('closed');
            process.exit(0);
        }, 100);
    });
    c.on("error", (err) => {
        console.log(err.message);
    });
}