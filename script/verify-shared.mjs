// Assert-based unit checks for online/shared.js — the validation logic shared
// by the Node relay, the Cloudflare Worker, and the browser clients.
// Run: node script/verify-shared.mjs
import assert from "node:assert/strict";
import {
  canStartOnlineRoom,
  normalizeOnlineConfig,
  normalizeRoomCode,
  sanitizeOnlineInput,
} from "../online/shared.js";

// ---- normalizeRoomCode ----
assert.equal(normalizeRoomCode(" abc12d!@# "), "ABC12D", "uppercase + strip + trim");
assert.equal(normalizeRoomCode("ABCDEFGHIJKLMNOP"), "ABCDEF", "truncate to 6");
assert.equal(normalizeRoomCode(null), "", "null -> empty");
assert.equal(normalizeRoomCode(undefined), "", "undefined -> empty");

// ---- normalizeOnlineConfig ----
const base = normalizeOnlineConfig({});
assert.equal(base.mode, "direct", "default mode");
assert.equal(base.ai, 1, "default ai");
assert.equal(base.time, 6, "default time");
assert.equal(base.side, "home", "default side");
assert.equal(base.formations.red, "2-3-1", "default red formation");

const hostile = normalizeOnlineConfig({
  mode: "hack",
  red: "nowhere",
  blue: "nowhere",
  ai: 99,
  time: -1,
  side: "sideways",
  formations: { red: "9-9-9", blue: "hack" },
});
assert.equal(hostile.mode, "direct", "bad mode -> direct");
assert.equal(hostile.red, "argentina", "bad team -> argentina");
assert.notEqual(hostile.blue, hostile.red, "same team -> swapped");
assert.equal(hostile.ai, 1, "bad ai -> 1");
assert.equal(hostile.time, 6, "bad time -> 6");
assert.equal(hostile.side, "home", "bad side -> home");
assert.equal(hostile.formations.red, "2-3-1", "bad formation -> default");
assert.equal(hostile.formations.blue, "3-2-1", "bad formation -> default");

// ---- sanitizeOnlineInput ----
const input = sanitizeOnlineInput({ vx: 5, vy: -3, shoot: "yes", sprint: 0, pass: 1 });
assert.equal(input.vx, 1, "vx clamped to 1");
assert.equal(input.vy, -1, "vy clamped to -1");
assert.equal(input.shoot, true, "truthy shoot");
assert.equal(input.sprint, false, "falsy sprint");
assert.equal(input.pass, true, "truthy pass");
assert.equal(input.lob, false, "absent lob -> false");
assert.deepEqual(sanitizeOnlineInput(null), {
  vx: 0, vy: 0, shoot: false, sprint: false, pass: false, lob: false,
  switchPlayer: false, tackle: false,
}, "null input -> all defaults");

// ---- canStartOnlineRoom ----
assert.equal(canStartOnlineRoom({ mode: "direct" }, { screen: true }), true, "direct needs only screen");
assert.equal(canStartOnlineRoom({ mode: "direct" }, { screen: false }), false, "direct without screen");
assert.equal(
  canStartOnlineRoom({ mode: "controllers" }, { screen: true, pads: [{ slot: 0 }, { slot: 1 }] }),
  true,
  "controllers with both pads",
);
assert.equal(
  canStartOnlineRoom({ mode: "controllers" }, { screen: true, pads: [{ slot: 0 }] }),
  false,
  "controllers with one pad",
);

console.log("verify-shared: all assertions passed");
