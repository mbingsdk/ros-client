const net = require("net");
const tls = require("tls");
const { EventEmitter } = require("events");

class RouterOSClient extends EventEmitter {
  constructor(options = {}) {
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
  }

  connect() {
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

      this.socket.on("data", (data) => {
        this.buffer = Buffer.concat([this.buffer, data]);
        this._parseResponse();
      });

      this.socket.on("error", (err) => {
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

  _login() {
    return new Promise((resolve, reject) => {
      this.sentences = []; // Clear any previous data

      this._sendCommand(["/login"], (response) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }

        if (this.debug) console.log("Login response:", response);

        // Modern login method (v6.43+)
        this._sendCommand(
          ["/login", `=name=${this.username}`, `=password=${this.password}`],
          (loginResponse) => {
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

  send(words) {
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        reject(new Error("Not connected"));
        return;
      }

      // Clear previous response data
      this.sentences = [];

      this._sendCommand(words, (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.data);
        }
      });
    });
  }

  close() {
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

  _parseResponse() {
    while (this.buffer.length > 0) {
      const length = this._readLength();
      if (length === null) break;

      if (length === 0) {
        // End of sentence
        if (!this.currentSentence) {
          this.currentSentence = [];
        }

        // Only add non-empty sentences
        if (this.currentSentence.length > 0) {
          this.sentences.push(this.currentSentence);
        }

        // Reset for next sentence
        this.currentSentence = [];

        // Check if we have !done, which indicates end of response
        const lastSentence = this.sentences[this.sentences.length - 1];
        if (lastSentence && lastSentence[0] === "!done") {
          this._processCompleteResponse();
        }
      } else {
        // Read word data
        if (this.buffer.length < length) break;

        const word = this.buffer.slice(0, length).toString("utf8");
        this.buffer = this.buffer.slice(length);

        // Initialize current sentence if needed
        if (!this.currentSentence) {
          this.currentSentence = [];
        }

        this.currentSentence.push(word);
      }
    }
  }

  _processCompleteResponse() {
    if (!this.currentRequest) return;

    const callback = this.currentRequest;
    this.currentRequest = null;

    // Check for trap/error
    let error = null;
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

    // Convert !re sentences to data objects
    const data = [];
    for (const sentence of this.sentences) {
      if (sentence[0] === "!re") {
        const item = {};
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

    // Clear sentences for next command
    const rawSentences = [...this.sentences];
    this.sentences = [];

    // Return the result
    callback({
      error: error,
      data: data,
      raw: rawSentences,
    });
  }

  _readLength() {
    if (this.buffer.length === 0) return null;

    let length = 0;
    let shift = 0;
    let idx = 0;

    while (true) {
      if (idx >= this.buffer.length) return null;

      const byte = this.buffer[idx++];
      length |= (byte & 0x7f) << shift;

      if ((byte & 0x80) === 0) break;
      shift += 7;
    }

    this.buffer = this.buffer.slice(idx);
    return length;
  }

  _writeLength(length) {
    const bytes = [];

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

  _encodeWord(word) {
    const wordBuf = Buffer.from(word, "utf8");
    const lengthBuf = this._writeLength(wordBuf.length);
    return Buffer.concat([lengthBuf, wordBuf]);
  }

  _sendCommand(words, callback) {
    this.currentRequest = callback;

    const data = Buffer.concat([
      ...words.map((word) => this._encodeWord(word)),
      this._writeLength(0), // End of sentence
    ]);

    this.socket.write(data);
  }
}

module.exports = RouterOSClient;
