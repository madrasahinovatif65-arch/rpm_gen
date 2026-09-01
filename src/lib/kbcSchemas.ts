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
  })).describe("Keterkaitan dengan 10 Nilai PPRA (Ta'addub, Qudwah, dsb)")
});
export type AcpType = z.infer<typeof AcpSchema>;

// 2. Tujuan Pembelajaran (TP)
export const TpSchema = z.object({
  daftarTp: z.array(z.object({
    kodeTp: z.string(),
    elemen: z.string(),
    rumusanTp: z.string(),
    kompetensi: z.string(),
    integrasiNilai: z.string().describe("Integrasi Panca Cinta dan PPRA"),
    alokasiJp: z.number()
  })),
  rekapAlokasi: z.array(z.object({
    elemen: z.string(),
    jumlahTp: z.number(),
    totalJp: z.number(),
    persentase: z.number()
  }))
});
export type TpType = z.infer<typeof TpSchema>;

// 3. Alur Tujuan Pembelajaran (ATP)
export const AtpSchema = z.object({
  alur: z.array(z.object({
    kodeTp: z.string(),
    elemen: z.string(),
    rumusanTp: z.string(),
    materiPokok: z.string(),
    kompetensi: z.string(),
    integrasiNilai: z.string(),
    alokasiJp: z.number(),
    semester: z.number()
  }))
});
export type AtpType = z.infer<typeof AtpSchema>;

// 4. Program Tahunan (Prota)
export const ProtaSchema = z.object({
  distribusiMinggu: z.array(z.object({
    semester: z.number(),
    bulan: z.string(),
    mingguKalender: z.number(),
    tidakEfektif: z.number(),
    efektif: z.number(),
    jp: z.number(),
    keterangan: z.string()
  })),
  programTahunan: z.array(z.object({
    kodeTp: z.string(),
    rumusanTp: z.string(),
    materiPokok: z.string(),
    elemen: z.string(),
    alokasiJp: z.number(),
    semester: z.number()
  }))
});
export type ProtaType = z.infer<typeof ProtaSchema>;

// 5. Program Semester (Prosem)
export const ProsemSchema = z.object({
  prosem: z.array(z.object({
    kodeTp: z.string(),
    rumusanTp: z.string(),
    alokasiJp: z.number(),
    bulanMinggu: z.record(z.string(), z.array(z.number())).describe("Key: nama bulan (Juli), Value: array of JP per minggu (M1-M5)")
  })),
  keterangan: z.array(z.string())
});
export type ProsemType = z.infer<typeof ProsemSchema>;

// 6. KKTP (Kriteria Ketercapaian Tujuan Pembelajaran)
export const KktpSchema = z.object({
  kktp: z.array(z.object({
    kodeTp: z.string(),
    rumusanTp: z.string(),
    rubrik: z.object({
      mulaiBerkembang: z.string(),
      layak: z.string(),
      cakap: z.string(),
      mahir: z.string()
    })
  }))
});
export type KktpType = z.infer<typeof KktpSchema>;

// 7. Modul Ajar (Modul Pembelajaran KBC)
export const ModulAjarSchema = z.object({
  informasiUmum: z.object({
    kesiapanPesertaDidik: z.string(),
    karakteristikMateri: z.string(),
    tujuanPembelajaran: z.string(),
    kompetensiAwal: z.array(z.object({ prasyarat: z.string(), caraMengecek: z.string() })),
    profilLulusan: z.array(z.object({ dimensi: z.string(), perwujudan: z.string() })),
    saranaPrasarana: z.array(z.object({ kategori: z.string(), rincian: z.string() })),
    targetPesertaDidik: z.object({
      reguler: z.object({ sasaran: z.string(), perlakuan: z.string() }),
      kesulitanBelajar: z.object({ sasaran: z.string(), perlakuan: z.string() }),
      berbakat: z.object({ sasaran: z.string(), perlakuan: z.string() })
    })
  }),
  komponenInti: z.object({
    pemahamanBermakna: z.string(),
    pertanyaanPemantik: z.array(z.string()),
    asesmenDiagnostik: z.object({
      nonKognitif: z.array(z.string()),
      kognitif: z.array(z.string())
    }),
    skenarioPertemuan: z.array(z.object({
      pertemuanKe: z.number(),
      judul: z.string(),
      fokusSintak: z.array(z.string()),
      kegiatanPendahuluan: z.array(z.object({ guru: z.string(), siswa: z.string(), anotasiPpra: z.string() })),
      kegiatanInti: z.array(z.object({ sintak: z.string(), guru: z.string(), siswa: z.string(), anotasiPpra: z.string() })),
      kegiatanPenutup: z.array(z.object({ guru: z.string(), siswa: z.string(), anotasiPpra: z.string() }))
    })),
    asesmenFormatif: z.array(z.object({ teknik: z.string(), instrumen: z.string(), aspek: z.string() })),
    asesmenSumatif: z.array(z.object({ deskripsi: z.string(), bobot: z.number() })),
    pengayaanRemedial: z.object({
      remedial: z.string(),
      pengayaan: z.string()
    }),
    refleksi: z.object({
      guru: z.array(z.string()),
      siswa: z.array(z.string())
    })
  }),
  lampiran: z.object({
    glosarium: z.array(z.object({ istilah: z.string(), arti: z.string() })),
    daftarPustaka: z.array(z.string())
  })
});
export type ModulAjarType = z.infer<typeof ModulAjarSchema>;

// 8. LKPD (Lembar Kerja Peserta Didik)
export const LkpdSchema = z.object({
  judul: z.string(),
  tujuanKegiatan: z.string(),
  alatDanBahan: z.array(z.string()),
  langkahKerja: z.array(z.string()),
  pertanyaanDiskusi: z.array(z.string()),
  tabelPengamatan: z.array(z.object({
    kolom1: z.string(),
    kolom2: z.string(),
    kolom3: z.string()
  })).optional()
});
export type LkpdType = z.infer<typeof LkpdSchema>;

// 9. Rubrik Penilaian
export const RubrikSchema = z.object({
  rubrikSikap: z.array(z.object({
    aspek: z.string(),
    skor1: z.string(),
    skor2: z.string(),
    skor3: z.string(),
    skor4: z.string()
  })),
  rubrikPengetahuan: z.array(z.object({
    indikator: z.string(),
    soal: z.string(),
    kunciJawaban: z.string(),
    skor: z.number()
  })),
  rubrikKeterampilan: z.array(z.object({
    aspek: z.string(),
    skor1: z.string(),
    skor2: z.string(),
    skor3: z.string(),
    skor4: z.string()
  }))
});
export type RubrikType = z.infer<typeof RubrikSchema>;

export const KbcSchemas: Record<string, z.ZodSchema<any>> = {
  "analisis_cp": AcpSchema,
  "tp": TpSchema,
  "atp": AtpSchema,
  "prota": ProtaSchema,
  "prosem": ProsemSchema,
  "kktp": KktpSchema,
  "modul_ajar": ModulAjarSchema,
  "lkpd": LkpdSchema,
  "rubrik": RubrikSchema
};
