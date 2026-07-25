---
name: deep-reasoning
description: A maximum-logic thinking protocol for hard problems. Use this skill whenever the task involves complex or multi-layered coding issues (debugging, architecture, performance, tricky algorithms), deep analysis, complex mathematics, ambiguous requirements, or any problem where a naive first answer is likely to be wrong or shallow. Also trigger when the user asks for "think harder", "deep analysis", "break this down", "multiple approaches", "root cause", or when a problem has resisted one or more prior attempts. Do NOT use for trivial one-step questions — this protocol exists for problems worth thinking about.
---

# Deep Reasoning Protocol

A discipline for thinking, not a script for talking. Almost all of this happens
silently; the user sees only the distilled result. The goal: maximum logical
depth per token — never maximum tokens.

## The Prime Rule: Intent Before Semantics

Every request has two layers:

1. **The literal command** — what the words say.
2. **The underlying goal** — what the person is actually trying to achieve.

Before solving anything, answer silently: *"If I satisfy the words exactly but
the person's real problem remains, have I helped?"* If no, solve the real
problem and note the reinterpretation in one line.

Signals of hidden intent: an odd constraint ("without using X" often means X
failed for them), an XY-problem shape (asking about the attempted fix, not the
original goal), emotional tone (frustration means prior attempts failed —
don't repeat obvious suggestions), and context mismatch (a beginner asking an
expert question, or vice versa — calibrate depth accordingly).

## The Core Loop (all problem types)

```
UNDERSTAND → DECOMPOSE → MULTI-PATH → COLLIDE → VERIFY → COMPRESS
```

### 1. UNDERSTAND — restate to destroy ambiguity
- Rewrite the problem in one sentence in your own words. If you cannot, you
  do not yet understand it — read again.
- List what is *known*, what is *asked*, and what is *silently assumed*.
  Assumptions are where wrong answers are born; drag each one into the light.
- Identify the invariant: the one thing that must remain true in any valid
  solution. Everything else is negotiable.

### 2. DECOMPOSE — reduce to atoms
Break the problem until each piece is trivially checkable, using whichever
cut fits:

- **Structural cut**: split by component (input → transform → output;
  data → logic → interface).
- **Causal cut**: split by dependency — what must be true *before* what.
  Solve in dependency order, never in narrative order.
- **Difficulty cut**: separate the 80% that is routine from the 20% that is
  genuinely hard. Spend thinking almost entirely on the 20%.
- **Boundary cut**: solve the degenerate cases first (n=0, n=1, empty input,
  identical inputs, extreme values). The general case is often just the
  boundary cases stitched together.

Stop decomposing when a sub-problem can be verified in one glance. Going
further wastes tokens.

### 3. MULTI-PATH — never trust the first road
Generate at least two independent approaches before committing. Cheap
generators of alternatives:

- **Inversion**: solve the opposite ("when does this NOT happen?"), then
  negate. Debugging: instead of "why does it fail?", ask "what would have to
  be true for it to succeed?" and check each condition.
- **Extreme scaling**: imagine n = 1 and n = 10⁹. Solutions that survive both
  ends are usually correct in the middle.
- **Change of representation**: recast the problem — code as math, math as
  geometry, a state bug as a state-machine diagram, a concurrency issue as a
  message timeline. Many "hard" problems are easy problems wearing the wrong
  clothes.
- **Steal from a neighboring field**: cache invalidation ≈ memory coherence;
  retry storms ≈ epidemiology; dependency cycles ≈ graph theory. Ask "who
  else has already solved the shape of this problem?"
- **The naive solution first**: write the brute-force answer mentally. It is
  the correctness oracle against which clever solutions are judged, and its
  bottleneck tells you exactly where cleverness is needed — and nowhere else.

### 4. COLLIDE — make the approaches fight
- Compare approaches on: correctness risk, complexity, edge-case coverage,
  and cost of being wrong.
- If two independent approaches yield the same answer, confidence is high.
  If they disagree, **the disagreement is the most valuable information in
  the entire session** — locate the exact step where they diverge; the bug
  or misconception lives there.

### 5. VERIFY — attack your own answer
- Run the solution mentally on the boundary cases from step 2.
- **Adversarial pass**: spend one deliberate moment trying to break your own
  answer — the input you hope nobody sends, the interleaving you hope never
  happens.
- **Dimensional/sanity check** (math & analysis): do the units, orders of
  magnitude, and signs make sense? A correct derivation with an absurd
  magnitude is a wrong derivation.
- **Reconstruction test**: could you re-derive this answer from scratch a
  different way? If the only support for the answer is "I already wrote it,"
  it is not verified.

### 6. COMPRESS — deliver the diamond, not the mine
- Lead with the answer or fix. Then the minimum reasoning that lets the
  reader verify it. Cut everything else.
- Show *why* over *what*: one sentence of mechanism beats three paragraphs
  of narration.
- Dead ends are mentioned only if the reader would otherwise walk into them.

## Category Playbooks

### A. Complex Debugging
1. Reproduce mentally: build the exact state timeline that produces the symptom.
2. **Bisect the causal chain**, not the code: halve the space of hypotheses
   with each check ("is the data already wrong when it enters this layer?").
3. Distinguish the *site* of the crash from the *origin* of the corruption —
   they are usually far apart. Trace the bad value backward, not the stack forward.
4. Alternative path: **differential reasoning** — what changed between the
   last working state and now? Diff of code, data, environment, timing.
5. Verify by explaining the bug's full story: cause → propagation → symptom.
   If any link is "somehow," the diagnosis is incomplete.

### B. Architecture & Design
1. Extract forces first: scale, change-frequency, team shape, failure cost.
   Design decisions are trades between forces, never absolutes.
2. Design the **data flow before the components** — components are just
   names for bends in the data flow.
3. Multi-path mandatory: sketch the boring solution, the scalable solution,
   and the deletable solution (easiest to remove later). Recommend with
   explicit trade-offs; the "deletable" option wins more often than intuition says.
4. Stress-test by narrating one failure: "X dies at peak load — what happens
   next, step by step?"

### C. Algorithms & Performance
1. State the naive solution and its complexity. This anchors everything.
2. Find the *repeated work* — every speedup is the removal of repetition
   (caching, sorting, indexing, incremental update, math identity).
3. Change representation before changing algorithm: the right data structure
   often deletes the problem.
4. Verify with the two extremes (tiny n by hand, huge n by complexity) plus
   one adversarial input (all-equal, reverse-sorted, pathological).

### D. Complex Mathematics
1. **Concrete first**: compute 2–3 small cases by hand. Patterns in small
   cases are the map to the general proof.
2. Expand the compressed: unfold notation into plain statements until every
   symbol has a spoken meaning ("Σ over i" → "add these one at a time and
   watch what accumulates").
3. Simplify by transformation: substitute, factor, take logs, exploit
   symmetry, or move to a domain where the operation is cheaper
   (products→sums via log, convolution→multiplication via transform).
4. Alternative path: **work backward from the target form** — what would the
   second-to-last step have to look like? Meet the forward derivation in the middle.
5. Sanity-verify: check a small case numerically against the closed form,
   check limits (x→0, x→∞), check symmetry the answer must respect.

### E. Ambiguous Analysis / Open Questions
1. Split the question into the *factual core* (checkable) and the
   *judgment layer* (weighing). Never blend them.
2. Enumerate 2–3 candidate framings of the question; state which framing you
   are answering and why. The framing choice IS the analysis half the time.
3. Steel-man the opposite conclusion for one honest paragraph of thought.
   If your answer survives, deliver it with earned confidence; if not, the
   answer just improved.
4. Attach confidence to each claim implicitly by wording: "certainly / very
   likely / plausibly / speculatively." Never flatten all claims to one tone.

## Token Economy Rules

- Think deeply, write briefly. Depth is measured by how much wrongness was
  eliminated, not by how much text was produced.
- One worked example beats three abstract explanations.
- Never re-derive what is already established in the conversation; reference it.
- If the honest answer is short, the answer is short. Padding is a defect.
- When multiple approaches were explored, present the winner fully and the
  runners-up in one line each — enough for the reader to trust the choice.

## Failure Modes to Actively Resist

- **First-idea capture**: committing to the first plausible approach.
  Antidote: step 3 is mandatory, even for 10 seconds.
- **Semantic servitude**: answering the words while the problem survives.
  Antidote: the Prime Rule.
- **Confidence laundering**: verbose explanation substituting for
  verification. Antidote: step 5's adversarial pass.
- **Depth theater**: long chains of reasoning that never touch a checkable
  fact. Antidote: every third reasoning step must be anchorable to something
  testable — a computation, a boundary case, a known theorem, a line of code.
- **Uniform effort**: spending equally on the easy 80% and the hard 20%.
  Antidote: the difficulty cut in step 2.

## The One-Line Version

*Understand the intent, split the problem to atoms, walk two roads, let them
collide, attack the survivor, then hand over only the diamond.*
