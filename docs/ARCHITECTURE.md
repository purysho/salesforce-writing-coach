# Architecture

## V0 principle

Validate the workflow with the smallest trustworthy architecture.

```text
Salesforce record
      ↓
Writing Coach LWC (screen quick action)
      ↓
lightning-input-rich-text
      ↓
Deterministic structural reviewer
      ↓
Findings shown to user
      ↓
User edits draft
      ↓
Global.SendEmail quick action
      ↓
Salesforce native email composer
```

## Client layer

### writingCoach
Responsibilities:
- capture subject and rich-text draft;
- trigger manual or debounced review;
- render findings;
- preserve user authorship;
- pass Subject / HTMLBody / RelatedToId to Salesforce Email.

### writingReviewEngine
Pure JavaScript module.

Responsibilities:
- strip presentation markup;
- segment sentences and paragraphs;
- run structural rules;
- return structured findings.

No Salesforce API calls.
No network calls.
No persistence.

## Finding contract

```js
{
  id: "main-message-buried",
  category: "hierarchy",
  severity: "warning",
  title: "Main message is buried",
  message: "The first clear decision appears in sentence 4.",
  evidence: "We recommend moving the launch...",
  suggestion: "Move the recommendation to the opening."
}
```

## Why deterministic first

1. Privacy: no data egress is needed.
2. Testability: the same input produces the same finding.
3. Cost: no inference cost while validating demand.
4. Explainability: findings can be tied to visible rules.
5. Architecture freedom: AI can be introduced only where it adds value.

## Future hybrid architecture

If pilots prove that higher-order reasoning is required:

```text
Draft
 ├─ deterministic checks (local)
 └─ higher-order reasoning (approved AI path)
          ↓
     structured result
          ↓
       user review
```

Possible AI paths:
- Salesforce-native Prompt Builder / Agentforce;
- customer-approved external provider;
- first-party hosted service.

No external provider should become mandatory until security, data-processing, and commercial requirements are explicit.

## Packaging

Use Salesforce DX source control now.

If commercial distribution proceeds, package as managed second-generation packaging (2GP) with version control as source of truth.

## Data policy for V0

The component does not persist:
- draft body;
- recipient address;
- customer name;
- subject;
- structural evidence.

Future telemetry should prefer event metadata such as:
- review_started;
- issue_detected(category);
- suggestion_opened;
- suggestion_applied;
- composer_handoff.

Raw message content should require a separate explicit research/data agreement.
