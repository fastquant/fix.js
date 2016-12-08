export class Session {
}
export class Client {
}

export interface IWebClientOptions {
    url: string
}
export class WebClient extends Client {
    private ws: WebSocket
    constructor(private options: IWebClientOptions) {
        super()
    }
    public connect() {
        this.ws = new WebSocket(this.options.url);
        this.ws.onopen = function (evt) {
        };
        this.ws.onclose = function (evt) {
        };
        this.ws.onmessage = function (evt) {
        };
        this.ws.onerror = function (evt) {
        };
    }
    getSession(key: string) {
        return new Session();
    }
}

export function createWebClient(options: IWebClientOptions): WebClient {
    return new WebClient(options);
}