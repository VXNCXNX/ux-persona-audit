# Persona schema

A panel is an array of persona objects, saved to
`./.ux-audit/personas/<site-slug>.json`. The template and the walkthrough agents
both read this shape.

## What makes a persona high-signal

Demographics alone predict almost nothing. Two 40-year-old managers in the same
city can behave in opposite ways. The traits that actually change what a person
does on a page, and therefore the traits the panel must vary, are:

- **Traffic source + landing expectation.** Where they came from sets what they
  expect to see first. A Google searcher for "X alternative" wants a comparison;
  an Instagram-ad clicker expects the ad's promise restated; a referral arrives
  pre-trusting and goal-directed. This is the single most behavior-shaping trait,
  so spread the panel across sources.
- **Mindset / skepticism.** Believer, neutral, skeptic. Skeptics need proof
  (reviews, guarantees, specifics) early or they leave; believers convert on ease.
- **Primary goal / JTBD.** The specific job they are trying to get done. Friction
  is the gap between that job and what the page supports.
- **Tech level and device.** A low-tech or mobile persona fails in places a
  desktop power user never notices. Include at least one of each.
- **Urgency and patience.** A rushed visitor abandons at the first extra step; a
  researcher tolerates depth but punishes vagueness.
- **Objections.** The 1 to 3 things that would make this person bounce (price,
  privacy, complexity, lock-in, "is this legit").

A good panel of 6 to 8 covers every traffic source the product really gets, at
least one skeptic and one believer, at least one mobile and one low-tech persona,
and a spread of goals. Avoid near-duplicates; each persona should be able to find
a problem the others cannot.

**The test for every persona: would they catch a real problem the others would
miss?** If a trait does not change where this person stalls, converts, or bounces,
it is decoration, cut it. This is why the panel varies on source, mindset, goal,
and objection, not on age, gender, or income. Abstract personality scoring (a Big
Five / OCEAN-style profile) reads as depth but rarely changes the walkthrough; vary
the disposition that actually bites instead, skeptic vs believer, rushed vs patient,
the specific objection, and let that drive the behavior. A persona that does not
change the finding is theater.

## Object shape

```json
{
  "id": "claire",
  "initial": "C",
  "color": "#7c5cff",
  "name": "Claire",
  "archetype": "Freelance dreamer, scanning for a lighter option",
  "demographics": "34, freelance graphic designer",
  "goal": "Pay less tax, no destination chosen yet",
  "device": "desktop",
  "tech_level": "medium",
  "traffic_source": "Google: \"moins d'impots freelance\"",
  "landing_expectation": "A profile-first answer about freelancer tax",
  "mindset": "Dreamer, low commitment",
  "objections": ["50k USD threshold feels out of reach", "too complex"]
}
```

- `id` — slug, unique within the panel.
- `initial` + `color` — drive the avatar chip in the report. Pick distinct, legible
  colors across the panel (hex). Initial is usually the first letter of the name.
- `archetype` — a short, human label (the chip the report shows under the name can
  be a friction tag instead; see report-structure).
- The remaining fields feed both the matrix and the walkthrough agent's character.

## Generation guidance

1. Seed from recon: read the ICP off the live copy, pricing, and proof.
2. Draft 6 to 8 personas spread across the axes above. Name them like real people,
   not "Persona 1".
3. Always validate with the user before walking (see SKILL.md Phase 2). Their
   correction of the ICP is the highest-leverage edit in the whole run.
4. Save the validated panel for reuse.
