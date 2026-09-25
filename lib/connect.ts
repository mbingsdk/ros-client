import { EventEmitter } from "events";
import * as net from "net";
import * as tls from "tls";
import * as iconv from "iconv-lite";

// ===================== TYPE DEFINITIONS =====================

interface RouterOSClientOptions {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  timeout?: number;
  tls?: boolean;
  debug?: boolean;
}

interface RouterOSResponse {
  error: string | null;
  data: RouterOSData[];
  raw: string[][];
}

type RouterOSData = Record<string, string>;

type ResponseCallback = (response: RouterOSResponse) => void;

// ===================== ROUTEROS CLIENT =====================

export class RouterOSClient extends EventEmitter {
  private host: string;
  private port: number;
  private username: string;
  private password: string;
  private timeout: number;
  private tls: boolean;
  private socket: net.Socket | tls.TLSSocket | null;
  private connected: boolean;
  private buffer: Buffer;
  private currentRequest: ResponseCallback | null;
  private debug: boolean;
  private sentences: string[][];
  private currentSentence: string[] | null;

  constructor(options: RouterOSClientOptions = {}) {
    super();
    this.host = options.host || "192.168.88.1";
    this.port = options.port || 8728;
    this.username = options.username || "admin";
    this.password = options.password || "";
    this.timeout = options.timeout || 10000;
    this.tls = options.tls || false;

    this.socket = null;
    this.connected = false;
    this.buffer = Buffer.alloc(0);
    this.currentRequest = null;
    this.debug = options.debug || false;
    this.sentences = [];
    this.currentSentence = null;
  }

  connect(): Promise<RouterOSClient> {
    return new Promise((resolve, reject) => {
      if (this.socket) {
        this.socket.destroy();
        this.socket = null;
      }

      const timeoutId = setTimeout(() => {
        if (this.socket) {
          this.socket.destroy();
          this.socket = null;
        }
        reject(new Error("Connection timeout"));
      }, this.timeout);

      if (this.tls) {
        this.socket = tls.connect({
          host: this.host,
          port: this.port || 8729,
          rejectUnauthorized: false,
        });
      } else {
        this.socket = net.createConnection({
          host: this.host,
          port: this.port || 8728,
        });
      }

      this.socket.on("connect", () => {
        clearTimeout(timeoutId);
        if (this.debug) console.log("Socket connected");
        this._login().then(resolve).catch(reject);
      });

      this.socket.on("data", (data: Buffer) => {
        this.buffer = Buffer.concat([this.buffer, data]);
        this._parseResponse();
      });

      this.socket.on("error", (err: Error) => {
        clearTimeout(timeoutId);
        this.emit("error", err);
        reject(err);
      });

      this.socket.on("close", () => {
        this.connected = false;
        this.emit("close");
      });
    });
  }

  private _login(): Promise<RouterOSClient> {
    return new Promise((resolve, reject) => {
      this.sentences = [];

      this._sendCommand(["/login"], (response: RouterOSResponse) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }

        if (this.debug) console.log("Login response:", response);

        this._sendCommand(
          ["/login", `=name=${this.username}`, `=password=${this.password}`],
          (loginResponse: RouterOSResponse) => {
            if (this.debug) console.log("Auth response:", loginResponse);

            if (loginResponse.error) {
              reject(new Error(loginResponse.error));
            } else {
              this.connected = true;
              this.emit("connected");
              resolve(this);
            }
          }
        );
      });
    });
  }

  send(words: string[]): Promise<RouterOSData[]> {
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        reject(new Error("Not connected"));
        return;
      }

      this.sentences = [];

      this._sendCommand(words, (response: RouterOSResponse) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.data);
        }
      });
    });
  }

  close(): Promise<void> {
    return new Promise((resolve) => {
      if (this.socket) {
        this.socket.end();
        this.socket.on("close", () => {
          this.socket = null;
          this.connected = false;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  private _parseResponse(): void {
    while (this.buffer.length > 0) {
      const length = this._readLength();
      if (length === null) break;

      if (length === 0) {
        if (!this.currentSentence) {
          this.currentSentence = [];
        }

        if (this.currentSentence.length > 0) {
          this.sentences.push(this.currentSentence);
        }

        this.currentSentence = [];

        const lastSentence = this.sentences[this.sentences.length - 1];
        if (lastSentence && lastSentence[0] === "!done") {
          this._processCompleteResponse();
        }
      } else {
        if (this.buffer.length < length) break;

        const word = iconv.decode(this.buffer.slice(0, length), "utf-8");
        this.buffer = this.buffer.slice(length);

        if (!this.currentSentence) {
          this.currentSentence = [];
        }

        this.currentSentence.push(word);
      }
    }
  }

  private _processCompleteResponse(): void {
    if (!this.currentRequest) return;

    const callback = this.currentRequest;
    this.currentRequest = null;

    let error: string | null = null;
    for (const sentence of this.sentences) {
      if (sentence[0] === "!trap") {
        const msgItem = sentence.find((word) => word.startsWith("=message="));
        if (msgItem) {
          error = msgItem.substring(9);
        } else {
          error = "Unknown error";
        }
        break;
      }
    }

    const data: RouterOSData[] = [];
    for (const sentence of this.sentences) {
      if (sentence[0] === "!re") {
        const item: RouterOSData = {};
        for (const word of sentence.slice(1)) {
          if (word.startsWith("=")) {
            const equalPos = word.indexOf("=", 1);
            if (equalPos !== -1) {
              const key = word.substring(1, equalPos);
              const value = word.substring(equalPos + 1);
              item[key] = value;
            }
          }
        }
        if (Object.keys(item).length > 0) {
          data.push(item);
        }
      }
    }

    const rawSentences = [...this.sentences];
    this.sentences = [];

    callback({
      error: error,
      data: data,
      raw: rawSentences,
    });
  }

  private _readLength(): number | null {
    if (this.buffer.length < 1) return null;

    const b = this.buffer[0];
    let len: number;
    let size: number;

    if ((b & 0x80) === 0x00) {
      len = b;
      size = 1;
    } else if ((b & 0xc0) === 0x80) {
      if (this.buffer.length < 2) return null;
      len = ((b & ~0xc0) << 8) + this.buffer[1];
      size = 2;
    } else if ((b & 0xe0) === 0xc0) {
      if (this.buffer.length < 3) return null;
      len = ((b & ~0xe0) << 16) + (this.buffer[1] << 8) + this.buffer[2];
      size = 3;
    } else if ((b & 0xf0) === 0xe0) {
      if (this.buffer.length < 4) return null;
      len =
        ((b & ~0xf0) << 24) +
        (this.buffer[1] << 16) +
        (this.buffer[2] << 8) +
        this.buffer[3];
      size = 4;
    } else if (b === 0xf0) {
      if (this.buffer.length < 5) return null;
      len =
        (this.buffer[1] << 24) +
        (this.buffer[2] << 16) +
        (this.buffer[3] << 8) +
        this.buffer[4];
      size = 5;
    } else {
      throw new Error("Invalid length byte");
    }

    if (this.buffer.length < size) return null;

    this.buffer = this.buffer.slice(size);
    return len;
  }

  private _writeLength(length: number): Buffer {
    const bytes: number[] = [];

    while (true) {
      let byte = length & 0x7f;
      length = length >> 7;

      if (length === 0) {
        bytes.push(byte);
        break;
      } else {
        bytes.push(byte | 0x80);
      }
    }

    return Buffer.from(bytes);
  }

  private _encodeWord(word: string): Buffer {
    const wordBuf = Buffer.from(word, "utf8");
    const lengthBuf = this._writeLength(wordBuf.length);
    return Buffer.concat([lengthBuf, wordBuf]);
  }

  private _sendCommand(words: string[], callback: ResponseCallback): void {
    this.currentRequest = callback;

    const data = Buffer.concat([
      ...words.map((word) => this._encodeWord(word)),
      this._writeLength(0),
    ]);

    this.socket!.write(data);
  }
}

// ===================== EXPORTS =====================

export type {
  RouterOSClientOptions,
  RouterOSResponse,
  RouterOSData,
  ResponseCallback,
};