# RouterOS API Client 🌐

[![npm version](https://img.shields.io/npm/v/ros-client.svg?style=flat-square)](https://www.npmjs.org/package/ros-client)
[![Build Status](https://img.shields.io/travis/SDWORLLD/ros-client/master.svg?style=flat-square)](https://travis-ci.org/SDWORLLD/ros-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

A powerful Node.js module for seamless interaction with MikroTik RouterOS API, supporting both plain text (port 8728) and encrypted (port 8729) connections. 🚀

## ✨ Key Features

- 🔒 Secure connections via plain text and TLS encryption
- 🔄 Full support for RouterOS API protocol encoding/decoding
- ⚡ Modern Promise-based API implementation
- 🛠️ Comprehensive MikroTik API command helpers
- 🐛 Robust error handling mechanism
- 🔍 Built-in debug mode for troubleshooting
- 📦 Lightweight with minimal dependencies

## 📦 Installation

```bash
npm install ros-client
```

## 🚀 Quick Start

```javascript
const RouterOSClient = require("ros-client");

// Create API client instance
const api = new RouterOSClient({
  host: "192.168.88.1",
  username: "admin",
  password: "your-password",
  port: 8728, // Use 8729 for TLS
  tls: false, // Set to true for encrypted connection
});

async function example() {
  try {
    await api.connect();
    console.log("✅ Connected successfully!");

    // Get system identity
    const identity = await api.send(["/system/identity/print"]);
    console.log("🖥️ Router identity:", identity);

    // Get all interfaces
    const interfaces = await api.send(["/interface/print"]);
    console.log("🌐 Interfaces:", interfaces);

    await api.close();
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

example();
```

## ⚙️ Configuration Options

```javascript
const api = new RouterOSClient({
  host: "192.168.88.1", // Router IP address
  username: "admin", // Username
  password: "password", // Password
  port: 8728, // API port (8729 for TLS)
  tls: false, // TLS encryption
  timeout: 10000, // Connection timeout (ms)
  debug: false, // Debug output
});
```

## 📚 API Documentation

### 🔌 Connection Methods

#### `connect()`

Establishes and authenticates the RouterOS connection.

```javascript
await api.connect();
```

#### `close()`

Gracefully terminates the RouterOS connection.

```javascript
await api.close();
```

### 🛠️ Command Methods

#### `send(words)`

Executes commands on the RouterOS device.

```javascript
const result = await api.send(["/system/resource/print"]);
```

## 📝 Command Examples

### 🖥️ System Management

```javascript
// System identity operations
const identity = await api.send(["/system/identity/print"]);
await api.send(["/system/identity/set", "=name=my-router"]);

// Resource monitoring
const resources = await api.send(["/system/resource/print"]);

// System maintenance
await api.send(["/system/reboot"]);
```

### 🌐 Network Interface Management

```javascript
// Interface operations
const interfaces = await api.send(["/interface/print"]);
await api.send(["/interface/enable", "=.id=ether1"]);

// Wireless interface management
const wireless = await api.send(["/interface/wireless/print"]);
```

### 🔧 IP Configuration

```javascript
// IP address management
const addresses = await api.send(["/ip/address/print"]);
await api.send([
  "/ip/address/add",
  "=address=192.168.1.1/24",
  "=interface=ether1",
]);

// DHCP server management
const leases = await api.send(["/ip/dhcp-server/lease/print"]);
```

## 🎯 Events

The client emits these events:

- `connected` ✅ - Connection established
- `error` ❌ - Error occurred
- `close` 🔒 - Connection terminated

```javascript
api.on("connected", () => console.log("✅ Connected"));
api.on("error", (err) => console.error("❌ Error:", err.message));
api.on("close", () => console.log("🔒 Connection closed"));
```

## 🔍 Debug Mode

Enable detailed logging:

```javascript
const api = new RouterOSClient({
  debug: true,
  // other options...
});
```

## ❌ Error Handling

```javascript
try {
  await api.connect();
  const result = await api.send(["/command"]);
} catch (err) {
  console.error("❌ Error:", err.message);
}
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Here's how:

1. 🔀 Fork the repository
2. 🌿 Create your feature branch (`git checkout -b feature/amazing-feature`)
3. ✍️ Commit changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to branch (`git push origin feature/amazing-feature`)
5. 📫 Open a Pull Request

---

⭐ Star this repository if you find it helpful!
