# Writing engine

## Purpose

The V0 engine identifies structural risks in customer-facing email without generating prose.

It is deliberately conservative. A finding should explain a plausible communication risk, not claim that the writer is “wrong.”

## Rules

### 1. Main message missing
Trigger:
- no obvious recommendation, proposal, decision, commitment, or change phrase.

Response:
- ask the writer to state the important message directly.

### 2. Main message buried
Trigger:
- first detected main-message sentence occurs after sentence 2.

Response:
- surface that sentence and suggest moving it earlier.

### 3. Opening setup
Trigger:
- conventional opening/setup phrases in the first two sentences.

Examples:
- “I hope you’re well”
- “I just wanted to…”
- “Following our conversation…”

This is informational, not automatically bad. The engine asks whether the setup is necessary.

### 4. Missing next action
Trigger:
- final 40% of the message contains no clear action/request marker.

The rule should not force a CTA into purely informational messages indefinitely. Discovery and later classification should determine when it is appropriate.

### 5. Vague language
Initial examples:
- ASAP;
- sometime soon;
- when you get a chance;
- a few;
- several;
- some other options;
- probably;
- might be.

Response:
- suggest a date, owner, amount, or decision where possible.

### 6. Dense paragraph
Trigger:
- paragraph over 90 words.

Response:
- suggest grouping support into shorter units.

### 7. Supporting overlap
Method:
- remove common stop words;
- compare content-token sets between sentences;
- flag high Jaccard overlap.

This is a crude proxy and should be treated as a candidate finding, not a logical proof.

## Non-goals

The V0 engine does not:
- grade intelligence or professionalism;
- infer personality;
- enforce a particular tone;
- rewrite silently;
- claim MECE compliance;
- claim Pyramid Principle compliance;
- guarantee correctness.

## Test philosophy

Use synthetic, non-customer fixtures.

Every new rule should have:
1. a positive fixture that triggers it;
2. a negative fixture that should not;
3. a false-positive note.

Rules that cannot be explained or regression-tested should not enter V0.
