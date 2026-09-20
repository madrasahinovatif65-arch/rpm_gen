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
  if (/menjelaskan|menguraikan|mengklasifikasikan|mendeskripsikan|mengorganisir|mengompres/.test(lower)) return 1.5;
  if (/mengidentifikasi|menyebutkan|menunjukkan|menerangkan|memberi/.test(lower)) return 1.2;

  return 1;
};

const getTpWeight = (tp: any): number => {
  const material = tp?.materiPokok || tp?.rumusanTp || "";
  const kkoWeight = getKkoWeight(tp?.rumusanTp || material);
  const wordCount = (material || "").trim().split(/\s+/).filter(Boolean).length;
  const practiceBonus = /membaca|menghafal|menulis|mempraktikkan|mendemonstrasikan|menerapkan/.test((material || "").toLowerCase()) ? 0.7 : 0;
  const breadthBonus = wordCount > 12 ? 0.8 : wordCount > 7 ? 0.4 : 0;
  return kkoWeight + practiceBonus + breadthBonus;
};

export const normalizeTpData = (rawTpJson: TpType, formData: any): TpType => {
  if (!rawTpJson?.daftarTp || !Array.isArray(rawTpJson.daftarTp)) return rawTpJson;

  const atomicTopics = parseAtomicCpTopics(formData.cpElemen || "");
  const prefix = formData.singkatanMapel || "MAPEL";
  const level = formData.level || formData.fase || "Fase";
  const multiplier = getPhaseMultiplier(formData.fase);
  const totalJpInput = Number(formData.totalJp || 0) * multiplier;

  const tpWeightList = rawTpJson.daftarTp.map((tp) => getTpWeight(tp));
  const totalWeight = tpWeightList.reduce((sum, weight) => sum + weight, 0) || rawTpJson.daftarTp.length;

  let remainingJp = totalJpInput;
  const daftarTp = rawTpJson.daftarTp.map((tp, index) => {
    const source = atomicTopics[index];
    const weight = tpWeightList[index] || 1;

    let alokasiJp = Number(tp.alokasiJp || 0);
    if (totalJpInput > 0) {
      if (index === rawTpJson.daftarTp.length - 1) {
        alokasiJp = Math.max(0, remainingJp);
      } else {
        const weightedShare = (weight / totalWeight) * totalJpInput;
        alokasiJp = Math.max(0, Math.round(weightedShare));
        remainingJp = Math.max(0, remainingJp - alokasiJp);
      }
    } else {
      alokasiJp = Number(tp.alokasiJp || 1);
    }

    return {
      ...tp,
      kodeTp: `${prefix}-${level}-${(tp.elemen || "UMU").substring(0, 3).toUpperCase()}-${String(index + 1).padStart(3, "0")}`,
      materiPokok: source?.topik || tp.materiPokok || tp.rumusanTp,
      alokasiJp
    };
  });

  // Pastikan total JP final konsisten dengan total yang diminta.
  if (totalJpInput > 0) {
    const finalTotal = daftarTp.reduce((sum, tp) => sum + (tp.alokasiJp || 0), 0);
    if (finalTotal !== totalJpInput) {
      const lastIndex = daftarTp.length - 1;
      const delta = totalJpInput - finalTotal;
      daftarTp[lastIndex] = {
        ...daftarTp[lastIndex],
        alokasiJp: Math.max(0, (daftarTp[lastIndex].alokasiJp || 0) + delta)
      };
    }
  }

  return { ...rawTpJson, daftarTp };
};

export const normalizeAtpData = (rawAtpJson: AtpType, formData: any, tpData: TpType | null): AtpType => {
  if (!rawAtpJson?.alur || !Array.isArray(rawAtpJson.alur)) return rawAtpJson;

  const targetJpPerSemester = Math.ceil(Number(formData.totalJp || 0) / 2);
  const accumulated: Record<string, number> = {};

  const alur = rawAtpJson.alur.map((atp, index) => {
    const match = tpData?.daftarTp?.find((tp) => tp.rumusanTp.includes(atp.rumusanTp.substring(0, 20))) || tpData?.daftarTp?.[index];
    const kelas = atp.kelas || "Umum";
    const realJp = match?.alokasiJp || atp.alokasiJp || 0;
    accumulated[kelas] = (accumulated[kelas] || 0) + realJp;

    return {
      ...atp,
      kodeTp: match?.kodeTp || atp.kodeTp,
      materiPokok: match?.materiPokok || atp.materiPokok,
      alokasiJp: realJp,
      semester: accumulated[kelas] > targetJpPerSemester ? 2 : 1
    };
  });

  return { ...rawAtpJson, alur };
};
