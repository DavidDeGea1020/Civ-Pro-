/**
 * SearchJobTitles
 * Fuzzy job-title search for the "Search Job Descriptions" flow.
 * Replaces MatchJobTitle in that flow only. Leave MatchJobTitle in place for any
 * other flows that still use it.
 *
 * Parameters (Power Automate "Run script"):
 *   userInput  - what the user typed
 *   itemsJson  - JSON array of JDs: [{ jobCode, jobTitle, ... }]; extra fields are ignored
 *   maxResults - how many matches to return (default 8)
 *
 * Returns the same shape as SearchJobDescriptions:
 *   { status, count, topScore, matches: [{ jobCode, jobTitle, score, matchedTerms }] }
 *
 * How scoring works (0-1):
 *   1. Both the input and each title are canonicalized: abbreviations expanded
 *      (Sr -> senior, VP -> vice president), Roman numerals and "Level 2" turned into
 *      digits, plurals trimmed, and filler words dropped.
 *   2. Each word is fuzzy-matched to the closest word on the other side. This tolerates
 *      typos, but numbers and words of 3 letters or fewer must match exactly.
 *   3. score = 80% how much of the input was found in the title
 *            + 20% how much of the title the input covered
 *      So "Loan Officer" scores well against "Commercial Loan Officer II", but an exact
 *      title always scores highest.
 *   4. A whole-string comparison sets a floor, which catches run-together input
 *      such as "loanofficer".
 *   5. If the input names a level (II, 3, Level 2) and the title's level differs,
 *      the score is reduced.
 *   6. If any titles match the input exactly after canonicalizing, only those are returned.
 */

interface JobItem {
  jobCode?: string;
  jobTitle?: string;
  JobCode?: string; // tolerated in case itemsJson uses other key names
  Title?: string;
}

interface JobMatch {
  jobCode: string;
  jobTitle: string;
  score: number;
  matchedTerms: string;
}

interface SearchResult {
  status: string; // "single" | "multiple" | "none"
  count: number;
  topScore: number;
  matches: JobMatch[];
}

// ---- Tuning knobs ----
const MIN_SCORE = 0.6;               // titles below this are not returned
const CONFIDENT_SCORE = 0.85;        // top result at/above this...
const CONFIDENT_GAP = 0.1;           // ...and this far ahead of #2 counts as "single"
const WORD_MATCH_MIN = 0.75;         // two words count as the same if at least this similar
const LEVEL_MISMATCH_PENALTY = 0.85; // applied when the input's level doesn't match the title's

// Abbreviations -> full words. Applied to both the input and the titles, so either form matches.
const ALIASES = new Map<string, string>([
  ["sr", "senior"], ["jr", "junior"],
  ["mgr", "manager"], ["mngr", "manager"],
  ["asst", "assistant"], ["assoc", "associate"],
  ["admin", "administrative"], ["dir", "director"],
  ["exec", "executive"], ["coord", "coordinator"],
  ["spec", "specialist"], ["rep", "representative"],
  ["ops", "operations"], ["acct", "account"],
  ["mgmt", "management"], ["svc", "service"], ["svcs", "service"],
  ["cust", "customer"], ["fin", "financial"], ["sys", "system"],
  ["eng", "engineer"], ["engr", "engineer"], ["dev", "developer"],
  ["vp", "vice president"], ["svp", "senior vice president"],
  ["evp", "executive vice president"], ["avp", "assistant vice president"],
  ["rm", "relationship manager"], ["hr", "human resources"]
]);

// Roman numerals -> digits (only converted when not the first word, so "I need..." isn't read as level 1)
const ROMAN = new Map<string, string>([
  ["i", "1"], ["ii", "2"], ["iii", "3"], ["iv", "4"], ["v", "5"],
  ["vi", "6"], ["vii", "7"], ["viii", "8"], ["ix", "9"], ["x", "10"]
]);

const FILLER = new Set<string>([
  "a", "an", "and", "the", "of", "for", "to", "in", "on", "at", "with", "i",
  "job", "title", "role", "position", "level", "lvl"
]);

function main(
  workbook: ExcelScript.Workbook,
  userInput: string,
  itemsJson: string,
  maxResults: number = 8
): SearchResult {
  const empty: SearchResult = { status: "none", count: 0, topScore: 0, matches: [] };
  const items = JSON.parse(itemsJson) as JobItem[];
  const q = canonicalize(userInput);
  if (q.length === 0 || items.length === 0) return empty;

  const qJoined = q.join(" ");
  const qCompact = q.join("");
  const qLevels = q.filter(w => isNum(w));

  const exact: JobMatch[] = [];
  const scored: JobMatch[] = [];

  for (const item of items) {
    const title = String(item.jobTitle || item.Title || "");
    const code = String(item.jobCode || item.JobCode || "");
    if (!title) continue;

    const t = canonicalize(title);
    if (t.length === 0) continue;

    // Exact title after canonicalizing ("Sr Loan Officer II" = "Senior Loan Officer 2")
    if (t.join(" ") === qJoined) {
      exact.push({ jobCode: code, jobTitle: title, score: 1, matchedTerms: "exact title" });
      continue;
    }

    // Word-level fuzzy score
    let score = 0.8 * coverage(q, t) + 0.2 * coverage(t, q);

    // Whole-string floor (catches "loanofficer", spacing differences)
    const tCompact = t.join("");
    const stringSim = 1 - levenshtein(qCompact, tCompact) / Math.max(qCompact.length, tCompact.length, 1);
    score = Math.max(score, 0.95 * stringSim);

    // Level check
    const tLevels = t.filter(w => isNum(w));
    if (qLevels.length > 0 && !qLevels.some(l => tLevels.indexOf(l) >= 0)) {
      score *= LEVEL_MISMATCH_PENALTY;
    }

    if (score >= MIN_SCORE) {
      scored.push({
        jobCode: code,
        jobTitle: title,
        score: Math.round(score * 100) / 100,
        matchedTerms: q.filter(w => t.some(x => wordSim(w, x) > 0)).join(", ")
      });
    }
  }

  // Exact matches win outright
  if (exact.length > 0) {
    const top = exact.slice(0, maxResults);
    return { status: top.length === 1 ? "single" : "multiple", count: top.length, topScore: 1, matches: top };
  }

  scored.sort((a, b) => (b.score - a.score) || a.jobTitle.localeCompare(b.jobTitle));
  const top = scored.slice(0, maxResults);

  let status = "none";
  if (top.length === 1) {
    status = "single";
  } else if (top.length > 1) {
    const clearWinner =
      top[0].score >= CONFIDENT_SCORE && top[0].score - top[1].score >= CONFIDENT_GAP;
    status = clearWinner ? "single" : "multiple";
  }

  return {
    status: status,
    count: top.length,
    topScore: top.length > 0 ? top[0].score : 0,
    matches: top
  };
}

// Lowercase, split, expand abbreviations, convert levels, trim plurals, drop filler
function canonicalize(text: string): string[] {
  const raw = (text || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 0);

  const out: string[] = [];
  raw.forEach((w, i) => {
    if (i > 0 && ROMAN.has(w)) {
      out.push(ROMAN.get(w) as string);
      return;
    }
    const expanded = ALIASES.has(w) ? (ALIASES.get(w) as string).split(" ") : [w];
    for (const e of expanded) {
      if (FILLER.has(e)) continue;
      out.push(singular(e));
    }
  });
  return out;
}

function singular(w: string): string {
  if (isNum(w)) return w;
  if (w.length > 4 && w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("us") && !w.endsWith("is")) {
    return w.slice(0, -1);
  }
  return w;
}

function isNum(w: string): boolean {
  return /^\d+$/.test(w);
}

// Average best-match similarity of each word in `from` against the words in `to`
function coverage(from: string[], to: string[]): number {
  if (from.length === 0) return 0;
  let total = 0;
  for (const f of from) {
    let best = 0;
    for (const t of to) {
      const s = wordSim(f, t);
      if (s > best) best = s;
    }
    total += best;
  }
  return total / from.length;
}

// 1 = identical, 0 = no match. Short words and numbers must match exactly.
function wordSim(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length <= 3 || b.length <= 3 || isNum(a) || isNum(b)) return 0;
  const sim = 1 - levenshtein(a, b) / Math.max(a.length, b.length);
  return sim >= WORD_MATCH_MIN ? sim : 0;
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let prev: number[] = [];
  for (let j = 0; j <= b.length; j++) prev.push(j);
  for (let i = 1; i <= a.length; i++) {
    const cur: number[] = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur.push(Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost));
    }
    prev = cur;
  }
  return prev[b.length];
}
