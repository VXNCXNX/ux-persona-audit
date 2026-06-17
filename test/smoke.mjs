#!/usr/bin/env node
// Smoke test for the report build. No dependencies. Run: node test/smoke.mjs
//
// It proves the two things that actually break this skill in the field:
//   1. a real audit (the bundled sample) builds, and the data round-trips into
//      the page intact (right persona/brief counts, no broken <script> breakout);
//   2. a malformed audit still produces a file instead of crashing mid-run, and
//      lands on the template's empty state rather than a blank page.

import { execFileSync } from "node:child_process";
import { readFileSync, mkdtempSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const build = resolve(root, "scripts/build_report.mjs");
const tmp = mkdtempSync(join(tmpdir(), "ux-audit-test-"));

let passed = 0;
function check(name, fn) { fn(); passed++; console.log("  ok - " + name); }

function embeddedData(html) {
  const m = html.match(/<script id="ux-data" type="application\/json">([\s\S]*?)<\/script>/);
  assert.ok(m, "embedded ux-data script tag is present");
  return { json: m[1], data: JSON.parse(m[1]) };
}

// 1) the bundled sample builds and round-trips
console.log("sample-data.json:");
const sample = resolve(root, "assets/sample-data.json");
const sampleOut = join(tmp, "sample.html");
execFileSync("node", [build, sample, "-o", sampleOut], { stdio: "pipe" });
const sampleHtml = readFileSync(sampleOut, "utf8");
const sampleIn = JSON.parse(readFileSync(sample, "utf8"));

check("placeholder is replaced", () => assert.ok(!sampleHtml.includes("__UX_AUDIT_DATA__")));
check("data round-trips (personas, briefs, title)", () => {
  const { data } = embeddedData(sampleHtml);
  assert.equal(data.personas.length, sampleIn.personas.length);
  assert.equal(data.briefs.length, sampleIn.briefs.length);
  assert.equal(data.meta.title, sampleIn.meta.title);
});
check("no </script> breakout inside the embedded json", () => {
  const { json } = embeddedData(sampleHtml);
  assert.ok(!json.includes("</script>"));
});
check("exit-interview reflections round-trip", () => {
  const { data } = embeddedData(sampleHtml);
  const withRef = data.personas.filter((p) => Array.isArray(p.reflection) && p.reflection.length);
  assert.ok(withRef.length >= 2, "at least two personas carry reflection answers");
  assert.ok(withRef[0].reflection[0].q && withRef[0].reflection[0].a, "a reflection has both a question and an answer");
});
check("template carries the exit-interview render path", () => {
  assert.ok(sampleHtml.includes('class="exq-q"'), "exit-interview question markup is in the template");
});

// 2) a malformed audit degrades instead of crashing
console.log("malformed fixture:");
const malformed = resolve(here, "fixtures/malformed.json");
const malOut = join(tmp, "malformed.html");
execFileSync("node", [build, malformed, "-o", malOut], { stdio: "pipe" }); // warns, exits 0
const malHtml = readFileSync(malOut, "utf8");

check("malformed input still writes a file", () => assert.ok(malHtml.length > 0));
check("no meta in the embedded data (empty-state path)", () => {
  const { data } = embeddedData(malHtml);
  assert.ok(!data.meta);
});
check("template carries the empty-state copy", () => assert.ok(malHtml.includes("No report data")));

console.log("\n" + passed + " checks passed.");
