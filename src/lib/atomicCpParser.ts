export type AtomicCpTopic = {
  elemen: string;
  topik: string;
};

const HEADER_PATTERN = /(?:^|[.!?])\s*([\p{L}][\p{L}\d'’‘&/()\- ]{1,48}?)\s*:\s*/gu;
const TRAILING_CLAUSE_RE = /\s*(?:sebagai bekal|agar dapat|untuk menerapkan|dalam kehidupan(?:\s+sehari-hari)?|dalam praktik(?:\s+membaca)?|dengan baik(?:\s+dan\s+benar)?|serta\s+isi\s+kandungannya|menjelaskan\s+arti\s+serta|sehingga\s+mampu)[\s\S]*$/iu;
const FILLER_WORDS = /^(?:murid|siswa|peserta didik|mereka|ia|dengan|benar|baik|serta|isi|kandungannya|atau|dan)$/iu;
const LEADING_VERBS = /^(?:menerapkan|menghafal|menulis|membaca|memahami|menjelaskan|mengidentifikasi|menyebutkan|menunjukkan|menceritakan|mendemonstrasikan|menerangkan|menguraikan|menganalisis|mengklasifikasikan|mengkomunikasikan|mengaplikasikan|mempraktikkan|mengartikan|menyimpulkan|menanggapi)\s+/iu;
const COMMON_PREFIX_RE = /^(?:hukum\s+bacaan|bacaan|hadis\s+tentang|surah(?:-surah)?\s+|arti\s+|isi\s+|makna\s+|pengertian\s+)/iu;
const VERB_FOR_SPLIT = /\b(?:menerapkan|menghafal|menulis|membaca|memahami|menjelaskan|mengidentifikasi|menyebutkan|menceritakan|mendemonstrasikan|menerangkan|menguraikan|menganalisis|mengklasifikasikan|mengkomunikasikan|mengaplikasikan|mempraktikkan|mengartikan|menyimpulkan|menunjukkan)\b/iu;

const normalizeMaterial = (value: string): string => {
  let out = value
    .replace(/^[\d.\-–—\s]+/u, "")
    .replace(TRAILING_CLAUSE_RE, "")
    .replace(LEADING_VERBS, "")
    .replace(COMMON_PREFIX_RE, "")
    .replace(/^\s*[-–—]\s*/u, "")
    .replace(/[.!?]+$/u, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!out) return "";
  if (FILLER_WORDS.test(out)) return "";
  return out;
};

const splitCoordinatedVerbPairs = (value: string): string[] => {
  const text = value.trim();
  if (!text) return [];

  const match = text.match(/^(.*?\b(?:menerapkan|menghafal|menulis|membaca|memahami|menjelaskan|mengidentifikasi|menyebutkan|menceritakan|mendemonstrasikan|menerangkan|menguraikan|menganalisis|mengklasifikasikan|mengkomunikasikan|mengaplikasikan|mempraktikkan|mengartikan|menyimpulkan|menunjukkan)\b)\s+dan\s+(?:(?:menerapkan|menghafal|menulis|membaca|memahami|menjelaskan|mengidentifikasi|menyebutkan|menceritakan|mendemonstrasikan|menerangkan|menguraikan|menganalisis|mengklasifikasikan|mengkomunikasikan|mengaplikasikan|mempraktikkan|mengartikan|menyimpulkan|menunjukkan)\s+)?(.+)$/iu);

  if (!match) return [text];

  const left = match[1].trim();
  const right = match[2].trim();
  const leftHead = left.match(VERB_FOR_SPLIT)?.[0]?.trim() ?? "";
  const rightHead = right.match(VERB_FOR_SPLIT)?.[0]?.trim() ?? "";

  if (!leftHead || !rightHead || leftHead.toLowerCase() === rightHead.toLowerCase()) {
    return [text];
  }

  const leftClean = normalizeMaterial(left);
  const rightClean = normalizeMaterial(right);
  return [leftClean, rightClean].filter(Boolean);
};

const splitAndList = (value: string): string[] => {
  const text = value.trim();
  if (!text) return [];

  const parts = text
    .split(/\s*,\s*|\s*;\s*/u)
    .map((part) => part.trim())
    .filter(Boolean);

  const result: string[] = [];
  for (const rawPart of parts) {
    const expanded = splitCoordinatedVerbPairs(rawPart);
    for (const item of expanded) {
      const splitByAnd = item.split(/\s+dan\s+(?=[A-Za-z])/u)
        .map((part) => part.trim())
        .filter(Boolean);

      for (const candidate of splitByAnd.length > 1 ? splitByAnd : [item]) {
        const normalized = normalizeMaterial(candidate);
        if (normalized.length >= 3 && !FILLER_WORDS.test(normalized)) {
          result.push(normalized);
        }
      }
    }
  }

  return result;
};

const dedupe = (rows: AtomicCpTopic[]): AtomicCpTopic[] => {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = `${row.elemen.toLowerCase()}::${row.topik.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/**
 * Memecah CP menjadi sub-materi atomik untuk pipeline TP.
 * Setiap item hasilnya harus mewakili satu materi pokok tunggal dan bukan
 * gabungan dari dua materi atau dua kompetensi.
 */
export const parseAtomicCpTopics = (cpText: string): AtomicCpTopic[] => {
  if (!cpText?.trim()) return [];

  const input = cpText.replace(/\r\n?/g, "\n").trim();
  const headers = [...input.matchAll(HEADER_PATTERN)];
  const sections = headers.length > 0
    ? headers.map((match, index) => ({
        elemen: match[1].trim(),
        content: input.slice(
          (match.index ?? 0) + match[0].length,
          index + 1 < headers.length ? (headers[index + 1].index ?? input.length) : input.length
        ).trim()
      }))
    : [{ elemen: "Umum", content: input }];

  const result: AtomicCpTopic[] = [];

  for (const section of sections) {
    const content = section.content
      .replace(/\s+/g, " ")
      .replace(/\s*;\s*/g, ",")
      .trim();

    const parts = splitAndList(content);
    for (const topic of parts) {
      if (!topic || topic.length < 3) continue;
      if (FILLER_WORDS.test(topic)) continue;
      result.push({ elemen: section.elemen, topik: topic });
    }
  }

  return dedupe(result);
};
