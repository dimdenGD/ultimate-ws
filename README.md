# Ultimate WS

The *Ultimate* WebSocket server. Ultimate WS is an extremely fast, drop-in replacement for `ws` module, with support for [Ultimate Express](https://github.com/dimdenGD/ultimate-express) http upgrades. It uses [uWebSockets.js](https://github.com/uNetworking/uWebSockets.js) under the hood.  
  
It's useful when:
- You want same API as `ws` module, but the speed of `uWebSockets.js`
- You want to convert your Express app with `ws` to use [Ultimate Express](https://github.com/dimdenGD/ultimate-express) instead
    
[![Node.js >= 20.0.0](https://img.shields.io/badge/Node.js-%3E=20.0.0-green)](https://nodejs.org)
[![npm](https://img.shields.io/npm/v/ultimate-ws?label=last+version)](https://npmjs.com/package/ultimate-ws)
[![Patreon](https://img.shields.io/badge/donate-Patreon-orange)](https://patreon.com/dimdendev)

## Installation

1.
```bash
npm install ultimate-ws
```
2. Replace `ws` with `ultimate-ws` in your code
3. Check compatibility and differences below

## Performance

Echo test using `artillery` (duration: 20, arrivalRate: 10000):

| Module            | Send rate     | Mean Session length | Median Session length |
|-------------------|---------------|---------------------|-----------------------|
| `ws`              | 2709/sec      | 2535ms              | 127ms                 |
| **`ultimate-ws`** | **10046/sec** | **45ms**            | **12ms**              |

## Usage

### Use with [Ultimate Express](https://github.com/dimdenGD/ultimate-express)

Since you don't create `http` server for `ws` or `express`, you can't really use `server.on("upgrade", ...)` to upgrade to Ultimate WS. Instead, you can pass Ultimate Express or uWS app to `WebSocketServer` as option. So **instead** of doing this:
```js
const http = require("http");
const express = require("express");
const ws = require("ws");

const app = express();
const wsServer = new ws.WebSocketServer({ noServer: true });

app.get("/", (_, res) => res.send("Hello, world!"));

const server = http.createServer(app);
server.on("upgrade", (request, socket, head) => {
    const { pathname } = url.parse(request.url);
    if(pathname !== "/wspath") return request.socket.destroy();
    
    wsServer.handleUpgrade(request, socket, head, (ws) => {
        wsServer.emit("connection", ws, request);
    });
});

server.listen(3000);
```
You need to do this:
```js
const express = require("ultimate-express");
const app = express();
const { WebSocketServer } = require("ultimate-ws");

app.get("/", (_, res) => res.send("Hello, world!"));

const wsServer = new WebSocketServer({ server: app, path: "/wspath" }); // path is optional

// your usual `ws` server code ...

app.listen(3000);
```

[Ultimate Express](https://github.com/dimdenGD/ultimate-express) is fully compatible, much faster `express` implementation.

### Stand-alone usage

If you want to use Ultimate WS without any existing http server, you can do this:
```js
const { WebSocketServer } = require("ultimate-ws");

const wsServer = new WebSocketServer({ port: 3000 });

// your usual `ws` server code ...
wsServer.on("connection", (ws) => {
    ws.on("message", (message) => {
        ws.send(message);
    });
});
```

### Use with existing uWS server

You can also pass existing uWS server to `WebSocketServer`:
```js
const { WebSocketServer } = require("ultimate-ws");
const uws = require("uWebSockets.js");

const server = uws.App();
const wsServer = new WebSocketServer({ server: server });

// your usual `ws` server code ...

server.listen(3000);
```

## HTTPS

Ultimate WS supports HTTPS. You can pass `uwsOptions` to `WebSocketServer` to configure it:
```js
const { WebSocketServer } = require("ultimate-ws");

const wsServer = new WebSocketServer({
    port: 3000,
    uwsOptions: {
        // https://unetworking.github.io/uWebSockets.js/generated/interfaces/AppOptions.html
        key_file_name: "path/to/key.pem",
        cert_file_name: "path/to/cert.pem",
    }
});
```

## Handling requests before connection

Instead of this:

```js
const http = require("http");
const express = require("express");
const ws = require("ws");

const app = express();
const wsServer = new ws.WebSocketServer({ noServer: true, path: "/wspath" });

app.get("/", (_, res) => res.send("Hello, world!"));

const server = http.createServer(app);
server.on("upgrade", async (request, socket, head) => {
    // your auth logic
    const user = await getUserFromDatabase(request.headers['authorization']);
    if(!user) return socket.destroy();
    
    wsServer.handleUpgrade(request, socket, head, (ws) => {
        ws.user = user;
        wsServer.emit("connection", ws, request);
    });
});

server.listen(3000);
```

You should do this:
```js
const { WebSocketServer } = require("ultimate-ws");
const express = require("ultimate-express");

const app = express();

const wsServer = new WebSocketServer({
    server: app,
    path: "/wspath",
    handleUpgrade: async (request) => {
        // your auth logic
        const user = await getUserFromDatabase(request.headers['authorization']);
        if(!user) {
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
        }
    }
});

app.get("/", (_, res) => res.send("Hello, world!"));

app.listen(3000);
```

- if `handleUpgrade` returns a function, it will be called with the new `WebSocket` instance and original request. "connection" will not be emitted automatically.
- if it returns `false`, the connection will not be upgraded. It's your responsibility to destroy the socket.
- if it returns nothing or anything else, the connection will be handled as usual, and "connection" event will be emitted.
- By default (`handleUpgrade: undefined`), the connection will be handled as usual, and "connection" event will be emitted.
  
## Compatibility

All commonly used `ws` features are supported. Almost all ws servers should work, as it's built with maximum compatibility in mind.
Please refer to [ws module documentation](https://github.com/websockets/ws) for API reference.
Below is the list of supported features and their compatibility:  

✅ - Full support (all features and options are supported)  
🚧 - Partial support (some features are not supported)  
❌ - Not supported  

#### WebSocket

- ✅ WebSocket
- ✅ WebSocket.Server
- ✅ WebSocket.WebSocket
- ✅ WebSocket.WebSocketServer
- ✅ WebSocket.CONNECTING
- ✅ WebSocket.OPEN
- ✅ WebSocket.CLOSING
- ✅ WebSocket.CLOSED
- ✅ WebSocket.createWebSocketStream

### Server

#### Server options

`ws` options:

- ✅ autoPong (maps to uWS `sendPingsAutomatically`, default `true`)
- ✅ allowSynchronousEvents (may lower performance when `false`, default `true`)
- ✅ clientTracking
- ✅ handleProtocols
- ✅ host
- ✅ maxPayload (default 100mb)
- ✅ path
- 🚧 perMessageDeflate - pass `true` for `DEDICATED_COMPRESSOR_4KB | DEDICATED_DECOMPRESSOR` or your own [`CompressOptions`](https://unetworking.github.io/uWebSockets.js/generated/types/CompressOptions.html) number. Options are not supported and if this is an object it will be treated as `true`.
- ✅ port
- ✅ server
- ✅ verifyClient
- ✅ WebSocket
- ✅ callback
- ❌ noServer - see examples above for alternatives
- ❌ skipUTF8Validation - uWS always validates UTF-8 when message is a string
- ❌ backlog

`uWS` options (additional options that `ws` doesn't have):  

- ✅ maxBackpressure (default `maxPayload`)
- ✅ idleTimeout (default 120)
- ✅ maxLifetime (default 0)
- ✅ closeOnBackpressureLimit (default `false`)

#### Server events

- ✅ close
- ✅ connection
- ✅ headers
- ✅ listening
- ✅ error - µWS never throws errors
- ✅ wsClientError - µWS never throws errors

#### Server properties

- ✅ server.address()
- ✅ server.clients
- ✅ server.close(callback)
- ✅ server.shouldHandle(request)
- ❌ server.handleUpgrade(request, socket, head, callback) - see examples above for alternatives

### Client

This category only describes server clients. Client-side (`new ws.WebSocket()`) just uses original `ws` module, and therefore supports everything.

#### Client events

- ✅ close
- ✅ message
- ✅ ping
- ✅ pong
- ✅ dropped - this event only exists in Ultimate WS for handling dropped messages
- ✅ drain - this event only exists in Ultimate WS for handling backpressure draining
- ✅ error - µWS never throws errors

#### Client properties

- ✅ client.addEventListener(type, listener, options)
- ✅ client.binaryType
- ✅ client.bufferedAmount
- ✅ client.close(code, reason)
- ✅ client.isPaused
- ✅ client.extensions
- ✅ client.onclose
- ✅ client.onerror
- ✅ client.onmessage
- ✅ client.onopen
- ✅ client.pause()
- 🚧 client.ping()
- ❌ client.pong(data, mask, callback) - pongs are handled automatically, method does nothing
- ✅ client.protocol
- ✅ client.resume()
- ✅ client.readyState
- ✅ client.removeEventListener(type, listener)
- 🚧 client.send(data, options, callback) - returns 1 for success, 2 for dropped due to backpressure limit, 0 for built up backpressure that will drain over time. Callback will only get error if it returns 2.
- - ✅ options.binary
- - ✅ options.compress
- - ❌ options.fin
- - ❌ options.mask
- ✅ client.terminate()
