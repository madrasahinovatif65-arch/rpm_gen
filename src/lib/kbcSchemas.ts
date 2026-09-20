import { z } from 'zod';

// 1. Analisis CP (ACP)
export const AcpSchema = z.object({
  rasional: z.string().describe("Pentingnya mapel dan kaitan dengan Panca Cinta Kemenag"),
  tujuan: z.array(z.string()).describe("Tujuan umum mata pelajaran"),
  karakteristik: z.array(z.object({
    elemen: z.string(),
    deskripsi: z.string(),
    topikPokok: z.array(z.string())
  })),
  keterkaitanPpra: z.array(z.object({
    nilaiPpra: z.string(),
    deskripsi: z.string(),
    integrasi: z.string()
  })).describe("Keterkaitan dengan 10 Nilai PPRA")
});
export type AcpType = z.infer<typeof AcpSchema>;

// 2. Tujuan Pembelajaran (TP)
export const TpSchema = z.object({
  daftarTp: z.array(z.object({
    kodeTp: z.string(),
    elemen: z.string(),
    materiPokok: z.string().describe("Satu materi pokok atomik dari CP; bukan gabungan beberapa materi"),
    rumusanTp: z.string(),
    kompetensi: z.string(),
    integrasiNilai: z.string().describe("Integrasi Panca Cinta dan PPRA"),
    alokasiJp: z.number().describe("Estimasi JP untuk TP ini")
  })).min(1).describe("Daftar TP yang sudah dipecah secara spesifik per topik/materi pokok."),
  rekapAlokasi: z.array(z.object({
    elemen: z.string(),
    jumlahTp: z.number(),
    totalJp: z.number(),
    persentase: z.number()
  })).optional().describe("Rekap alokasi JP per elemen")
});
export type TpType = z.infer<typeof TpSchema>;

// 3. Alur Tujuan Pembelajaran (ATP)
export const AtpSchema = z.object({
  alur: z.array(z.object({
    kodeTp: z.string(), elemen: z.string(), rumusanTp: z.string(), materiPokok: z.string(), kompetensi: z.string(), integrasiNilai: z.string(), alokasiJp: z.number(),
    kelas: z.string().describe("Kelas spesifik, misal 'Kelas 1' atau 'Kelas 2'"),
    rasionalisasiKelas: z.string().describe("Alasan logis pedagogik mengapa TP ini diletakkan di kelas tersebut (berdasarkan Konkret-Abstrak, Prasyarat, Cakupan, atau Taksonomi Bloom)").optional(),
    semester: z.number()
  }))
});
export type AtpType = z.infer<typeof AtpSchema>;

// 4. Program Tahunan (Prota)
export const ProtaSchema = z.object({
  distribusiMinggu: z.array(z.object({ semester: z.number(), bulan: z.string(), mingguKalender: z.number(), tidakEfektif: z.number(), efektif: z.number(), jp: z.number(), keterangan: z.string() })).optional().describe("Distribusi minggu efektif per bulan"),
  programTahunan: z.array(z.object({ kodeTp: z.string(), rumusanTp: z.string(), materiPokok: z.string(), elemen: z.string(), alokasiJp: z.number(), semester: z.number() }))
});
export type ProtaType = z.infer<typeof ProtaSchema>;

// 5. Program Semester (Prosem)
export const ProsemSchema = z.object({
  prosem: z.array(z.object({ kodeTp: z.string(), rumusanTp: z.string(), alokasiJp: z.number(), bulanMinggu: z.record(z.string(), z.array(z.number())) })),
  keterangan: z.array(z.string())
});
export type ProsemType = z.infer<typeof ProsemSchema>;

// 6. KKTP
export const KktpSchema = z.object({ kktp: z.array(z.object({ kodeTp: z.string(), rumusanTp: z.string(), rubrik: z.object({ mulaiBerkembang: z.string(), layak: z.string(), cakap: z.string(), mahir: z.string() }) })) });
export type KktpType = z.infer<typeof KktpSchema>;

// Dokumen lain tetap didefinisikan di bawah ini untuk menjaga kontrak publik KbcSchemas.
export const ModulAjarUmumSchema = z.object({ informasiUmum: z.record(z.any()), komponenInti: z.record(z.any()), lampiran: z.record(z.any()) });
export type ModulAjarUmumType = z.infer<typeof ModulAjarUmumSchema>;
export const ModulAjarMeetingSchema = z.object({ pertemuanKe: z.number(), judul: z.string(), fokusSintak: z.array(z.string()), kegiatanPendahuluan: z.array(z.record(z.string())), kegiatanInti: z.array(z.record(z.string())), kegiatanPenutup: z.array(z.record(z.string())) });
export type ModulAjarMeetingType = z.infer<typeof ModulAjarMeetingSchema>;
export const AsesmenSchema = z.object({ judul: z.string(), jenisAsesmen: z.string(), daftarInstrumen: z.array(z.record(z.any())) });
export type AsesmenType = z.infer<typeof AsesmenSchema>;
const KriteriaSchema = z.object({ sangatBaik: z.string(), baik: z.string(), cukup: z.string(), kurang: z.string() });
export const RubrikSchema = z.object({ rubrikSikap: z.array(z.record(z.any())), rubrikPengetahuan: z.array(z.record(z.any())), rubrikKeterampilan: z.array(z.record(z.any())) });
export type RubrikType = z.infer<typeof RubrikSchema>;
export const AnalisisPenilaianSchema = z.object({ identitas: z.record(z.string()), analisisRubrik: z.record(z.string()), analisisKktp: z.record(z.string()), analisisKognitif: z.record(z.string()), tindakLanjut: z.record(z.string()) });
export type AnalisisPenilaianType = z.infer<typeof AnalisisPenilaianSchema>;

export const KbcSchemas: Record<string, z.ZodSchema<any>> = {
  analisis_cp: AcpSchema, tp: TpSchema, atp: AtpSchema, prota: ProtaSchema, prosem: ProsemSchema, kktp: KktpSchema,
  modul_ajar_umum: ModulAjarUmumSchema, modul_ajar_meeting: ModulAjarMeetingSchema,
  asesmen_kognitif: AsesmenSchema, asesmen_formatif: AsesmenSchema, asesmen_sumatif: AsesmenSchema,
  rubrik: RubrikSchema, analisis_penilaian: AnalisisPenilaianSchema
};
