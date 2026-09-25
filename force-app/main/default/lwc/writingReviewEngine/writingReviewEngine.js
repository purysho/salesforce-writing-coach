const MESSAGE_PATTERNS = {
  recommendation: [
    /\bwe recommend\b/i,
    /\bi recommend\b/i,
    /\bwe propose\b/i,
    /\bi propose\b/i,
    /\bwe suggest\b/i,
    /\bi suggest\b/i,
    /\bour recommendation is\b/i
  ],
  request: [
    /\bwe need (?:your|you to)\b/i,
    /\bplease\b/i,
    /\bcan you\b/i,
    /\bcould you\b/i,
    /\bwould you\b/i,
    /\bwe need a decision\b/i,
    /\bwe need approval\b/i
  ],
  change: [
    /\bwe will (?:move|change|delay|pause|cancel|extend|reduce|increase)\b/i,
    /\bwe cannot\b/i,
    /\bwe can't\b/i,
    /\bthe (?:launch|date|timeline|scope|price|cost|plan) (?:will|needs to|must|has to)\b/i,
    /\bthe decision is\b/i,
    /\bthe change is\b/i,
    /\bhas been (?:moved|changed|delayed|cancelled|canceled)\b/i
  ],
  update: [
    /\b(?:here is|here's) (?:the|an) update\b/i,
    /\b(?:the|our) (?:project|implementation|migration|testing|work) (?:is|remains|continues)\b/i,
    /\bwe have completed\b/i,
    /\bwe've completed\b/i,
    /\bwe completed\b/i,
    /\bwe are on track\b/i,
    /\bwe remain on track\b/i,
    /\btesting (?:is|will be)\b/i
  ]
};

const ACTION_PATTERNS = [
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
  /\bselect\b/i,
  /\bprovide\b/i,
  /\blet me know\b/i
];

const VAGUE_PATTERNS = [
  { id: "asap", pattern: /\basap\b/i },
  { id: "as-soon-as-possible", pattern: /\bas soon as possible\b/i },
  { id: "sometime-soon", pattern: /\bsome\s*time soon\b/i },
  { id: "when-you-get-a-chance", pattern: /\bwhen you get a chance\b/i },
  { id: "few", pattern: /\ba few\b/i },
  { id: "several", pattern: /\bseveral\b/i },
  { id: "other-options", pattern: /\bsome other options\b/i },
  { id: "probably", pattern: /\bprobably\b/i },
  { id: "might-be", pattern: /\bmight be\b/i },
  { id: "looking-at", pattern: /\bcurrently looking at\b/i }
];

const SETUP_PATTERNS = [
  /\bi hope (?:you'?re|you are) well\b/i,
  /\bi just wanted to\b/i,
  /\bfollowing (?:our|the) conversation\b/i,
  /\bjust (?:a )?quick update\b/i,
  /\bwhere things currently stand\b/i,
  /\bi wanted to reach out\b/i
];

const GREETING_PATTERNS = [
  /^(?:hi|hello|dear)\b/i,
  /^(?:good morning|good afternoon|good evening)\b/i
];

const SIGNOFF_PATTERNS = [
  /^(?:best|regards|kind regards|thanks|thank you|sincerely|cheers)[,!]?$/i
];

const STOP_WORDS = new Set([
  "the","a","an","and","or","but","to","of","in","on","for","with","as","at","by",
  "is","are","was","were","be","been","being","it","this","that","these","those",
  "we","you","i","our","your","they","their","from","so","if","then","than","will",
  "would","could","should","have","has","had","do","does","did"
]);

const INTENT_LABELS = {
  recommendation: "Recommendation",
  request: "Request / decision",
  change: "Change / problem",
  update: "Informational update",
  unknown: "General message"
};

function stripHtml(value = "") {
  return value
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/(?:p|div|li)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
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

function isGreeting(sentence) {
  return GREETING_PATTERNS.some((pattern) => pattern.test(sentence.trim()));
}

function isSignoff(sentence) {
  return SIGNOFF_PATTERNS.some((pattern) => pattern.test(sentence.trim()));
}

function isSetup(sentence) {
  return SETUP_PATTERNS.some((pattern) => pattern.test(sentence));
}

function matchIntent(sentence) {
  for (const intent of ["recommendation", "request", "change", "update"]) {
    if (MESSAGE_PATTERNS[intent].some((pattern) => pattern.test(sentence))) {
      return intent;
    }
  }
  return null;
}

function substantiveSentences(sentences) {
  return sentences
    .map((sentence, originalIndex) => ({ sentence, originalIndex }))
    .filter(({ sentence }) => !isGreeting(sentence) && !isSignoff(sentence));
}

function inferIntent(sentences, explicitIntent = "auto") {
  if (explicitIntent && explicitIntent !== "auto") {
    return {
      intent: explicitIntent,
      confidence: "explicit",
      sourceSentence: ""
    };
  }

  const substantive = substantiveSentences(sentences);
  const scores = {
    recommendation: 0,
    request: 0,
    change: 0,
    update: 0
  };
  let firstMatch = null;

  substantive.forEach(({ sentence, originalIndex }, substantiveIndex) => {
    const intent = matchIntent(sentence);
    if (!intent) return;

    const positionWeight = substantiveIndex <= 1 ? 3 : 1;
    scores[intent] += positionWeight;

    if (!firstMatch) {
      firstMatch = { intent, sentence, originalIndex, substantiveIndex };
    }
  });

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (!ranked[0][1]) {
    return {
      intent: "unknown",
      confidence: "low",
      sourceSentence: ""
    };
  }

  return {
    intent: ranked[0][0],
    confidence: ranked[0][1] >= 3 ? "high" : "medium",
    sourceSentence: firstMatch?.sentence || ""
  };
}

function findMainMessage(sentences, intent) {
  const substantive = substantiveSentences(sentences);

  for (let i = 0; i < substantive.length; i += 1) {
    const item = substantive[i];
    const matchedIntent = matchIntent(item.sentence);

    if (matchedIntent && (intent === "unknown" || matchedIntent === intent || i <= 1)) {
      return {
        originalIndex: item.originalIndex,
        substantiveIndex: i,
        sentence: item.sentence,
        matchedIntent
      };
    }
  }

  // If no explicit signal exists, treat the first concise substantive sentence as a
  // plausible main message rather than automatically declaring the draft broken.
  const candidate = substantive.find(({ sentence }) =>
    !isSetup(sentence) && wordCount(sentence) >= 4 && wordCount(sentence) <= 35
  );

  if (candidate) {
    return {
      originalIndex: candidate.originalIndex,
      substantiveIndex: substantive.findIndex((item) => item.originalIndex === candidate.originalIndex),
      sentence: candidate.sentence,
      matchedIntent: "implicit"
    };
  }

  return null;
}

function requiresNextAction(intent) {
  return intent === "recommendation" || intent === "request" || intent === "change";
}

function hasNextAction(sentences) {
  const substantive = substantiveSentences(sentences);
  const tailStart = Math.max(0, Math.floor(substantive.length * 0.55));
  const tail = substantive.slice(tailStart).map(({ sentence }) => sentence).join(" ");
  return ACTION_PATTERNS.some((pattern) => pattern.test(tail));
}

function makeFinding({
  id,
  category,
  severity,
  title,
  message,
  suggestion,
  evidence = "",
  action = null
}) {
  return { id, category, severity, title, message, suggestion, evidence, action };
}

function parseBlocks(input) {
  const matches = [...input.matchAll(/<(p|div)([^>]*)>([\s\S]*?)<\/\1>/gi)];
  if (!matches.length) return [];

  return matches.map((match, index) => ({
    index,
    html: match[0],
    tag: match[1],
    text: stripHtml(match[3]).trim()
  }));
}

function replaceBlocks(input, blocks) {
  const blockPattern = /<(p|div)([^>]*)>([\s\S]*?)<\/\1>/gi;
  const matches = [...input.matchAll(blockPattern)];
  if (!matches.length) return input;

  // Safe automatic edits are limited to rich-text values whose meaningful content
  // is represented by top-level paragraph/div blocks. If there is other content
  // around those blocks, keep the original rather than risk damaging formatting.
  const remainder = input.replace(blockPattern, "").trim();
  if (remainder) return input;

  return blocks.map((block) => block.html).join("");
}

export function applyReviewAction(input = "", finding) {
  if (!finding?.action?.safe) {
    return { changed: false, value: input, reason: "This suggestion needs the writer's judgement." };
  }

  const blocks = parseBlocks(input);
  if (!blocks.length) {
    return {
      changed: false,
      value: input,
      reason: "Safe automatic edits require paragraph-based rich text."
    };
  }

  if (finding.action.type === "move-main-block-first") {
    const evidence = (finding.evidence || "").toLowerCase();
    const targetIndex = blocks.findIndex((block) =>
      evidence && block.text.toLowerCase().includes(evidence)
    );

    if (targetIndex < 0) {
      return { changed: false, value: input, reason: "The main-message paragraph could not be located safely." };
    }

    const target = blocks[targetIndex];
    const remaining = blocks.filter((_, index) => index !== targetIndex);
    const greetingIndex = remaining.findIndex((block) => isGreeting(block.text));
    const insertAt = greetingIndex === 0 ? 1 : 0;
    remaining.splice(insertAt, 0, target);

    return {
      changed: true,
      value: replaceBlocks(input, [...remaining]),
      reason: "Moved the main-message paragraph to the opening."
    };
  }

  if (finding.action.type === "remove-setup-block") {
    const targetIndex = blocks.findIndex((block) =>
      SETUP_PATTERNS.some((pattern) => pattern.test(block.text))
    );

    if (targetIndex < 0) {
      return { changed: false, value: input, reason: "No standalone setup paragraph was found." };
    }

    // Do not delete a block that also contains an explicit business message.
    if (matchIntent(blocks[targetIndex].text)) {
      return {
        changed: false,
        value: input,
        reason: "The setup shares a paragraph with business content, so it was left for manual editing."
      };
    }

    const remaining = blocks.filter((_, index) => index !== targetIndex);
    return {
      changed: true,
      value: replaceBlocks(input, [...remaining]),
      reason: "Removed the standalone setup paragraph."
    };
  }

  return { changed: false, value: input, reason: "No automatic edit is available for this finding." };
}

export function reviewEmail(input = "", options = {}) {
  const text = stripHtml(input);
  const explicitIntent = options.intent || "auto";

  if (!text) {
    return {
      summary: {
        words: 0,
        sentences: 0,
        findings: 0,
        intent: "unknown",
        intentLabel: INTENT_LABELS.unknown,
        intentConfidence: "low"
      },
      findings: [
        makeFinding({
          id: "empty-draft",
          category: "draft",
          severity: "info",
          title: "Start with a draft",
          message: "Write or paste a customer-facing email to review its structure.",
          suggestion: "Add a draft, then run the review."
        })
      ]
    };
  }

  const sentences = splitSentences(text);
  const paragraphs = splitParagraphs(text);
  const intentResult = inferIntent(sentences, explicitIntent);
  const intent = intentResult.intent;
  const findings = [];
  const main = findMainMessage(sentences, intent);

  if (!main) {
    findings.push(
      makeFinding({
        id: "main-message-missing",
        category: "hierarchy",
        severity: "warning",
        title: "Main message is unclear",
        message: "The draft does not surface a concise business message.",
        suggestion: "State the most important update, decision, request, or recommendation directly."
      })
    );
  } else if (main.substantiveIndex > 1) {
    findings.push(
      makeFinding({
        id: "main-message-buried",
        category: "hierarchy",
        severity: "warning",
        title: "Main message is buried",
        message: `The first clear business message appears after ${main.substantiveIndex} substantive sentence${main.substantiveIndex === 1 ? "" : "s"}.`,
        suggestion: "Consider moving this message to the opening, after any greeting.",
        evidence: main.sentence,
        action: {
          type: "move-main-block-first",
          label: "Move paragraph to opening",
          safe: true
        }
      })
    );
  }

  const substantive = substantiveSentences(sentences);
  const opening = substantive.slice(0, Math.min(2, substantive.length)).map(({ sentence }) => sentence).join(" ");
  if (opening && SETUP_PATTERNS.some((pattern) => pattern.test(opening))) {
    findings.push(
      makeFinding({
        id: "opening-setup",
        category: "hierarchy",
        severity: "info",
        title: "Opening spends time on setup",
        message: "The opening contains conventional setup before the business message.",
        suggestion: "Remove nonessential preamble when the customer can understand the message without it.",
        evidence: opening,
        action: {
          type: "remove-setup-block",
          label: "Remove setup paragraph",
          safe: true
        }
      })
    );
  }

  if (requiresNextAction(intent) && !hasNextAction(sentences)) {
    findings.push(
      makeFinding({
        id: "next-action-missing",
        category: "action",
        severity: "warning",
        title: "Next action is unclear",
        message: `${INTENT_LABELS[intent]} messages usually need an explicit customer action, decision, or acknowledgement.`,
        suggestion: "Name the action, owner, and timing explicitly.",
        action: {
          type: "manual-next-action",
          label: "Add next action",
          safe: false
        }
      })
    );
  }

  for (const vague of VAGUE_PATTERNS) {
    const match = text.match(vague.pattern);
    if (match) {
      findings.push(
        makeFinding({
          id: `vague-${vague.id}`,
          category: "precision",
          severity: "info",
          title: "Timing, quantity, or certainty may be vague",
          message: `“${match[0]}” may leave the customer unsure what happens next.`,
          suggestion: "Replace vague language with a date, owner, amount, status, or decision where possible.",
          evidence: match[0],
          action: {
            type: "manual-specifics",
            label: "Add specifics",
            safe: false
          }
        })
      );
      break;
    }
  }

  const denseParagraph = paragraphs.find((paragraph) => wordCount(paragraph) > 90);
  if (denseParagraph) {
    findings.push(
      makeFinding({
        id: "dense-paragraph",
        category: "readability",
        severity: "info",
        title: "A paragraph is carrying too much",
        message: "One paragraph is longer than 90 words.",
        suggestion: "Group supporting points into shorter paragraphs with one job each.",
        evidence: denseParagraph.slice(0, 180),
        action: {
          type: "manual-split",
          label: "Split supporting points",
          safe: false
        }
      })
    );
  }

  const support = substantive
    .filter(({ originalIndex }) => !main || originalIndex !== main.originalIndex)
    .map(({ sentence }) => sentence)
    .filter((sentence) => wordCount(sentence) >= 6);

  let overlapEvidence = null;
  for (let i = 0; i < support.length; i += 1) {
    const a = contentTokens(support[i]);
    if (a.size < 4) continue;

    for (let j = i + 1; j < support.length; j += 1) {
      const b = contentTokens(support[j]);
      if (b.size < 4) continue;

      if (jaccard(a, b) >= 0.58) {
        overlapEvidence = `${support[i]} / ${support[j]}`;
        break;
      }
    }

    if (overlapEvidence) break;
  }

  if (overlapEvidence) {
    findings.push(
      makeFinding({
        id: "support-overlap",
        category: "logic",
        severity: "info",
        title: "Supporting points may overlap",
        message: "Two supporting sentences use substantially the same content.",
        suggestion: "Check whether they make distinct points. Merge them if they support the same idea.",
        evidence: overlapEvidence,
        action: {
          type: "manual-merge",
          label: "Compare support",
          safe: false
        }
      })
    );
  }

  return {
    summary: {
      words: wordCount(text),
      sentences: sentences.length,
      findings: findings.length,
      intent,
      intentLabel: INTENT_LABELS[intent],
      intentConfidence: intentResult.confidence
    },
    findings
  };
}

export function hasBlockingFindings(result) {
  return result.findings.some((finding) => finding.severity === "warning");
}

export const INTENTS = [
  { label: "Auto-detect", value: "auto" },
  { label: "Informational update", value: "update" },
  { label: "Request / decision", value: "request" },
  { label: "Recommendation", value: "recommendation" },
  { label: "Change / problem", value: "change" }
];
