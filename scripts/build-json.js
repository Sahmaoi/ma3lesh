// Writes excuses.json from src/excuses.js, for anyone fetching the list over HTTP.
// Why it is committed and how it stays in sync: docs/knowledge/excuses-json-sync.md
import { writeFileSync } from "node:fs";
import { excuses } from "../src/excuses.js";

writeFileSync(new URL("../excuses.json", import.meta.url), JSON.stringify(excuses, null, 2) + "\n");
