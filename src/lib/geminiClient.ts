const tpUserPrompt = `Tugasmu adalah menghasilkan data JSON sesuai dengan skema JSON yang diminta untuk dokumen: ${docType}.
${kaldikInfo}
Ini adalah data mentah (form data) yang diinputkan oleh guru:
${JSON.stringify(optimizedData, null, 2)}

PENTING:
- Fokus utama Anda adalah merumuskan (reasoning) materi pokok, kompetensi, dan memecah Capaian Pembelajaran.
- ABAIKAN kalkulasi matematika presisi terkait "Alokasi JP" atau "kodeTp". JANGAN membatasi jumlah TP karena takut "kehabisan" Alokasi JP! Anda BEBAS membuat sebanyak mungkin TP untuk membedah materi CP.
- ${optimizedData.topikLokal ? `- KONTEKS LOKAL (FP-PLO): Field topikLokal terisi dengan nilai "${optimizedData.topikLokal}". Pastikan TP/ATP memiliki Indikator Kontekstualisasi Lokal (memberi contoh sesuai konteks lokal).` : ""}
- Pastikan setiap array terisi dengan struktur yang valid.
- KHUSUS UNTUK TP (MIMIC BEST PRACTICE GURU KBC):
  1. PEMECAHAN ATOMIK: Jika paragraf CP menyebutkan daftar materi yang dipisah koma, titik koma, atau "dan", Anda WAJIB memecahnya menjadi 1 TP untuk SETIAP materi tunggal. Tidak boleh menggabungkan dua materi, dua subkonsep, atau dua kompetensi ke dalam satu TP.
  2. Contoh yang harus dipecah: "menghafal dan menulis hadis..." harus menjadi 2 TP terpisah; "salat berjemaah, persaudaraan, takwa, niat, dan silaturahmi" harus menjadi 5 TP terpisah; "kalkalah, mad tabi'i, izhar halqi, ikhfa' hakiki, idgam bigunnah, idgam bilagunnah, iqlab" harus menjadi 7 TP terpisah.
  3. SETIAP TP HARUS fokus pada 1 sub-materi, 1 kompetensi utama, 1 objek belajar utama.
  4. INTEGRASI NILAI DI DALAM KALIMAT TP: Kalimat pada properti "rumusanTp" WAJIB diakhiri dengan frasa tujuan karakter/sikap yang mengambil dari Dimensi Profil Lulusan (DPL) dan Panca Cinta. Contoh format yang benar: "[KKO] [Materi Pokok] ..., untuk menumbuhkan [Nilai DPL] dan mewujudkan [Nilai Panca Cinta]".
  5. Hasilkan MINIMAL 3-5 TP PER ELEMEN, atau lebih banyak jika materinya padat.
  6. Jangan pernah membuat TP yang isinya gabungan seperti "menghafal dan menulis hadis tentang..." atau "takwa, niat, dan silaturahmi" dalam satu baris.`;

if (schemaKey === "tp") {
  userPrompt = tpUserPrompt;
}

${schemaKey === "prosem" && Array.isArray(optimizedData.blockedWeeks) && optimizedData.blockedWeeks.length > 0 ? `...` : ""}
