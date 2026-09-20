export type AtomicCpTopic = {
  elemen: string;
  topik: string;
};

const HEADER_PATTERN = /(?:^|[.!?])\s*([\p{L}][\p{L}\d'’‘&/()\- ]{1,48}?)\s*:\s*/gu;
const LEADING_ACTIONS = /^(?:menerapkan|menghafal|menulis|membaca|memahami|menjelaskan|mengidentifikasi|menyebutkan|menunjukkan|mendemonstrasikan|mempraktikkan)\s+/iu;
const LIST_STOP = /\s*,\s*(?:menjelaskan|menguraikan|mendeskripsikan|agar dapat|untuk menerapkan|sebagai bekal|sehingga mampu|dalam praktik)\b[\s\S]*$/iu;
const FILLER_ONLY = /^(?:murid|siswa|peserta didik|mereka|ia|dengan|benar|baik|serta|isi|kandungannya|atau)$/iu;

const normalizeMaterial = (value: string): string => value
  .replace(/^[\d.\-–—\s]+/u, "")
  .replace(LEADING_ACTIONS, "")
  .replace(/^hukum\s+bacaan\s+/iu, "")
  .replace(/^bacaan\s+/iu, "")
  .replace(/^hadis\s+tentang\s+/iu, "")
  .replace(/^surah(?:-surah)?\s+/iu, "surah ")
  .replace(/[.!?]+$/u, "")
  .trim();

/**
 * Memecah setiap elemen CP menjadi unit materi pokok yang tidak boleh
 * digabungkan kembali menjadi satu TP. Konjungsi "dan" hanya dipakai
 * sebagai pemisah ketika membentuk daftar materi; pasangan aksi seperti
 * "menghafal dan menulis" dipertahankan sebagai instruksi kompetensi.
 */
export const parseAtomicCpTopics = (cpText: string): AtomicCpTopic[] => {
  if (!cpText?.trim()) return [];

  const input = cpText.replace(/\r\n?/g, "\n").trim();
  const headers = [...input.matchAll(HEADER_PATTERN)];
  const sections = headers.length
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
    // Hentikan daftar materi sebelum uraian kompetensi/tujuan lanjutan.
    const materialText = section.content
      .replace(LIST_STOP, "")
      .replace(/\s+/g, " ")
      .trim();

    const commaParts = materialText.split(/[,;]+/u).flatMap((part) => {
      const clean = part.trim();
      // "..., takwa, niat, dan silaturahmi" harus menjadi tiga unit terakhir.
      if (/\s+dan\s+/iu.test(clean) && !/^(?:menghafal|menulis|membaca|memahami)\s+dan\s+/iu.test(clean)) {
        return clean.split(/\s+dan\s+/iu);
      }
      return [clean];
    });

    for (const part of commaParts) {
      const topik = normalizeMaterial(part);
      if (topik.length < 3 || FILLER_ONLY.test(topik)) continue;
      if (!result.some((item) => item.elemen === section.elemen && item.topik.toLocaleLowerCase() === topik.toLocaleLowerCase())) {
        result.push({ elemen: section.elemen, topik });
      }
    }
  }

  return result;
};
