import test from "node:test";
import assert from "node:assert/strict";
import { reviewEmail } from "../force-app/main/default/lwc/writingReviewEngine/writingReviewEngine.js";

test("flags a buried main message", () => {
  const draft = `
Hi Sarah,

I hope you're well. I just wanted to follow up on our conversation from last week and give you a quick update. We've been speaking internally with several teams.

We recommend moving the launch to 18 October.

Please confirm the revised date by Friday.
`;

  const result = reviewEmail(draft);
  assert.ok(result.findings.some((f) => f.id === "main-message-buried"));
});

test("flags a missing next action", () => {
  const draft = `
We recommend moving the launch to 18 October.

The API integration needs another validation cycle and the migration must finish before final testing.
`;

  const result = reviewEmail(draft);
  assert.ok(result.findings.some((f) => f.id === "next-action-missing"));
});

test("flags vague language", () => {
  const draft = `
We recommend keeping the existing project scope.

We will send the revised plan sometime soon. Please confirm that you want us to proceed.
`;

  const result = reviewEmail(draft);
  assert.ok(result.findings.some((f) => f.category === "precision"));
});

test("does not invent structural warnings for a clean example", () => {
  const draft = `
We recommend moving the launch to 18 October so the team can complete testing safely.

The API integration needs one additional validation cycle, and the data migration must finish before final testing.

Please confirm the revised date by 5 PM Friday.
`;

  const result = reviewEmail(draft);
  assert.equal(
    result.findings.filter((f) => f.severity === "warning").length,
    0
  );
});
