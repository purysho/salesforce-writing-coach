# Product specification

## Working name

Salesforce Writing Coach

The repository name is descriptive. It is not the final commercial brand.

## Problem

Customer-facing teams write large volumes of email inside or around Salesforce. Existing AI tooling is strongest at generation, rewriting, tone, and templating. That leaves a narrower problem:

> Is the message logically structured before it is sent?

Managers can train teams to lead with the answer, separate support from detail, make requests explicit, and avoid ambiguity, but those habits are inconsistently applied in day-to-day email.

## V1 user

Primary:
- account manager;
- customer success manager;
- salesperson;
- support/case owner.

Secondary:
- RevOps;
- Salesforce administrator;
- sales/CS enablement;
- communications or brand owner.

## Job to be done

Before I send a customer email, help me see whether:
1. the main message is clear and early;
2. the supporting points are distinct;
3. important facts are precise;
4. the customer knows what happens next.

Do this without taking authorship away from me.

## V1 product decision

**Review-first is the default. Live Coach is optional.**

Review-first:
- lower interruption cost;
- easier to trust;
- easier to test;
- fewer false-positive moments while a thought is still unfinished.

Live Coach:
- available as a toggle;
- runs after a short pause;
- uses the same structural engine.

## V1 scope

### Included
- rich-text draft editor;
- structural review;
- findings with explanation, evidence, and suggestion;
- optional live review;
- subject field;
- handoff to Salesforce native email composer;
- Contact, Lead, Account, Opportunity, and Case quick actions;
- local deterministic rule engine.

### Explicitly excluded
- autonomous sending;
- hidden rewriting;
- employee ranking;
- “quality score” leaderboard;
- sentiment/personality profiling;
- external AI dependency;
- Barbara Minto / Pyramid Principle branding or claims;
- organization-wide analytics before pilot validation.

## Finding categories

### Hierarchy
- main message missing;
- main message buried;
- excessive setup before the business message.

### Logic
- supporting points substantially overlap.

### Precision
- vague timing;
- vague ownership;
- vague quantity or decision wording.

### Action
- customer action/decision is absent when the draft appears to require one.

### Readability
- one paragraph carries too much content.

## Success criteria for technical V0

- deterministic engine passes synthetic regression cases;
- LWC deploys as a screen quick action;
- draft changes can be reviewed without server calls;
- revised HTML can be passed to Salesforce Send Email;
- no raw email body is persisted by the component.

## Discovery gate

Do not add large feature sets before 20 discovery interviews.

Desired interview mix:
- 5 Salesforce consultants;
- 5 Salesforce Admin/RevOps users;
- 5 Customer Success / Account users;
- 5 Sales users or leaders.

Advance to design-partner recruitment if:
- at least 12 report a recurring communication-structure problem;
- at least 6 want to test;
- at least 3 organizations are plausible pilot candidates.
