const RouterOSClient = require("ros-client");
const {
  SYSTEM_COMMANDS,
  INTERFACE_COMMANDS,
  IP_COMMANDS,
  QUEUE_COMMANDS,
  PPP_COMMANDS,
  TOOLS_COMMANDS,
  WIRELESS_COMMANDS,
} = require("./routeros-commands");

// Create API client instance
const api = new RouterOSClient({
  host: "192.168.88.1", // Replace with your router IP
  username: "admin", // Replace with your username
  password: "password", // Replace with your password
  debug: false, // Set to true for debugging
});

// Example usage with different command categories
async function systemExamples() {
  console.log("\n=== SYSTEM EXAMPLES ===");

  // Get system identity
  const identity = await api.send(SYSTEM_COMMANDS.getIdentity);
  console.log("Router Identity:", identity[0]?.name || "Unknown");

  // Get system resources
  const resources = await api.send(SYSTEM_COMMANDS.getResources);
  console.log("CPU Load:", resources[0]?.["cpu-load"] + "%");
  console.log("Free Memory:", resources[0]?.["free-memory"] + " bytes");

  // Get system users
  const users = await api.send(SYSTEM_COMMANDS.getUsers);
  console.log("Users:", users.map((user) => user.name).join(", "));
}

async function interfaceExamples() {
  console.log("\n=== INTERFACE EXAMPLES ===");

  // Get all interfaces
  const interfaces = await api.send(INTERFACE_COMMANDS.getAll);
  console.log(`Total interfaces: ${interfaces.length}`);

  // Show ethernet interfaces
  const ethernet = await api.send(INTERFACE_COMMANDS.getEthernet);
  console.log("Ethernet interfaces:");
  ethernet.forEach((iface) => {
    console.log(
      `- ${iface.name}: ${iface.disabled === "true" ? "DISABLED" : "ENABLED"}`
    );
  });
}

async function ipExamples() {
  console.log("\n=== IP EXAMPLES ===");

  // Get IP addresses
  const addresses = await api.send(IP_COMMANDS.getAddresses);
  console.log("IP Addresses:");
  addresses.forEach((addr) => {
    console.log(`- ${addr.address} on ${addr.interface}`);
  });

  // Get DHCP leases
  const leases = await api.send(IP_COMMANDS.getDhcpLeases);
  console.log(`Active DHCP leases: ${leases.length}`);
  leases.slice(0, 5).forEach((lease) => {
    console.log(
      `- ${lease.address} -> ${lease.host - name || lease.mac - address}`
    );
  });
}

async function queueExamples() {
  console.log("\n=== QUEUE EXAMPLES ===");

  // Get all simple queues
  const queues = await api.send(QUEUE_COMMANDS.getSimpleQueues);
  console.log(`Total simple queues: ${queues.length}`);

  // Show queue details
  queues.forEach((queue) => {
    console.log(
      `- ${queue.name}: Target ${queue.target}, Max limit ${queue["max-limit"]}`
    );
  });
}

async function toolExamples() {
  console.log("\n=== TOOLS EXAMPLES ===");

  // Ping example (note: this returns raw ping results)
  console.log("Pinging 8.8.8.8...");
  const pingResult = await api.send(TOOLS_COMMANDS.ping("8.8.8.8", 3));
  console.log(`Ping results: ${pingResult.length} packets`);
}

// Main function to run all examples
async function runExamples() {
  try {
    console.log("Connecting to RouterOS...");
    await api.connect();
    console.log("Connected successfully!");

    // Run examples
    await systemExamples();
    await interfaceExamples();
    await ipExamples();
    await queueExamples();
    await toolExamples();

    // Close connection
    await api.close();
    console.log("\nConnection closed.");
  } catch (err) {
    console.error("Error:", err.message);
  }
}

// Run the examples
// runExamples();

// Export functions for individual use
module.exports = {
  systemExamples,
  interfaceExamples,
  ipExamples,
  queueExamples,
  toolExamples,
  runExamples,
};
