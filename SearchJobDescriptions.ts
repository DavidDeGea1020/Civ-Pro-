/**
 * SearchJobDescriptions
 * Scores job descriptions against a free-text description of a role.
 * Called from Power Automate via "Run script". The workbook isn't used; JD data
 * is passed in as JSON so the script doesn't depend on any sheet layout.
 *
 * Score (0–1) = 70% coverage  – share of the query's meaningful words found anywhere
 *                               in the JD, with rare words counting more than common ones
 *             + 30% placement – bonus when those words land in Title/Purpose rather
 *                               than Education/Experience
 */

interface JobCandidate {
  jobCode: string;
  jobTitle: string;
  purpose?: string;
  duties?: string;
  ksa?: string;
  education?: string;
  experience?: string;
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
const MIN_SCORE = 0.25;       // JDs scoring below this aren't returned
const CONFIDENT_SCORE = 0.8;  // top result at/above this...
const CONFIDENT_GAP = 0.15;   // ...and this far ahead of #2 counts as "single"
const MAX_FIELD_WEIGHT = 3;   // must equal the highest weight in fieldTexts()

const STOP_WORDS = new Set<string>([
  "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "have", "in", "is", "it",
  "of", "on", "or", "our", "that", "the", "their", "this", "to", "was", "we", "who", "will",
  "with", "job", "role", "position", "someone", "person", "looking", "need", "needs", "want",
  "responsible", "responsibilities", "duties", "employee", "employees"
]);

function main(
  workbook: ExcelScript.Workbook,
  query: string,
  candidatesJson: string,
  maxResults: number = 8
): SearchResult {
  const candidates = JSON.parse(candidatesJson) as JobCandidate[];

  // Query terms: stem -> original word (keeps matchedTerms readable)
  const queryTerms = new Map<string, string>();
  for (const word of words(query)) {
    const s = stem(word);
    if (!queryTerms.has(s)) queryTerms.set(s, word);
  }
  if (queryTerms.size === 0 || candidates.length === 0) {
    return { status: "none", count: 0, topScore: 0, matches: [] };
  }

  // Index each JD: term set per field, plus one set for all fields
  const docs = candidates.map(c => {
    const fields = fieldTexts(c).map(f => ({
      weight: f.weight,
      terms: new Set<string>(words(f.text).map(w => stem(w)))
    }));
    const all = new Set<string>();
    fields.forEach(f => f.terms.forEach(t => all.add(t)));
    return { cand: c, fields: fields, all: all };
  });

  // Inverse document frequency. Terms that appear in no JD are ignored so a
  // stray word doesn't drag every score down.
  const n = docs.length;
  const idf = new Map<string, number>();
  queryTerms.forEach((_, term) => {
    const df = docs.filter(d => d.all.has(term)).length;
    if (df > 0) idf.set(term, Math.log(1 + n / (1 + df)));
  });
  let totalIdf = 0;
  idf.forEach(v => { totalIdf += v; });
  if (totalIdf === 0) {
    return { status: "none", count: 0, topScore: 0, matches: [] };
  }

  const scored: JobMatch[] = [];
  for (const d of docs) {
    let covered = 0;
    let placed = 0;
    const hits: string[] = [];
    idf.forEach((w, term) => {
      if (!d.all.has(term)) return;
      covered += w;
      let best = 0;
      for (const f of d.fields) {
        if (f.terms.has(term) && f.weight > best) best = f.weight;
      }
      placed += w * (best / MAX_FIELD_WEIGHT);
      hits.push(queryTerms.get(term) as string);
    });
    const score = 0.7 * (covered / totalIdf) + 0.3 * (placed / totalIdf);
    if (score >= MIN_SCORE) {
      scored.push({
        jobCode: String(d.cand.jobCode),
        jobTitle: d.cand.jobTitle,
        score: Math.round(score * 100) / 100,
        matchedTerms: hits.join(", ")
      });
    }
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

// Field weights: where a word lands says how central it is to the job
function fieldTexts(c: JobCandidate): { text: string; weight: number }[] {
  return [
    { text: c.jobTitle, weight: 3 },
    { text: c.purpose, weight: 2 },
    { text: c.duties, weight: 1.5 },
    { text: c.ksa, weight: 1 },
    { text: c.education, weight: 0.5 },
    { text: c.experience, weight: 0.5 }
  ];
}

function words(text: string): string[] {
  return (text || "")
    .replace(/<[^>]*>/g, " ")          // SharePoint rich text arrives as HTML
    .replace(/&[a-z#0-9]+;/gi, " ")    // HTML entities (&nbsp; etc.)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

// Light stemmer so "managing", "manages", "managed", "manage" all line up
function stem(w: string): string {
  let s = w;
  if (s.length > 5 && s.endsWith("ing")) s = s.slice(0, -3);
  else if (s.length > 4 && s.endsWith("ies")) s = s.slice(0, -3) + "y";
  else if (s.length > 4 && s.endsWith("ed")) s = s.slice(0, -2);
  else if (s.length > 3 && s.endsWith("s") && !s.endsWith("ss")) s = s.slice(0, -1);
  if (s.length > 4 && s.endsWith("e")) s = s.slice(0, -1);
  return s;
}
