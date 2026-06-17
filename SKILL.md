---
name: ux-persona-audit
description: >-
  Run a multi-persona UX audit of a website. Spins up a diverse panel of AI
  personas, each arriving from a different traffic source (Google, X, Instagram,
  a referral, direct) and carrying a different goal and mindset, then has each
  one walk the real pages and note where they get stuck, backtrack, or cannot
  find what they came for. Synthesizes everything into a polished standalone
  HTML report (light and dark themes): a headline verdict, the cast of personas,
  per-persona fixes with verbatim quotes and the top friction, a ranked friction
  ledger, an exit interview where each persona answers the same post-walkthrough
  questions, and consolidated SEO / UX / nomenclature / quick-win briefs. Use this
  whenever the user wants to audit, review, or
  stress-test a site's UX or conversion flow, simulate real users or customer
  journeys, find friction / confusion / drop-off points, pressure-test a landing
  page or funnel, or asks things like "where do visitors get stuck", "how does
  my site feel to a real user", "test my page with different personas", or
  "parcours client". Trigger even when the user does not say the words "persona"
  or "audit" but is clearly asking how their site performs for real visitors.
license: MIT
---

# UX Persona Audit

## Why this works

Real users do not arrive as one average visitor. They come from an X thread, a
Google search, an Instagram ad, a friend's link, each with a different goal,
mindset, and patience. A page that is obvious to one person is opaque to
another. The whole point of this skill is to make that variance visible: run a
*panel* of deliberately different personas through the real site in parallel,
capture each one's think-aloud journey, and turn the friction into a prioritized
report the user can act on.

This is a scaled **cognitive walkthrough** (does the persona notice the action,
associate it with their goal, and see progress?) layered with **Nielsen's
heuristics** and **jobs-to-be-done**. Nielsen Norman research is the reason for
the panel size: roughly 10 testers surface the large majority of usability
issues, so 6 to 8 *diverse* personas hit the sweet spot of coverage without
noise. Diversity of traffic source and mindset matters far more than
demographics, because that is what actually changes behavior on a page.

## Scope: the public acquisition surface (V1)

V1 audits everything a logged-out visitor sees: the landing page, the marketing
site, pricing, and the conversion funnel up to the signup or paywall boundary. For a
SaaS that is the entire pre-login journey, the part that decides whether someone ever
becomes a user, and it is reachable without credentials.

It deliberately stops at the login/signup wall. Testing the authed product, the
onboarding wizard, and in-app flows needs real credentials, seeded test accounts, and
a real browser driving the session: a heavier, different job planned for V2. If the
user asks to audit the in-product experience, say that is out of V1 scope and offer
to cover the pre-signup funnel thoroughly instead.

## Pipeline

```
0. Scope        what site, what flow, what language, how many personas, browser backend, subagent model
1. Recon        visit the real pages, infer the product and its ICP
2. Personas     load saved panel, or generate, validate ICPs with the user, save for reuse
3. Walkthroughs one subagent per persona, in parallel, each walks the flow and logs friction
4. Synthesis    verdict, per-persona fixes, exit interview, consolidated briefs
5. Report       render the standalone HTML from the bundled template and open it
```

Do not skip the recon or the persona validation. A panel built on a wrong guess
about who the site serves produces a confident, useless report.

---

## Phase 0 — Scope and browser backend

Settle these before doing anything else. Ask the user only for what you cannot
infer; default the rest and state your defaults.

- **Target**: the URL (or a local dev URL). If the user is inside a repo, you may
  also read the landing source for extra context in Phase 1, but the audit is
  always of the live rendered pages.
- **Flow / journey**: the path to test (for example `landing -> pricing -> signup`,
  or `landing -> country hub -> chosen plan`). If unspecified, infer the 1 to 3
  critical journeys during recon and confirm.
- **Persona count**: scale to the ask. A quick check is 3 to 4; a thorough audit
  is 6 to 8. Default 6.
- **Language**: write the report in **English by default**. The skill is
  English-first for a global audience. You can match the audited site's language on
  request by localizing the `ui` strings (see `references/report-structure.md`), but
  do not default to it.

**Browser backend** — pick the highest tier available, decided at runtime:

1. **Real browser** via a connected Playwright MCP or any browser MCP. Personas
   navigate click by click, which catches real backtracking, broken links, and
   slow loads. This is the highest-fidelity option. Recommend the user connect a
   Playwright MCP if none is present and they want true navigation.
2. **WebFetch fallback** (always available). Fetch each page in the flow and have
   the persona reason through the transitions. This is exactly what a careful
   manual audit does, and it is the default when no browser tool is connected.

State which backend you are using. Never assume a private or house-specific tool
exists; detect, then degrade gracefully. Record the choice as `meta.method`
(`"reasoned"` for WebFetch, `"clicked"` for a real browser) so the report shows a
small honesty chip.

**The SPA caveat.** Many modern sites are JavaScript single-page apps: a plain
WebFetch returns the non-hydrated HTML shell, often just a spinner, an empty root
div, or a `<noscript>` "your browser is not supported" fallback, none of which a
real visitor with JS sees. Treat that shell as *missing data, not a finding*. Never
report a `<noscript>` message, a bare "Loading...", or an empty page as observed
friction. If a fetched page looks like an unhydrated shell, say so and either reason
from other evidence or flag the point as **unverified, needs a real browser**. This
is the single most common way a fetch-based audit invents a bug that is not there.

**Subagent model.** Phase 3 fans out one subagent per persona, 6 to 8 running at
once. Ask the user which model those subagents should run on, with
`AskUserQuestion`:

- **Sonnet (default, recommended)** — fast, and light enough that a panel of 6 to 8
  parallel personas will not blow through usage limits. Works on every plan,
  including Claude Pro. Pick this unless the user wants more depth.
- **Opus** — richer, more in-character reasoning per persona, at a much higher token
  cost. Running 6 to 8 Opus subagents in parallel needs headroom: a **Max 5x plan at
  the bare minimum**, and Max 20x to be comfortable. On Pro or a smaller plan it will
  hit usage limits partway through the panel and the audit stalls, so only offer it
  when the user has the plan for it.

Default to Sonnet if the user does not care. Pass the choice as the `model` on each
Agent call in Phase 3. Synthesis (Phase 4) runs on your main model regardless, so
the persona model changes the walkthrough depth, not the final write-up.

---

## Phase 1 — Recon

Visit the entry page and the main pages in the flow with the chosen backend.
Establish, in your own notes:

- What the product is and the single job it sells.
- Who it appears built for (the ICP), inferred from the copy, pricing, and
  proof. This seeds the personas.
- The real navigation: what links exist, what the primary CTA is, where the
  journey can branch or dead-end.
- The page language.

Keep this lightweight. You are mapping the territory, not auditing yet.

---

## Phase 2 — Build the persona panel

Read `references/persona-schema.md` before generating. It defines the trait
template and, more importantly, *which* traits change behavior so the panel is
diverse on the axes that matter.

**Reuse first.** Personas are expensive to get right and worth keeping. Compute a
site slug (hostname without `www`, dots to dashes, for example
`preuve.ai` -> `preuve-ai`) and check `./.ux-audit/personas/<slug>.json`.

- If it exists, load it, show the panel, and ask whether to reuse as-is, edit, or
  regenerate.
- If not, generate a fresh panel from the recon.

**Generate** 6 to 8 personas (or the requested count) that are spread across:

- **Traffic source** — at minimum cover Google/organic, a social referral
  (X / Instagram / Facebook, pick what fits the product), a direct/branded
  visit, and a word-of-mouth referral. Source sets the landing expectation.
- **Mindset** — include at least one skeptic and one believer; vary urgency.
- **Goal / JTBD** — different reasons for being on the site.
- **Tech level and device** — include at least one mobile and one low-tech
  persona; they fail differently.

**Validate the ICP with the user.** This is required, and it is the cheapest way
to avoid a wrong-audience report. Present the panel compactly (name, one-line
archetype, source, mindset, goal) and use `AskUserQuestion` to confirm or adjust:
offer "run this panel", "swap or edit a persona", "regenerate". Fold their edits
back in.

**Save** the final panel to `./.ux-audit/personas/<slug>.json` so the next run
starts from it. Mention the path so the user knows it is reusable and
git-ignorable.

---

## Phase 3 — Parallel walkthroughs

Dispatch **one subagent per persona, all in the same turn** so they run
concurrently (see the `superpowers:dispatching-parallel-agents` skill if you want
the pattern), each on the subagent model chosen in Phase 0 (pass it as the Agent
`model`: Sonnet by default, Opus only if the user opted in and has the plan for it).
Each subagent gets:

- Its full persona (from the panel JSON).
- The flow / tasks to attempt.
- The 3 to 4 **post-walkthrough questions** to answer in character, the same set
  for every persona (trust, free-vs-paid clarity, what almost made them leave,
  willingness to pay, missing proof).
- The path to `references/friction-taxonomy.md` to tag findings consistently.
- The browser backend instructions from Phase 0.
- The required structured output (the persona-findings object in
  `references/report-structure.md`).

Give every persona subagent these standing rules in its prompt:

> Stay in character. You are this person, with their goal, source, and mindset,
> not a UX expert. Narrate a think-aloud as you move through the flow: what you
> expected, what you see, what you click, what confuses you. Use **only**
> information actually present on the pages, never outside knowledge of the
> product, because the gaps in what the page tells you are the findings. Record
> every point where you had to go back, hunt, or could not find what you came
> for. Tag each friction with a category and a severity (S1 to S4) from the
> taxonomy. End with: a single verbatim quote in your own voice, your top
> friction, where you intended to land versus where you actually ended up, and
> whether you completed the job, and a short answer, in character, to each
> post-walkthrough question you were handed (say what you actually felt; the gaps
> are the point). If a page you fetch looks like an empty or
> not-yet-loaded shell (a spinner, a blank root element, or a "browser not
> supported" message), that is the JS app failing to render for a fetch, not
> something a real visitor sees: do not log it as friction, flag it as
> "unverified, needs a real browser" instead.

Collect each subagent's findings object.

---

## Phase 4 — Synthesis

Pull all persona findings together and look for patterns *across* personas, which
is where the real signal lives (one person's complaint is anecdote; the same wall
hit by four is a roadmap). Produce the report-data object defined in
`references/report-structure.md`:

- **Headline** — `meta.headline` plus `meta.headlineLead`: the hook, the first thing
  the reader sees. A short, concrete finding that states the outcome ("Six buyers
  walked the funnel." / "One made it through."), never a flat description.
- **Verdict** (renders as "the pattern") — 3 short lines naming the biggest
  cross-persona patterns, not a per-persona recap. Each is a 2-to-4-word tag plus
  one tight sentence.
- **Per-persona** — a ranked "what to improve" list, the verbatim quote, the top
  friction with its `severity` (S1 to S4), and an `outcome` (did they finish the
  job). Keep the outcomes honest: a panel where one persona succeeds and five fail
  reads as a real audit; all-fail reads as a hit piece. The personas also populate
  the cast strip and the **friction ledger** (every top friction, auto-ranked
  worst-first), so you do not author the ledger separately.
- **Exit interview** — collect each persona's `reflection`: the same 3 to 4
  post-walkthrough questions, answered in their own voice. Ask everyone the same
  questions in the same order; the report pivots them per question so the panel's
  agreement or split is visible at a glance. This is where willingness-to-pay and
  the trust gap surface in the user's own words. Optional, but high-signal.
- **Consolidated briefs** — dedup findings into action groups: **SEO**, **UX**,
  **Nomenclature** (naming/labels), **Bugs / quick wins**. Each item is a
  concrete action, not an observation. Note effort vs impact on the highest-leverage
  items so the user knows what to do first.

Write honest findings. If a persona sailed through, say so; validations are as
useful as problems.

---

## Phase 5 — Render the report

The look is a bundled, data-driven template, so you never hand-write HTML or CSS.
You only produce the data.

1. Write the report-data object to `./.ux-audit/reports/<slug>-<date>.data.json`.
2. Build the report:
   ```bash
   node <skill-dir>/scripts/build_report.mjs ./.ux-audit/reports/<slug>-<date>.data.json \
     -o ./.ux-audit/reports/<slug>-<date>.html
   ```
   If Node is unavailable, fall back: copy `assets/report-template.html`, and
   replace the `__UX_AUDIT_DATA__` placeholder with the JSON (the script just does
   this string injection).
3. Open the report (`open` on macOS, `xdg-open` on Linux) and tell the user the
   path. Give a 3-line spoken summary of the verdict so they get the gist without
   opening it.

`assets/report-template.html` is self-contained: inline CSS and JS, no network
fonts, renders from the injected report-data JSON. It ships in light and dark themes
with a header toggle, defaulting to the reader's system preference and remembering
their choice, so a consultant can white-label it and the recipient picks the look.
`assets/sample-data.json` is a full worked example you can read to see the exact
shape the template expects.

---

## Scaling and honesty

- Match effort to the request. "Quick gut check" is 3 personas and a fetch pass;
  "thorough audit before launch" is 8 personas with real navigation.
- Report what actually happened. If the backend was WebFetch and you reasoned a
  path rather than clicking it, say the report is a reasoned walkthrough, not a
  click-tested one. Do not present theorized friction as observed friction.
- The personas exist to find truth, not to flatter or to manufacture problems. A
  short, accurate report beats a padded one.

## Files

- `references/persona-schema.md` — persona JSON shape and the traits that matter.
- `references/friction-taxonomy.md` — friction categories, S1 to S4 severity,
  Nielsen heuristics. Hand the path to persona subagents.
- `references/report-structure.md` — the report-data JSON contract the template
  consumes, plus per-section writing guidance.
- `assets/report-template.html` — the standalone, data-driven report (light + dark
  themes with a reader toggle).
- `assets/sample-data.json` — a full worked example of report-data.
- `scripts/build_report.mjs` — injects data into the template (Node, no deps),
  with light validation that warns on a missing section or a bad severity value.
- `test/smoke.mjs` — builds the sample and a malformed fixture, asserts the
  placeholder is gone and the data round-trips. Run with `node test/smoke.mjs`.
- `README.md` — what the skill is and a rendered sample, for sharing.
