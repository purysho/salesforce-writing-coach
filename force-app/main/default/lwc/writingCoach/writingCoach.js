import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { encodeDefaultFieldValues } from "lightning/pageReferenceUtils";
import {
  applyReviewAction,
  INTENTS,
  reviewEmail
} from "c/writingReviewEngine";

export default class WritingCoach extends NavigationMixin(LightningElement) {
  @api recordId;

  subject = "";
  draftHtml = "";
  findings = [];
  summary;
  liveCoach = false;
  reviewHasRun = false;
  selectedIntent = "auto";
  guidanceMessage = "";
  dismissedFindingIds = [];
  _liveTimer;

  get intentOptions() {
    return INTENTS;
  }

  get hasFindings() {
    return this.findings.length > 0;
  }

  get findingsLabel() {
    if (!this.reviewHasRun) return "No review run yet";
    if (!this.findings.length) return "No structural issues found";
    return `${this.findings.length} finding${this.findings.length === 1 ? "" : "s"}`;
  }

  get reviewSummary() {
    if (!this.summary) return "";
    return `${this.summary.words} words · ${this.summary.sentences} sentences`;
  }

  get intentSummary() {
    if (!this.summary) return "";
    const confidence =
      this.summary.intentConfidence === "explicit"
        ? "selected"
        : `${this.summary.intentConfidence} confidence`;
    return `${this.summary.intentLabel} · ${confidence}`;
  }

  get showGuidance() {
    return Boolean(this.guidanceMessage);
  }

  handleSubjectChange(event) {
    this.subject = event.target.value;
  }

  handleDraftChange(event) {
    this.draftHtml = event.target.value;
    this.dismissedFindingIds = [];
    this.guidanceMessage = "";

    if (this.liveCoach) {
      window.clearTimeout(this._liveTimer);
      this._liveTimer = window.setTimeout(() => {
        this.runReview();
      }, 700);
    }
  }

  handleIntentChange(event) {
    this.selectedIntent = event.detail.value;
    this.dismissedFindingIds = [];
    this.guidanceMessage = "";

    if (this.reviewHasRun || this.liveCoach) {
      this.runReview();
    }
  }

  handleLiveCoachChange(event) {
    this.liveCoach = event.target.checked;
    if (this.liveCoach && this.draftHtml) {
      this.runReview();
    }
  }

  handleReview() {
    this.dismissedFindingIds = [];
    this.guidanceMessage = "";
    this.runReview();
  }

  decorateFinding(finding) {
    return {
      ...finding,
      actionLabel: finding.action?.label || "",
      showAction: Boolean(finding.action),
      showSafeAction: Boolean(finding.action?.safe),
      manualAction: Boolean(finding.action && !finding.action.safe)
    };
  }

  runReview() {
    const result = reviewEmail(this.draftHtml, {
      intent: this.selectedIntent,
      subject: this.subject
    });

    this.findings = result.findings
      .filter((finding) => !this.dismissedFindingIds.includes(finding.id))
      .map((finding) => this.decorateFinding(finding));

    this.summary = result.summary;
    this.reviewHasRun = true;
  }

  handleApplyFinding(event) {
    const findingId = event.currentTarget.dataset.findingId;
    const finding = this.findings.find((item) => item.id === findingId);
    if (!finding) return;

    const edit = applyReviewAction(this.draftHtml, finding);
    this.guidanceMessage = edit.reason;

    if (edit.changed) {
      this.draftHtml = edit.value;
      this.dismissedFindingIds = [];
      this.runReview();
    }
  }

  handleManualFinding(event) {
    const findingId = event.currentTarget.dataset.findingId;
    const finding = this.findings.find((item) => item.id === findingId);
    if (!finding) return;

    this.guidanceMessage = finding.suggestion;
    const editor = this.template.querySelector("lightning-input-rich-text");
    if (editor) {
      editor.focus();
    }
  }

  handleDismissFinding(event) {
    const findingId = event.currentTarget.dataset.findingId;
    if (!findingId) return;

    this.dismissedFindingIds = [...this.dismissedFindingIds, findingId];
    this.findings = this.findings.filter((item) => item.id !== findingId);
    this.guidanceMessage = "Finding dismissed for this draft.";
  }

  handleOpenEmail() {
    const fields = {
      Subject: this.subject || "",
      HTMLBody: this.draftHtml || ""
    };

    if (this.recordId) {
      fields.RelatedToId = this.recordId;
    }

    const pageReference = {
      type: "standard__quickAction",
      attributes: {
        apiName: "Global.SendEmail"
      },
      state: {
        defaultFieldValues: encodeDefaultFieldValues(fields)
      }
    };

    this[NavigationMixin.Navigate](pageReference);
  }
}
