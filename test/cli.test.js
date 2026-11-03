import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const cli = fileURLToPath(new URL("../bin/ma3lesh.js", import.meta.url));
// stdin is a pipe here, never a terminal, so ma3lesh must not wait for an answer unless --ask is given.
const run = (args, input = "") =>
  spawnSync(process.execPath, [cli, ...args], { encoding: "utf8", input, timeout: 10_000 });

test("CLI with no topic and piped stdin picks any topic without asking", () => {
  const { status, stdout, stderr } = run([]);
  assert.equal(status, 0);
  assert.equal(stderr, "");
  assert.match(stdout, /\((real ETA|really|real reason): .+, confidence \d+%\)/);
});

test("CLI topic argument picks from that topic and labels it", () => {
  const labels = { when: "real ETA", where: "really", why: "real reason" };
  for (const [topic, label] of Object.entries(labels)) {
    const { status, stdout } = run([topic, "--json"]);
    assert.equal(status, 0, topic);
    assert.equal(JSON.parse(stdout).topic, topic);
    assert.match(run([topic]).stdout, new RegExp(`\\(${label}: `), topic);
  }
});

test("CLI --json --lang ar prints parseable Arabic", () => {
  const { status, stdout } = run(["--json", "--lang", "ar"]);
  assert.equal(status, 0);
  const result = JSON.parse(stdout);
  assert.equal(result.lang, "ar");
  assert.match(result.says, /\p{Script=Arabic}/u);
});

test("CLI accepts --lang=arabizi and -l ar", () => {
  assert.equal(JSON.parse(run(["--lang=arabizi", "--json"]).stdout).lang, "arabizi");
  assert.equal(JSON.parse(run(["-l", "ar", "--json"]).stdout).lang, "ar");
});

test("CLI --ask reads the topic by number or name, with the menu on stderr", () => {
  for (const [answer, topic] of [["2\n", "where"], ["why\n", "why"], [" WHEN \n", "when"]]) {
    const { status, stdout, stderr } = run(["--ask", "--json"], answer);
    assert.equal(status, 0, answer);
    assert.equal(JSON.parse(stdout).topic, topic, answer);
    assert.match(stderr, /What do you need an excuse for\?/);
  }
});

test("CLI --ask accepts CRLF, a missing final newline, and uses only the first line", () => {
  for (const [answer, topic] of [["where\r\n", "where"], ["3", "why"], ["1\n2\n3\n", "when"]]) {
    const { status, stdout } = run(["--ask", "--json"], answer);
    assert.equal(status, 0, JSON.stringify(answer));
    assert.equal(JSON.parse(stdout).topic, topic, JSON.stringify(answer));
  }
});

// Spawns with stdin left open after the answer, the way a parent process might.
function runWithOpenStdin(args, answer) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [cli, ...args], { stdio: ["pipe", "pipe", "pipe"] });
    const timer = setTimeout(() => child.kill(), 5000);
    child.on("exit", (code, signal) => {
      clearTimeout(timer);
      resolve({ code, signal });
    });
    child.stdin.write(answer);
  });
}

test("CLI --ask exits on its own when stdin stays open after the answer", async () => {
  assert.deepEqual(await runWithOpenStdin(["--ask"], "2\n"), { code: 0, signal: null });
  assert.deepEqual(await runWithOpenStdin(["--ask"], "x\n"), { code: 1, signal: null });
});

test("CLI --ask rejects an answer longer than it will read", () => {
  const { status, stderr } = run(["--ask"], "x".repeat(5000));
  assert.equal(status, 1);
  assert.match(stderr, /ma3lesh: answer too long/);
});

test("CLI checks --lang before showing the menu", () => {
  const { status, stderr } = run(["--ask", "--lang", "fr"], "2\n");
  assert.equal(status, 1);
  assert.doesNotMatch(stderr, /What do you need/);
  assert.match(stderr, /unknown lang/);
});

test("CLI --ask fails cleanly on a bad answer or no answer", () => {
  for (const answer of ["9\n", "how\n", ""]) {
    const { status, stdout, stderr } = run(["--ask"], answer);
    assert.equal(status, 1, JSON.stringify(answer));
    assert.equal(stdout, "", JSON.stringify(answer));
    assert.match(stderr, /ma3lesh: .+\nTry 'ma3lesh --help'\./, JSON.stringify(answer));
  }
});

test("CLI --help and -h print usage and exit 0", () => {
  for (const flag of ["--help", "-h"]) {
    const { status, stdout } = run([flag]);
    assert.equal(status, 0, flag);
    assert.match(stdout, /Usage: ma3lesh/, flag);
  }
});

test("CLI --version and -v print the package version", () => {
  const { version } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  for (const flag of ["--version", "-v"]) {
    const { status, stdout } = run([flag]);
    assert.equal(status, 0, flag);
    assert.equal(stdout.trim(), version, flag);
  }
});

test("CLI escapes and truncates bad input in its error", () => {
  for (const arg of ["x\u001b[31m\nma3lesh: fake" + "y".repeat(5000), "-x\u001b[31m\nma3lesh: fake" + "y".repeat(5000)]) {
    const { status, stderr } = run([arg]);
    assert.equal(status, 1);
    assert.doesNotMatch(stderr, /\u001b/);
    assert.equal(stderr.split("\n").length, 3); // error line, hint line, trailing newline
    assert.ok(stderr.length < 200);
  }
});

test("CLI fails with exit 1 on bad input", () => {
  const cases = [
    ["--lang", "fr"], ["--lang"], ["--lang", ""], ["--lang="], ["--lang", "--json"], ["-l"], ["--nope"],
    ["how"], ["when", "where"], ["when", "--ask"],
  ];
  for (const args of cases) {
    const { status, stdout, stderr } = run(args);
    assert.equal(status, 1, args.join(" "));
    assert.equal(stdout, "", args.join(" "));
    assert.match(stderr, /^ma3lesh: .+\nTry 'ma3lesh --help'\./, args.join(" "));
  }
});
