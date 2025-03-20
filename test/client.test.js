const RouterOSClient = require("../index.js");

/**
 * System examples test function
 * @param {Object} config RouterOS connection configuration
 */
async function systemExamples(config) {
  const api = new RouterOSClient(config);
  console.log("\n=== SYSTEM EXAMPLES ===");

  // Get system identity
  const identity = await api.send(["/system/identity/print"]);
  console.log("Router Identity:", identity[0]?.name || "Unknown");

  // Get system resources
  const resources = await api.send(["/system/resource/print"]);
  console.log("CPU Load:", resources[0]?.["cpu-load"] + "%");
  console.log("Free Memory:", resources[0]?.["free-memory"] + " bytes");

  // Get system users
  const users = await api.send(["/user/print"]);
  console.log("Users:", users.map((user) => user.name).join(", "));
}

/**
 * Interface examples test function
 * @param {Object} config RouterOS connection configuration
 */
async function interfaceExamples(config) {
  const api = new RouterOSClient(config);
  console.log("\n=== INTERFACE EXAMPLES ===");

  // Get all interfaces
  const interfaces = await api.send(["/interface/print"]);
  console.log(`Total interfaces: ${interfaces.length}`);

  // Show ethernet interfaces
  const ethernet = await api.send(["/interface/ethernet/print"]);
  console.log("Ethernet interfaces:");
  ethernet.forEach((iface) => {
    console.log(
      `- ${iface.name}: ${iface.disabled === "true" ? "DISABLED" : "ENABLED"}`
    );
  });
}

/**
 * IP examples test function
 * @param {Object} config RouterOS connection configuration
 */
async function ipExamples(config) {
  const api = new RouterOSClient(config);
  console.log("\n=== IP EXAMPLES ===");

  // Get IP addresses
  const addresses = await api.send(["/ip/address/print"]);
  console.log("IP Addresses:");
  addresses.forEach((addr) => {
    console.log(`- ${addr.address} on ${addr.interface}`);
  });

  // Get DHCP leases
  const leases = await api.send(["/ip/dhcp-server/lease/print"]);
  console.log(`Active DHCP leases: ${leases.length}`);
  leases.slice(0, 5).forEach((lease) => {
    console.log(
      `- ${lease.address} -> ${lease.host - name || lease.mac - address}`
    );
  });
}

/**
 * Queue examples test function
 * @param {Object} config RouterOS connection configuration
 */
async function queueExamples(config) {
  const api = new RouterOSClient(config);
  console.log("\n=== QUEUE EXAMPLES ===");

  // Get all simple queues
  const queues = await api.send(["/queue/simple/print"]);
  console.log(`Total simple queues: ${queues.length}`);

  // Show queue details
  queues.forEach((queue) => {
    console.log(
      `- ${queue.name}: Target ${queue.target}, Max limit ${queue["max-limit"]}`
    );
  });
}

/**
 * Tool examples test function
 * @param {Object} config RouterOS connection configuration
 */
async function toolExamples(config) {
  const api = new RouterOSClient(config);
  console.log("\n=== TOOLS EXAMPLES ===");

  // Ping example (note: this returns raw ping results)
  console.log("Pinging 8.8.8.8...");
  const pingResult = await api.send(["/ping", "=address=8.8.8.8", "=count=3"]);
  console.log(`Ping results: ${pingResult.length} packets`);
}

// Main function to run all examples
/**
 * Run all example tests
 * @param {Object} config RouterOS connection configuration
 */
async function runExamples(config) {
  const api = new RouterOSClient(config);
  try {
    console.log("Connecting to RouterOS...");
    await api.connect();
    console.log("Connected successfully!");

    // Run examples
    await systemExamples(config);
    await interfaceExamples(config);
    await ipExamples(config);
    await queueExamples(config);
    await toolExamples(config);

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
