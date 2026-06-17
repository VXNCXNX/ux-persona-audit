# Report-data contract

The HTML template renders entirely from one report-data object. Build this object
in synthesis (Phase 4), write it to JSON, and let `scripts/build_report.mjs` inject
it (the script embeds the JSON in a `<script type="application/json">` tag that the
page parses on load). Read `assets/sample-data.json` for a full worked example; this
file documents each field and how to write it well.

The report ships in **light and dark themes** with a toggle in the header; it
defaults to the reader's system preference and remembers their choice. You author
the content once, the same data drives both themes. There is nothing theme-related
to write.

## Top-level shape

```json
{
  "meta": { ... },
  "verdict": [ { "tag": "...", "text": "..." }, ... ],
  "personas": [ { ... } ],
  "briefs": [ { "id": "seo", "label": "Brief SEO", "items": ["..."] }, ... ]
}
```

The **friction ledger** (a single ranked list of every persona's top friction,
worst-first) is derived automatically from `personas[].friction`; you do not write
it. The **Exit interview** section is likewise assembled automatically from
`personas[].reflection`: you author each persona's answers, the template pivots them
by question. `matrix` is no longer rendered (the cast strip and per-persona chips
replace it) but is still accepted, so old data builds without error; you can omit it.

### meta

```json
{
  "brand": "Switchboard",
  "descriptor": "feature-flag SaaS",
  "headline": "Six buyers walked the funnel.",
  "headlineLead": "One made it through.",
  "standfirst": "Six prospective buyers, each arriving from a different place, walked the real signup flow. **Five left before converting.** Here is what stopped each, in their own words.",
  "site": "switchboard.example",
  "date": "17 June 2026",
  "flow": ["landing", "pricing", "signup"],
  "method": "reasoned"
}
```

- `headline` — **the hook**, the single most important line in the report. Write a
  short, concrete finding, not a description. State the outcome. "Six buyers walked
  the funnel." beats "A UX audit of the signup flow." It renders as the large
  display headline.
- `headlineLead` — the second line, rendered on its own line in the accent color.
  Make it the punch: the result. "One made it through." / "Nobody reached checkout."
  / "Only the engineer converted." Optional; if omitted, only `headline` shows.
- `standfirst` — one or two sentences under the headline: who the panel were and the
  one-line stakes. Supports `**bold**` for the key clause. Keep it tight.
- `brand` — the product/brand name for the kicker (rendered uppercase). If omitted,
  it is derived from `site` (the part before the first dot).
- `descriptor` — a 2 to 4 word category shown in the kicker (for example
  "feature-flag SaaS", "freelance tax tool"). Optional.
- `flow` — the journey steps; rendered as a `landing → pricing → signup` path chip.
- `method` — `"reasoned"` (WebFetch, you reasoned the transitions) or `"clicked"`
  (a real browser drove the clicks). Renders a small honesty note in the footer so a
  reader trusts the right things. Omit only if you genuinely cannot say.
- `site`, `date` — shown in the header line.

Legacy fields still accepted as fallbacks: `title` (used as the headline if
`headline` is absent), `subtitle` (used as the standfirst if `standfirst` is absent).
`eyebrow`, `title_highlights`, `stats`, and `flowLabel` are no longer rendered; you
can drop them.

### verdict — "The pattern"

Exactly 3 items. Each is the biggest *cross-persona* pattern, named in a 2 to 4
word `tag` plus one tight sentence of `text`. This is the part a busy founder reads.
The `tag` renders as a bold lead-in to the sentence ("**Pricing hides where buyers
decide.** The number a buyer needs is missing exactly where they look..."), so write
`text` to continue naturally from the tag. Do not recap individuals here; name the
systemic issues. `text` supports `**bold**`.

### personas

```json
{
  "initial": "P",
  "name": "Priya",
  "short": "frontend engineer",
  "meta": "33, evaluating flags for her team's React app",
  "outcome": { "completed": true, "landedOn": "Free signup, running the SDK" },
  "chips": [
    { "k": "From", "v": "Hacker News thread" },
    { "k": "Mindset", "v": "DX-driven" }
  ],
  "improvements": [
    "Surface the SDK quickstart on the landing page, not only in the docs. **It is what actually converts her.**",
    "Link Docs from the top nav; she found them by guessing the /docs URL."
  ],
  "verbatim": "The quickstart sold me, three lines and the flag flipped. I just wish I hadn't had to guess the /docs URL.",
  "friction": { "severity": "S2", "text": "The one thing that converts her is **only reachable by guessing the docs URL**, absent from the landing and the nav." }
}
```

Each persona renders twice: as a chip in the top **cast strip** (monogram, name,
role, an outcome dot), and as a full **block** in "Person by person".

- `initial` — the monogram letter. Defaults to the first letter of `name`.
- `name`, `short` — name and a short role label (for example "frontend engineer").
  `short` is shown under the name, in the cast strip, and in the quote attribution.
- `meta` — a one-line human bio under the name.
- `outcome` — `{ "completed": true|false, "landedOn": "..." }`. `completed` drives the
  green "done" / muted "dropped" pill and the cast-strip dot. Be honest: one true
  badge among several false ones makes the report read as a real audit, not a hit
  piece. `landedOn` is currently not rendered but is good to record.
- `chips` — `{ "k", "v" }` pairs (entry source, mindset, page). Rendered as the
  small meta list in the persona's identity rail. Keep 2 to 4, values short.
- `improvements` — 2 to 4 concrete, ranked actions in this persona's context,
  rendered as the "What would help {name}" analysis. Each supports `**bold**`.
- `verbatim` — one quote in the persona's own voice, rendered as the large
  pull-quote. This is what makes the report feel real; write it as the person would
  actually mutter it. Do not add quote marks, the design adds them.
- `friction` — the single top friction. `severity` is one of `S1`/`S2`/`S3`/`S4`
  from `references/friction-taxonomy.md` (the single source of truth for the scale)
  and renders a colored tag. `text` supports `**bold**`; do not bake the severity
  into the text (no trailing "(S4)"). These frictions are also collected, ranked
  worst-first, into the auto-generated **friction ledger** section.
- `reflection` — optional. 3 to 4 short **post-walkthrough answers** in the
  persona's own voice, as `{ "q", "a" }` pairs. Ask every persona the *same*
  ordered questions (trust before handing over their idea/data, free-vs-paid
  clarity, what almost made them leave, whether they would pay, what proof was
  missing). The template pivots them into the **Exit interview** section, grouping
  all personas' answers under each question so a cross-panel pattern is visible at
  a glance, so keep the questions and their order identical across personas. `a`
  supports `**bold**`; write it as the person would actually answer, not as a UX
  note. Omit `reflection` and the section simply does not render (back-compatible).

```json
"reflection": [
  { "q": "Did the pages give you enough to trust them before signing up?", "a": "The quickstart did it, three lines and the flag flipped. **I just had to dig to find it.**" },
  { "q": "Was it clear what is free versus what you pay for?", "a": "Free was enough to try the SDK, **but I confirmed that by doing it, not from the pricing page.**" }
]
```

Monogram colors are assigned automatically by position (a theme-aware palette that
adapts to light and dark), so a `color` field is no longer needed. A per-persona
`tag` is no longer rendered; the persona's story is carried by the quote, the
analysis, and the friction.

### briefs — "Recommendations"

The consolidated, deduped action lists across all personas. Use these four ids:
`seo`, `ux`, `nomenclature`, `bugs`. The `label` is the group heading. Each `items`
entry is one concrete action, ordered by priority.

An item is either a plain string, or an object that carries optional priority chips:

```json
{ "text": "Give the methodology a linked home in the top nav.", "impact": "High impact", "effort": "~1h" }
```

`impact` (accent chip) and `effort` (neutral chip) render after the item. Use them on
the few highest-leverage items per brief, not every line, so they stay signal.
Keep the labels short ("High impact", "Revenue", "~30 min", "Half-day"). Mixing
strings and objects in the same `items` array is fine. `text` supports `**bold**`.

### ui (optional, localization + label overrides)

The template's chrome strings default to English. To localize the whole report or
retune a label, set a `ui` object; any key you provide overrides the default.

```json
{
  "completed": "Signed up",
  "dropped": "Bounced",
  "patternLabel": "The pattern",
  "personasLabel": "Person by person",
  "personasTitle": "Where each buyer broke.",
  "ledgerLabel": "Friction ledger",
  "ledgerTitle": "Every block, worst first.",
  "exitLabel": "Exit interview",
  "exitTitle": "What the panel said after.",
  "recsLabel": "Recommendations",
  "recsTitle": "What to fix, in order.",
  "help": "What would help",
  "methodReasoned": "Reasoned walkthrough",
  "methodClicked": "Click-tested"
}
```

- `completed` / `dropped` label the per-persona outcome pill.
- `*Label` are the small accent section eyebrows; `*Title` are the section headings.
- `help` is the prefix before each persona's name in the analysis label ("What would
  help Priya"). Keep it name-friendly.
- `personasTitle` and `exitTitle` are worth tuning per audit (for example "Where
  each buyer broke.", "What the six buyers said after."); the rest are fine at
  their defaults.

### Inline emphasis

Prose fields, the `standfirst`, verdict `text`, persona `improvements`, the
`friction` text, and brief item text, support one bit of inline markdown:
`**double asterisks**` render as bold. Use it to mark the single most important
phrase in a sentence (the "where" of a friction, the payoff of a fix). One bold span
per item, at most. Everything else (the verbatim quote, names, chip values) renders
literally, so quotes keep their real punctuation.

## Writing principles

- The `headline` carries the report. Make it a finding with an outcome, not a label.
- Concrete over abstract. "Rename Solutions to By role" beats "improve nav clarity".
- Cross-persona patterns earn the verdict and the top of each brief.
- Keep validations visible. If the flow works for a segment, the report should say
  so; one honest success makes the failures credible.
- Write in English by default; localize via the `ui` object only when the user asks.
