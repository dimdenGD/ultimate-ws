module.exports = class IncomingMessage {
    #rawHeadersEntries = [];
    #cachedHeaders = null;
    #cachedDistinctHeaders = null;
    #cachedParsedIp = null;
    constructor(app, req, res) {
        this.app = app;
        this.req = req;
        this.res = res;
        this.urlQuery = req.getQuery() ?? '';
        if(this.urlQuery) {
            this.urlQuery = '?' + this.urlQuery;
        }
        this.url = req.getUrl() + this.urlQuery;
        this.method = req.getMethod();
        this.rawIp = res.getRemoteAddress();
        req.forEach((key, value) => {
            this.#rawHeadersEntries.push([key, value]);
        });
    }

    get parsedIp() {
        if(this.#cachedParsedIp) {
            return this.#cachedParsedIp;
        }
        let ip = '';
        if(this.rawIp.byteLength === 4) {
            // ipv4
            ip = this.rawIp.join('.');
        } else {
            // ipv6
            const dv = new DataView(this.rawIp);
            for(let i = 0; i < 8; i++) {
                ip += dv.getUint16(i * 2).toString(16).padStart(4, '0');
                if(i < 7) {
                    ip += ':';
                }
            }
        }
        this.#cachedParsedIp = ip;
        return ip;
    }

    get connection() {
        return {
            remoteAddress: this.parsedIp,
            localPort: this.app.port,
            remotePort: this.app.port,
            encrypted: this.app.ssl,
        };
    }

    get socket() {
        return this.connection;
    }

    get headers() {
        // https://nodejs.org/api/http.html#messageheaders
        if(this.#cachedHeaders) {
            return this.#cachedHeaders;
        }
        let headers = {};
        this.#rawHeadersEntries.forEach((val) => {
            const key = val[0].toLowerCase();
            const value = val[1];
            if(headers[key]) {
                if(discardedDuplicates.includes(key)) {
                    return;
                }
                if(key === 'cookie') {
                    headers[key] += '; ' + value;
                } else if(key === 'set-cookie') {
                    headers[key].push(value);
                } else {
                    headers[key] += ', ' + value;
                }
                return;
            }
            if(key === 'set-cookie') {
                headers[key] = [value];
            } else {
                headers[key] = value;
            }
        });
        this.#cachedHeaders = headers;
        return headers;
    }

    get headersDistinct() {
        if(this.#cachedDistinctHeaders) {
            return this.#cachedDistinctHeaders;
        }
        let headers = {};
        this.#rawHeadersEntries.forEach((val) => {
            if(!headers[val[0]]) {
                headers[val[0]] = [];
            }
            headers[val[0]].push(val[1]);
        });
        this.#cachedDistinctHeaders = headers;
        return headers;
    }

    get rawHeaders() {
        const res = [];
        this.#rawHeadersEntries.forEach((val) => {
            res.push(val[0], val[1]);
        });
        return res;
    }

    get httpVersion() {
        return '1.1';
    }

    get httpVersionMajor() {
        return 1;
    }

    get httpVersionMinor() {
        return 1;
    }
}