import * as fs from "fs";
import * as path from "path";
import { RouterOSClient } from "../index";

function envBool(value: string | undefined): boolean {
  return /^(1|true|yes|on)$/i.test(value || "");
}

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

async function main(): Promise<void> {
  const host = process.env.ROUTEROS_HOST;
  const username = process.env.ROUTEROS_USER;

  if (!host || !username) {
    console.error("Missing RouterOS connection settings.");
    console.error("Required: ROUTEROS_HOST and ROUTEROS_USER");
    console.error("Optional: ROUTEROS_PASSWORD, ROUTEROS_PORT, ROUTEROS_TLS, ROUTEROS_TIMEOUT");
    console.error("");
    console.error("Example (PowerShell):");
    console.error('$env:ROUTEROS_HOST="192.168.88.1"');
    console.error('$env:ROUTEROS_USER="api-user"');
    console.error('$env:ROUTEROS_PASSWORD="your-password"');
    console.error('npm run test:hotspot');
    process.exitCode = 1;
    return;
  }

  const useTls = envBool(process.env.ROUTEROS_TLS);
  const port = Number(process.env.ROUTEROS_PORT || (useTls ? 8729 : 8728));
  const timeout = Number(process.env.ROUTEROS_TIMEOUT || 120000);
  const outputArg = process.argv[2];
  const outputFile = path.resolve(outputArg || `hotspot-users-${timestamp()}.json`);

  const api = new RouterOSClient({
    host,
    port,
    username,
    password: process.env.ROUTEROS_PASSWORD || "",
    timeout,
    tls: useTls,
    debug: envBool(process.env.ROUTEROS_DEBUG),
  });

  const startedAt = Date.now();

  try {
    console.log(`Connecting to ${host}:${port} ...`);
    await api.connect();
    console.log("Connected. Dumping /ip/hotspot/user/print ...");

    const users = await api.send(["/ip/hotspot/user/print"]);
    const elapsedMs = Date.now() - startedAt;

    const ids = users.map((user) => user[".id"]).filter(Boolean);
    const uniqueIds = new Set(ids);
    const duplicateIdCount = ids.length - uniqueIds.size;

    const payload = {
      generated_at: new Date().toISOString(),
      router: host,
      command: "/ip/hotspot/user/print",
      count: users.length,
      duplicate_id_count: duplicateIdCount,
      elapsed_ms: elapsedMs,
      users,
    };

    fs.writeFileSync(outputFile, JSON.stringify(payload, null, 2), "utf8");
    const bytes = fs.statSync(outputFile).size;

    console.log("");
    console.log("Hotspot user dump completed.");
    console.log(`Records       : ${users.length}`);
    console.log(`Unique .id    : ${uniqueIds.size}`);
    console.log(`Duplicate .id : ${duplicateIdCount}`);
    console.log(`Elapsed       : ${(elapsedMs / 1000).toFixed(2)}s`);
    console.log(`File size     : ${(bytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Output        : ${outputFile}`);

    if (users.length === 0) {
      console.warn("WARNING: Router returned zero hotspot users.");
    }
    if (duplicateIdCount > 0) {
      console.warn("WARNING: Duplicate RouterOS .id values were found in the dump.");
    }
  } finally {
    await api.close().catch(() => undefined);
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.stack || err.message : String(err);
  console.error("Hotspot dump failed:", message);
  process.exitCode = 1;
});
