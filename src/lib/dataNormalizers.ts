import { TpType, AtpType } from "./kbcSchemas";
import { parseAtomicCpTopics } from "./atomicCpParser";

const getPhaseMultiplier = (fase: string): number => {
  const f = (fase || "").toUpperCase();
  if (f.includes("FASE A") || f.includes("FASE B") || f.includes("FASE C") || f.includes("FASE F")) return 2;
  if (f.includes("FASE D")) return 3;
  if (f.includes("FASE E")) return 1;
  return 2;
};

const getKkoWeight = (text: string): number => {
  const lower = (text || "").toLowerCase();
  if (/mencipta|menghasilkan|merancang|menyusun|mendesain|mengevaluasi|mengkritisi/.test(lower)) return 2.6;
  if (/menganalisis|membandingkan|menilai|mengkritik|mengolah|menyimpulkan/.test(lower)) return 2.2;
  if (/menerapkan|mempraktikkan|menggunakan|menyelesaikan|menghafal|membaca|menulis|mendemonstrasikan/.test(lower)) return 1.9;
  if (/menjelaskan|menguraikan|mengklasifikasikan|mendeskripsikan|mengorganisir/.test(lower)) return 1.5;
  if (/mengidentifikasi|menyebutkan|menunjukkan|menerangkan|memberi/.test(lower)) return 1.2;
  return 1;
};

const getTpWeight = (tp: any): number => {
  const material = tp?.materiPokok || tp?.rumusanTp || "";
  const kkoWeight = getKkoWeight(tp?.rumusanTp || material);
  const wordCount = material.trim().split(/\s+/).filter(Boolean).length;
  const practiceBonus = /membaca|menghafal|menulis|mempraktikkan|mendemonstrasikan|menerapkan/.test(material.toLowerCase()) ? 0.7 : 0;
  const breadthBonus = wordCount > 12 ? 0.8 : wordCount > 7 ? 0.4 : 0;
  return kkoWeight + practiceBonus + breadthBonus;
};

export const normalizeTpData = (rawTpJson: TpType, formData: any): TpType => {
  if (!rawTpJson?.daftarTp || !Array.isArray(rawTpJson.daftarTp)) return rawTpJson;

  const atomicTopics = parseAtomicCpTopics(formData.cpElemen || "");
  const sourceRows = atomicTopics.length > rawTpJson.daftarTp.length
    ? atomicTopics.map((topic, index) => ({
        ...(rawTpJson.daftarTp[index] || rawTpJson.daftarTp[rawTpJson.daftarTp.length - 1]),
        elemen: topic.elemen,
        materiPokok: topic.topik
      }))
    : rawTpJson.daftarTp;

  const prefix = formData.singkatanMapel || "MAPEL";
  const level = formData.level || formData.fase || "Fase";
  const totalJpInput = Number(formData.totalJp || 0) * getPhaseMultiplier(formData.fase);
  const weights = sourceRows.map((tp) => getTpWeight(tp));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0) || sourceRows.length;
  let remainingJp = totalJpInput;

  const daftarTp = sourceRows.map((tp, index) => {
    const topic = atomicTopics[index];
    const alokasiJp = totalJpInput > 0
      ? index === sourceRows.length - 1
        ? Math.max(0, remainingJp)
        : Math.max(0, Math.round((weights[index] / totalWeight) * totalJpInput))
      : Number(tp.alokasiJp || 1);
    if (totalJpInput > 0 && index < sourceRows.length - 1) remainingJp = Math.max(0, remainingJp - alokasiJp);

    return {
      ...tp,
      kodeTp: `${prefix}-${level}-${(tp.elemen || "UMU").substring(0, 3).toUpperCase()}-${String(index + 1).padStart(3, "0")}`,
      elemen: topic?.elemen || tp.elemen,
      materiPokok: topic?.topik || tp.materiPokok || tp.rumusanTp,
      alokasiJp
    };
  });

  return { ...rawTpJson, daftarTp };
};

export const normalizeAtpData = (rawAtpJson: AtpType, formData: any, tpData: TpType | null): AtpType => {
  if (!rawAtpJson?.alur || !Array.isArray(rawAtpJson.alur)) return rawAtpJson;
  const targetJpPerSemester = Math.ceil(Number(formData.totalJp || 0) / 2);
  const accumulated: Record<string, number> = {};
  const alur = rawAtpJson.alur.map((atp, index) => {
    const match = tpData?.daftarTp?.find((tp) => tp.kodeTp === atp.kodeTp) || tpData?.daftarTp?.[index];
    const kelas = atp.kelas || "Umum";
    const realJp = match?.alokasiJp || atp.alokasiJp || 0;
    accumulated[kelas] = (accumulated[kelas] || 0) + realJp;
    return { ...atp, kodeTp: match?.kodeTp || atp.kodeTp, materiPokok: match?.materiPokok || atp.materiPokok, alokasiJp: realJp, semester: accumulated[kelas] > targetJpPerSemester ? 2 : 1 };
  });
  return { ...rawAtpJson, alur };
};
