
export const PROMPT_ADMIN_MD = `# 🚀 Prompt Ekstraksi Database CP & Pedoman Model Pembelajaran

Dokumen ini berisi **Template Prompt AI** yang bisa Anda salin-tempel (copy-paste) ke ChatGPT, Gemini, atau Claude untuk mengekstrak teks PDF resmi Kemenag/Kemdikbud menjadi format data yang siap dimasukkan ke dalam menu *Database CP Elemen* di aplikasi.

Selain itu, dokumen ini juga memuat **Skenario Rekomendasi Pemilihan Model & Metode Pembelajaran** berbasis elemen kompetensi.

---

## 🟢 1. Template Prompt Ekstraksi CP
Salin teks di dalam kotak di bawah ini, lalu tempelkan ke ChatGPT/Gemini beserta file PDF/teks Capaian Pembelajaran (CP) resmi dari kementerian.

> **⚠️ PENTING UNTUK ADMIN:** 
> 1. Sebelum menekan tombol Kirim di ChatGPT/Gemini, Anda **WAJIB MENGEDIT** teks di dalam kurung siku \`[...]\` pada paragraf pertama *prompt* di bawah ini dengan Nama Mapel, Singkatan Mapel, Jumlah JP, dan Total Minggu Efektif (dalam 1 tahun).
> 2. Pada poin **10. JP per Minggu** di dalam prompt, **PASTE/TEMPELKAN** rincian JP spesifik untuk mapel Anda dari **Kamus Referensi Mapel** (tersedia di bagian paling bawah dokumen ini). Hal ini sangat penting untuk mencegah AI mengalami *prompt fatigue* (kelelahan instruksi) akibat membaca terlalu banyak acuan mapel lain!

\`\`\`text
Bertindaklah sebagai Ahli Kurikulum Merdeka dan Kurikulum Madrasah.
Saya akan memberikan dokumen Capaian Pembelajaran (CP) resmi untuk mata pelajaran [NAMA_MAPEL] (Singkatan: [SINGKATAN_MAPEL]) yang memiliki alokasi waktu sekitar [JUMLAH_JP] JP per minggu, dengan total [TOTAL_MINGGU_EFEKTIF] minggu efektif dalam 1 tahun ajaran.
Tugas Anda adalah membedah dan mengekstrak isi dokumen tersebut untuk **SELURUH FASE (Fase A, Fase B, dan Fase C)** yang ada di jenjang Madrasah Ibtidaiyah/SD.

Mohon ekstrak dan sintesis data tersebut, lalu sajikan dalam bentuk **TABEL MULTI-BARIS** (1 baris untuk 1 Fase). Setiap baris harus memiliki tepat 13 kolom berikut ini agar saya bisa langsung memindahkannya ke spreadsheet/database:

1. Nama Template
(Format: "CP [Nama Mapel] Fase [Fase] KMA/SK Terbaru". Contoh: "CP Fikih Fase B KMA 450")

2. Rasional Mapel
(Ekstrak esensi rasional mapel ini dalam 1-2 paragraf padat. Isinya biasanya sama untuk semua fase)

3. Tujuan Mapel
(Tuliskan poin-poin utama tujuan mapel ini. Isinya biasanya sama untuk semua fase)

4. Karakteristik Mapel
(Jelaskan ruang lingkup atau karakteristik unik dari mapel ini. Isinya biasanya sama untuk semua fase)

5. CP Fase Umum
(PENTING: Jika dokumen asli memiliki paragraf CP Umum, salin persis 100% (VERBATIM). NAMUN, jika mapel tersebut sama sekali tidak memiliki CP Fase Umum, Anda DIIZINKAN BERIMPROVISASI dengan menyintesis/merangkum intisari dari seluruh CP Elemen menjadi 1 paragraf padat).

6. CP Per Elemen
(PENTING: Gabungkan seluruh elemen yang ada dalam satu kotak/paragraf dengan format mutlak: NAMA_ELEMEN : DESKRIPSI_CP. Tiap elemen dipisah dengan baris baru. Contoh -> Fikih Ibadah : Peserta didik mampu... Teks deskripsi CP tiap elemen WAJIB VERBATIM / persis 100% dengan teks dokumen asli tanpa diringkas!)

7. Mata Pelajaran
(Isi dengan [NAMA_MAPEL] yang telah saya sebutkan di atas)

8. Singkatan Mapel
(Isi dengan [SINGKATAN_MAPEL] yang telah saya sebutkan di atas)

9. Fase / Kelas
(Sebutkan fase dan rentang kelas. Contoh: Fase B (Kelas 3-4))

10. JP per Minggu
(Pilih angka yang paling akurat berdasarkan rincian JP untuk fase ini:
[ADMIN: PASTE TEKS RINCIAN JP DARI KAMUS REFERENSI DI SINI. JIKA MAPEL TIDAK ADA, GUNAKAN PARAMETER JUMLAH_JP DI ATAS]
)

11. Total JP
(Berdasarkan JP per Minggu di atas, kalikan dengan [TOTAL_MINGGU_EFEKTIF] minggu efektif yang telah disebutkan di awal prompt. Contoh: Jika 5 JP dan 36 minggu efektif, maka Total JP = 180)

12. Model Pembelajaran
(PILIH HANYA SALAH SATU dari referensi wajib ini yang paling cocok: Discovery Learning, Problem Based Learning (PBL), Project Based Learning (PjBL), Inquiry Learning, Pembelajaran Berdiferensiasi, Cooperative Learning, Flipped Classroom, atau Teaching at the Right Level (TaRL). 
Catatan: Beri prioritas pada Inquiry/PBL jika mapel memiliki elemen 'Keterampilan Proses'. Jika tidak ada elemen tersebut, silakan berimprovisasi memilih model lain yang paling relevan dengan karakteristik kognitif/sikap mapel ini).

13. Metode Pembelajaran
(PILIH 2-3 dari referensi wajib ini yang paling cocok: Diskusi, Ceramah Interaktif, Tanya Jawab, Role Playing, Demonstrasi, Eksperimen Terbimbing, Kerja Kelompok, Presentasi, Observasi, Penugasan Proyek).

PENTING: Pastikan kolom ke-6 (CP Per Elemen) murni menggunakan format NAMA_ELEMEN : DESKRIPSI_CP tanpa tabel tambahan. Wajib gunakan nama model dan metode sama persis dengan referensi wajib di atas.
\`\`\`

---

## 🔵 2. Skenario Rekomendasi Pemilihan Model & Metode Pembelajaran

Saat menyusun Modul Ajar (terutama di aplikasi ini), pemilihan **Model Pembelajaran** (sintaks/kerangka besar) dan **Metode Pembelajaran** (cara penyampaian teknis) harus disesuaikan dengan *Karakteristik Elemen* yang sedang diajarkan.

Berikut adalah skenario rekomendasinya:

### A. Jika Mapel Memiliki "Elemen Keterampilan Proses" (Misal: IPAS / Sains)
Elemen *Keterampilan Proses* (seperti Mengamati, Mempertanyakan, Memprediksi, Merencanakan Penyelidikan) menuntut siswa untuk bertindak layaknya ilmuwan cilik. Jangan gunakan ceramah!

- **Model Pembelajaran yang Wajib Dipilih:**
  - \`Inquiry Learning\` (Mencari tahu sendiri)
  - \`Discovery Learning\` (Menemukan konsep)
  - \`Problem Based Learning (PBL)\` (Pemecahan masalah)
  - \`Project Based Learning (PjBL)\` (Jika ujungnya menghasilkan karya/produk)
- **Metode Pembelajaran yang Cocok:**
  - Eksperimen Terbimbing
  - Observasi
  - Diskusi Kelompok
  - Demonstrasi

### B. Jika Elemen Berfokus pada "Pemahaman Konsep / Kognitif Teoritis" (Misal: Akidah, Sejarah, Teori Matematika)
- **Model Pembelajaran yang Wajib Dipilih:**
  - \`Discovery Learning\` (Menstimulasi rasa ingin tahu lalu menarik kesimpulan)
  - \`Flipped Classroom\` (Materi dipelajari di rumah, di kelas fokus diskusi)
  - \`Teaching at the Right Level (TaRL)\` (Bila butuh diferensiasi pemahaman)
- **Metode Pembelajaran yang Cocok:**
  - Ceramah Interaktif (Bukan ceramah satu arah)
  - Tanya Jawab kritis
  - *Mind Mapping*

### C. Jika Elemen Berfokus pada "Sikap / Akhlak / Nilai Karakter" (Misal: Akhlak, PPKn)
- **Model Pembelajaran yang Wajib Dipilih:**
  - \`Problem Based Learning (PBL)\` (Menyajikan dilema moral/kasus di masyarakat)
  - \`Value Clarification Technique (VCT)\`
- **Metode Pembelajaran yang Cocok:**
  - *Role Playing* (Bermain Peran)
  - Studi Kasus
  - Refleksi

### D. Jika Elemen Berfokus pada "Praktik Keterampilan Fisik/Bahasa" (Misal: Fikih Praktik, Penjas, Berbicara/Menyimak Bahasa)
- **Model Pembelajaran yang Wajib Dipilih:**
  - \`Project Based Learning (PjBL)\`
  - \`Direct Instruction\` (Instruksi Langsung bertahap)
- **Metode Pembelajaran yang Cocok:**
  - Praktik Langsung / Demonstrasi Guru
  - Simulasi
  - Unjuk Kerja

> [!TIP]
> Di dalam menu **Generator Perangkat KBC**, jika Anda mengosongkan kolom *Metode Pembelajaran*, AI kita telah dilatih secara bawaan (*built-in*) untuk membaca teks *CP Elemen* Anda dan secara otomatis memilihkan Metode Pembelajaran yang paling relevan dengan skenario di atas!

---

## 💡 4. Saran Tambahan (Opsional)
Jika Anda memiliki dokumen CP dalam format PDF/Word yang halamannya sangat banyak, **jangan copy-paste semuanya sekaligus**. Lakukan copy-paste per mata pelajaran. AI akan jauh lebih fokus dan akurat jika diberi beban bacaan yang spesifik.

---

## 📚 5. Kamus Referensi Mapel Kemenag (Untuk Copas)
Gunakan kamus baku di bawah ini untuk mengisi variabel \`[NAMA_MAPEL]\`, \`[SINGKATAN_MAPEL]\`, dan untuk meng-copy teks rincian JP ke poin ke-10 di dalam teks Prompt di atas.

1. **Al Qur'an Hadis** (Singkatan: **QH**)
   > **Copas ke Poin 10:** Al Qur’an Hadis : Fase A (Kelas 1 - 2) - 2 JP, Fase B (Kelas 3 - 4) - 2 JP, Fase C (Kelas 5 - 6) - 2 JP

2. **Akidah Akhlak** (Singkatan: **AA**)
   > **Copas ke Poin 10:** Akidah Akhlak : Fase A (Kelas 1 - 2) - 2 JP, Fase B (Kelas 3 - 4) - 2 JP, Fase C (Kelas 5 - 6) - 2 JP

3. **Aswaja** (Singkatan: **ASW**)
   > **Copas ke Poin 10:** Aswaja : Fase B (Kelas 4) - 1 JP, Fase C (Kelas 5 - 6) - 1 JP

4. **Baca Tulis Al Qur'an** (Singkatan: **BTQ**)
   > **Copas ke Poin 10:** Baca Tulis Al Qur’an : Fase A (Kelas 1 - 2) - 1 JP, Fase B (Kelas 3–5) - 1 JP, Fase C (Kelas 5) - 1 JP

5. **Bahasa Arab** (Singkatan: **BAR**)
   > **Copas ke Poin 10:** Bahasa Arab : Fase A (Kelas 1 - 2) - 2 JP, Fase B (Kelas 3 - 4) - 2 JP, Fase C (Kelas 5 - 6) - 2 JP

6. **Bahasa Inggris** (Singkatan: **BING**)
   > **Copas ke Poin 10:** Bahasa Inggris : Fase B (Kelas 3 - 4) - 2 JP, Fase C (Kelas 5 - 6) - 2 JP

7. **Bahasa Indonesia** (Singkatan: **BIND**)
   > **Copas ke Poin 10:** Bahasa Indonesia : Fase A (Kelas 1) - 7 JP, Kelas 2 - 8 JP, Fase B (Kelas 3 - 4) - 6 JP, Fase C (Kelas 5 - 6) - 6 JP

8. **Bahasa Jawa** (Singkatan: **BJW**)
   > **Copas ke Poin 10:** Bahasa Jawa : Fase A (Kelas 1 - 2) - 1 JP, Fase B (Kelas 3 - 4) - 1 JP, Fase C (Kelas 5 - 6) - 1 JP

9. **Fikih** (Singkatan: **FQH**)
   > **Copas ke Poin 10:** Fikih : Fase A (Kelas 1 - 2) - 2 JP, Fase B (Kelas 3 - 4) - 2 JP, Fase C (Kelas 5 - 6) - 2 JP

10. **Ilmu Pengetahuan Alam dan Sosial** (Singkatan: **IPAS**)
    > **Copas ke Poin 10:** Ilmu Pengetahuan Alam dan Sosial : Fase B (Kelas 3 - 4) - 5 JP, Fase C (Kelas 5 - 6) - 5 JP

11. **Koding dan Kecerdasan Artifisial** (Singkatan: **AI**)
    > **Copas ke Poin 10:** Koding dan Kecerdasan Artifisial : Fase C (Kelas 5 - 6) - 2 JP

12. **Matematika** (Singkatan: **MTK**)
    > **Copas ke Poin 10:** Matematika : Fase A (Kelas 1) - 4 JP, Kelas 2 - 5 JP, Fase B (Kelas 3 - 4) - 5 JP, Fase C (Kelas 5 - 6) - 5 JP

13. **Pendidikan Jasmani, Olahraga, dan Kesehatan** (Singkatan: **PJOK**)
    > **Copas ke Poin 10:** Pendidikan Jasmani, Olahraga, dan Kesehatan : Fase A (Kelas 1 - 2) - 3 JP, Fase B (Kelas 3 - 4) - 3 JP, Fase C (Kelas 5 - 6) - 3 JP

14. **Pendidikan Pancasila** (Singkatan: **PP**)
    > **Copas ke Poin 10:** Pendidikan Pancasila : Fase A (Kelas 1) - 4 JP, Kelas 2 - 5 JP, Fase B (Kelas 3 - 4) - 4 JP, Fase C (Kelas 5 - 6) - 4 JP

15. **Sejarah Kebudayaan Islam** (Singkatan: **SKI**)
    > **Copas ke Poin 10:** Sejarah Kebudayaan Islam : Fase B (Kelas 3 - 4) - 2 JP, Fase C (Kelas 5 - 6) - 2 JP

16. **Seni Rupa** (Singkatan: **SENI**)
    > **Copas ke Poin 10:** Seni Rupa : Fase A (Kelas 1 - 2) - 3 JP, Fase B (Kelas 3 - 4) - 3 JP, Fase C (Kelas 5 - 6) - 3 JP

*(Jika mapel muatan lokal Anda tidak ada di atas, abaikan poin 10 dan AI akan otomatis menggunakan variabel \`[JUMLAH_JP]\` dari paragraf pertama prompt).*
`;

export const ALUR_GURU_MD = `# 📘 Panduan Alur Kerja Guru (Workflow) - Generator Perangkat KBC

Dokumen ini adalah panduan praktis (SOP) bagi Guru Madrasah dalam menggunakan aplikasi **Generator Perangkat Kurikulum Berbasis Cinta (KBC)**. Proses kerja di aplikasi ini didesain secara linier (berurutan) agar setiap dokumen yang dihasilkan konsisten dan akurat.

Secara garis besar, alur kerja dibagi menjadi 3 fase utama: **Input**, **Generate**, dan **Koreksi & Ekspor**.

---

## 🟢 FASE 1: INPUT (Persiapan Data & Regulasi)
Pada fase ini, guru melakukan pendefinisian ruang lingkup mengajar. Data yang diinput di fase ini akan menjadi "otak" bagi AI dalam menyusun seluruh dokumen.

### 1. Pengaturan Profil & Tahun Ajaran
- **Navigasi:** Buka menu **Pengaturan** (ikon gerigi).
- **Aksi:** Lengkapi data *Nama Yayasan, Nama Madrasah, Nama Guru, NIP, Kepala Madrasah*, dll.
- **Penting:** Pastikan **Tahun Ajaran** di-set dengan benar (misal: 2026/2027) karena ini akan mengunci database seluruh dokumen Anda agar tidak tercampur dengan tahun lain.

### 2. Pengecekan Kalender Akademik (Kaldik)
- **Navigasi:** Buka menu **Kalender Akademik**.
- **Aksi:** Cek apakah admin sekolah sudah mengatur *Total Minggu* dan *Minggu Tidak Efektif* per bulannya. Jika sudah, Anda bisa melewati langkah ini.
- **Koreksi Pribadi:** Jika jadwal mengajar Anda di hari tertentu banyak yang gugur karena libur (meski Kaldik sekolah efektif), Anda akan menyesuaikan JP Total Anda di langkah berikutnya.

### 3. Mengatur Database Capaian Pembelajaran (CP)
- **Navigasi:** Buka menu **Kelola Database CP Elemen**.
- **Aksi:** Masukkan teks resmi CP dari Keputusan Dirjen Pendis / Kemdikbud berdasarkan Elemen yang Anda ajar.

---

## 🟡 FASE 2: GENERATE (Proses Otomasi AI Terpadu)
Fase ini adalah tempat di mana Anda memproduksi dokumen secara berurutan. Anda wajib mengerjakannya secara runut dari Tab 1 hingga Tab 4 agar data saling terhubung (*Autofill*).

- **Navigasi:** Buka menu **Generator Perangkat KBC**.

### Tahap 2.1: Mengisi Identitas Dasar (Header)
- Klik tombol **"Isi dari Profil"** agar nama sekolah, guru, dan tahun ajaran terisi otomatis.
- Isi *Mata Pelajaran, Fase, Kelas*, dan **Alokasi Waktu Total (JP 1 Tahun)** serta **JP per Minggu**.
> [!TIP]
> Jika ada hari libur spesifik yang menghilangkan jadwal mengajar Anda, segera **kurangi** angka "Alokasi Waktu Total" dari angka ideal, agar pembagian Prosem nanti tidak memaksakan jam yang tidak ada.

### Tahap 2.2: Generate Dokumen (Lakukan Berurutan!)
Proses generasi **HARUS** dilakukan secara urut. Jangan melompat!

1. **Tab 1 (ACP & TP):** Klik *Generate* untuk menyusun Analisis CP dan Tujuan Pembelajaran. Tunggu hingga AI selesai meracik rumusan TP berdasarkan elemen.
2. **Tab 2 (ATP & Prota):** Klik *Generate*. AI akan mendistribusikan TP dari Tab 1 menjadi Alur (ATP) yang dilengkapi rasionalisasi pedagogik, serta membaginya ke dalam Program Tahunan.
3. **Tab 3 (Prosem):** Klik *Generate*. AI akan "memanggil" data Kalender Akademik (Kaldik) dan membagi matriks ATP ke dalam minggu-minggu efektif per bulan secara akurat (baik Semester Ganjil maupun Genap).
4. **Tab 4 (Modul, LKPD, Rubrik):** 
   - Pilih TP yang ingin diajarkan dari *dropdown*.
   - Kolom **Topik / Konteks Lokal Relevan** akan terisi otomatis (*autofill*) dari Materi Pokok ATP.
   - Klik *Generate* untuk menghasilkan RPP utuh.

---

## 🔴 FASE 3: KOREKSI, PREVIEW, DAN EKSPOR (Finalisasi)
AI bertindak sebagai *Co-Pilot*, bukan pengganti guru. Segala hasil dari Fase 2 wajib melalui proses verifikasi oleh hak prerogatif guru.

### 1. Koreksi Tampilan Langsung (Preview)
- **Navigasi:** Gulir layar ke bawah menuju area **"Preview Hasil Generate"**.
- **Aksi:** Tinjau hasil kerja AI di semua tab (ACP, TP, ATP, Prota, Prosem, Modul).
- **Fokus Pemeriksaan:**
  - Cek kolom **Rasionalisasi Kelas** pada ATP: Apakah pembagian materi kelas 1 dan 2 masuk akal?
  - Cek **Distribusi Ceklis Bulan** pada Prosem: Apakah penyebaran centang minggu efektifnya sudah sesuai dengan Kaldik?
  - Cek **Integrasi Nilai (Panca Cinta/PPRA)**: Apakah sesuai dengan kearifan madrasah Anda?

### 2. Generate Ulang Jika Kurang Sesuai (Opsi)
- Jika hasilnya dirasa kurang tajam secara pedagogi, Anda dapat kembali ke atas, memodifikasi *prompt* di kolom "Topik/Konteks Lokal" (misalnya menambahkan perintah spesifik: *"Fokuskan materi pada budaya Kerinci"*), lalu klik *Generate* ulang pada dokumen yang bermasalah.

### 3. Ekspor & Koreksi Manual di Microsoft Word
> [!IMPORTANT]
> Aplikasi ini tidak menyediakan *inline editor* tabel yang rumit di dalam browser demi kecepatan performa. Koreksi teks tingkat mikro disarankan dilakukan di Microsoft Word.

- **Aksi:** Klik tombol **"Ekspor Semua (Batch ZIP)"**.
- **Hasil:** Aplikasi akan mengunduh 1 buah file ZIP yang di dalamnya terdapat 9 dokumen Microsoft Word (\`.docx\`) dengan format kertas F4 (Folio) yang sudah rapi dan siap cetak.
- **Koreksi Final:** Buka dokumen Word tersebut. Di sini, Anda memiliki otonomi mutlak 100% untuk mengubah redaksi kata, menyesuaikan baris tabel, atau memodifikasi sintaks/langkah pembelajaran sesuka hati sebelum diserahkan ke Kepala Madrasah.

---

## 💡 Ringkasan Praktis:
\`Input Profil & Kaldik\` ➔ \`Input CP\` ➔ \`Generate Tab 1 s.d. 4 Berurutan\` ➔ \`Preview Visual\` ➔ \`Download Word\` ➔ \`Revisi di Word\` ➔ \`Cetak\`.
`;
