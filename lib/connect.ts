import { EventEmitter } from "events";
import * as net from "net";
import * as tls from "tls";

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

type LengthFrame = {
  length: number;
  size: number;
};

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
  private currentSentence: string[];

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
    this.currentSentence = [];
  }

  connect(): Promise<RouterOSClient> {
    return new Promise((resolve, reject) => {
      if (this.socket) {
        this.socket.destroy();
        this.socket = null;
      }

      this.buffer = Buffer.alloc(0);
      this.sentences = [];
      this.currentSentence = [];
      this.currentRequest = null;

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
        try {
          this._parseResponse();
        } catch (err) {
          this.emit("error", err);
        }
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
      this.currentSentence = [];

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

      if (this.currentRequest) {
        reject(new Error("Another RouterOS command is already in progress"));
        return;
      }

      this.sentences = [];
      this.currentSentence = [];

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
      const frame = this._peekLength();
      if (frame === null) break;

      const { length, size } = frame;
      const totalSize = size + length;

      // TCP is a byte stream. A RouterOS word can be split anywhere, including
      // between its length prefix and payload. Do not consume anything until
      // the complete word is available.
      if (this.buffer.length < totalSize) break;

      this.buffer = this.buffer.slice(size);

      if (length === 0) {
        if (this.currentSentence.length > 0) {
          this.sentences.push(this.currentSentence);
        }

        this.currentSentence = [];

        const lastSentence = this.sentences[this.sentences.length - 1];
        if (lastSentence && lastSentence[0] === "!done") {
          this._processCompleteResponse();
        }
        continue;
      }

      const word = this.buffer.slice(0, length).toString("utf8");
      this.buffer = this.buffer.slice(length);
      this.currentSentence.push(word);
    }
  }

  private _processCompleteResponse(): void {
    if (!this.currentRequest) {
      this.sentences = [];
      return;
    }

    const callback = this.currentRequest;
    this.currentRequest = null;

    let error: string | null = null;
    for (const sentence of this.sentences) {
      if (sentence[0] === "!trap" || sentence[0] === "!fatal") {
        const msgItem = sentence.find((word) => word.startsWith("=message="));
        if (msgItem) {
          error = msgItem.substring(9);
        } else {
          error = sentence[0] === "!fatal" ? "Fatal RouterOS error" : "Unknown error";
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
        data.push(item);
      }
    }

    const rawSentences = this.sentences;
    this.sentences = [];

    callback({
      error,
      data,
      raw: rawSentences,
    });
  }

  private _peekLength(): LengthFrame | null {
    if (this.buffer.length < 1) return null;

    const b = this.buffer[0];

    if ((b & 0x80) === 0x00) {
      return { length: b, size: 1 };
    }

    if ((b & 0xc0) === 0x80) {
      if (this.buffer.length < 2) return null;
      return {
        length: ((b & 0x3f) << 8) | this.buffer[1],
        size: 2,
      };
    }

    if ((b & 0xe0) === 0xc0) {
      if (this.buffer.length < 3) return null;
      return {
        length: ((b & 0x1f) << 16) | (this.buffer[1] << 8) | this.buffer[2],
        size: 3,
      };
    }

    if ((b & 0xf0) === 0xe0) {
      if (this.buffer.length < 4) return null;
      return {
        length:
          (((b & 0x0f) << 24) |
            (this.buffer[1] << 16) |
            (this.buffer[2] << 8) |
            this.buffer[3]) >>> 0,
        size: 4,
      };
    }

    if (b === 0xf0) {
      if (this.buffer.length < 5) return null;
      return {
        length: this.buffer.readUInt32BE(1),
        size: 5,
      };
    }

    throw new Error(`Invalid RouterOS length prefix: 0x${b.toString(16)}`);
  }

  private _readLength(): number | null {
    const frame = this._peekLength();
    if (frame === null) return null;

    this.buffer = this.buffer.slice(frame.size);
    return frame.length;
  }

  private _writeLength(length: number): Buffer {
    if (!Number.isSafeInteger(length) || length < 0 || length > 0xffffffff) {
      throw new RangeError("RouterOS word length must be between 0 and 0xffffffff");
    }

    if (length < 0x80) {
      return Buffer.from([length]);
    }

    if (length < 0x4000) {
      const value = length | 0x8000;
      return Buffer.from([(value >> 8) & 0xff, value & 0xff]);
    }

    if (length < 0x200000) {
      const value = length | 0xc00000;
      return Buffer.from([
        (value >> 16) & 0xff,
        (value >> 8) & 0xff,
        value & 0xff,
      ]);
    }

    if (length < 0x10000000) {
      const value = (length | 0xe0000000) >>> 0;
      return Buffer.from([
        (value >>> 24) & 0xff,
        (value >>> 16) & 0xff,
        (value >>> 8) & 0xff,
        value & 0xff,
      ]);
    }

    const result = Buffer.allocUnsafe(5);
    result[0] = 0xf0;
    result.writeUInt32BE(length >>> 0, 1);
    return result;
  }

  private _encodeWord(word: string): Buffer {
    const wordBuf = Buffer.from(word, "utf8");
    const lengthBuf = this._writeLength(wordBuf.length);
    return Buffer.concat([lengthBuf, wordBuf]);
  }

  private _sendCommand(words: string[], callback: ResponseCallback): void {
    if (!this.socket || this.socket.destroyed) {
      throw new Error("Socket is not connected");
    }

    if (this.currentRequest) {
      throw new Error("Another RouterOS command is already in progress");
    }

    this.currentRequest = callback;

    const data = Buffer.concat([
      ...words.map((word) => this._encodeWord(word)),
      this._writeLength(0),
    ]);

    this.socket.write(data);
  }
}

// ===================== EXPORTS =====================

export type {
  RouterOSClientOptions,
  RouterOSResponse,
  RouterOSData,
  ResponseCallback,
};
