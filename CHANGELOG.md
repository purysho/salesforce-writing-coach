# Changelog

## 0.2.0 — unreleased

### Added
- intent-aware classification for recommendation, request/decision, change/problem, update, and general messages;
- explicit message-type override in the Salesforce component;
- CTA requirement only for action-oriented message types;
- subject-line specificity checks;
- next-action timing guidance;
- safe paragraph-level fixes for buried main messages and standalone setup;
- dismissible findings and manual edit prompts;
- expanded synthetic regression suite;
- Developer Org / scratch-org deployment guide;
- V0.2 acceptance checklist;
- desktop form-factor metadata.

### Changed
- greeting/sign-off text no longer distorts main-message position;
- overlap checking excludes the detected main message and uses a stricter threshold;
- review findings now carry structured action metadata;
- V0.2 remains local and deterministic with no external model dependency.

### Not yet complete
- deployment to a real Salesforce org;
- end-to-end native composer verification;
- discovery interviews and design-partner validation.
