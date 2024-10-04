// must support handleProtocols option

const ws = require("ws");

const wss = new ws.WebSocketServer({
    port: 8080,
    handleProtocols: (protocols, req) => {
        console.log('protocols:', protocols);
        return protocols.has("protocol2") ? "protocol2" : "protocol1";
    }
 }, cb);

function cb() {
    const c = new ws.WebSocket("ws://localhost:8080", ["protocol1", "protocol2"]);
    c.on("open", () => {
        console.log("Connected to server");
        console.log('protocol:', c.protocol);
        process.exit(0);
    });
    c.on("error", (err) => {
        console.log(err);
        process.exit(1);
    });
}