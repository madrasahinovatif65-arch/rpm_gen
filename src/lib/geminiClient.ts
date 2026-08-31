import { GoogleGenAI } from "@google/genai";
import {
  generateModulAjarFallback,
  generateChatAssistantFallback
} from "./aiGenerators";

// Initialize Gemini AI Client safely
export const getAiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
};

// Helper for resilient Gemini API calls with model fallback and exponential retry
const generateContentWithRetry = async (ai: GoogleGenAI | null, contents: any) => {
  if (!ai) {
    throw new Error("GEMINI_API_KEY tidak dikonfigurasi.");
  }
  const modelCandidates = ["gemini-3.7-flash", "gemini-2.5-flash", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const modelCandidate of modelCandidates) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelCandidate,
          contents
        });
        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const status = err?.status || err?.code || err?.error?.code;
        const errMsg = String(err?.message || err || "");
        const isApiKeyInvalid =
          status === 400 ||
          errMsg.includes("API_KEY_INVALID") ||
          errMsg.includes("API key not valid") ||
          errMsg.includes("API_KEY");

        if (isApiKeyInvalid) {
          throw err;
        }

        const isTransient =
          status === 503 ||
          status === 429 ||
          status === 500 ||
          errMsg.includes("503") ||
          errMsg.includes("UNAVAILABLE") ||
          errMsg.includes("high demand") ||
          errMsg.includes("resource exhausted") ||
          errMsg.includes("Quota exceeded");

        if (isTransient) {
          if (attempt === 0) {
            await new Promise((resolve) => setTimeout(resolve, 1500));
          } else {
            break;
          }
        } else {
          break;
        }
      }
    }
  }
  throw lastError || new Error("Layanan AI sedang sibuk.");
};

// Generator Modul Ajar
export const generateModulAjarAPI = async (formData: any) => {
  const ai = getAiClient();
  const metodeText = formData.metode && formData.metode.trim() 
    ? formData.metode.trim() 
    : "Otomatis ditentukan oleh AI secara variatif dan interaktif";

  const systemPrompt = `Bertindaklah sebagai Ahli Kurikulum Nasional dan pengembang Sistem Modul Ajar Deep Learning Pro Administrasi Guru. Susunlah MODUL AJAR DEEP LEARNING (RENCANA PEMBELAJARAN MENDALAM) yang sangat komprehensif, terstruktur, profesional, dan berbobot.

ATURAN UTAMA:
1. JANGAN PERNAH MENYINGKAT PENJELASAN. Berikan penjabaran sedetail mungkin.
2. Setiap langkah (sintak) kegiatan guru dan murid WAJIB dipecah menjadi minimal 3-5 poin aktivitas rinci (gunakan <ul><li>), JANGAN HANYA 1 AKTIVITAS TUNGGAL. Sisipkan juga contoh dialog/perkataan guru.
3. FORMAT WAJIB: MURNI KODE HTML TANPA MARKDOWN / TANPA KODE. GUNAKAN TAG HTML MURNI (<strong>, <b>, <h3>, <p>, <ul>, <li>).
4. SANGAT PENTING - KHUSUS "BAGIAN E. SKENARIO PENGALAMAN BELAJAR PERTEMUAN":
   - PENGALAMAN BELAJAR WAJIB DIBUAT TANPA TABEL (DILARANG MENGGUNAKAN TABEL <table> PADA BAGIAN E).
   - Susunlah Pengalaman Belajar per pertemuan secara rinci, terstruktur, dan berkelas/premium menggunakan heading (<h3>, <h4>), daftar poin (<ul>, <li>), serta penekanan teks (<strong>).
   - Untuk setiap Pertemuan (Pertemuan 1 sampai ${formData.jumlahPertemuan}), bagi dengan struktur rapi:
     a. <h3>Pertemuan 1: [Judul/Topik Pertemuan]</h3>
     b. <h4>1. Kegiatan Pendahuluan (Durasi: X Menit)</h4>
        - <strong>Aktivitas Guru:</strong> (min 3-5 poin + contoh dialog guru)
        - <strong>Aktivitas Peserta Didik:</strong> (min 3-5 poin)
     c. <h4>2. Kegiatan Inti - Deep Learning (Durasi: X Menit)</h4>
        - Jabarkan per Sintak Model (${formData.model}) yang mencakup 3 Fase Deep Learning: <strong>Memahami (Concept)</strong>, <strong>Mengaplikasi (Practice)</strong>, dan <strong>Merefleksi (Reflection)</strong>.
        - Untuk setiap sintak: tuliskan <strong>Kegiatan Guru:</strong> (poin-poin + contoh dialog) dan <strong>Kegiatan Peserta Didik:</strong> (poin-poin aktif).
     d. <h4>3. Kegiatan Penutup (Durasi: X Menit)</h4>
        - <strong>Aktivitas Guru & Peserta Didik:</strong> (Simpulan, Refleksi, Rencana Pertemuan Berikutnya).
5. Untuk bagian A, C2, D, dan G tetap gunakan tabel HTML profesional agar data tersaji rapi.
6. WAJIB BUAT LKPD (Lembar Kerja Peserta Didik) YANG SIAP PAKAI SECARA UTUH DAN LANGSUNG BISA DIKERJAKAN SISWA.
7. Cantumkan footer resmi di bagian bawah.`;

  const userPrompt = `DATA MODUL AJAR:
- Nama Guru: ${formData.namaGuru || 'Guru Pengampu'}
- Nama Sekolah: ${formData.namaSekolah || 'Sekolah'}
- Tahun Ajaran: ${formData.tahunAjaran || '2026/2027'}
- Jenjang: ${formData.jenjang || 'SMP'}
- Fase: ${formData.fase || 'Fase D (Kelas 7-9)'}
- Kelas: ${formData.kelas || 'VII'}
- Alokasi Waktu: ${formData.waktu || '2 x 45 JP'}
- Mata Pelajaran: ${formData.mataPelajaran || 'Umum'}
- Bab/Topik Utama: ${formData.topik || 'Topik Utama'} ${formData.subTopik ? `- ${formData.subTopik}` : ''}
- Jumlah Pertemuan: ${formData.jumlahPertemuan || '1'} Pertemuan
- Model Pembelajaran: ${formData.model || 'Problem Based Learning (PBL)'}
- Metode Pembelajaran: ${metodeText}
- Tujuan Pembelajaran Spesifik: ${formData.tujuan || 'Siswa dapat memahami dan mengaplikasikan konsep dengan cermat.'}
- Karakteristik Murid: ${formData.karakteristik || 'Heterogen, siap belajar aktif.'}

FORMAT WAJIB LAYOUT HTML:

<h1>MODUL AJAR DEEP LEARNING (RENCANA PEMBELAJARAN MENDALAM)</h1>

<h2>A. INFORMASI UMUM</h2>
<table>
  <thead>
    <tr><th>Komponen</th><th>Detail Informasi</th></tr>
  </thead>
  <tbody>
    <tr><td>Nama Sekolah</td><td>${formData.namaSekolah}</td></tr>
    <tr><td>Nama Penyusun</td><td>${formData.namaGuru}</td></tr>
    <tr><td>Tahun Ajaran</td><td>${formData.tahunAjaran}</td></tr>
    <tr><td>Jenjang / Fase / Kelas</td><td>${formData.jenjang} / ${formData.fase} / Kelas ${formData.kelas}</td></tr>
    <tr><td>Mata Pelajaran</td><td>${formData.mataPelajaran}</td></tr>
    <tr><td>Topik / Sub-Topik</td><td>${formData.topik} ${formData.subTopik ? `(${formData.subTopik})` : ''}</td></tr>
    <tr><td>Alokasi Waktu Total</td><td>${formData.waktu}</td></tr>
    <tr><td>Jumlah Pertemuan</td><td>${formData.jumlahPertemuan} Pertemuan</td></tr>
    <tr><td>Model Pembelajaran</td><td>${formData.model}</td></tr>
    <tr><td>Metode Pembelajaran</td><td>${metodeText}</td></tr>
  </tbody>
</table>

<h2>B. TUJUAN PEMBELAJARAN</h2>
<p>Jelaskan secara spesifik, terukur, kontekstual, berpusat pada murid, dan memacu berfikir kritis (HOTS).</p>

<h2>C. IDENTIFIKASI MURID & PROFIL LULUSAN</h2>
<h3>1. Asesmen Diagnostik Awal</h3>
<p>Penjelasan strategi diagnostik kognitif & non-kognitif.</p>
<h3>2. Pemetaan Kesiapan Belajar</h3>
<table>
  <thead>
    <tr><th>Kategori Kesiapan</th><th>Deskripsi Kategori</th><th>Strategi Pendampingan & Tutor Sebaya</th></tr>
  </thead>
  <tbody>
    <tr><td>Belum Berkembang (BB)</td><td>Siswa membutuhkan bantuan penuh pada fondasi materi.</td><td>Pendampingan intensif oleh guru.</td></tr>
    <tr><td>Mulai Berkembang (MB)</td><td>Siswa memahami sebagian konsep dasar.</td><td>Latihan terbimbing dengan scaffolding.</td></tr>
    <tr><td>Berkembang Sesuai Harapan (BSH)</td><td>Siswa menguasai konsep sesuai standar.</td><td>Pembelajaran mandiri & diskusi kelompok.</td></tr>
    <tr><td>Sangat Berkembang (SDB)</td><td>Siswa mahir & mampu menganalisis mendalam.</td><td>Tutor sebaya & tantangan pengayaan.</td></tr>
  </tbody>
</table>

<h2>D. KERANGKA DESAIN PEMBELAJARAN MENDALAM</h2>
<table>
  <thead>
    <tr><th>Dimensi Pedagogis</th><th>Penerapan Strategis</th></tr>
  </thead>
  <tbody>
    <tr><td>Capaian Pembelajaran (CP)</td><td>Penguasaan konsep esensial dan penalaran reflektif.</td></tr>
    <tr><td>Praktik Pedagogis</td><td>${formData.model} - Metode: ${metodeText} dengan pendekatan Deep Learning (Memahami, Mengaplikasi, Merefleksi).</td></tr>
    <tr><td>Kemitraan Pembelajaran</td><td>Kolaborasi kelompok, diskusi kritis, dan presentasi tim.</td></tr>
    <tr><td>Lingkungan Pembelajaran</td><td>Inklusif, aman, interaktif, dan mendukung eksplorasi.</td></tr>
    <tr><td>Pemanfaatan Digital</td><td>Integrasi media digital, peta konsep interaktif, dan simulasi visual.</td></tr>
  </tbody>
</table>

<h2>E. SKENARIO PENGALAMAN BELAJAR PERTEMUAN</h2>
<p><em>(DIBUAT TANPA TABEL. Gunakan susunan heading <h3>, <h4>, poin-poin <ul><li>, dan <strong> secara terperinci untuk setiap pertemuan)</em></p>
(Buat skenario detail untuk tiap pertemuan dari Pertemuan 1 hingga Pertemuan ${formData.jumlahPertemuan}. DILARANG MENGGUNAKAN TABEL pada bagian E ini.)

<h2>F. REFLEKSI GURU & SISWA</h2>
<p>Daftar 3-5 pertanyaan reflektif mendalam untuk mengukur keberhasilan proses belajar.</p>

<h2>G. ASESMEN PEMBELAJARAN & RUBRIK EVALUASI</h2>
<table>
  <thead>
    <tr><th>Aspek Penilaian</th><th>Teknik Asesmen</th><th>Instrumen Penilaian</th><th>Kriteria Ketuntasan</th></tr>
  </thead>
  <tbody>
    <tr><td>Sikap / Karakter</td><td>Observasi & Jurnal</td><td>Lembar Observasi Aktivitas</td><td>Menunjukkan sikap kritis & kolaboratif</td></tr>
    <tr><td>Pengetahuan (Konsep)</td><td>Tes Tulis / Lisan</td><td>Soal HOTS & Lembar Jawaban</td><td>Nilai >= KKM / Kriteria Sekolah</td></tr>
    <tr><td>Keterampilan / Praktik</td><td>Penilaian Kinerja / LKPD</td><td>Rubrik Unjuk Kerja / Produk</td><td>Mampu menyelesaikan masalah secara sistematis</td></tr>
  </tbody>
</table>

<h2>H. BAHAN AJAR & LKPD (LEMBAR KERJA PESERTA DIDIK) SIAP PAKAI</h2>
<h3>1. Ringkasan Bahan Ajar Esensial</h3>
<p>Materi pembelajaran lengkap yang dapat dibaca siswa.</p>

<h3>2. LKPD Interaktif Siswa</h3>
<p><strong>LEMBAR KERJA PESERTA DIDIK (LKPD)</strong></p>
<p>Nama Siswa: ................................................<br>Kelas: ${formData.kelas}<br>Mata Pelajaran: ${formData.mataPelajaran}<br>Topik: ${formData.topik}</p>
<p><strong>Petunjuk Pengerjaan:</strong><br>1. Bacalah setiap instruksi dengan cermat.<br>2. Kerjakan soal & diskusikan bersama kelompokmu.<br>3. Tuliskan hasil analisis secara rinci pada kolom yang disediakan.</p>
<p><strong>Soal & Aktivitas Studi Kasus:</strong></p>
<ol>
  <li>Jelaskan konsep dasar dari ${formData.topik} berdasarkan pemahamanmu!</li>
  <li>Analisis contoh penerapan ${formData.topik} dalam kehidupan sehari-hari!</li>
  <li>Diskusikan bersama kelompok dan susunlah solusi untuk permasalahan berikut...</li>
</ol>

<h2>I. PENGAYAAN DAN REMEDIAL</h2>
<p>Program remedi untuk siswa BB/MB dan tantangan analisis tinggi untuk siswa SDB.</p>

<h2>J. LAMPIRAN & KUNCI JAWABAN</h2>
<p>Kunci jawaban LKPD, pedoman penskoran, dan referensi pustaka.</p>

<br><hr>
<p style="text-align: center; font-weight: bold; color: #475569;">Hak Cipta &copy; EdAdmin Pro - ${formData.namaSekolah}</p>`;

  try {
    const response = await generateContentWithRetry(ai, [
      { role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
    ]);

    let text = response?.text || "";
    text = text
      .replace(/```[a-zA-Z]*\n?/g, "")
      .replace(/```/g, "")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/^#+\s*(.*?)$/gm, "<h3>$1</h3>")
      .replace(/`/g, "")
      .trim();

    if (text && text.length > 50) {
      return { status: "success", html: text };
    }
  } catch (geminiError) {
    console.warn("Gemini API unavailable for Modul Ajar, using built-in generator engine:", geminiError);
  }

  const fallbackHtml = generateModulAjarFallback(formData);
  return { status: "success", html: fallbackHtml };
};


// Chat Assistant
export const chatAssistantAPI = async (message: string, context: any) => {
  const ai = getAiClient();
  const systemPrompt = `Anda adalah "EdAdmin AI Assistant", asisten kecerdasan buatan khusus administrasi guru dan pendidik profesional di Indonesia.
Tugas Anda membantu guru dalam:
1. Merumuskan ide RPP, alur tujuan pembelajaran (ATP), dan rubrik asesmen.
2. Memberikan ide metode pengajaran kreatif, esensial, dan berdiferensiasi.
3. Menyusun contoh soal tes (HOTS, PISA style, essay, pilihan ganda) beserta kunci jawaban.
4. Draft kalimat catatan wali kelas untuk rapor atau pesan santun ke orang tua murid.
5. Memberikan solusi akademis, motivasi, dan strategi penanganan disiplin siswa.

Berikan jawaban yang ramah, sopan, terstruktur, berbasis Kurikulum Merdeka / Nasional, mudah dipahami, dan langsung dapat dipraktikkan guru.
Informasi Sekolah/Guru Pendukung: ${JSON.stringify(context || {})}`;

  try {
    const response = await generateContentWithRetry(ai, [
      { role: "user", parts: [{ text: `${systemPrompt}\n\nPertanyaan/Permintaan Guru:\n${message}` }] }
    ]);

    const rawText = response?.text || "";
    const cleanReply = rawText
      .replace(/```[a-zA-Z]*\n?/g, "")
      .replace(/```/g, "")
      .replace(/^`+|`+$/g, "")
      .trim();

    if (cleanReply && cleanReply.length > 10) {
      return { status: "success", reply: cleanReply };
    }
  } catch (geminiError) {
    console.warn("Gemini API unavailable for Chat Assistant, using built-in engine:", geminiError);
  }

  const assistantReply = generateChatAssistantFallback(message, context);
  return { status: "success", reply: assistantReply };
};

// Generator Perangkat Ajar
export const generatePerangkatAjarAPI = async (docType: string, formData: any) => {
  const ai = getAiClient();

  const schoolName = formData?.school || "SMA Negeri 1 Jambi";
  const subject = formData?.subject || "Bahasa Indonesia";
  const singkatanMapel = formData?.singkatanMapel || "BI";
  const level = formData?.level || "Fase E / Kelas X";
  const year = formData?.year || "2026/2027";
  const totalJp = formData?.totalJp || "108 JP / Tahun";
  const jpPerMinggu = formData?.jpPerMinggu || "3 JP/Minggu";
  const teacher = formData?.teacher || "Budi Santoso, S.Pd., Gr.";
  const nipTeacher = formData?.nipTeacher || "19900101 201903 1 001";
  const cityDate = formData?.cityDate || "Jambi, 14 Juli 2026";
  const principal = formData?.principal || "Dr. Ahmad Fauzi, M.Pd.";
  const nipPrincipal = formData?.nipPrincipal || "19720514 200003 1 002";

  const cpRasional = formData?.cpRasional || "Pada akhir Fase E, peserta didik memiliki kemampuan berbahasa untuk berkomunikasi dan bernalar sesuai dengan tujuan, konteks sosial, akademis, dan dunia kerja.";
  const cpElemen = formData?.cpElemen || `Elemen 1 — Menyimak: Peserta didik mampu mengevaluasi dan mengkreasi informasi berupa gagasan dari berbagai tipe teks lisan.\nElemen 2 — Membaca dan Memirsa: Peserta didik mampu mengevaluasi informasi berupa gagasan dari teks deskripsi, laporan, narasi, eksplanasi, eksposisi.\nElemen 3 — Berbicara dan Mempresentasikan: Peserta didik mampu mengolah dan menyajikan gagasan untuk tujuan pengajuan usul dan solusi.\nElemen 4 — Menulis: Peserta didik mampu menulis gagasan tertulis secara logis, kritis, dan kreatif.`;

  const generalRules = `
KETENTUAN UTAMA GENERASI HTML ADMINISTRASI:
1. SANGAT PENTING - TANPA LOGO / GAMBAR: Kop Sekolah HANYA berisi teks nama dinas/pemerintah, nama sekolah, alamat, dan garis tebal pembatas. DILARANG MENAMBAHKAN TAG <img>, PLACEHOLDER [LOGO], ATAU GAMBAR APAPUN.
2. TANDA TANGAN SEJAJAR DALAM TABEL TAK TERLIHAT: Bagian tanda tangan penutup Kepala Sekolah (kiri/kanan) dan Guru Mata Pelajaran (kiri/kanan) HARUS disusun sejajar dalam 1 baris menggunakan TABEL HTML 2 KOLOM TANPA BORDER (\`<table style="width:100%; border:none; margin-top:30px;"><tr><td style="border:none; text-align:center; width:50%;">... TTD Kepsek ...</td><td style="border:none; text-align:center; width:50%;">... TTD Guru ...</td></tr></table>\`).
3. DILARANG MENAMPILKAN TEKS/TOMBOL "Cetak Dokumen" atau "🖨️ Cetak" DI DALAM ISI DOKUMEN HTML.
4. WARNA HEADER TABEL WARNA-WARNI KONTRAST: Semua elemen \`<th>\` pada tabel HARUS diberikan atribut \`style="background-color:#1a3a5c; color:#ffffff; font-weight:bold; text-align:center; padding:8px;"\` secara inline agar warna header tabel muncul dengan sempurna di browser maupun di Microsoft Word.`;

  let docPrompt = "";

  if (docType === "analisis_cp") {
    docPrompt = `Anda adalah asisten pembuatan perangkat administrasi pembelajaran Kurikulum Merdeka yang ahli dan berpengalaman. Tugas Anda adalah membuat dokumen **ANALISIS CAPAIAN PEMBELAJARAN (CP)** yang lengkap, profesional, dan siap cetak dalam format HTML.

${generalRules}

[DATA INPUT GURU]:
- Satuan Pendidikan: ${schoolName}
- Mata Pelajaran: ${subject}
- Fase / Kelas: ${level}
- Tahun Pelajaran: ${year}
- Nama Guru: ${teacher}
- NIP / NUPTK: ${nipTeacher}
- Kota / Tanggal TTD: ${cityDate}
- Nama Kepala Sekolah: ${principal}
- NIP Kepala Sekolah: ${nipPrincipal}
- Rasional CP Umum: ${cpRasional}
- CP Per Elemen: ${cpElemen}

STRUKTUR DOKUMEN HTML WAJIB (7 Bagian Wajib):
1. Kop Sekolah (TANPA LOGO) & Nomor Dokumen: No. Dok: ADM-CP-${singkatanMapel}-${level.replace(/\s+/g, '')} / Rev: 00 / Tgl: ${year.slice(0, 4)}
2. BAGIAN A — IDENTITAS (Tabel 2 Kolom)
3. BAGIAN B — RASIONAL MATA PELAJARAN (Tabel 3 kolom: No | Uraian | Deskripsi) -> 1. Pentingnya Mapel, 2. Kaitan dengan 8 Dimensi Profil Lulusan, 3. Orientasi Pembelajaran.
4. BAGIAN C — TUJUAN MATA PELAJARAN (Tabel 3 kolom: No | Tujuan | Indikator Umum - min 3 tujuan terukur)
5. BAGIAN D — KARAKTERISTIK MATA PELAJARAN & ELEMEN CP (Tabel 4 kolom: No | Elemen | Deskripsi Elemen | Cakupan Konten Utama - daftar 5-7 topik konkret per elemen)
6. BAGIAN E — CAPAIAN PEMBELAJARAN FASE (Tabel 4 kolom: Fase | Capaian Pembelajaran | Kompetensi Kunci | Konten / Materi Pokok)
7. BAGIAN F — PENJABARAN KATA KERJA OPERASIONAL (KKO) PER ELEMEN (Tabel 3 kolom: No | Elemen | KKO & Arah Tujuan Pembelajaran)
8. BAGIAN G — KETERKAITAN DENGAN 8 DIMENSI PROFIL LULUSAN (Tabel 4 kolom: No | Dimensi Profil Lulusan | Elemen Terkait | Relevansi ✔)
9. BAGIAN PENUTUP — TANDA TANGAN SEJAJAR KEPSEK & GURU DENGAN TABEL TANPA BORDER.

KETENTUAN LAYOUT HTML:
- Hasilkan MURNI KODE HTML tanpa tanda markdown fence (\`\`\`html) dan tanpa teks tambahan lain.
- Gunakan styling CSS internal yang bersih dengan font sans-serif, header tabel warna biru tua (#1a3a5c) teks putih, border tabel tipis, dan styling print @media print { @page { size: A4 portrait; margin: 1.5cm; } }.`;
  } else if (docType === "tp") {
    docPrompt = `Anda adalah asisten pembuatan perangkat administrasi pembelajaran Kurikulum Merdeka yang ahli dan berpengalaman. Tugas Anda adalah membuat dokumen **TUJUAN PEMBELAJARAN (TP)** yang lengkap, sistematis, profesional, dan siap cetak dalam format HTML.

${generalRules}

[DATA INPUT GURU]:
- Satuan Pendidikan: ${schoolName}
- Mata Pelajaran: ${subject}
- Singkatan Mapel: ${singkatanMapel}
- Fase / Kelas: ${level}
- Tahun Pelajaran: ${year}
- Alokasi Waktu Total: ${totalJp}
- Nama Guru: ${teacher}
- NIP Guru: ${nipTeacher}
- Kota / Tanggal TTD: ${cityDate}
- Nama Kepala Sekolah: ${principal}
- NIP Kepala Sekolah: ${nipPrincipal}
- CP Per Elemen: ${cpElemen}

STRUKTUR DOKUMEN HTML WAJIB (4 Bagian Wajib):
1. Kop Sekolah (TANPA LOGO) & Nomor Dokumen: No. Dok: ADM-TP-${singkatanMapel}-${level.replace(/\s+/g, '')} / Rev: 00 / Tgl: ${year.slice(0, 4)}
2. BAGIAN A — IDENTITAS (Tabel 2 Kolom)
3. BAGIAN B — PANDUAN KODE TUJUAN PEMBELAJARAN (Sub B1 Format Kode box, Sub B2 Tabel Kode Elemen)
4. BAGIAN C — DAFTAR TUJUAN PEMBELAJARAN (Tabel 6 kolom: No | Kode TP | Elemen CP | Tujuan Pembelajaran | Aspek Kompetensi | Alokasi JP). Buat 8-12 TP berprinsip ABCD, KKO Bloom terukur, diawali "Peserta didik mampu...". Total JP HARUS TEPAT SAMA dengan Alokasi Waktu Total (${totalJp}).
5. BAGIAN D — REKAPITULASI ALOKASI WAKTU PER ELEMEN (Tabel 5 kolom: No | Elemen CP | Jumlah TP | Total JP | Persentase)
6. BAGIAN PENUTUP — TANDA TANGAN SEJAJAR KEPSEK & GURU DENGAN TABEL TAK TERLIHAT (BORDER 0).

KETENTUAN LAYOUT HTML:
- Hasilkan MURNI KODE HTML tanpa markdown fence.
- CSS internal rapi, warna header #1a3a5c, @media print { @page { size: A4 portrait; margin: 1.5cm; } }.`;
  } else if (docType === "atp") {
    docPrompt = `Anda adalah asisten pembuatan perangkat administrasi pembelajaran Kurikulum Merdeka yang ahli dan berpengalaman. Tugas Anda adalah membuat dokumen **ALUR TUJUAN PEMBELAJARAN (ATP)** yang lengkap, sistematis, profesional, dan siap cetak dalam format HTML.

${generalRules}

[DATA INPUT GURU]:
- Satuan Pendidikan: ${schoolName}
- Mata Pelajaran: ${subject}
- Singkatan Mapel: ${singkatanMapel}
- Fase / Kelas: ${level}
- Tahun Pelajaran: ${year}
- Alokasi Waktu Total: ${totalJp}
- Nama Guru: ${teacher}
- NIP Guru: ${nipTeacher}
- Kota / Tanggal TTD: ${cityDate}
- Nama Kepala Sekolah: ${principal}
- NIP Kepala Sekolah: ${nipPrincipal}
- CP Per Elemen: ${cpElemen}

STRUKTUR DOKUMEN HTML WAJIB (4 Bagian Wajib):
1. Kop Sekolah (TANPA LOGO) & Nomor Dokumen: No. Dok: ADM-ATP-${singkatanMapel}-${level.replace(/\s+/g, '')} / Rev: 00 / Tgl: ${year.slice(0, 4)}
2. BAGIAN A — IDENTITAS (Tabel 4 kolom compact)
3. BAGIAN B — ALUR URUTAN TUJUAN PEMBELAJARAN DALAM SATU FASE (Diagram visual Flexbox kotak kode TP dengan panah →)
4. BAGIAN C — TABEL ALUR TUJUAN PEMBELAJARAN (Tabel 8 kolom: No | Kode TP | Elemen CP | Tujuan Pembelajaran | Materi Pokok | Kompetensi & Variasi | 8 Dimensi Profil Lulusan | Alokasi JP | Semester)
5. BAGIAN D — REKAPITULASI ALOKASI WAKTU (Tabel 6 kolom: No | Elemen CP | Jumlah TP | JP Sem 1 | JP Sem 2 | Total JP | Keterangan)
6. BAGIAN PENUTUP — TANDA TANGAN SEJAJAR KEPSEK & GURU DENGAN TABEL TAK TERLIHAT (BORDER 0).

KETENTUAN LAYOUT HTML:
- Hasilkan MURNI KODE HTML tanpa markdown fence.
- CSS internal rapi, warna header #1a3a5c, @media print { @page { size: A4 portrait; margin: 1.5cm; } }.`;
  } else {
    // Prota, Prosem, KKTP, KKM, dll.
    docPrompt = `Buatkan dokumen ${docType} untuk ${subject} tingkat ${level}.
${generalRules}
Gunakan format HTML murni tanpa markdown, lengkapi kop sekolah dan tanda tangan guru/kepsek.`;
  }

  try {
    const response = await generateContentWithRetry(ai, [
      { role: "user", parts: [{ text: docPrompt }] }
    ]);
    let text = response?.text || "";
    text = text.replace(/```[a-zA-Z]*\n?/g, "").replace(/```/g, "").trim();
    if (text) {
      return { status: "success", html: text };
    }
  } catch (err) {
    console.warn("Failed to generate", err);
  }

  return { status: "error", message: "Gagal membuat dokumen." };
};

// Generator Perangkat Ajar KBC (Kurikulum Berbasis Cinta)
export const generatePerangkatAjarKBCAPI = async (docType: string, formData: any) => {
  const ai = getAiClient();
  const {
    schoolName = "MAN 1 Kerinci",
    kemenagOffice = "KANTOR KEMENTERIAN AGAMA KABUPATEN KERINCI",
    schoolAddress = "Jl. Raya Semurup No. 45, Semurup, Kabupaten Kerinci",
    subject = "Akidah Akhlak",
    singkatanMapel = "AA",
    level = "Fase E / Kelas X",
    year = "2026/2027",
    totalJp = "72 JP / Tahun",
    jpPerMinggu = "2 JP/Minggu",
    teacher = "Drs. Yefri Haryanto, M.Pd.",
    nipTeacher = "19850312 201001 1 008",
    cityDate = "Kerinci, 14 Juli 2026",
    principal = "Hamdani, S.Pd., M.Si.",
    nipPrincipal = "19780514 200212 1 003",
    cpRasional = "",
    cpElemen = "",
    learningModel = "Discovery Learning",
    sintakModel = "1. Stimulasi/Pemberian Rangsangan, 2. Identifikasi Masalah, 3. Pengumpulan Data, 4. Pengolahan Data, 5. Pembuktian, 6. Penarikan Kesimpulan",
    kodeTp = "TP.AA.ELE.10.01",
    rumusanTp = "Peserta didik mampu menganalisis konsep tauhid dan Asmaul Husna secara mendalam, serta menginternalisasi nilai kasih sayang Allah Swt. dalam kehidupan sehari-hari dan kearifan lokal Kerinci.",
    elemenCp = "Akidah",
    jumlahPertemuan = "3",
    jpPerPertemuan = "2",
    topikLokal = "Pelestarian Lingkungan Hutan TNKS & Budaya Adat Mudik Kerinci"
  } = formData || {};

  let docPrompt = "";
  const generalKbcRules = `
[ATURAN PENTING KBC & KEMENAG]:
- Kamu adalah Ahli Kurikulum & Pengembang Perangkat Ajar Kemenag RI, menguasai "Kurikulum Berbasis Cinta (KBC)" (turunan Kurikulum Merdeka yang mengintegrasikan Panca Cinta Kemenag & 10 Nilai PPRA: Ta'addub, Qudwah, Muwaṭanah, Tawassuṭ, Tawāzun, I'tidāl, Musāwah, Syūrā, Tasāmuh, Tathawwur wa Ibtikār).
- Hasil WAJIB MURNI KODE HTML tanpa markdown code fences (\`\`\`html) atau teks pengantar lain.
- Gunakan CSS internal rapi dengan font sans-serif (Arial/Calibri), header tabel warna biru tua (#1a3a5c) teks putih bold.
- Tanda tangan penutup 2 kolom sejajar border 0 (Kepala Sekolah & Guru Mata Pelajaran).
- Tanggal & Kota TTD: ${cityDate}.
  `;

  if (docType === "analisis_cp") {
    docPrompt = `
${generalKbcRules}

TUGAS: Buatkan dokumen "ANALISIS CAPAIAN PEMBELAJARAN (ACP) KURIKULUM BERBASIS CINTA" dengan struktur, urutan, dan format tabel PERSIS seperti kerangka baku di bawah ini. Jangan mengubah urutan bagian (A–H), jangan menghilangkan kolom, dan jangan menyingkat isi tabel.

[DATA IDENTITAS GURU & MADRASAH]:
- Kantor / Yayasan: ${kemenagOffice}
- Satuan Pendidikan: ${schoolName}
- Mata Pelajaran: ${subject} (${singkatanMapel})
- Fase / Kelas: ${level}
- Tahun Pelajaran: ${year}
- Nama Guru: ${teacher} (NIP/NUPTK: ${nipTeacher})
- Nama Kepala Sekolah: ${principal} (NIP: ${nipPrincipal})
- Rasional & Elemen CP: ${cpRasional} \n ${cpElemen}

STRUKTUR DOKUMEN (WAJIB PERSIS URUTAN A-H):
KOP DOKUMEN:
KEMENTERIAN AGAMA REPUBLIK INDONESIA
${kemenagOffice}
${schoolName.toUpperCase()}
[Alamat Lengkap Madrasah]
Judul: ANALISIS CAPAIAN PEMBELAJARAN
Sub-judul: Kurikulum Berbasis Cinta (KBC) | Tahun Pelajaran ${year}

A. IDENTITAS (Tabel 2 kolom: Label | Isi, 6 baris)
B. RASIONAL MATA PELAJARAN (Tabel 3 kolom: No | Uraian | Deskripsi — 3 baris: 1. Pentingnya Mapel & Panca Cinta, 2. Kaitan dengan 8 Dimensi Profil Lulusan & 10 Nilai PPRA, 3. Orientasi Pembelajaran)
C. TUJUAN MATA PELAJARAN (Tabel 3 kolom: No | Tujuan | Indikator Umum — 2-3 baris terukur)
D. KARAKTERISTIK MATA PELAJARAN & ELEMEN CP (Tabel 4 kolom: No | Elemen | Deskripsi Elemen | Cakupan Konten Utama)
E. CAPAIAN PEMBELAJARAN FASE ${level} (Tabel 4 kolom: Fase | Capaian Pembelajaran | Kompetensi Kunci | Konten/Materi Pokok)
F. PENJABARAN KATA KERJA OPERASIONAL (KKO) PER ELEMEN (Tabel 3 kolom: No | Elemen | KKO & Arah Tujuan Pembelajaran — sertakan KKO Bloom tinggi, Panca Cinta, & nilai PPRA konkret)
G. KETERKAITAN DENGAN 10 NILAI PPRA (Tabel 4 kolom: No | Dimensi Profil Lulusan | Elemen Terkait | Relevansi ✔ — WAJIB 10 baris urut: Ta'addub, Qudwah, Muwaṭanah, Tawassuṭ, Tawāzun, I'tidāl, Musāwah, Syūrā, Tasāmuh, Tathawwur wa Ibtikār)
H. INTEGRASI NILAI PPRA DALAM PEMBELAJARAN (Tabel 4 kolom: No | Nilai PPRA | Deskripsi Nilai | Integrasi dalam Kegiatan Pembelajaran — WAJIB 10 baris urut sesuai Bagian G)

PENUTUP: Tanda tangan sejajar Kepala Sekolah & Guru (${cityDate}).
Layout: A4 Portrait (@media print { @page { size: A4 portrait; margin: 1.2cm; } }).
`;
  } else if (docType === "tp") {
    docPrompt = `
${generalKbcRules}

TUGAS: Buatkan dokumen "TUJUAN PEMBELAJARAN (TP) KURIKULUM BERBASIS CINTA" (breakdown CP menjadi TP per elemen, lengkap dengan kode dan alokasi JP), dengan struktur, urutan, dan format tabel PERSIS seperti kerangka baku di bawah ini.

[DATA IDENTITAS]:
- Satuan Pendidikan: ${schoolName}
- Mata Pelajaran: ${subject}
- Singkatan Mapel: ${singkatanMapel}
- Fase / Kelas: ${level}
- Tahun Pelajaran: ${year}
- Alokasi Waktu Total: ${totalJp}
- Nama Guru: ${teacher} (NIP: ${nipTeacher})
- Kepala Sekolah: ${principal} (NIP: ${nipPrincipal})
- CP Elemen: ${cpElemen}

STRUKTUR DOKUMEN WAJIB:
KOP DOKUMEN KEMENTERIAN AGAMA & MADRASAH
Judul: TUJUAN PEMBELAJARAN KURIKULUM BERBASIS CINTA | Tahun Pelajaran ${year}

A. IDENTITAS (Tabel 2 kolom dengan format titik dua)
B. PANDUAN KODE TUJUAN PEMBELAJARAN (Format Kode: [SINGKATAN_MAPEL]-[FASE]-[KODE_ELEMEN]-[NOMOR], Contoh: ${singkatanMapel}-E-ELE-001 & Tabel Kode Elemen)
C. DAFTAR TUJUAN PEMBELAJARAN (Tabel 6 kolom: No | Kode TP | Elemen CP | Tujuan Pembelajaran & Aspek Kompetensi | Integrasi Nilai (KBC & PPRA) | JP). Buat 8-12 TP berpola "Peserta didik mampu...", cantumkan Panca Cinta & Nilai PPRA (salah satu dari 10 nilai baku). Total JP = ${totalJp}.
D. REKAPITULASI ALOKASI WAKTU PER ELEMEN (Tabel 5 kolom: No | Elemen CP | Jumlah TP | Total JP | Persentase %)
PENUTUP / PENGESAHAN (${cityDate}).
Layout: A4 Portrait (@media print { @page { size: A4 portrait; margin: 1.2cm; } }).
`;
  } else if (docType === "atp") {
    docPrompt = `
${generalKbcRules}

TUGAS: Buatkan dokumen "ALUR TUJUAN PEMBELAJARAN (ATP) KURIKULUM BERBASIS CINTA" — pengurutan logis-hierarkis seluruh TP dalam satu fase dengan struktur PERSIS seperti kerangka baku di bawah ini.

[DATA IDENTITAS]:
- Satuan Pendidikan: ${schoolName}
- Mata Pelajaran: ${subject}
- Singkatan Mapel: ${singkatanMapel}
- Fase / Kelas: ${level}
- Tahun Pelajaran: ${year}
- Alokasi Waktu Total: ${totalJp}
- Nama Guru: ${teacher} (NIP: ${nipTeacher})
- Kepala Sekolah: ${principal} (NIP: ${nipPrincipal})
- CP Elemen: ${cpElemen}

STRUKTUR DOKUMEN WAJIB:
KOP DOKUMEN KEMENTERIAN AGAMA & MADRASAH
Judul: ALUR TUJUAN PEMBELAJARAN KURIKULUM BERBASIS CINTA (KBC)

A. IDENTITAS (Tabel 2 kolom berdampingan: Kiri & Kanan)
B. ALUR URUTAN TUJUAN PEMBELAJARAN DALAM SATU FASE (Kotak Diagram Alur Horizontal [KODE-TP-001] → [KODE-TP-002] → ... dihubungkan tanda panah, dilengkapi Legenda ■ Hitam = Pembuka, □ Putih = Lanjutan)
C. TABEL ALUR TUJUAN PEMBELAJARAN (Tabel 9 kolom: No | Kode TP | Elemen CP | Tujuan Pembelajaran | Materi Pokok | Aspek Kompetensi | Integrasi Nilai (PC & PPRA) | Alokasi JP | Semester). Dikelompokkan per baris elemen.
PENUTUP / PENGESAHAN (${cityDate}).
Layout: A4 Landscape (@media print { @page { size: A4 landscape; margin: 1.2cm; } }).
`;
  } else if (docType === "prota") {
    docPrompt = `
${generalKbcRules}

TUGAS: Buatkan dokumen "PROGRAM TAHUNAN (PROTA) KURIKULUM BERBASIS CINTA" — pemetaan seluruh TP ke minggu efektif kalender akademik dalam satu tahun ajaran.

[DATA IDENTITAS]:
- Satuan Pendidikan: ${schoolName}
- Mata Pelajaran: ${subject}
- Singkatan Mapel: ${singkatanMapel}
- Fase / Kelas: ${level}
- Tahun Pelajaran: ${year}
- Alokasi Waktu: ${totalJp} (${jpPerMinggu})
- Nama Guru: ${teacher} (NIP: ${nipTeacher})
- Kepala Sekolah: ${principal} (NIP: ${nipPrincipal})

STRUKTUR DOKUMEN WAJIB:
KOP DOKUMEN KEMENTERIAN AGAMA & MADRASAH
Judul: PROGRAM TAHUNAN | Kurikulum Berbasis Cinta | ${subject} | ${level} | TP ${year}

A. IDENTITAS
B. DISTRIBUSI MINGGU EFEKTIF — KALENDER PENDIDIKAN (Tabel 7 kolom: Sem. | Bulan | Minggu Kalender | Tdk Efektif | Efektif | JP | Keterangan). Sertakan Subtotal Sem 1, Subtotal Sem 2, & TOTAL KESELURUHAN.
C. RENCANA PROGRAM TAHUNAN (Tabel 7 kolom: No | Kode TP | Tujuan Pembelajaran & Materi Pokok | Elemen CP | Integrasi Nilai (KBC & PPRA) | Alokasi JP | Semester). Sertakan header kelompok Semester 1 & Semester 2, serta baris CADANGAN.
PENUTUP / PENGESAHAN (${cityDate}).
Layout: A4 Portrait (@media print { @page { size: A4 portrait; margin: 1.2cm; } }).
`;
  } else if (docType === "prosem") {
    docPrompt = `
${generalKbcRules}

TUGAS: Buatkan dokumen "PROGRAM SEMESTER (PROSEM) KURIKULUM BERBASIS CINTA" — jadwal distribusi pembelajaran mingguan per semester.

[DATA IDENTITAS]:
- Satuan Pendidikan: ${schoolName}
- Mata Pelajaran: ${subject}
- Singkatan Mapel: ${singkatanMapel}
- Fase / Kelas: ${level}
- Tahun Pelajaran: ${year}
- JP per Minggu: ${jpPerMinggu}
- Nama Guru: ${teacher} (NIP: ${nipTeacher})
- Kepala Sekolah: ${principal} (NIP: ${nipPrincipal})

STRUKTUR DOKUMEN WAJIB:
KOP DOKUMEN KEMENTERIAN AGAMA & MADRASAH
Judul: PROGRAM SEMESTER (PROSEM) | Kurikulum Berbasis Cinta | ${subject} | ${level}

BLOK INFORMASI HEADER & Legenda Warna: [■ biru] JP Aktif Pembelajaran, [■ abu] Libur, [■ kuning] PTS, [■ merah] PAS.
TABEL DISTRIBUSI PEMBELAJARAN (Grid mingguan: No | Kode TP | Tujuan Pembelajaran & Materi Pokok | JP | Integrasi Nilai (KBC & PPRA) | Kolom M1..M5 per bulan Juli-Desember & Januari-Juni).
KETERANGAN: Catatan minggu tidak efektif per bulan & Catatan Semester.
PENUTUP / PENGESAHAN (${cityDate}).
Layout: A4 Landscape (@media print { @page { size: A4 landscape; margin: 1.0cm; } }).
`;
  } else if (docType === "kktp") {
    docPrompt = `
${generalKbcRules}

TUGAS: Buatkan dokumen "KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP) KURIKULUM BERBASIS CINTA" — rubrik 4 level capaian untuk setiap TP.

[DATA IDENTITAS]:
- Satuan Pendidikan: ${schoolName}
- Mata Pelajaran: ${subject}
- Fase / Kelas: ${level}
- Tahun Pelajaran: ${year}
- Nama Guru: ${teacher} (NIP: ${nipTeacher})
- Kepala Sekolah: ${principal} (NIP: ${nipPrincipal})

STRUKTUR DOKUMEN WAJIB:
KOP DOKUMEN KEMENTERIAN AGAMA & MADRASAH
Judul: KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP) | Kurikulum Berbasis Cinta

BLOK INFORMASI HEADER & PARAGRAF DASAR (Mengutip Permendikbudristek & Filosofi KBC / Panca Cinta & PPRA).
A. DESKRIPSI LEVEL CAPAIAN (Tabel 6 kolom: Level | Skor | Deskripsi Umum | Tindak Lanjut | Rentang Nilai | Predikat — Level 1 Mulai Berkembang 0-55, Level 2 Layak ✓ KKTP 56-70, Level 3 Cakap 71-85, Level 4 Mahir 86-100).
B. RUBRIK KKTP PER TUJUAN PEMBELAJARAN (Tabel 5 kolom utama dengan sub-kolom 4 level: Mulai Berkembang (1), Layak (2) ✓ KKTP, Cakap (3), Mahir (4)). Tulis deskriptor progresi bertingkat yang kaya nilai PPRA & Panca Cinta.
CATATAN PENTING AMBANG BATAS KETUNTASAN.
PENUTUP / PENGESAHAN (${cityDate}).
Layout: A4 Landscape (@media print { @page { size: A4 landscape; margin: 1.2cm; } }).
`;
  } else if (docType === "modul_ajar") {
    docPrompt = `
${generalKbcRules}

PERAN & KONTEKS
Kamu adalah Ahli Kurikulum dan Pengembang Perangkat Ajar berpengalaman di satuan pendidikan naungan Kementerian Agama RI, menguasai penyusunan Modul Ajar berbasis Deep Learning (Mindful, Meaningful, Joyful Learning) yang diintegrasikan penuh dengan Kurikulum Berbasis Cinta (KBC) — Panca Cinta dan 10 Nilai PPRA (Profil Pelajar Rahmatan lil 'Alamin).

TUGAS
Susun dokumen "PERENCANAAN PEMBELAJARAN (MODUL AJAR DEEP LEARNING - KBC)" untuk Tujuan Pembelajaran [Kode: ${kodeTp}, Rumusan: ${rumusanTp}] mata pelajaran ${subject} kelas ${level} tahun pelajaran ${year}, dengan identitas satuan pendidikan:
- Kementerian Agama Republik Indonesia
- ${kemenagOffice}
- ${schoolName}
- ${schoolAddress}
- Penyusun: ${teacher} (NIP: ${nipTeacher}) | Kepala Madrasah: ${principal} (NIP: ${nipPrincipal})

INPUT YANG DIBERIKAN PENGGUNA
- Rumusan lengkap TP dan Elemen CP: Kode ${kodeTp} - ${rumusanTp} | Elemen: ${elemenCp}
- Model pembelajaran (${learningModel}) beserta sintaknya: ${sintakModel}
- Jumlah pertemuan dan alokasi JP per pertemuan: ${jumlahPertemuan} Pertemuan x ${jpPerPertemuan} JP (${Number(jpPerPertemuan) * 45} Menit/Pertemuan)
- Topik/konteks lokal yang relevan: ${topikLokal}

ATURAN STRUKTUR MODUL AJAR (WAJIB DIIKUTI PERSIS)
Hasilkan MURNI KODE HTML tanpa markdown code fences (\`\`\`html). Gunakan CSS internal rapi dengan font sans-serif (Arial/Calibri), header tabel warna biru tua (#1a3a5c) teks putih bold.

KOP SURAT DOKUMEN:
KEMENTERIAN AGAMA REPUBLIK INDONESIA
${kemenagOffice.toUpperCase()}
${schoolName.toUpperCase()}
${schoolAddress}

BAGIAN A — INFORMASI UMUM
- Tabel identitas: Nama Penyusun, Satuan Pendidikan, Mata Pelajaran, Fase/Kelas, Kode & Judul TP, Elemen CP, Alokasi Waktu, Model Pembelajaran, Moda, Tahun Pelajaran
- B. Identifikasi Kesiapan Peserta Didik (1 paragraf naratif mengaitkan capaian belajar sebelumnya dengan TP ini)
- C. Karakteristik Materi Pelajaran (1 paragraf: sifat materi, tingkat kesulitan, relevansi lokal: ${topikLokal})
- 1. Tujuan Pembelajaran (1 kalimat utuh memuat kompetensi + nilai KBC yang ditumbuhkan)
- 2. Kompetensi Awal/Prasyarat (tabel: No | Kompetensi Prasyarat | Cara Mengecek)
- 3. 8 Dimensi Profil Lulusan (pilih 2 dimensi paling relevan; tabel: No | Dimensi | Deskripsi Perwujudan, setiap deskripsi WAJIB diakhiri anotasi "(PC: [Panca Cinta] | PPRA: [Nilai])")
- 3a. Integrasi KBC: baris terpisah "Panca Cinta: [...]" dan "Nilai PPRA: [...]" (pilih 2-3 nilai paling relevan dari 10 Nilai PPRA)
- 4. Sarana & Prasarana (tabel: Kategori | Rincian | Keterangan)
- 5. Target Peserta Didik & Diferensiasi (3 kolom: Reguler/Tipikal | Kesulitan Belajar | Berbakat/Cepat — masing-masing berisi Sasaran & Perlakuan)

BAGIAN B — KOMPONEN INTI
- 6. Pemahaman Bermakna (kotak bertekstur naratif-reflektif, mengaitkan materi dengan minimal 1 istilah PPRA, misal Tathawwur wa Ibtikār / Syūrā / I'tidāl)
- 7. Pertanyaan Pemantik (tabel: No | Pertanyaan | Tujuan Pertanyaan, 3 butir)
- 8. Asesmen Diagnostik:
  8a. Non-Kognitif (tabel: No | Pertanyaan Refleksi | Tujuan Diagnostik, 3 butir)
  8b. Kognitif (tabel: No | Indikator | Bentuk Soal | Tindak Lanjut, 3 butir) + 5 contoh soal campuran (isian, PG, terbuka)
- 9. KEGIATAN PEMBELAJARAN — cantumkan nama model (${learningModel}) & urutan sintak lengkap (${sintakModel}) di awal.
  UNTUK SETIAP PERTEMUAN (Pertemuan 1 s.d. ${jumlahPertemuan}), wajib memuat:
  a. Judul pertemuan bertema naratif + Alokasi (${jpPerPertemuan} JP & ${Number(jpPerPertemuan) * 45} menit) + Sintak yang dicakup + Fokus
  b. Tujuan Pertemuan (3 butir: Keterampilan, Pengetahuan, Sikap)
  c. ● PEMBUKA (15 menit) — prinsip Deep Learning + integrasi KBC (PC & PPRA), tabel 2 kolom (Aktivitas Guru | Aktivitas Siswa) berpasangan No, 5 baris, SETIAP baris aktivitas guru MAUPUN siswa diakhiri anotasi "(PC: ... | PPRA: ...)"
  d. SINTAK [n] [Nama Sintak] (durasi menit) — prinsip pembelajaran + integrasi KBC, tabel sama seperti di atas (5 baris)
  e. Ulangi (d) untuk setiap sintak dalam pertemuan tsb (${sintakModel})
  f. ● PENUTUP (15 menit) — format sama, 5 baris
  Total menit per pertemuan harus sama dengan alokasi ${jpPerPertemuan} JP × 45 menit (${Number(jpPerPertemuan) * 45} menit).
- 10. Asesmen Formatif (tabel: No | Teknik | Instrumen | Waktu Pelaksanaan | Aspek yang Dinilai, satu baris per pertemuan) + 5 contoh soal proses pembelajaran
- 11. Asesmen Sumatif (tabel: No | Komponen | Deskripsi Tugas | Bobot | Acuan KKTP; bobot harus total 100%)
- 12. Pengayaan & Remedial (3 kolom: Remedial | Reguler | Pengayaan, masing-masing berisi Sasaran, Kegiatan, Waktu)
- 13. Refleksi Guru & Peserta Didik (2 kolom, masing-masing 3-4 pertanyaan reflektif, refleksi guru memuat kata "teladan (Qudwah)")

BAGIAN C — LAMPIRAN
- Deskripsi singkat tiap lampiran (LKPD, lembar penilaian sahabat, dsb.)
- Glosarium (3 istilah kunci materi)
- Daftar Pustaka
PENUTUP / PENGESAHAN (${cityDate}).
`;
  } else {
    docPrompt = `Buatkan dokumen ${docType} untuk ${subject} tingkat ${level}.
${generalKbcRules}
Gunakan format HTML murni tanpa markdown, lengkapi kop madrasah dan tanda tangan guru/kepsek.`;
  }

  try {
    const response = await generateContentWithRetry(ai, [
      { role: "user", parts: [{ text: docPrompt }] }
    ]);
    let text = response?.text || "";
    text = text.replace(/\`\`\`[a-zA-Z]*\n?/g, "").replace(/\`\`\`/g, "").trim();
    if (text) {
      return { status: "success", html: text };
    }
  } catch (err) {
    console.warn("Failed to generate", err);
  }

  return { status: "error", message: "Gagal membuat dokumen." };
};
