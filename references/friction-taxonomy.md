# Friction taxonomy and severity

Hand this file's path to every persona walkthrough subagent so findings are
tagged consistently and can be deduped in synthesis.

## Categories

Tag each friction with one category. These cover self-guided site walkthroughs.

| Category | The question it answers | Typical examples |
| --- | --- | --- |
| **Findability** | Can I locate the thing I need from here? | Label uses internal jargon, item buried in a menu, search misses the page, no cross-link. |
| **Information scent** | Does this link/heading signal the right path? | Vague CTA ("Click here"), misleading headline, icon-only nav, weak button prominence. |
| **Navigation / orientation** | Where am I, how do I go back? | No breadcrumbs, broken back button, no logo-to-home, nested modals trap me. |
| **Trust / credibility** | Does this feel legit and safe? | No proof or reviews, stale copyright, missing contact/about, amateur design, no privacy link before a form. |
| **Copy clarity** | Do I understand what this says? | Jargon, abstraction ("empower your future"), passive voice hiding the benefit, wall of text. |
| **CTA friction** | Is the next action obvious and low-risk? | Competing equal CTAs, low-contrast button, CTA below the fold, promise/label mismatch. |
| **Form friction** | Does each field feel necessary and safe? | Phone before price, forced account before trial, 10+ fields, no error messages. |
| **Performance** | Is it fast enough? | Slow load, heavy page, spinner that never clears, laggy interaction. |
| **Mobile** | Does mobile match the promise? | Tiny touch targets, text under 16px, horizontal scroll, fewer features than desktop. |
| **Cognitive overload** | Am I asked to decide too much at once? | Many equal CTAs, 20+ options, competing value props, stacked popups. |
| **Dead end / incomplete journey** | Can I actually finish the job? | Button goes nowhere, success with no next step, key feature gated and unsurfaced, missing comparison row. |
| **Expectation mismatch** | Did the page deliver the promise that brought me? | Ad said "$9/mo" but price is unclear, "free" needs a card, "works with X" only via a workaround. |

## Severity (S1 to S4)

Rate the impact on *this persona completing their job*.

- **S1 — Minor.** Under ~3 seconds of friction, job still completed. Polish item.
- **S2 — Moderate.** Some friction, job likely still done. Small conversion cost.
- **S3 — Major.** Noticeable hesitation or a forced detour; some people drop here.
- **S4 — Critical.** The persona abandons or leaves for a competitor. Converts no one
  like them.

When the same wall appears for several personas, raise its priority in synthesis
even if each individual instance is only S2 or S3. Repetition is signal.

## Nielsen heuristics (optional tag)

If useful, also note which of Nielsen's 10 a friction violates: visibility of
system status; match to the real world; user control and freedom; consistency and
standards; error prevention; recognition over recall; flexibility and efficiency;
aesthetic and minimalist design; help users recover from errors; help and
documentation. Counting heuristic violations across personas is a quick way to see
which kind of problem dominates.
