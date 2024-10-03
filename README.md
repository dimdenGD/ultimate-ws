# Ultimate WS

The *Ultimate* WebSocket server. Ultimate WS is a faster replacement for `ws` module, with support for [Ultimate Express](https://github.com/dimdenGD/ultimate-express) http upgrades. It uses [uWebSockets.js](https://github.com/uNetworking/uWebSockets.js) under the hood.  
  
It's useful when:
- You want same API as `ws` module, but the speed of `uWebSockets.js`
- You want to convert your Express app with `ws` to use [Ultimate Express](https://github.com/dimdenGD/ultimate-express) instead

`npm install ultimate-ws`

## Compatibility

WIP

✅ - Full support (all features and options are supported)  
🚧 - Partial support (some options are not supported)  
❌ - Not supported  

### WebSocket

- ✅ WebSocket
- ✅ WebSocket.Server
- ✅ WebSocket.WebSocket
- ✅ WebSocket.WebSocketServer
- ✅ WebSocket.CONNECTING
- ✅ WebSocket.OPEN
- ✅ WebSocket.CLOSING
- ✅ WebSocket.CLOSED
- ❌ WebSocket.createWebSocketStream
- ❌ WebSocket.Receiver
- ❌ WebSocket.Sender

### Server options

- ❌ autoPong
- ❌ allowSynchronousEvents 
- ❌ backlog
- ✅ clientTracking
- ❌ handleProtocols
- ❌ host
- ❌ maxPayload
- ❌ noServer
- ✅ path
- ❌ perMessageDeflate
- - ❌ serverNoContextTakeover
- - ❌ clientNoContextTakeover
- - ❌ serverMaxWindowBits
- - ❌ clientMaxWindowBits
- - ❌ zlibDeflateOptions
- - ❌ zlibInflateOptions
- - ❌ threshold
- - ❌ concurrencyLimit
- ✅ port
- ✅ server
- ❌ skipUTF8Validation 
- ❌ verifyClient
- ❌ WebSocket
- ✅ callback

### Server events

- ✅ close
- ✅ connection
- ✅ headers
- ✅ listening
- 🚧 error - uWS never throws errors
- 🚧 wsClientError - uWS never throws errors

### Server properties

- ✅ server.address()
- ✅ server.clients
- ✅ server.close(callback)
- ❌ server.handleUpgrade(request, socket, head, callback) - this is unneeded. Just pass `server` (uWS.App or [µExpress app](https://github.com/dimdenGD/ultimate-express)) to `WebSocketServer` as option. See above for example.
- ❌ server.shouldHandle(request)

### Client events

- ✅ close
- ✅ message
- ✅ ping
- ✅ pong
- 🚧 error - uWS never throws errors

### Client properties

- ❌ client.addEventListener(type, listener, options)
- ❌ client.binaryType
- ❌ client.bufferedAmount
- ❌ client.close(code, reason)
- ❌ client.isPaused
- ❌ client.extensions
- ❌ client.onclose
- ❌ client.onerror
- ❌ client.onmessage
- ❌ client.onopen
- ❌ client.pause()
- ❌ client.ping(data, mask, callback)
- ❌ client.pong(data, mask, callback)
- ❌ client.protocol
- ❌ client.resume()
- ❌ client.readyState
- ❌ client.removeEventListeners(type, listener)
- ❌ client.send(data, options, callback)
- ❌ client.terminate()
