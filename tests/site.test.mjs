import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const html = read("index.html");
const program = read("programs/manesso/src/lib.rs");

test("every modeled execution stage maps to a real program symbol", () => {
  const buttons = [...html.matchAll(/<button class="source-node[^>]+>/g)].map((match) => match[0]);
  assert.equal(buttons.length, 6);
  for (const button of buttons) {
    const source = button.match(/data-open="([^"]+)"/)?.[1];
    const symbol = button.match(/data-symbol="([^"]+)"/)?.[1];
    assert.equal(source, "programs/manesso/src/lib.rs");
    assert.ok(symbol && program.includes(symbol), symbol ?? button);
    assert.equal([...button.matchAll(/data-stage-index=/g)].length, 1);
  }
  assert.match(html, /id="manessoBackplane"/);
  assert.match(html, /assets\/hairline-kernel\.js/);
});

test("source browser embeds the checked-in program exactly", () => {
  const sandbox = { window: {} };
  vm.runInNewContext(read("source-data.js"), sandbox);
  assert.equal(sandbox.window.MANESSO_SOURCE_OBJECTS["programs/manesso/src/lib.rs"].content, program.replace(/\r\n/g, "\n"));
  for (const file of Object.keys(sandbox.window.MANESSO_SOURCE_OBJECTS)) {
    assert.ok(fs.existsSync(path.join(root, file)), file);
    assert.ok(!file.startsWith("contracts/"), file);
  }
});

test("public page contains no prior chain or signature claims", () => {
  assert.doesNotMatch(html, /Robinhood|EIP.712|ERC.1271|EVM|\.sol\b/i);
  assert.match(html, /<code title="Official Manesso token contract address">2n8uNgWXeBfEXzihi4vYm5GrnCpgkkP9fr7fR7Jmpump<\/code>/);
  assert.doesNotMatch(html, /G4Nt1oUvpDGrDEK2rkTDbLRpMuGUuVnGq5cJgtRJpump/);
  assert.doesNotMatch(html, /F8XJnif9YTTV7fxZzGsp9KZdUkaC6n2cjArejj8Ypump/);
  assert.match(html, /Solana/);
});
