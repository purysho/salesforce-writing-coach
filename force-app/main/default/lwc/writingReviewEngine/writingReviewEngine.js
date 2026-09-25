const MAIN_MESSAGE_PATTERNS = [
  /\bwe recommend\b/i,
  /\bi recommend\b/i,
  /\bwe propose\b/i,
  /\bi propose\b/i,
  /\bwe suggest\b/i,
  /\bi suggest\b/i,
  /\bwe need to\b/i,
  /\bwe will\b/i,
  /\bwe cannot\b/i,
  /\bwe can't\b/i,
  /\bthe launch (?:will|needs to|must)\b/i,
  /\bthe date (?:will|needs to|must)\b/i,
  /\bthe decision is\b/i,
  /\bthe change is\b/i
];

const NEXT_ACTION_PATTERNS = [
  /\bplease\b/i,
  /\bcan you\b/i,
  /\bcould you\b/i,
  /\bwould you\b/i,
  /\bconfirm\b/i,
  /\bapprove\b/i,
  /\breply\b/i,
  /\bsend\b/i,
  /\bsign\b/i,
  /\bchoose\b/i,
  /\bbook\b/i,
  /\blet me know\b/i
];

const VAGUE_PATTERNS = [
  /\basap\b/i,
  /\bas soon as possible\b/i,
  /\bsometime soon\b/i,
  /\bsome time soon\b/i,
  /\bwhen you get a chance\b/i,
  /\ba few\b/i,
  /\bseveral\b/i,
  /\bsome other options\b/i,
  /\bprobably\b/i,
  /\bmight be\b/i,
  /\bcurrently looking at\b/i
];

const SETUP_PATTERNS = [
  /\bi hope (?:you'?re|you are) well\b/i,
  /\bi just wanted to\b/i,
  /\bfollowing (?:our|the) conversation\b/i,
  /\bjust (?:a )?quick update\b/i,
  /\bwhere things currently stand\b/i
];

const STOP_WORDS = new Set([
  "the","a","an","and","or","but","to","of","in","on","for","with","as","at","by",
  "is","are","was","were","be","been","being","it","this","that","these","those",
  "we","you","i","our","your","they","their","from","so","if","then","than"
]);

function stripHtml(value = "") {
  return value
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function splitSentences(text) {
  return (text.match(/[^.!?\n]+[.!?]?/g) || [])
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function splitParagraphs(text) {
  return text
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function wordCount(text) {
  return (text.match(/\b[\w'-]+\b/g) || []).length;
}

function contentTokens(sentence) {
  return new Set(
    (sentence.toLowerCase().match(/\b[a-z][a-z'-]{2,}\b/g) || [])
      .filter((token) => !STOP_WORDS.has(token))
  );
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection += 1;
  }
  const union = new Set([...a, ...b]).size;
  return union ? intersection / union : 0;
}

function makeFinding(id, category, severity, title, message, suggestion, evidence = "") {
  return { id, category, severity, title, message, suggestion, evidence };
}

function findMainMessage(sentences) {
  return sentences.findIndex((sentence) =>
    MAIN_MESSAGE_PATTERNS.some((pattern) => pattern.test(sentence))
  );
}

export function reviewEmail(input = "") {
  const text = stripHtml(input);
  if (!text) {
    return {
      summary: { words: 0, sentences: 0, findings: 0 },
      findings: [
        makeFinding(
          "empty-draft",
          "draft",
          "info",
          "Start with a draft",
          "Write or paste a customer-facing email to review its structure.",
          "Add a draft, then run the review."
        )
      ]
    };
  }

  const sentences = splitSentences(text);
  const paragraphs = splitParagraphs(text);
  const findings = [];
  const mainIndex = findMainMessage(sentences);

  if (mainIndex === -1) {
    findings.push(
      makeFinding(
        "main-message-missing",
        "hierarchy",
        "warning",
        "Main message is unclear",
        "The draft does not contain an obvious recommendation, decision, change, or commitment.",
        "State the most important message directly in the first one or two sentences."
      )
    );
  } else if (mainIndex > 1) {
    findings.push(
      makeFinding(
        "main-message-buried",
        "hierarchy",
        "warning",
        "Main message is buried",
        `The first clear decision or recommendation appears in sentence ${mainIndex + 1}.`,
        "Consider moving the decision, recommendation, or change to the opening.",
        sentences[mainIndex]
      )
    );
  }

  const opening = sentences.slice(0, Math.min(2, sentences.length)).join(" ");
  if (SETUP_PATTERNS.some((pattern) => pattern.test(opening))) {
    findings.push(
      makeFinding(
        "opening-setup",
        "hierarchy",
        "info",
        "Opening spends time on setup",
        "The opening contains conventional setup before the business message.",
        "Remove nonessential preamble when the customer can understand the message without it.",
        opening
      )
    );
  }

  const tailStart = Math.max(0, Math.floor(sentences.length * 0.6));
  const tail = sentences.slice(tailStart).join(" ");
  const hasNextAction = NEXT_ACTION_PATTERNS.some((pattern) => pattern.test(tail));

  if (!hasNextAction) {
    findings.push(
      makeFinding(
        "next-action-missing",
        "action",
        "warning",
        "Next action is unclear",
        "The final part of the email does not give the customer a specific action or decision.",
        "When action is required, name the action, owner, and timing explicitly."
      )
    );
  }

  for (const pattern of VAGUE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      findings.push(
        makeFinding(
          `vague-${findings.length + 1}`,
          "precision",
          "info",
          "Timing or ownership may be vague",
          `“${match[0]}” can leave the customer unsure what happens next.`,
          "Replace vague language with a date, owner, amount, or decision where possible.",
          match[0]
        )
      );
      break;
    }
  }

  const denseParagraph = paragraphs.find((paragraph) => wordCount(paragraph) > 90);
  if (denseParagraph) {
    findings.push(
      makeFinding(
        "dense-paragraph",
        "readability",
        "info",
        "A paragraph is carrying too much",
        "One paragraph is longer than 90 words.",
        "Group supporting points into shorter paragraphs with one job each.",
        denseParagraph.slice(0, 180)
      )
    );
  }

  let overlapEvidence = null;
  for (let i = 0; i < sentences.length; i += 1) {
    const a = contentTokens(sentences[i]);
    if (a.size < 4) continue;
    for (let j = i + 1; j < sentences.length; j += 1) {
      const b = contentTokens(sentences[j]);
      if (b.size < 4) continue;
      if (jaccard(a, b) >= 0.5) {
        overlapEvidence = `${sentences[i]} / ${sentences[j]}`;
        break;
      }
    }
    if (overlapEvidence) break;
  }

  if (overlapEvidence) {
    findings.push(
      makeFinding(
        "support-overlap",
        "logic",
        "info",
        "Supporting points may overlap",
        "Two sentences use substantially the same content words.",
        "Check whether they make distinct points. Merge them if they support the same idea.",
        overlapEvidence
      )
    );
  }

  return {
    summary: {
      words: wordCount(text),
      sentences: sentences.length,
      findings: findings.length
    },
    findings
  };
}

export function hasBlockingFindings(result) {
  return result.findings.some((finding) => finding.severity === "warning");
}
