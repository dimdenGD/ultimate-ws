import ws from 'ws';
import uWS from 'uWebSockets.js';
import {IncomingMessage} from 'http';

declare namespace WebSocket {
    type HandleUpgradeResult<T, U> = (ws: T, request: U) => void | false | void;
    type UExpressApp = {uwsApp: uWS.TemplatedApp, [key: string]: any};

    interface ServerOptions<
        T extends typeof WebSocketClient = typeof WebSocketClient,
        U extends typeof IncomingMessage = typeof IncomingMessage,
    > extends Omit<ws.ServerOptions<T, U>, 'noServer' | 'skipUTF8Validation' | 'backlog'> {
        // pass true for DEDICATED_COMPRESSOR_4KB | DEDICATED_DECOMPRESSOR or your own CompressOptions number.
        // Options are not supported and if this is an object it will be treated as true.
        // https://github.com/uNetworking/uWebSockets.js/blob/master/docs/index.d.ts#L360-L361
        perMessageDeflate?: boolean | uWS.CompressOptions | ws.PerMessageDeflateOptions;

        uwsOptions?: uWS.AppOptions;
        server?: UExpressApp | uWS.TemplatedApp;

        /**
         * Custom upgrade handler
         * By default (handleUpgrade: undefined), the connection will be handled as usual, and "connection" event will be emitted.
         * @returns 
         *  - function: Callback to handle the WebSocket instance manually
         *  - false: Reject the connection (remember to destroy the socket)
         *  - void/other: Handle normally, will emit 'connection' event
         */
        handleUpgrade?: (request: T) => Promise<HandleUpgradeResult<T, U>> | HandleUpgradeResult<T, U>;
    }

    class WebSocketServer<
        T extends typeof WebSocketClient = typeof WebSocketClient,
        U extends typeof IncomingMessage = typeof IncomingMessage,
    > extends ws.Server<T, U> {
        constructor(options: WebSocket.ServerOptions<T, U>);

        readonly uwsApp: uWS.TemplatedApp;
        // Override ws.Server's handleUpgrade to prevent usage
        // passing a custom handleUpgrade function in constructor option for alternatives.
        override handleUpgrade: never;
    }

    type SendReturnType = 0 | 1 | 2;
    interface SendOptions {
        binary?: boolean;
        compress?: boolean;
    }

    class WebSocketClient extends ws.WebSocket {
        /**
         * Send a message. Support binary/compress options only.
         * Callback will only get error if it returns 2
         * @returns 
         *  - 1 for success
         *  - 2 for dropped due to backpressure limit
         *  - 0 for built up backpressure that will drain over time.
         */
        override send(
            message: uWS.RecognizedString,
            callback?: (err?: Error) => void,
        ): SendReturnType; 
        override send(
            message: uWS.RecognizedString,
            options: SendOptions, callback?: (err?: Error) => void,
        ): SendReturnType;

        override ping(data?: uWS.RecognizedString): void;
        override pong(): void;
    }
}

export = {
    ...ws,
    Server: WebSocket.WebSocketServer,
    WebSocketServer: WebSocket.WebSocketServer,
};