# Security and privacy

## V0 threat boundary

V0 is intentionally client-side and deterministic.

The quick action:
- receives a Salesforce record context;
- accepts a draft in the browser;
- runs local JavaScript analysis;
- passes the resulting draft to Salesforce's native Send Email action.

It does not require:
- Apex;
- an external API;
- an external database;
- an LLM;
- a connected/external client app;
- OAuth beyond the user already being authenticated to Salesforce.

## Data minimization

Do not persist raw customer email content in V0.

Do not add analytics that capture:
- HTML body;
- subject;
- recipient;
- customer/account name;
- evidence snippets.

Prefer categorical telemetry if later needed.

## Future AI boundary

Before any external model is introduced, define:
- processor/subprocessor;
- data retention;
- training usage;
- region;
- encryption;
- tenant isolation;
- deletion;
- auditability;
- model/provider fallback;
- customer opt-out.

Any Salesforce integration that requires an external authorization surface must follow the Salesforce integration model current at implementation time.

## Abuse resistance

The product must not:
- send email autonomously;
- impersonate customers or colleagues;
- insert fabricated CRM facts;
- hide edits from the author;
- create employee surveillance rankings.

## Security review readiness

Before marketplace submission:
- run Salesforce Code Analyzer;
- remove unused permissions;
- document every external endpoint if any;
- produce architecture/data-flow diagrams;
- test least-privilege packaging;
- create a vulnerability disclosure process;
- complete dependency inventory;
- document data retention and deletion.

This document is an engineering baseline, not a completed Salesforce security review.
