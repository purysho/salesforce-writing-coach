import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { encodeDefaultFieldValues } from "lightning/pageReferenceUtils";
import { reviewEmail } from "c/writingReviewEngine";

export default class WritingCoach extends NavigationMixin(LightningElement) {
  @api recordId;

  subject = "";
  draftHtml = "";
  findings = [];
  summary;
  liveCoach = false;
  reviewHasRun = false;
  _liveTimer;

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

  handleSubjectChange(event) {
    this.subject = event.target.value;
  }

  handleDraftChange(event) {
    this.draftHtml = event.target.value;

    if (this.liveCoach) {
      window.clearTimeout(this._liveTimer);
      this._liveTimer = window.setTimeout(() => {
        this.runReview();
      }, 700);
    }
  }

  handleLiveCoachChange(event) {
    this.liveCoach = event.target.checked;
    if (this.liveCoach && this.draftHtml) {
      this.runReview();
    }
  }

  handleReview() {
    this.runReview();
  }

  runReview() {
    const result = reviewEmail(this.draftHtml);
    this.findings = result.findings;
    this.summary = result.summary;
    this.reviewHasRun = true;
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
