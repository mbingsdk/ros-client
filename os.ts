import { RouterOSClient } from "./lib/connect";



// Create API client instance
const api = new RouterOSClient({
  host: "192.168.1.64",
  username: "admin",
  password: "13ans",
  port: 8728,
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
    const interfaces = await api.send(["/ip/hotspot/user/profile/print", "?-kat"]);
    console.log("🌐 Interfaces:", interfaces);
    await api.close();
  } catch (err) {
    console.error("❌ Error:", err instanceof Error ? err.message : err);
  } 
}

example();