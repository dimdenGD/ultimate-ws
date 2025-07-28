const ws = require("ws");

const wsServer = new ws.WebSocketServer({
  port: 8080,
  path: "/wspath",
  handleUpgrade: async (request) => {
    // your auth logic
    const user = await getUserFromDatabase(request.headers["authorization"]);
    if (!user) {
      // request has `req` and `res` properties
      // which are instances of `uws.HttpRequest` and `uws.HttpResponse`
      request.res.cork(() => {
        request.res.writeStatus("401 Unauthorized");
        request.res.end();
      });
      return false;
    }

    return (ws, request) => {
      ws.user = user;
      wsServer.emit("connection", ws, request);
    };
  },
}, client);

// Fake async database lookup for demonstration
async function getUserFromDatabase(authHeader) {
  // Simulate some async delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Very naive check -- you can expand as needed
  if (authHeader === "Bearer FAKE_TOKEN") {
    // Fake user object returned from the "database"
    return {
      id: "user123",
      name: "Test User",
      roles: ["user"],
    };
  }
  // No user found for this token
  return null;
}

function client() {
    const c = new ws.WebSocket("ws://localhost:8080/wspath", {
        headers: {
            authorization: "Bearer FAKE_TOKEN"
        }
    });

    c.on('open', () => {
        c.send("Hello from client");
        setTimeout(() => {
            process.exit(0);
        }, 100);
    });
}
