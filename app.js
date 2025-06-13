/**
 * RouterOS API Client - Production Example & Reference Implementation
 * 
 * This file serves as a comprehensive reference for implementing RouterOS API
 * connections with advanced error handling, connectivity testing, and debugging.
 * 
 * Features demonstrated:
 * - ✅ TCP connectivity pre-testing
 * - 🔥 Advanced error categorization and handling
 * - 📊 Comprehensive event monitoring
 * - 🚨 Connection and operation timeouts
 * - 🔍 Detailed debug logging and troubleshooting
 * 
 * @version 1.1.0
 * @author RouterOS API Client Library
 * @example
 * // Run this example:
 * // node app.js
 */

const RouterOSClient = require("./index");

// RouterOS API connection configuration

// Create API client instance
const api = new RouterOSClient({
  host: "192.168.1.2", // Your RouterOS IP
  username: "sdworlld", // Your username
  password: "Shivam!024@", // Your password
  port: 8728, // Default API port
  debug: true, // Enable debug mode for detailed logs
});

// Add event listeners for better error tracking
api.on('error', (err) => {
  console.error("🔥 RouterOS Client Error Event:", err);
});

api.on('trap', (trap, id) => {
  console.error("🪤 RouterOS Trap Event:", { trap, id });
});

api.on('close', () => {
  console.log("📡 Connection closed by RouterOS");
});

api.on('timeout', () => {
  console.error("⏰ Connection timeout occurred");
});

// Function to test basic connectivity
async function testConnectivity() {
  const net = require('net');
  
  return new Promise((resolve, reject) => {
    console.log("🔍 Testing basic connectivity...");
    const socket = new net.Socket();
    
    socket.setTimeout(5000); // 5 second timeout
    
    socket.connect(api.port, api.host, () => {
      console.log("✅ Basic TCP connection successful");
      socket.destroy();
      resolve(true);
    });
    
    socket.on('error', (err) => {
      console.error("❌ TCP connection failed:", err.message);
      reject(err);
    });
    
    socket.on('timeout', () => {
      console.error("⏰ TCP connection timeout");
      socket.destroy();
      reject(new Error('TCP connection timeout'));
    });
  });
}

// Enhanced error handling function
function handleConnectionError(err) {
  console.error("❌ Connection Failed!");
  console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  // Log the full error object for debugging
  console.error("Full Error Object:", err);
  
  // Check for specific error types and provide helpful messages
  if (err.code) {
    switch (err.code) {
      case 'ECONNREFUSED':
        console.error("🚫 Connection Refused:");
        console.error("   - Router is not reachable at the specified IP address");
        console.error("   - RouterOS API service might be disabled");
        console.error("   - Wrong port number (default is 8728)");
        console.error("   - Firewall blocking the connection");
        break;
        
      case 'ENOTFOUND':
        console.error("🔍 Host Not Found:");
        console.error("   - Invalid IP address or hostname");
        console.error("   - DNS resolution failed");
        console.error("   - Network connectivity issues");
        break;
        
      case 'ETIMEDOUT':
        console.error("⏰ Connection Timeout:");
        console.error("   - Router is not responding");
        console.error("   - Network latency issues");
        console.error("   - Router might be overloaded");
        break;
        
      case 'ECONNRESET':
        console.error("🔄 Connection Reset:");
        console.error("   - Router forcibly closed the connection");
        console.error("   - API service might have crashed");
        break;
        
      default:
        console.error(`🔧 Network Error (${err.code}):`);
        console.error("   - Check network connectivity");
        console.error("   - Verify router configuration");
    }
  } else if (err.message) {
    // Check for authentication-related errors
    if (err.message.includes('login') || err.message.includes('auth') || err.message.includes('password')) {
      console.error("🔐 Authentication Failed:");
      console.error("   - Wrong username or password");
      console.error("   - Account might be disabled");
      console.error("   - User might not have API access permissions");
    } else if (err.message.includes('trap')) {
      console.error("⚠️  RouterOS Trap Error:");
      console.error("   - Invalid command or parameters");
      console.error("   - Insufficient permissions");
    } else if (err.message.includes('timeout')) {
      console.error("⏰ Operation Timeout:");
      console.error("   - Command took too long to execute");
      console.error("   - Router might be busy");
    } else {
      console.error("❓ Unknown Error:");
      console.error(`   - ${err.message}`);
    }
  }
  
  console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.error("🔧 Troubleshooting Steps:");
  console.error("1. Verify the router IP address and port");
  console.error("2. Check if RouterOS API is enabled");
  console.error("3. Confirm username and password are correct");
  console.error("4. Ensure the user has API access permissions");
  console.error("5. Check firewall rules on both router and client");
  console.error("6. Test connectivity with ping or telnet");
  console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

async function example() {
  console.log("🔄 Attempting to connect to RouterOS...");
  console.log(`📡 Host: ${api.host || 'undefined'}`);
  console.log(`👤 Username: ${api.username || 'undefined'}`);
  console.log(`🔌 Port: ${api.port || 'undefined'}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  try {
    // First test basic TCP connectivity
    await testConnectivity();
    
    // Attempt RouterOS API connection with timeout
    console.log("🔄 Attempting RouterOS API connection...");
    const connectionPromise = api.connect();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('RouterOS API connection timeout after 10 seconds')), 10000);
    });
    
    await Promise.race([connectionPromise, timeoutPromise]);
    console.log("✅ RouterOS API connected successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Get system identity
    console.log("🔍 Fetching system identity...");
    const identity = await api.send(["/system/identity/print"]);
    console.log("🖥️ Router identity:", identity);

    await api.close();
    console.log("✅ Connection closed successfully!");
  } catch (err) {
    handleConnectionError(err);
  }
}

example();