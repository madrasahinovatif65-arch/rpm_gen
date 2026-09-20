export type AtomicCpTopic = {
  elemen: string;
  topik: string;
};

const HEADER_PATTERN = /(?:^|[.!?])\s*([\p{L}][\p{L}\d'’‘&/()\- ]{1,48}?)\s*:\s*/gu;
const VERB_GROUP = "menghafal|menulis|membaca|memahami|menjelaskan|mengidentifikasi|menyebutkan|menceritakan|menerapkan|mempraktikkan|mendemonstrasikan|menguraikan|menganalisis|mengklasifikasikan|mengkomunikasikan|menyimpulkan|mengartikan";
const VERB_PATTERN = new RegExp(`(${VERB_GROUP})`, "iu");

const normalizeMaterial = (value: string): string => value
  .replace(/^\s*(?:\d+[.)-]\s*)+/u, "")
  .replace(/^[\s\-–—]+/u, "")
  .replace(/\s*(?:sebagai bekal|agar dapat|dalam kehidupan(?: sehari-hari)?|untuk menerapkan|sehingga mampu|dalam praktik membaca|dalam praktik|dengan baik dan benar|dengan baik)\b[\s\S]*$/iu, "")
  .replace(/^hukum\s+bacaan\s+/iu, "")
  .replace(/^bacaan\s+/iu, "")
  .replace(/^hadis\s+tentang\s+/iu, "")
  .replace(/^surah(?:-surah)?\s+/iu, "surah ")
  .replace(/[.!?]+$/u, "")
  .replace(/\s+/g, " ")
  .trim();

const splitCoordinatedVerbPairs = (value: string): string[] => {
  const text = value.trim();
  if (!text) return [];
  const pairRegex = new RegExp(`^(.*?\b(?:${VERB_GROUP})\b)\s+dan\s+(?:(?:${VERB_GROUP})\s+)?(.+)$`, "iu");
  const match = text.match(pairRegex);
  if (!match) return [text];

  const left = match[1].trim();
  const right = match[2].trim();
  const leftHead = left.match(VERB_PATTERN)?.[0]?.toLowerCase() ?? "";
  const rightHead = right.match(VERB_PATTERN)?.[0]?.toLowerCase() ?? "";

  if (!leftHead || !rightHead || leftHead === rightHead) return [text];

  const objectPart = right.replace(new RegExp(`^${rightHead}\\s+`, "i"), "").trim();
  return [
    `${leftHead} ${objectPart}`.trim(),
    `${rightHead} ${objectPart}`.trim()
  ].filter(Boolean);
};

const splitAtomicMaterialList = (sectionText: string): string[] => {
  const cleaned = sectionText
    .replace(/\s*;\s*/g, ",")
    .replace(/\s*(?:,\s*dan\s+|\s+dan\s+)(?=\b(?:[A-Za-z])\b)/gi, ", ")
    .trim();

  const baseItems = cleaned
    .split(/\s*,\s*/u)
    .map((part) => part.trim())
    .filter(Boolean);

  const result: string[] = [];
  for (const item of baseItems) {
    const expanded = splitCoordinatedVerbPairs(item);
    for (const candidate of expanded) {
      const normalized = normalizeMaterial(candidate);
      if (normalized.length >= 3 && !/^(murid|siswa|peserta didik|mereka|ia|dengan|benar|baik|serta|isi|kandungannya|atau)$/iu.test(normalized)) {
        result.push(normalized);
      }
    }
  }

  return result;
};

/**
 * Memecah CP menjadi materi pokok atomik untuk pipeline TP.
 * Setiap elemen CP wajib diurai sampai level sub-materi tunggal, termasuk
 * daftar seperti "menghafal dan menulis hadis ...", "salat berjemaah,
 * persaudaraan, takwa, niat, dan silaturahmi".
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
    const items = splitAtomicMaterialList(section.content);
    for (const item of items) {
      if (!result.some((entry) => entry.elemen === section.elemen && entry.topik.toLowerCase() === item.toLowerCase())) {
        result.push({ elemen: section.elemen, topik: item });
      }
    }
  }

  return result;
};
