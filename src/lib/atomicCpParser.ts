export type AtomicCpTopic = {
  elemen: string;
  topik: string;
};

const HEADER_PATTERN = /(?:^|[.!?])\s*([\p{L}][\p{L}\d'’‘&/()\- ]{1,48}?)\s*:\s*/gu;

const FILLER_SUFFIX = /\s*(?:sebagai bekal|agar dapat|dalam kehidupan(?: sehari-hari)?|untuk menerapkan|sehingga mampu|dalam praktik membaca|dengan baik dan benar)\b[\s\S]*$/iu;

/**
 * Memecah CP menjadi materi pokok atomik untuk pipeline TP.
 *
 * Prinsip penting:
 * - Header elemen dipisahkan tanpa bergantung pada newline dari input.
 * - Koma dan titik koma memisahkan materi pokok.
 * - Kata "dan" tidak dipaksa menjadi pemisah; ini mencegah frasa
 *   kompetensi seperti "menghafal dan menulis" terpotong secara keliru.
 * - Kalimat tujuan di belakang daftar materi dibuang dari nama materi.
 */
export const parseAtomicCpTopics = (cpText: string): AtomicCpTopic[] => {
  if (!cpText?.trim()) return [];

  const input = cpText.replace(/\r\n?/g, "\n").trim();
  const headers = [...input.matchAll(HEADER_PATTERN)];
  const sections: Array<{ elemen: string; content: string }> = [];

  if (headers.length > 0) {
    headers.forEach((match, index) => {
      const start = (match.index ?? 0) + match[0].length;
      const end = index + 1 < headers.length ? (headers[index + 1].index ?? input.length) : input.length;
      sections.push({
        elemen: match[1].trim(),
        content: input.slice(start, end).trim()
      });
    });
  } else {
    sections.push({ elemen: "Umum", content: input });
  }

  const result: AtomicCpTopic[] = [];
  for (const section of sections) {
    const content = section.content
      .replace(/\s+/g, " ")
      .replace(/\s*;\s*/g, ";")
      .trim();

    // Daftar materi biasanya berada sebelum penjelas tujuan pertama.
    const parts = content.split(/[,;]+/u);
    for (const rawPart of parts) {
      const topik = rawPart
        .replace(FILLER_SUFFIX, "")
        .replace(/^[\d.\-–—\s]+/u, "")
        .replace(/^dan\s+/iu, "")
        .replace(/[.!?]+$/u, "")
        .trim();

      if (topik.length < 3) continue;
      if (/^(murid|siswa|peserta didik|mereka|ia|dengan|benar|baik|serta|atau)$/iu.test(topik)) continue;
      if (!result.some((item) => item.elemen === section.elemen && item.topik.toLocaleLowerCase() === topik.toLocaleLowerCase())) {
        result.push({ elemen: section.elemen, topik });
      }
    }
  }

  return result;
};
