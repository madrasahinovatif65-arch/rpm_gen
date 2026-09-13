# 📘 Panduan Alur Kerja Guru (Workflow) - Generator Perangkat KBC

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
- **Hasil:** Aplikasi akan mengunduh 1 buah file ZIP yang di dalamnya terdapat 9 dokumen Microsoft Word (`.docx`) dengan format kertas F4 (Folio) yang sudah rapi dan siap cetak.
- **Koreksi Final:** Buka dokumen Word tersebut. Di sini, Anda memiliki otonomi mutlak 100% untuk mengubah redaksi kata, menyesuaikan baris tabel, atau memodifikasi sintaks/langkah pembelajaran sesuka hati sebelum diserahkan ke Kepala Madrasah.

---

## 💡 Ringkasan Praktis:
`Input Profil & Kaldik` ➔ `Input CP` ➔ `Generate Tab 1 s.d. 4 Berurutan` ➔ `Preview Visual` ➔ `Download Word` ➔ `Revisi di Word` ➔ `Cetak`.
