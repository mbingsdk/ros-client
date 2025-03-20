const RouterOSClient = require("../lib/connect.js");

/**
 * System identity test function
 * @param {Object} config RouterOS connection configuration
 */
async function systemIdentityTest(config) {
  const api = new RouterOSClient(config);
  try {
    console.log("\n=== SYSTEM IDENTITY TEST ===");
    await api.connect();
    const identity = await api.send(["/system/identity/print"]);
    console.log("System Identity:", identity);
  } finally {
    await api.close();
  }
}

/**
 * Interface list test function
 * @param {Object} config RouterOS connection configuration
 */
async function interfaceListTest(config) {
  const api = new RouterOSClient(config);
  try {
    console.log("\n=== INTERFACE LIST TEST ===");
    await api.connect();
    const interfaces = await api.send(["/interface/print"]);
    console.log("Interfaces:", interfaces);
  } finally {
    await api.close();
  }
}

/**
 * System resource test function
 * @param {Object} config RouterOS connection configuration
 */
async function systemResourceTest(config) {
  const api = new RouterOSClient(config);
  try {
    console.log("\n=== SYSTEM RESOURCE TEST ===");
    await api.connect();
    const resources = await api.send(["/system/resource/print"]);
    console.log("System Resources:", resources);
  } finally {
    await api.close();
  }
}

/**
 * Run all system tests
 * @param {Object} config RouterOS connection configuration
 */
async function runTests(config) {
  try {
    console.log("Running tests sequentially...");
    await systemIdentityTest(config);
    await systemResourceTest(config);
    await interfaceListTest(config);
    console.log("\nAll tests completed.");
  } catch (err) {
    console.error("Error:", err.message);
  }
}

// Export functions for individual use
module.exports = {
  systemIdentityTest,
  systemResourceTest,
  interfaceListTest,
  runTests,
};
