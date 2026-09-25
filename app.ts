/**
 * RouterOS API Client - Production Example & Reference Implementation
 * 
 * This file serves as a comprehensive reference for implementing RouterOS API
 * connections with advanced error handling, connectivity testing, and debugging.
 * 
 * Features demonstrated:
 * - TCP connectivity pre-testing
 * - Advanced error categorization and handling
 * - Comprehensive event monitoring
 * - Connection and operation timeouts
 * - Detailed debug logging and troubleshooting
 * 
 * @version 2.0.0
 * @author RouterOS API Client Library
 * @example
 * // Run this example:
 * // ts-node app.ts
 */

import * as net from "net";
import { RouterOSClient } from "./lib/connect";

interface ConnectionConfig {
  host: string;
  username: string;
  password: string;
  port: number;
  debug: boolean;
}

interface ErrorWithCode extends Error {
  code?: string;
}

const config: ConnectionConfig = {
  host: "192.168.1.2",
  username: "username",
  password: "password",
  port: 8728,
  debug: true,
};

const api = new RouterOSClient(config);

api.on("error", (err: Error) => {
  console.error("RouterOS Client Error Event:", err);
});

api.on("trap", (trap: unknown, id: unknown) => {
  console.error("RouterOS Trap Event:", { trap, id });
});

api.on("close", () => {
  console.log("Connection closed by RouterOS");
});

api.on("timeout", () => {
  console.error("Connection timeout occurred");
});

async function testConnectivity(host: string, port: number): Promise<boolean> {
  return new Promise((resolve, reject) => {
    console.log("Testing basic connectivity...");
    const socket = new net.Socket();

    socket.setTimeout(5000);

    socket.connect(port, host, () => {
      console.log("Basic TCP connection successful");
      socket.destroy();
      resolve(true);
    });

    socket.on("error", (err: Error) => {
      console.error("TCP connection failed:", err.message);
      reject(err);
    });

    socket.on("timeout", () => {
      console.error("TCP connection timeout");
      socket.destroy();
      reject(new Error("TCP connection timeout"));
    });
  });
}

function handleConnectionError(err: ErrorWithCode): void {
  console.error("Connection Failed!");
  console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  console.error("Full Error Object:", err);

  if (err.code) {
    switch (err.code) {
      case "ECONNREFUSED":
        console.error("Connection Refused:");
        console.error("   - Router is not reachable at the specified IP address");
        console.error("   - RouterOS API service might be disabled");
        console.error("   - Wrong port number (default is 8728)");
        console.error("   - Firewall blocking the connection");
        break;

      case "ENOTFOUND":
        console.error("Host Not Found:");
        console.error("   - Invalid IP address or hostname");
        console.error("   - DNS resolution failed");
        console.error("   - Network connectivity issues");
        break;

      case "ETIMEDOUT":
        console.error("Connection Timeout:");
        console.error("   - Router is not responding");
        console.error("   - Network latency issues");
        console.error("   - Router might be overloaded");
        break;

      case "ECONNRESET":
        console.error("Connection Reset:");
        console.error("   - Router forcibly closed the connection");
        console.error("   - API service might have crashed");
        break;

      default:
        console.error(`Network Error (${err.code}):`);
        console.error("   - Check network connectivity");
        console.error("   - Verify router configuration");
    }
  } else if (err.message) {
    if (
      err.message.includes("login") ||
      err.message.includes("auth") ||
      err.message.includes("password")
    ) {
      console.error("Authentication Failed:");
      console.error("   - Wrong username or password");
      console.error("   - Account might be disabled");
      console.error("   - User might not have API access permissions");
    } else if (err.message.includes("trap")) {
      console.error("RouterOS Trap Error:");
      console.error("   - Invalid command or parameters");
      console.error("   - Insufficient permissions");
    } else if (err.message.includes("timeout")) {
      console.error("Operation Timeout:");
      console.error("   - Command took too long to execute");
      console.error("   - Router might be busy");
    } else {
      console.error("Unknown Error:");
      console.error(`   - ${err.message}`);
    }
  }

  console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.error("Troubleshooting Steps:");
  console.error("1. Verify the router IP address and port");
  console.error("2. Check if RouterOS API is enabled");
  console.error("3. Confirm username and password are correct");
  console.error("4. Ensure the user has API access permissions");
  console.error("5. Check firewall rules on both router and client");
  console.error("6. Test connectivity with ping or telnet");
  console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

async function example(): Promise<void> {
  console.log("Attempting to connect to RouterOS...");
  console.log(`Host: ${config.host}`);
  console.log(`Username: ${config.username}`);
  console.log(`Port: ${config.port}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    await testConnectivity(config.host, config.port);

    console.log("Attempting RouterOS API connection...");
    const connectionPromise = api.connect();
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error("RouterOS API connection timeout after 10 seconds")),
        10000
      );
    });

    await Promise.race([connectionPromise, timeoutPromise]);
    console.log("RouterOS API connected successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    console.log("Fetching system identity...");
    const identity = await api.send(["/system/identity/print"]);
    console.log("Router identity:", identity);

    await api.close();
    console.log("Connection closed successfully!");
  } catch (err) {
    handleConnectionError(err as ErrorWithCode);
  }
}

example();

export { example, testConnectivity, handleConnectionError };
export type { ConnectionConfig, ErrorWithCode };
