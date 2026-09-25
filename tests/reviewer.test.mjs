import test from "node:test";
import assert from "node:assert/strict";
import {
  applyReviewAction,
  reviewEmail
} from "../force-app/main/default/lwc/writingReviewEngine/writingReviewEngine.js";

function ids(result) {
  return result.findings.map((finding) => finding.id);
}

function warnings(result) {
  return result.findings.filter((finding) => finding.severity === "warning");
}

test("flags a buried recommendation after setup", () => {
  const draft = `
Hi Sarah,

I hope you're well. I just wanted to follow up on our conversation from last week and give you a quick update. We've been speaking internally with several teams.

We recommend moving the launch to 18 October.

Please confirm the revised date by Friday.
`;

  const result = reviewEmail(draft);
  assert.ok(ids(result).includes("main-message-buried"));
  assert.equal(result.summary.intent, "recommendation");
});

test("ignores the greeting when judging message position", () => {
  const draft = `
Hi Sarah,

We recommend moving the launch to 18 October.

Please confirm the revised date by Friday.
`;

  const result = reviewEmail(draft);
  assert.ok(!ids(result).includes("main-message-buried"));
});

test("does not require a CTA for a clear informational update", () => {
  const draft = `
Hi Sarah,

The implementation remains on schedule. Testing will finish on Friday, and deployment is still planned for 18 October.

Regards,
Oliver
`;

  const result = reviewEmail(draft);
  assert.equal(result.summary.intent, "update");
  assert.ok(!ids(result).includes("next-action-missing"));
});

test("requires a CTA for a recommendation", () => {
  const draft = `
We recommend moving the launch to 18 October.

The API integration needs one additional validation cycle.
`;

  const result = reviewEmail(draft);
  assert.ok(ids(result).includes("next-action-missing"));
});

test("requires a CTA for a change/problem message", () => {
  const draft = `
The launch will move to 18 October because the migration needs another validation cycle.
`;

  const result = reviewEmail(draft);
  assert.equal(result.summary.intent, "change");
  assert.ok(ids(result).includes("next-action-missing"));
});

test("a concrete request satisfies the next-action rule", () => {
  const draft = `
We need your approval for the revised scope.

Please approve the attached scope by 5 PM Friday.
`;

  const result = reviewEmail(draft);
  assert.equal(result.summary.intent, "request");
  assert.ok(!ids(result).includes("next-action-missing"));
});

test("explicit update intent suppresses an unnecessary CTA warning", () => {
  const draft = `
The migration completed successfully yesterday. All records reconciled correctly.
`;

  const result = reviewEmail(draft, { intent: "update" });
  assert.equal(result.summary.intent, "update");
  assert.equal(result.summary.intentConfidence, "explicit");
  assert.ok(!ids(result).includes("next-action-missing"));
});

test("explicit recommendation intent requires an action even without recommendation keywords", () => {
  const draft = `
Moving the launch to 18 October gives the testing team enough time to finish validation.
`;

  const result = reviewEmail(draft, { intent: "recommendation" });
  assert.ok(ids(result).includes("next-action-missing"));
});

test("does not declare a concise unknown message structurally broken", () => {
  const draft = `
The migration finished on Tuesday. All customer records reconciled successfully.
`;

  const result = reviewEmail(draft);
  assert.equal(result.summary.intent, "unknown");
  assert.ok(!ids(result).includes("main-message-missing"));
  assert.ok(!ids(result).includes("next-action-missing"));
});

test("flags conventional setup at the opening", () => {
  const draft = `
Hi Sarah,

I hope you're well.

We recommend moving the launch to 18 October.

Please confirm the revised date by Friday.
`;

  const result = reviewEmail(draft);
  assert.ok(ids(result).includes("opening-setup"));
});

test("flags vague timing language", () => {
  const draft = `
We recommend keeping the existing project scope.

We will send the revised plan sometime soon. Please confirm that you want us to proceed.
`;

  const result = reviewEmail(draft);
  assert.ok(result.findings.some((finding) => finding.category === "precision"));
});

test("does not flag a concrete date as vague", () => {
  const draft = `
We recommend keeping the existing project scope.

We will send the revised plan by 3 PM on 12 October. Please confirm that you want us to proceed.
`;

  const result = reviewEmail(draft);
  assert.ok(!result.findings.some((finding) => finding.category === "precision"));
});

test("flags a dense paragraph", () => {
  const sentence = "The implementation team reviewed the integration, migration, permissions, deployment plan, validation steps, customer data, testing schedule, and rollback process before confirming the revised approach";
  const dense = Array.from({ length: 8 }, () => sentence).join(" ");

  const result = reviewEmail(`We recommend proceeding with the revised plan.\n\n${dense}\n\nPlease confirm the plan by Friday.`);
  assert.ok(ids(result).includes("dense-paragraph"));
});

test("flags highly overlapping supporting points", () => {
  const draft = `
We recommend delaying the launch to 18 October.

The integration team needs another validation cycle before the launch can proceed safely.
The integration team requires another validation cycle before the launch can proceed safely.

Please confirm the revised date by Friday.
`;

  const result = reviewEmail(draft);
  assert.ok(ids(result).includes("support-overlap"));
});

test("does not flag distinct supporting points as overlap", () => {
  const draft = `
We recommend delaying the launch to 18 October.

The API integration needs one additional validation cycle.
The customer data migration must finish before final testing.

Please confirm the revised date by Friday.
`;

  const result = reviewEmail(draft);
  assert.ok(!ids(result).includes("support-overlap"));
});

test("handles rich-text HTML input", () => {
  const draft = "<p>Hi Sarah,</p><p>We recommend moving the launch to 18 October.</p><p>Please confirm the revised date by Friday.</p>";
  const result = reviewEmail(draft);

  assert.equal(result.summary.intent, "recommendation");
  assert.equal(warnings(result).length, 0);
});

test("returns an empty-draft finding", () => {
  const result = reviewEmail("");
  assert.ok(ids(result).includes("empty-draft"));
  assert.equal(result.summary.words, 0);
});

test("buried-main-message finding exposes a safe action", () => {
  const draft = "<p>Hi Sarah,</p><p>I hope you're well.</p><p>We've reviewed the project internally.</p><p>We recommend moving the launch to 18 October.</p><p>Please confirm by Friday.</p>";
  const result = reviewEmail(draft);
  const finding = result.findings.find((item) => item.id === "main-message-buried");

  assert.equal(finding.action.type, "move-main-block-first");
  assert.equal(finding.action.safe, true);
});

test("safe action moves the main-message paragraph after the greeting", () => {
  const draft = "<p>Hi Sarah,</p><p>I hope you're well.</p><p>We've reviewed the project internally.</p><p>We recommend moving the launch to 18 October.</p><p>Please confirm by Friday.</p>";
  const result = reviewEmail(draft);
  const finding = result.findings.find((item) => item.id === "main-message-buried");
  const edit = applyReviewAction(draft, finding);

  assert.equal(edit.changed, true);
  assert.ok(
    edit.value.startsWith("<p>Hi Sarah,</p><p>We recommend moving the launch to 18 October.</p>")
  );
});

test("safe action removes a standalone setup paragraph", () => {
  const draft = "<p>Hi Sarah,</p><p>I hope you're well.</p><p>We recommend moving the launch to 18 October.</p><p>Please confirm by Friday.</p>";
  const result = reviewEmail(draft);
  const finding = result.findings.find((item) => item.id === "opening-setup");
  const edit = applyReviewAction(draft, finding);

  assert.equal(edit.changed, true);
  assert.ok(!edit.value.includes("I hope you're well."));
  assert.ok(edit.value.includes("We recommend moving the launch to 18 October."));
});

test("manual findings are not auto-applied", () => {
  const draft = "<p>We recommend keeping the existing scope.</p><p>We will send the plan sometime soon.</p><p>Please confirm that you want us to proceed.</p>";
  const result = reviewEmail(draft);
  const finding = result.findings.find((item) => item.category === "precision");
  const edit = applyReviewAction(draft, finding);

  assert.equal(edit.changed, false);
  assert.equal(edit.value, draft);
});

test("clean recommendation produces no warning findings", () => {
  const draft = `
We recommend moving the launch to 18 October so the team can complete testing safely.

The API integration needs one additional validation cycle, and the data migration must finish before final testing.

Please confirm the revised date by 5 PM Friday.
`;

  const result = reviewEmail(draft);
  assert.equal(warnings(result).length, 0);
});

test("flags a generic subject when subject review is enabled", () => {
  const draft = `
We recommend moving the launch to 18 October.

Please confirm the revised date by Friday.
`;

  const result = reviewEmail(draft, { subject: "Update" });
  assert.ok(ids(result).includes("subject-generic"));
});

test("accepts a specific subject", () => {
  const draft = `
We recommend moving the launch to 18 October.

Please confirm the revised date by Friday.
`;

  const result = reviewEmail(draft, { subject: "Launch date recommendation — 18 October" });
  assert.ok(!ids(result).includes("subject-generic"));
  assert.ok(!ids(result).includes("subject-long"));
});

test("flags an action request with no timing", () => {
  const draft = `
We recommend moving the launch to 18 October.

Please confirm the revised date.
`;

  const result = reviewEmail(draft);
  assert.ok(ids(result).includes("next-action-timing-missing"));
});

test("accepts a timed action request", () => {
  const draft = `
We recommend moving the launch to 18 October.

Please confirm the revised date by 5 PM Friday.
`;

  const result = reviewEmail(draft);
  assert.ok(!ids(result).includes("next-action-timing-missing"));
});

