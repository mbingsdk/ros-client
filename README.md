# RouterOS API Node.js Client

A Node.js module for interacting with MikroTik RouterOS API, supporting both plain text (port 8728) and encrypted (port 8729) connections.

## Features

- Connect to RouterOS devices using both plain text and encrypted (TLS) connections
- Support for RouterOS API protocol encoding/decoding
- Promise-based API for modern JavaScript usage
- Support for MikroTik API commands with helper functions
- Comprehensive error handling
- Debug mode for troubleshooting
- Simple, lightweight implementation with minimal dependencies

## Installation

```bash
npm install routeros-api-client
```

## Quick Start

```javascript
const RouterOSClient = require("routeros-api-client");

const api = new RouterOSClient({
  host: "192.168.88.1",
  username: "admin",
  password: "your-password",
  port: 8728, // Use 8729 for TLS
  tls: false, // Set to true for encrypted connection
});

async function example() {
  try {
    // Connect to the router
    await api.connect();
    console.log("Connected to RouterOS!");

    // Get system identity
    const identity = await api.send(["/system/identity/print"]);
    console.log("Router identity:", identity);

    // Get all interfaces
    const interfaces = await api.send(["/interface/print"]);
    console.log("Interfaces:", interfaces);

    // Close the connection
    await api.close();
  } catch (err) {
    console.error("Error:", err.message);
  }
}

example();
```

## Connection Options

```javascript
const api = new RouterOSClient({
  host: "192.168.88.1", // Router IP address (default: 192.168.88.1)
  username: "admin", // Username (default: admin)
  password: "password", // Password (default: empty string)
  port: 8728, // API port (default: 8728 for plain text, 8729 for TLS)
  tls: false, // Use TLS encryption (default: false)
  timeout: 10000, // Connection timeout in ms (default: 10000)
  debug: false, // Enable debug output (default: false)
});
```

## API Reference

### Connection Methods

#### `connect()`

Establishes a connection to the RouterOS device and performs authentication.

```javascript
await api.connect();
```

#### `close()`

Closes the connection to the RouterOS device.

```javascript
await api.close();
```

### Command Methods

#### `send(words)`

Sends a command to the RouterOS device and returns the response.

```javascript
const result = await api.send(["/system/resource/print"]);
```

## Command Examples

### System Commands

```javascript
// Get system identity
const identity = await api.send(["/system/identity/print"]);

// Set system identity
await api.send(["/system/identity/set", "=name=my-router"]);

// Get system resources
const resources = await api.send(["/system/resource/print"]);

// Reboot router
await api.send(["/system/reboot"]);
```

### Interface Commands

```javascript
// Get all interfaces
const interfaces = await api.send(["/interface/print"]);

// Enable interface
await api.send(["/interface/enable", "=.id=ether1"]);

// Get wireless interfaces
const wireless = await api.send(["/interface/wireless/print"]);
```

### IP Commands

```javascript
// Get IP addresses
const addresses = await api.send(["/ip/address/print"]);

// Add IP address
await api.send([
  "/ip/address/add",
  "=address=192.168.1.1/24",
  "=interface=ether1",
]);

// Get DHCP leases
const leases = await api.send(["/ip/dhcp-server/lease/print"]);
```

### Queue Commands

```javascript
// Get all queues
const queues = await api.send(["/queue/simple/print"]);

// Add simple queue
await api.send([
  "/queue/simple/add",
  "=name=Client1",
  "=target=192.168.1.10/32",
  "=max-limit=10M/5M",
]);

// Remove queue
await api.send(["/queue/simple/remove", "=.id=*1"]);
```

### Firewall Commands

```javascript
// Get firewall rules
const rules = await api.send(["/ip/firewall/filter/print"]);

// Add firewall rule
await api.send([
  "/ip/firewall/filter/add",
  "=chain=forward",
  "=action=drop",
  "=src-address=10.0.0.0/8",
  "=log=yes",
  "=comment=Block private network",
]);
```

## Events

The client extends EventEmitter and emits the following events:

- `connected`: Emitted when successfully connected and authenticated
- `error`: Emitted when an error occurs
- `close`: Emitted when the connection is closed

```javascript
api.on("connected", () => {
  console.log("Connected to router");
});

api.on("error", (err) => {
  console.error("Connection error:", err.message);
});

api.on("close", () => {
  console.log("Connection closed");
});
```

## Debug Mode

Enable debug mode to see detailed information about the connection process and API commands:

```javascript
const api = new RouterOSClient({
  // other options...
  debug: true,
});
```

## Error Handling

Errors are thrown as exceptions and can be caught with try/catch when using async/await:

```javascript
try {
  await api.connect();
  const result = await api.send(["/some/invalid/command"]);
} catch (err) {
  console.error("Error:", err.message);
}
```

## Inspiration

This project was inspired by the RouterOS Python API implementation and similar projects in the MikroTik community.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
