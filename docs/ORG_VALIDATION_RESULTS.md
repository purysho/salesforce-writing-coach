# Salesforce V0.2 — real-org validation record

This file records evidence from an authenticated Salesforce Developer Edition, sandbox, or scratch org.

**Current status: not yet executed against a real org.**

Local synthetic engine tests are green. They do not prove Lightning deployment, quick-action rendering, or native Email composer handoff.

## Automated org gate

The manual GitHub Actions workflow `.github/workflows/salesforce-org-validation.yml` performs the machine-verifiable part of the real-org pass:

1. authenticate to a disposable org using the repository secret `SALESFORCE_SFDX_AUTH_URL`;
2. run `sf project deploy validate` against `force-app`;
3. deploy V0.2;
4. query the Salesforce Tooling API for the `writingCoach` and `writingReviewEngine` Lightning bundles;
5. upload the redacted JSON evidence as the `salesforce-org-validation` workflow artifact.

The workflow deliberately does **not** claim that Lightning UI behavior has passed.

## Human Lightning smoke test

After the automated org gate is green, use the deployed org and follow [DEPLOYMENT.md](DEPLOYMENT.md).

Record one row per object.

| Object | Quick action renders | Review works | Live Coach works | Intent override | Dismiss works | Safe fix preserves content | Salesforce Email handoff | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Contact | | | | | | | | Not run |
| Lead | | | | | | | | Not run |
| Account | | | | | | | | Not run |
| Opportunity | | | | | | | | Not run |
| Case | | | | | | | | Not run |

## Contact acceptance evidence

The Contact pass is the V0.2 release-critical smoke test.

Record:

- org type:
- Salesforce release:
- API version:
- validation workflow run:
- deployment ID:
- Contact record type/layout:
- quick action label:
- subject used: `Update`
- expected findings observed:
  - generic subject:
  - buried main message:
  - setup-heavy opening:
  - vague wording:
  - action timing:
- **Move paragraph to opening** preserved all other content:
- native Email composer opened:
- subject populated:
- HTML body populated:
- related record populated where supported:
- screenshots/evidence:
- defects:
- overall result: **NOT RUN**

## Evidence rule

Do not mark any unchecked item in `docs/V0.2_ACCEPTANCE.md` complete from source inspection alone. A Salesforce UX item requires observation in an authenticated Lightning Experience org.
