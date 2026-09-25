/**
 * RouterOS API Client - System Tests
 * 
 * Basic test suite for verifying RouterOS API connectivity and core operations.
 * Each test creates its own connection and properly cleans up afterwards.
 * 
 * @version 2.0.0
 * @author RouterOS API Client Library
 */

import { RouterOSClient, RouterOSClientOptions } from "../lib/connect";

async function systemIdentityTest(config: RouterOSClientOptions): Promise<void> {
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

async function interfaceListTest(config: RouterOSClientOptions): Promise<void> {
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

async function systemResourceTest(config: RouterOSClientOptions): Promise<void> {
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

async function runTests(config: RouterOSClientOptions): Promise<void> {
  try {
    console.log("Running tests sequentially...");
    await systemIdentityTest(config);
    await systemResourceTest(config);
    await interfaceListTest(config);
    console.log("\nAll tests completed.");
  } catch (err) {
    console.error("Error:", (err as Error).message);
  }
}

export {
  systemIdentityTest,
  systemResourceTest,
  interfaceListTest,
  runTests,
};