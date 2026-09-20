import { TpType, AtpType } from "./kbcSchemas";
import { parseAtomicCpTopics } from "./atomicCpParser";

const getPhaseMultiplier = (fase: string): number => {
  const f = (fase || "").toUpperCase();
  if (f.includes("FASE A") || f.includes("FASE B") || f.includes("FASE C") || f.includes("FASE F")) return 2;
  if (f.includes("FASE D")) return 3;
  if (f.includes("FASE E")) return 1;
  return 2;
};

export const normalizeTpData = (rawTpJson: TpType, formData: any): TpType => {
  if (!rawTpJson?.daftarTp || !Array.isArray(rawTpJson.daftarTp)) return rawTpJson;
  const atomicTopics = parseAtomicCpTopics(formData.cpElemen || "");
  const prefix = formData.singkatanMapel || "MAPEL";
  const level = formData.level || formData.fase || "Fase";
  const multiplier = getPhaseMultiplier(formData.fase);
  const totalJpInput = Number(formData.totalJp || 0) * multiplier;
  const currentTotalJp = Math.max(1, rawTpJson.daftarTp.reduce((sum, tp) => sum + (tp.alokasiJp || 0), 0));
  let accumulated = 0;

  const daftarTp = rawTpJson.daftarTp.map((tp, index) => {
    const source = atomicTopics[index];
    const alokasiJp = totalJpInput > 0
      ? index === rawTpJson.daftarTp.length - 1
        ? Math.max(0, totalJpInput - accumulated)
        : Math.max(1, Math.round(((tp.alokasiJp || 1) / currentTotalJp) * totalJpInput))
      : (tp.alokasiJp || 1);
    accumulated += index === rawTpJson.daftarTp.length - 1 ? 0 : alokasiJp;
    return {
      ...tp,
      kodeTp: `${prefix}-${level}-${tp.elemen.substring(0, 3).toUpperCase()}-${String(index + 1).padStart(3, "0")}`,
      materiPokok: source?.topik || tp.materiPokok || tp.rumusanTp,
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
    const match = tpData?.daftarTp?.find((tp) => tp.rumusanTp.includes(atp.rumusanTp.substring(0, 20))) || tpData?.daftarTp?.[index];
    const kelas = atp.kelas || "Umum";
    accumulated[kelas] = (accumulated[kelas] || 0) + (match?.alokasiJp || atp.alokasiJp || 0);
    return { ...atp, kodeTp: match?.kodeTp || atp.kodeTp, materiPokok: match?.materiPokok || atp.materiPokok, alokasiJp: match?.alokasiJp || atp.alokasiJp, semester: accumulated[kelas] > targetJpPerSemester ? 2 : 1 };
  });
  return { ...rawAtpJson, alur };
};
