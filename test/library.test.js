import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { excuse, excuses, LANGS, TOPICS } from "../src/index.js";

const MIN_PER_TOPIC = 8;

test("every excuse has a known topic and every field in every language", () => {
  for (const e of excuses) {
    assert.ok(TOPICS.includes(e.topic), `${e.id} has topic ${e.topic}`);
    for (const side of ["says", "means"]) {
      for (const lang of LANGS) {
        const value = e[side]?.[lang];
        assert.ok(typeof value === "string" && value.trim() === value && value.length > 0, `${e.id}.${side}.${lang} is empty or padded`);
      }
    }
  }
});

test(`every topic has at least ${MIN_PER_TOPIC} excuses, so picks don't repeat constantly`, () => {
  for (const topic of TOPICS) {
    const count = excuses.filter((e) => e.topic === topic).length;
    assert.ok(count >= MIN_PER_TOPIC, `${topic} has only ${count}`);
  }
});

test("ids are unique", () => {
  const ids = excuses.map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("ar is Arabic script, en and arabizi are ASCII", () => {
  for (const e of excuses) {
    for (const side of ["says", "means"]) {
      const { en, ar, arabizi } = e[side];
      // Arabic letters and marks, plus digits, punctuation and spaces. No Latin letters.
      assert.match(ar, /^[\p{Script_Extensions=Arabic}\p{Script=Common}]+$/u, `${e.id}.${side}.ar has non-Arabic letters`);
      assert.match(ar, /\p{Script=Arabic}/u, `${e.id}.${side}.ar has no Arabic`);
      assert.doesNotMatch(ar, /[A-Za-z]/, `${e.id}.${side}.ar has Latin letters`);
      assert.match(en, /^[\x20-\x7E]+$/, `${e.id}.${side}.en is not ASCII`);
      assert.match(arabizi, /^[A-Za-z0-9 '\-.,?!%]+$/, `${e.id}.${side}.arabizi has unexpected characters`);
    }
  }
});

test("excuses.json matches src/excuses.js (run npm run build:json)", () => {
  const json = JSON.parse(readFileSync(new URL("../excuses.json", import.meta.url), "utf8"));
  assert.deepEqual(json, excuses);
});

test("excuse() defaults to English, any topic, and returns a real pair", () => {
  const result = excuse();
  assert.equal(result.lang, "en");
  assert.ok(TOPICS.includes(result.topic));
  assert.ok(excuses.some((e) => e.id === result.id && e.topic === result.topic && e.says.en === result.says && e.means.en === result.means));
  assert.ok(Number.isInteger(result.confidence) && result.confidence >= 1 && result.confidence <= 19);
});

test("a topic only ever returns excuses from that topic", () => {
  for (const topic of TOPICS) {
    const pool = excuses.filter((e) => e.topic === topic);
    for (let i = 0; i < pool.length; i++) {
      const r = (i + 0.5) / pool.length;
      assert.equal(excuse({ topic }, () => r).id, pool[i].id);
    }
  }
});

test("empty lang means English and empty topic means any topic", () => {
  const result = excuse({ lang: "", topic: "" }, () => 1 - 2 ** -53);
  assert.equal(result.lang, "en");
  // The last excuse overall is a "why", so this proves "" did not narrow the pool to one topic.
  assert.equal(result.id, excuses.at(-1).id);
});

test("lang 'ar' returns Arabic for both fields", () => {
  const result = excuse({ lang: "ar" });
  assert.match(result.says, /\p{Script=Arabic}/u);
  assert.match(result.means, /\p{Script=Arabic}/u);
});

test("lang and topic are case-insensitive", () => {
  const result = excuse({ lang: "ARABIZI", topic: "Where" });
  assert.equal(result.lang, "arabizi");
  assert.equal(result.topic, "where");
});

test("an unknown lang or topic is rejected with the allowed values", () => {
  assert.throws(() => excuse({ lang: "fr" }), { name: "RangeError", message: /en, ar, arabizi/ });
  assert.throws(() => excuse({ topic: "how" }), { name: "RangeError", message: /when, where, why/ });
});

test("random maps [0, 1) onto the first and last excuse and confidence 1..19", () => {
  const low = excuse({}, () => 0);
  const high = excuse({}, () => 1 - 2 ** -53);
  assert.equal(low.id, excuses[0].id);
  assert.equal(low.confidence, 1);
  assert.equal(high.id, excuses.at(-1).id);
  assert.equal(high.confidence, 19);
});

test("non-string options and non-object option bags are TypeErrors", () => {
  assert.throws(() => excuse({ lang: 5 }), TypeError);
  assert.throws(() => excuse({ topic: {} }), TypeError);
  assert.throws(() => excuse("ar"), TypeError);
  assert.throws(() => excuse(null), TypeError);
});

test("excuses, LANGS and TOPICS cannot be changed by a caller", () => {
  assert.throws(() => excuses.push({}), TypeError);
  assert.throws(() => { excuses[0].says.en = "changed"; }, TypeError);
  assert.throws(() => { excuses[0].topic = "why"; }, TypeError);
  assert.throws(() => LANGS.push("fr"), TypeError);
  assert.throws(() => { LANGS.length = 0; }, TypeError);
  assert.throws(() => TOPICS.push("how"), TypeError);
});

test("excuse() rejects a random that is not a function or leaves [0, 1)", () => {
  assert.throws(() => excuse({}, null), TypeError);
  for (const bad of [1, -0.01, NaN, Infinity, "0.5", undefined]) {
    assert.throws(() => excuse({}, () => bad), { name: "RangeError" }, String(bad));
  }
});

test("a long or odd value is rejected without echoing it raw", () => {
  for (const key of ["lang", "topic"]) {
    assert.throws(() => excuse({ [key]: "x".repeat(1e6) }), (err) => err instanceof RangeError && err.message.length < 120);
    // A 30-emoji string cut at 40 code units would split a surrogate pair if not repaired.
    assert.throws(() => excuse({ [key]: "a" + "\u{1F600}".repeat(30) }), (err) => err.message.isWellFormed());
    assert.throws(() => excuse({ [key]: "when\n" }), (err) => !err.message.includes("\n"));
  }
});

test("the package exports resolve by name", async () => {
  const pkg = await import("ma3lesh");
  assert.equal(typeof pkg.excuse, "function");
  assert.deepEqual(pkg.TOPICS, ["when", "where", "why"]);
  const json = JSON.parse(readFileSync(fileURLToPath(import.meta.resolve("ma3lesh/excuses.json")), "utf8"));
  assert.deepEqual(json, pkg.excuses);
});
