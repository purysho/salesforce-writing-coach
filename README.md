# Salesforce Writing Coach

A Salesforce-native writing assistant for customer-facing email.

The project is intentionally brand-neutral while the product and licensing strategy are validated. It does **not** claim affiliation with Barbara Minto, Minto Books International, or the Minto Pyramid Principle®.

## Product thesis

Most AI email tools start by writing for the user. Salesforce Writing Coach starts by **reviewing what the user already wrote**.

The first product wedge is structural review:

- surface a buried or missing main message;
- distinguish the main message from supporting detail;
- identify overlapping or weak support;
- flag vague dates, quantities, ownership, and requests;
- require a clear customer next action where one is appropriate;
- preserve the employee as the author.

Generation and rewriting are optional assists, not the core product.

## V1 workflow

1. User opens a Contact, Lead, Account, Opportunity, or Case.
2. User launches **Writing Coach** as a record-page quick action.
3. User writes or pastes an email into a rich-text editor.
4. The deterministic reviewer returns structural findings.
5. The user accepts, dismisses, or manually resolves findings.
6. The revised draft opens in Salesforce's native email composer.

V1 performs deterministic review locally in the Salesforce client. No external AI call is required.

## Repository layout

```text
.
├── docs/                         Product, architecture, security, and test specs
├── engine/                       Standalone deterministic review engine
├── force-app/main/default/lwc/   Salesforce Lightning Web Components
├── tests/                        Synthetic regression tests
├── package.json
└── sfdx-project.json
```

## Current milestone

**V0.2 — Intent-aware reviewer**

- [x] Intent-aware deterministic review engine
- [x] Informational-update vs action-oriented CTA logic
- [x] Subject-line review
- [x] Action-timing guidance
- [x] Safe block-level suggestion actions
- [x] Intent override and dismissible findings
- [x] Expanded synthetic regression suite
- [x] Salesforce Developer Org deployment guide
- [ ] Deploy V0.2 to a Salesforce developer org
- [ ] Pass the Contact end-to-end smoke test
- [ ] Validate on Lead / Account / Opportunity / Case
- [ ] Run first 20 discovery interviews
- [ ] Recruit three design-partner organizations

## Local engine tests

```bash
npm test
```

The regression suite uses synthetic emails only.

## Salesforce deployment

This repository uses Salesforce DX source format and targets API version 67.0.

Authenticate a development org, then deploy:

```bash
sf org login web --alias writing-coach-dev
sf project deploy start --target-org writing-coach-dev
```

After deployment, create an object-specific Lightning quick action for the `writingCoach` component and add it to the relevant page layout.

## Product principles

1. **Human authored by default.**
2. **Structure before style.**
3. **Explain findings; do not silently rewrite.**
4. **No employee leaderboard or simplistic writing score.**
5. **Data minimization by default.**
6. **No methodology or trademark claims without permission.**
7. **Salesforce-native before external infrastructure.**

## Status

Early technical prototype. Not production ready.
