import { excuses as source } from "./excuses.js";

// Frozen so one caller cannot change what every other caller in the process gets.
export const excuses = Object.freeze(
  source.map((e) =>
    Object.freeze({ id: e.id, topic: e.topic, says: Object.freeze({ ...e.says }), means: Object.freeze({ ...e.means }) }),
  ),
);
export const LANGS = Object.freeze(["en", "ar", "arabizi"]);
export const TOPICS = Object.freeze(["when", "where", "why"]);
export const DEFAULT_LANG = "en";

const MAX_OPTION_LENGTH = 16;

// Shared check for lang and topic: a string from a fixed list, case-insensitive.
function pick(name, value, allowed, fallback) {
  if (value != null && typeof value !== "string") {
    throw new TypeError(`${name} must be a string`);
  }
  // Empty or missing counts as the fallback, so `excuse()` and `excuse({ lang: "" })` behave the same.
  const chosen = value || fallback;
  if (chosen === undefined) return undefined;
  // Length first, so a huge string is rejected before any work is done on it.
  if (chosen.length > MAX_OPTION_LENGTH || !allowed.includes(chosen.toLowerCase())) {
    const shown = JSON.stringify(chosen.slice(0, 40).toWellFormed());
    throw new RangeError(`unknown ${name} ${shown}, expected one of: ${allowed.join(", ")}`);
  }
  return chosen.toLowerCase();
}

export function normalizeLang(lang) {
  return pick("lang", lang, LANGS, DEFAULT_LANG);
}

export function normalizeTopic(topic) {
  return pick("topic", topic, TOPICS, undefined);
}

function draw(random, size) {
  const r = random();
  if (typeof r !== "number" || !(r >= 0 && r < 1)) {
    throw new RangeError("random() must return a number in [0, 1)");
  }
  return Math.floor(r * size);
}

const byTopic = Object.fromEntries(TOPICS.map((t) => [t, excuses.filter((e) => e.topic === t)]));

export function excuse(options = {}, random = Math.random) {
  if (options === null || typeof options !== "object") {
    throw new TypeError("options must be an object");
  }
  if (typeof random !== "function") {
    throw new TypeError("random must be a function");
  }
  const lang = normalizeLang(options.lang);
  const topic = normalizeTopic(options.topic);
  const pool = topic ? byTopic[topic] : excuses;
  const chosen = pool[draw(random, pool.length)];
  return {
    id: chosen.id,
    topic: chosen.topic,
    lang,
    says: chosen.says[lang],
    means: chosen.means[lang],
    // Percent, never above 19. Why: docs/knowledge/confidence-cap.md
    confidence: 1 + draw(random, 19),
  };
}
