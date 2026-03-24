/**
 * RouterOS API Client - Test Examples
 * 
 * Comprehensive test suite demonstrating various RouterOS API operations
 * organized by category with proper error handling and TypeScript types.
 * 
 * @version 2.0.0
 * @author RouterOS API Client Library
 */

import { RouterOSClient } from "../index";
import { RouterOSClientOptions, RouterOSData } from "../lib/connect";

async function systemExamples(config: RouterOSClientOptions): Promise<void> {
  const api = new RouterOSClient(config);
  console.log("\n=== SYSTEM EXAMPLES ===");

  const identity = await api.send(["/system/identity/print"]);
  console.log("Router Identity:", identity[0]?.name || "Unknown");

  const resources = await api.send(["/system/resource/print"]);
  console.log("CPU Load:", resources[0]?.["cpu-load"] + "%");
  console.log("Free Memory:", resources[0]?.["free-memory"] + " bytes");

  const users = await api.send(["/user/print"]);
  console.log("Users:", users.map((user) => user.name).join(", "));
}

async function interfaceExamples(config: RouterOSClientOptions): Promise<void> {
  const api = new RouterOSClient(config);
  console.log("\n=== INTERFACE EXAMPLES ===");

  const interfaces = await api.send(["/interface/print"]);
  console.log(`Total interfaces: ${interfaces.length}`);

  const ethernet = await api.send(["/interface/ethernet/print"]);
  console.log("Ethernet interfaces:");
  ethernet.forEach((iface: RouterOSData) => {
    console.log(
      `- ${iface.name}: ${iface.disabled === "true" ? "DISABLED" : "ENABLED"}`
    );
  });
}

async function ipExamples(config: RouterOSClientOptions): Promise<void> {
  const api = new RouterOSClient(config);
  console.log("\n=== IP EXAMPLES ===");

  const addresses = await api.send(["/ip/address/print"]);
  console.log("IP Addresses:");
  addresses.forEach((addr: RouterOSData) => {
    console.log(`- ${addr.address} on ${addr.interface}`);
  });

  const leases = await api.send(["/ip/dhcp-server/lease/print"]);
  console.log(`Active DHCP leases: ${leases.length}`);
  leases.slice(0, 5).forEach((lease: RouterOSData) => {
    console.log(
      `- ${lease.address} -> ${lease["host-name"] || lease["mac-address"]}`
    );
  });
}

async function queueExamples(config: RouterOSClientOptions): Promise<void> {
  const api = new RouterOSClient(config);
  console.log("\n=== QUEUE EXAMPLES ===");

  const queues = await api.send(["/queue/simple/print"]);
  console.log(`Total simple queues: ${queues.length}`);

  queues.forEach((queue: RouterOSData) => {
    console.log(
      `- ${queue.name}: Target ${queue.target}, Max limit ${queue["max-limit"]}`
    );
  });
}

async function toolExamples(config: RouterOSClientOptions): Promise<void> {
  const api = new RouterOSClient(config);
  console.log("\n=== TOOLS EXAMPLES ===");

  console.log("Pinging 8.8.8.8...");
  const pingResult = await api.send(["/ping", "=address=8.8.8.8", "=count=3"]);
  console.log(`Ping results: ${pingResult.length} packets`);
}

async function runExamples(config: RouterOSClientOptions): Promise<void> {
  const api = new RouterOSClient(config);
  try {
    console.log("Connecting to RouterOS...");
    await api.connect();
    console.log("Connected successfully!");

    await systemExamples(config);
    await interfaceExamples(config);
    await ipExamples(config);
    await queueExamples(config);
    await toolExamples(config);

    await api.close();
    console.log("\nConnection closed.");
  } catch (err) {
    console.error("Error:", (err as Error).message);
  }
}

export {
  systemExamples,
  interfaceExamples,
  ipExamples,
  queueExamples,
  toolExamples,
  runExamples,
};