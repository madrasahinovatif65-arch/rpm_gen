import { z } from 'zod';

export const AcpSchema = z.object({
  rasional: z.string(),
  tujuan: z.array(z.string()),
  karakteristik: z.array(z.object({ elemen: z.string(), deskripsi: z.string(), topikPokok: z.array(z.string()) })),
  keterkaitanPpra: z.array(z.object({ nilaiPpra: z.string(), deskripsi: z.string(), integrasi: z.string() }))
});
export type AcpType = z.infer<typeof AcpSchema>;

export const TpSchema = z.object({
  daftarTp: z.array(z.object({
    kodeTp: z.string(),
    elemen: z.string(),
    materiPokok: z.string().describe("WAJIB satu sub-materi atomik; dilarang menggabungkan dua materi dalam satu TP"),
    rumusanTp: z.string(),
    kompetensi: z.string(),
    integrasiNilai: z.string(),
    alokasiJp: z.number()
  })).min(1),
  rekapAlokasi: z.array(z.object({ elemen: z.string(), jumlahTp: z.number(), totalJp: z.number(), persentase: z.number() })).optional()
});
export type TpType = z.infer<typeof TpSchema>;

export const AtpSchema = z.object({ alur: z.array(z.object({ kodeTp: z.string(), elemen: z.string(), rumusanTp: z.string(), materiPokok: z.string(), kompetensi: z.string(), integrasiNilai: z.string(), alokasiJp: z.number(), kelas: z.string(), rasionalisasiKelas: z.string().optional(), semester: z.number() })) });
export type AtpType = z.infer<typeof AtpSchema>;
export const ProtaSchema = z.object({ distribusiMinggu: z.array(z.record(z.any())).optional(), programTahunan: z.array(z.record(z.any())) });
export type ProtaType = z.infer<typeof ProtaSchema>;
export const ProsemSchema = z.object({ prosem: z.array(z.record(z.any())), keterangan: z.array(z.string()) });
export type ProsemType = z.infer<typeof ProsemSchema>;
export const KktpSchema = z.object({ kktp: z.array(z.record(z.any())) });
export type KktpType = z.infer<typeof KktpSchema>;
export const ModulAjarUmumSchema = z.object({ informasiUmum: z.record(z.any()), komponenInti: z.record(z.any()), lampiran: z.record(z.any()) });
export type ModulAjarUmumType = z.infer<typeof ModulAjarUmumSchema>;
export const ModulAjarMeetingSchema = z.object({ pertemuanKe: z.number(), judul: z.string(), fokusSintak: z.array(z.string()), kegiatanPendahuluan: z.array(z.record(z.string())), kegiatanInti: z.array(z.record(z.string())), kegiatanPenutup: z.array(z.record(z.string())) });
export type ModulAjarMeetingType = z.infer<typeof ModulAjarMeetingSchema>;
export const AsesmenSchema = z.object({ judul: z.string(), jenisAsesmen: z.string(), daftarInstrumen: z.array(z.record(z.any())) });
export type AsesmenType = z.infer<typeof AsesmenSchema>;
export const RubrikSchema = z.object({ rubrikSikap: z.array(z.record(z.any())), rubrikPengetahuan: z.array(z.record(z.any())), rubrikKeterampilan: z.array(z.record(z.any())) });
export type RubrikType = z.infer<typeof RubrikSchema>;
export const AnalisisPenilaianSchema = z.object({ identitas: z.record(z.string()), analisisRubrik: z.record(z.string()), analisisKktp: z.record(z.string()), analisisKognitif: z.record(z.string()), tindakLanjut: z.record(z.string()) });
export type AnalisisPenilaianType = z.infer<typeof AnalisisPenilaianSchema>;

export const KbcSchemas: Record<string, z.ZodSchema<any>> = { analisis_cp: AcpSchema, tp: TpSchema, atp: AtpSchema, prota: ProtaSchema, prosem: ProsemSchema, kktp: KktpSchema, modul_ajar_umum: ModulAjarUmumSchema, modul_ajar_meeting: ModulAjarMeetingSchema, asesmen_kognitif: AsesmenSchema, asesmen_formatif: AsesmenSchema, asesmen_sumatif: AsesmenSchema, rubrik: RubrikSchema, analisis_penilaian: AnalisisPenilaianSchema };
