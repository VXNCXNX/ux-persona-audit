#!/usr/bin/env node
// Inject a report-data JSON file into the standalone HTML template.
// Usage: node build_report.mjs <data.json> [-o out.html] [-t template.html]
// No dependencies. The template carries an __UX_AUDIT_DATA__ placeholder inside a
// <script type="application/json"> tag; we replace it with the JSON text.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);

let dataPath, outPath, templatePath;
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "-o") outPath = argv[++i];
  else if (a === "-t") templatePath = argv[++i];
  else if (!a.startsWith("-") && !dataPath) dataPath = a;
}

if (!dataPath) {
  console.error("Usage: node build_report.mjs <data.json> [-o out.html] [-t template.html]");
  process.exit(1);
}

templatePath = templatePath || resolve(here, "../assets/report-template.html");
outPath = outPath || dataPath.replace(/\.data\.json$|\.json$/i, "") + ".html";

let data;
try {
  data = JSON.parse(readFileSync(dataPath, "utf8"));
} catch (e) {
  console.error("Invalid JSON in " + dataPath + ": " + e.message);
  process.exit(1);
}

// Light validation. The template degrades gracefully (empty state on no meta,
// sections skipped when absent), so these are warnings, not errors: a partial
// report is more useful than a failed build mid-audit. Findings go to stderr.
function warn(msg) { console.warn("warning: " + msg); }
(function validate(d) {
  if (!d || typeof d !== "object") { warn("data is not an object; the report will show its empty state."); return; }
  if (!d.meta) warn("no `meta`; the report will render its empty state. Add meta.headline (or meta.title) at minimum.");
  else if (!d.meta.headline && !d.meta.title) warn("no meta.headline or meta.title; the hero will have no headline.");
  if (!Array.isArray(d.personas) || d.personas.length === 0) warn("no `personas`; the report has no persona cards.");
  if (Array.isArray(d.verdict) && d.verdict.length !== 3) warn("verdict has " + d.verdict.length + " items; the design expects exactly 3.");
  const SEV = new Set(["S1", "S2", "S3", "S4"]);
  (d.personas || []).forEach(function (p) {
    if (p && p.friction && p.friction.severity && !SEV.has(String(p.friction.severity).toUpperCase()))
      warn("persona '" + (p.id || p.name || "?") + "' has friction.severity '" + p.friction.severity + "'; expected one of S1-S4 (see references/friction-taxonomy.md). It will not render a tag.");
    if (p && p.outcome && typeof p.outcome.completed !== "boolean")
      warn("persona '" + (p.id || p.name || "?") + "' has an outcome without a boolean `completed`; no outcome badge will show.");
  });
  (d.briefs || []).forEach(function (b) {
    (b.items || []).forEach(function (it) {
      if (it != null && typeof it !== "string" && typeof it !== "object")
        warn("brief '" + (b.id || b.label || "?") + "' has an item that is neither a string nor an object; it may render oddly.");
    });
  });
})(data);

const template = readFileSync(templatePath, "utf8");
if (!template.includes("__UX_AUDIT_DATA__")) {
  console.error("Template is missing the __UX_AUDIT_DATA__ placeholder: " + templatePath);
  process.exit(1);
}

// Embed inside <script type="application/json">. Only < and > need neutralizing
// to avoid a </script> breakout; JSON.parse decodes the \u00XX escapes back.
const json = JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");

writeFileSync(outPath, template.replace("__UX_AUDIT_DATA__", json));
console.log("Wrote " + outPath);
