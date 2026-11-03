#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { excuse, normalizeLang, LANGS, TOPICS } from "../src/index.js";

const QUESTIONS = { when: "When will it be done?", where: "Where are you?", why: "Why isn't it done?" };
const MAX_ANSWER_BYTES = 1024;
const REAL = { when: "real ETA", where: "really", why: "real reason" };

const HELP = `Usage: ma3lesh [${TOPICS.join("|")}] [--lang ${LANGS.join("|")}] [--json] [--ask]

Get a Jordanian excuse, and what it really means.

  when           ${QUESTIONS.when}
  where          ${QUESTIONS.where}
  why            ${QUESTIONS.why}
                 With no topic, ma3lesh asks in a terminal and picks any topic otherwise.

  --lang, -l     language of the answer (default: en)
  --json         print the full result as JSON
  --ask          always ask which topic, reading the answer from stdin
  --version, -v  print the version
  --help, -h     show this help`;

// Hand-rolled on purpose. Why: docs/knowledge/zero-dependencies.md
function parse(argv) {
  const opts = { topic: undefined, lang: undefined, json: false, ask: false, help: false, version: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") opts.help = true;
    else if (arg === "--version" || arg === "-v") opts.version = true;
    else if (arg === "--json") opts.json = true;
    else if (arg === "--ask") opts.ask = true;
    else if (arg === "--lang" || arg === "-l") {
      const value = argv[++i];
      if (value === undefined || value === "" || value.startsWith("-")) throw new Error(`${arg} needs a value`);
      opts.lang = value;
    } else if (arg.startsWith("--lang=")) {
      opts.lang = arg.slice("--lang=".length);
      if (!opts.lang) throw new Error("--lang needs a value");
    } else if (!arg.startsWith("-") && arg !== "") {
      if (opts.topic !== undefined) throw new Error(`unexpected argument ${JSON.stringify(arg.slice(0, 40).toWellFormed())}`);
      opts.topic = arg;
    } else throw new Error(`unknown option ${JSON.stringify(arg.slice(0, 40).toWellFormed())}`);
  }
  if (opts.ask && opts.topic !== undefined) throw new Error("give a topic or --ask, not both");
  return opts;
}

// Reads one answer from stdin. The prompt goes to stderr so --json output stays clean.
function askTopic() {
  const menu = TOPICS.map((t, i) => `  ${i + 1}) ${t.padEnd(6)} ${QUESTIONS[t]}`).join("\n");
  process.stderr.write(`What do you need an excuse for?\n${menu}\n> `);
  return new Promise((resolve, reject) => {
    const rl = createInterface({ input: process.stdin, terminal: false });
    let done = false;
    const finish = (fn, value) => {
      if (done) return;
      done = true;
      rl.close();
      // Release stdin too, or a caller that keeps the pipe open would keep the process alive.
      process.stdin.destroy();
      fn(value);
    };
    rl.on("line", (line) => {
      const answer = line.trim().toLowerCase();
      const byNumber = TOPICS[Number(answer) - 1];
      const topic = /^[1-9]$/.test(answer) ? byNumber : TOPICS.find((t) => t === answer);
      if (topic) finish(resolve, topic);
      else finish(reject, new Error(`pick 1 to ${TOPICS.length} or one of: ${TOPICS.join(", ")}`));
    });
    rl.on("close", () => finish(reject, new Error("no topic chosen")));
    rl.on("error", (err) => finish(reject, err));
    // An answer is a word or a digit. Stop reading early so a huge pipe can't exhaust memory.
    let seen = 0;
    process.stdin.on("data", (chunk) => {
      seen += chunk.length;
      if (seen > MAX_ANSWER_BYTES) finish(reject, new Error("answer too long"));
    });
    // Ctrl-C is left to Node's default signal handling: readline emits no SIGINT with terminal: false.
  });
}

function format(result) {
  return `${result.says}\n(${REAL[result.topic]}: ${result.means}, confidence ${result.confidence}%)`;
}

async function main() {
  const opts = parse(process.argv.slice(2));
  if (opts.help) return console.log(HELP);
  if (opts.version) {
    return console.log(JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version);
  }
  // Check lang before asking, so nobody answers the menu only to hit a lang error.
  normalizeLang(opts.lang);
  // Only prompt when a person can see the prompt and answer it. Why: docs/knowledge/topics.md
  const interactive = process.stdin.isTTY && process.stdout.isTTY && process.stderr.isTTY;
  const topic = opts.ask || (opts.topic === undefined && interactive) ? await askTopic() : opts.topic;
  const result = excuse({ topic, lang: opts.lang });
  console.log(opts.json ? JSON.stringify(result, null, 2) : format(result));
}

main().catch((err) => {
  console.error(`ma3lesh: ${err.message}\nTry 'ma3lesh --help'.`);
  process.exitCode = 1;
});
