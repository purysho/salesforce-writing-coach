# Developer Org deployment

This guide validates V0.2 in a real Salesforce Lightning Experience org.

## Prerequisites

- Salesforce CLI (\`sf\`)
- a Salesforce Developer Edition, sandbox, or scratch org
- permission to deploy metadata and create object-specific quick actions

V0.2 targets Salesforce API version 67.0.

## Option A — existing Developer Edition or sandbox

Authenticate:

\`\`\`bash
sf org login web --alias writing-coach-dev
\`\`\`

Deploy the source:

\`\`\`bash
sf project deploy start --target-org writing-coach-dev --source-dir force-app
\`\`\`

For a validation-only pass:

\`\`\`bash
sf project deploy validate --target-org writing-coach-dev --source-dir force-app
\`\`\`

## Option B — scratch org

Authenticate to a Dev Hub first, then:

\`\`\`bash
sf org create scratch \\
  --definition-file config/project-scratch-def.json \\
  --alias writing-coach-scratch \\
  --duration-days 7

sf project deploy start \\
  --target-org writing-coach-scratch \\
  --source-dir force-app
\`\`\`

## Create the quick action

Deployment exposes the Lightning Web Component, but Salesforce Setup still needs an object-specific action.

For each object to test:

1. Open **Setup → Object Manager**.
2. Choose **Contact**, **Lead**, **Account**, **Opportunity**, or **Case**.
3. Open **Buttons, Links, and Actions**.
4. Choose **New Action**.
5. Set **Action Type** to **Lightning Web Component**.
6. Select **Writing Coach**.
7. Give the action a label such as **Writing Coach**.
8. Save.
9. Open the object's **Page Layouts**.
10. Add the action to **Salesforce Mobile and Lightning Experience Actions**.

Despite the section name, standard LWC record quick actions are for Lightning Experience record pages and are not supported in the standard Salesforce mobile app.

## Smoke-test script

Use a Contact record and paste:

\`\`\`text
Hi Sarah,

I hope you're well. I just wanted to follow up after our conversation last week. We have spoken internally with the implementation and migration teams.

We recommend moving the launch to 18 October.

There are a few outstanding integration checks and the migration team might need some more time.

Please confirm the revised date.
\`\`\`

Use subject:

\`\`\`text
Update
\`\`\`

Expected findings include:

- generic subject;
- buried main message;
- setup-heavy opening;
- vague wording;
- next action with no timing.

Then test a safe fix:

- choose **Move paragraph to opening** on the buried-main-message finding;
- confirm the recommendation moves immediately after the greeting;
- confirm the rest of the rich-text blocks remain present.

Finally choose **Open in Salesforce Email** and confirm Salesforce's native email composer opens with:

- subject populated;
- HTML body populated;
- current record used as the related record where supported.

## Acceptance record

For every org test, record:

- org type;
- Salesforce release/API version;
- object tested;
- quick action renders;
- manual Review works;
- Live Coach works;
- intent override works;
- safe fix preserves content;
- native composer handoff works;
- defects and screenshots.

Do not use real confidential customer email during the first technical validation.
