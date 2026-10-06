import assert from "assert";
import { RouterOSClient } from "../lib/connect";

type TestClient = any;

function encodeLength(length: number): Buffer {
  if (length < 0x80) return Buffer.from([length]);
  if (length < 0x4000) {
    const value = length | 0x8000;
    return Buffer.from([(value >> 8) & 0xff, value & 0xff]);
  }
  if (length < 0x200000) {
    const value = length | 0xc00000;
    return Buffer.from([(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff]);
  }
  if (length < 0x10000000) {
    const value = (length | 0xe0000000) >>> 0;
    return Buffer.from([
      (value >>> 24) & 0xff,
      (value >>> 16) & 0xff,
      (value >>> 8) & 0xff,
      value & 0xff,
    ]);
  }

  const result = Buffer.alloc(5);
  result[0] = 0xf0;
  result.writeUInt32BE(length >>> 0, 1);
  return result;
}

function encodeWord(word: string): Buffer {
  const body = Buffer.from(word, "utf8");
  return Buffer.concat([encodeLength(body.length), body]);
}

function encodeSentence(words: string[]): Buffer {
  return Buffer.concat([...words.map(encodeWord), Buffer.from([0])]);
}

function buildHotspotDump(count: number): Buffer {
  const sentences: Buffer[] = [];

  for (let i = 0; i < count; i++) {
    const padded = String(i).padStart(6, "0");
    const longComment = `hotspot-user-${padded}-` + "x".repeat(180 + (i % 40));

    sentences.push(
      encodeSentence([
        "!re",
        `=.id=*${padded}`,
        `=name=user-${padded}`,
        `=password=pw-${padded}`,
        "=profile=default",
        `=comment=${longComment}`,
        "=disabled=false",
      ])
    );
  }

  sentences.push(encodeSentence(["!done"]));
  return Buffer.concat(sentences);
}

function feedFragmented(client: TestClient, payload: Buffer): void {
  const chunkSizes = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233];
  let offset = 0;
  let index = 0;

  while (offset < payload.length) {
    const size = chunkSizes[index++ % chunkSizes.length];
    const chunk = payload.subarray(offset, Math.min(offset + size, payload.length));

    client.buffer = Buffer.concat([client.buffer, chunk]);
    client._parseResponse();
    offset += chunk.length;
  }
}

function testLengthEncoding(): void {
  const client = new RouterOSClient() as TestClient;
  const cases: Array<[number, string]> = [
    [0x00, "00"],
    [0x7f, "7f"],
    [0x80, "8080"],
    [0x3fff, "bfff"],
    [0x4000, "c04000"],
    [0x1fffff, "dfffff"],
    [0x200000, "e0200000"],
    [0x0fffffff, "efffffff"],
    [0x10000000, "f010000000"],
  ];

  for (const [length, expected] of cases) {
    assert.strictEqual(client._writeLength(length).toString("hex"), expected);
  }
}

function testLargeFragmentedHotspotDump(): void {
  const userCount = 5000;
  const payload = buildHotspotDump(userCount);
  const client = new RouterOSClient() as TestClient;

  let response: { error: string | null; data: Record<string, string>[]; raw: string[][] } | null = null;
  client.currentRequest = (result: { error: string | null; data: Record<string, string>[]; raw: string[][] }) => {
    response = result;
  };

  feedFragmented(client, payload);

  const parsed: any = response;
  assert(parsed, "Parser never reached !done");
  assert.strictEqual(parsed.error, null);
  assert.strictEqual(parsed.data.length, userCount);
  assert.strictEqual(parsed.data[0].name, "user-000000");
  assert.strictEqual(parsed.data[userCount - 1].name, "user-004999");
  assert(parsed.data[123].comment.length > 127, "Long word boundary was not exercised");
  assert.strictEqual(client.buffer.length, 0, "Parser left unread bytes");

  console.log(
    `OK: parsed ${userCount} hotspot users from ${payload.length.toLocaleString()} bytes with heavy TCP fragmentation`
  );
}

testLengthEncoding();
testLargeFragmentedHotspotDump();
console.log("All RouterOS parser tests passed.");
