import { GoogleGenAI } from "@google/genai";
import { ZodSchema } from "zod";
import {
  generateModulAjarFallback,
  generateChatAssistantFallback
} from "./aiGenerators";
import { KbcSchemas } from "./kbcSchemas";

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

// Helper for JSON Generation with Zod Validation & Repair Loop
export const generateJsonWithRepair = async (ai: GoogleGenAI | null, systemPrompt: string, userPrompt: string, schema: ZodSchema<any>, maxRetries = 2) => {
  if (!ai) throw new Error("GEMINI_API_KEY tidak dikonfigurasi.");
  
  let currentPrompt = `${systemPrompt}\n\nIMPORTANT: You must return a valid JSON object that strictly follows this schema. Do not include markdown blocks like \`\`\`json. Return ONLY the raw JSON string.\n\n${userPrompt}`;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await generateContentWithRetry(ai, [{ role: "user", parts: [{ text: currentPrompt }] }]);
      let text = response?.text || "";
      text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      const parsed = JSON.parse(text);
      const validationResult = schema.safeParse(parsed);
      
      if (validationResult.success) {
        return validationResult.data;
      } else {
        // Validation failed, create repair prompt
        const errorMsg = ((validationResult.error as any).issues || []).map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
        console.warn(`JSON validation failed on attempt ${attempt + 1}:`, errorMsg);
        currentPrompt = `You previously returned invalid JSON. Please fix the following validation errors:\n${errorMsg}\n\nPrevious JSON:\n${text}\n\nReturn ONLY the corrected JSON object.`;
      }
    } catch (err) {
      console.warn(`JSON parsing failed on attempt ${attempt + 1}:`, err);
      currentPrompt = `You previously returned invalid JSON that could not be parsed. Error: ${String(err)}\n\nPlease ensure your response is ONLY a valid JSON object with no extra text.`;
    }
  }
  
  throw new Error("Gagal menghasilkan JSON yang valid setelah beberapa kali percobaan perbaikan.");
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


export const generatePerangkatAjarKBCAPI = async (docType: string, formData: any) => {
  const ai = getAiClient();
  
  let schemaKey = docType;
  let meetingNumber = 0;
  
  if (docType.startsWith("modul_ajar_meeting_")) {
    schemaKey = "modul_ajar_meeting";
    meetingNumber = parseInt(docType.split("_")[3], 10);
  }

  const schema = KbcSchemas[schemaKey];
  
  if (!schema) {
    return { status: "error", message: `Schema untuk dokumen ${docType} tidak ditemukan.` };
  }

  const generalKbcRules = `Kamu adalah Ahli Kurikulum & Pengembang Perangkat Ajar Kemenag RI, menguasai "Kurikulum Berbasis Cinta (KBC)".
Dalam setiap analisis, penyusunan tujuan, dan modul ajar, kamu WAJIB berpedoman mutlak pada definisi berikut sebagai GROUND TRUTH (kebenaran dasar) tanpa merujuk sumber eksternal mana pun:

=== PEDOMAN KURIKULUM BERBASIS CINTA (KBC) ===

[A] LIMA (5) PANCA CINTA KEMENAG:
1. Cinta Allah
2. Cinta Rasulullah SAW
3. Cinta Al-Qur'an
4. Cinta Sesama Manusia
5. Cinta Tanah Air dan Alam Semesta

[B] SEPULUH (10) NILAI PROFIL PELAJAR RAHMATAN LIL 'ALAMIN (PPRA):
1. Berkeadaban (Ta'addub) — menjunjung tinggi akhlak mulia, budi pekerti, dan adab.
2. Keteladanan (Qudwah) — memiliki suri teladan yang baik dalam sikap dan perilaku.
3. Kewarganegaraan dan Kebangsaan (Muwaṭanah) — mencintai tanah air dan berkomitmen pada NKRI.
4. Mengambil Jalan Tengah (Tawassuṭ) — bersikap moderat, tidak ekstrem kanan maupun kiri.
5. Berimbang (Tawāzun) — menjaga keseimbangan antara aspek jasmani, rohani, dunia, dan akhirat.
6. Lurus dan Tegas (I'tidāl) — bersikap proporsional, adil, dan tidak berpihak secara tidak benar.
7. Kesetaraan (Musāwah) — mengakui persamaan derajat antar sesama manusia tanpa diskriminasi.
8. Musyawarah (Syūra) — mengutamakan mufakat dan dialog dalam mengambil keputusan.
9. Toleransi (Tasāmuh) — menghormati perbedaan keyakinan, pendapat, dan keberagaman budaya.
10. Dinamis dan Inovatif (Taṭawwur wa Ibtikār) — terbuka terhadap perubahan positif dan terus berkreasi.

[C] DELAPAN (8) DIMENSI PROFIL LULUSAN (DPL) — Permendikdasmen No. 10 Tahun 2025:
1. Keimanan dan Ketakwaan terhadap Tuhan YME — memiliki keyakinan teguh & menghayati nilai spiritual.
2. Kewargaan — cinta tanah air, taat norma, peduli sosial, berkomitmen pada keberlanjutan lingkungan.
3. Penalaran Kritis — berpikir logis, analitis, dan reflektif dalam memproses informasi & menyelesaikan masalah.
4. Kreativitas — berpikir inovatif, fleksibel, dan orisinal dalam menciptakan solusi yang unik & bermanfaat.
5. Kolaborasi — peduli, berbagi, dan bekerja sama (gotong royong) secara efektif untuk tujuan bersama.
6. Kemandirian — bertanggung jawab atas proses belajar sendiri, berinisiatif, dan adaptif dalam pengembangan diri.
7. Kesehatan — menjalankan pola hidup bersih & sehat, menjaga kebugaran fisik & mental.
8. Komunikasi — mampu menyimak, membaca, berbicara, dan menulis dengan baik, benar, dan etis.

[D] PEDOMAN MODEL DAN METODE PEMBELAJARAN (OTOMATISASI AI):
Sebagai AI profesional, kamu WAJIB menerjemahkan "Model Pembelajaran" yang dipilih guru menjadi Sintak (Langkah-langkah) baku dan memilihkan "Metode Pembelajaran" (seperti diskusi, ceramah interaktif, tanya jawab, penugasan) yang paling relevan secara OTOMATIS.
Gunakan pedoman baku berikut jika guru memilih model di bawah ini:
1. Problem Based Learning (PBL):
   - Sintak: (1) Orientasi siswa pada masalah, (2) Mengorganisasikan siswa, (3) Membimbing penyelidikan, (4) Menyajikan hasil karya, (5) Evaluasi proses pemecahan masalah.
   - Metode cocok: Diskusi kelompok, presentasi, tanya jawab kritis.
2. Project Based Learning (PjBL):
   - Sintak: (1) Penentuan pertanyaan mendasar, (2) Mendesain perencanaan proyek, (3) Menyusun jadwal, (4) Memonitoring siswa dan proyek, (5) Menguji hasil, (6) Mengevaluasi pengalaman.
   - Metode cocok: Kerja proyek, eksperimen, kolaborasi, presentasi produk.
3. Discovery Learning:
   - Sintak: (1) Pemberian rangsangan (Stimulation), (2) Identifikasi masalah, (3) Pengumpulan data, (4) Pengolahan data, (5) Pembuktian (Verification), (6) Menarik kesimpulan.
   - Metode cocok: Observasi, eksperimen terbimbing, diskusi, resitasi.
4. Inquiry Learning:
   - Sintak: (1) Orientasi, (2) Merumuskan masalah, (3) Merumuskan hipotesis, (4) Mengumpulkan data, (5) Menguji hipotesis, (6) Menarik kesimpulan.
   - Metode cocok: Penyelidikan kritis, observasi, tanya jawab analitik.
5. Pembelajaran Berdiferensiasi (Differentiated Learning):
   - Sintak: (1) Pemetaan kebutuhan belajar (Asesmen awal), (2) Diferensiasi Konten, (3) Diferensiasi Proses, (4) Diferensiasi Produk, (5) Refleksi & Umpan balik.
   - Metode cocok: Tutor sebaya, penugasan mandiri terstruktur, diskusi kelompok heterogen.
6. Cooperative Learning (Jigsaw / STAD):
   - Sintak: (1) Menyampaikan tujuan & motivasi, (2) Menyajikan informasi/materi dasar, (3) Mengorganisasikan siswa ke dalam kelompok (asal & ahli), (4) Membimbing kelompok bekerja & belajar, (5) Evaluasi, (6) Memberikan penghargaan.
   - Metode cocok: Diskusi kelompok ahli, saling mengajar antar teman, role playing.
7. Flipped Classroom (Kelas Terbalik):
   - Sintak: (1) Pra-pembelajaran mandiri (di rumah), (2) Asesmen awal diagnostik (di kelas), (3) Pemecahan masalah tingkat lanjut/diskusi kelas, (4) Praktik/Penerapan konsep, (5) Konfirmasi & Penguatan.
   - Metode cocok: Penugasan pra-kelas, diskusi kasus, praktik terbimbing, presentasi interaktif.
8. Teaching at the Right Level (TaRL):
   - Sintak: (1) Asesmen diagnostik penempatan, (2) Pengelompokan siswa berdasarkan tingkat kemampuan, (3) Pembelajaran terarah & bimbingan sesuai level, (4) Evaluasi formatif, (5) Perpindahan level (re-grouping) & Pengayaan.
   - Metode cocok: Pendampingan intensif, scaffolding, tutor sebaya, latihan berjenjang.
*PENTING: Jika data input memiliki "learningMethod" yang diisi secara spesifik oleh guru, maka kamu WAJIB menggunakan metode tersebut alih-alih metode otomatismu.
*Jika model yang dipilih di luar daftar di atas, gunakan pengetahuan AI terbaikmu untuk menentukan sintak baku dan metode yang paling relevan.

INSTRUKSI PENTING: Setiap kali menyusun Analisis CP, TP, ATP, atau Modul Ajar, WAJIB mengaitkan materi dengan minimal 3 dari 5 Panca Cinta, minimal 3 dari 10 Nilai PPRA, dan minimal 3 dari 8 DPL secara eksplisit dan relevan. Khusus untuk Modul Ajar, jabarkan skenario kegiatan selaras dengan Sintak Model Pembelajarannya.`;

  let userPrompt = `Buatkan konten JSON untuk dokumen ${docType} berdasarkan data berikut:\n${JSON.stringify(formData, null, 2)}\n\nPastikan data terisi lengkap, akurat, dan kaya akan nilai PPRA & Panca Cinta Kemenag.`;

  // Context Builder untuk Dokumen Administratif (TP, ATP, Prota, Prosem)
  if (["tp", "atp", "prota", "prosem"].includes(schemaKey)) {
    userPrompt = `Buatkan konten JSON untuk dokumen ${docType} berdasarkan data pendukung berikut:
${JSON.stringify(formData, null, 2)}

PENTING:
- Fokus utama Anda adalah merumuskan (reasoning) materi pokok, kompetensi, dan memecah Capaian Pembelajaran.
- ABAIKAN kalkulasi matematika presisi terkait "Alokasi JP" atau "kodeTp" karena sistem kami memiliki Data Normalizer yang akan menimpa angka JP dan kode TP tersebut. Anda cukup memberi estimasi nilai (misal 1 atau 2).
- Pastikan setiap array terisi dengan struktur yang valid.`;
  }

  // Context Builder untuk Modul Ajar Umum
  if (schemaKey === "modul_ajar_umum") {
    userPrompt = `Buatkan struktur MODUL AJAR UMUM (Informasi Umum, Komponen Inti dasar, Asesmen, dan Lampiran) untuk topik: ${formData.topik}. \nData pendukung:\n${JSON.stringify(formData, null, 2)}\n\n(Jangan masukkan detail kegiatan skenario per pertemuan, karena itu akan digenerate terpisah).`;
  }
  
  // Context Builder khusus untuk Pertemuan
  if (schemaKey === "modul_ajar_meeting" && meetingNumber > 0) {
    userPrompt = `Buatkan Skenario Kegiatan Belajar Mengajar (KBM) KHUSUS HANYA UNTUK PERTEMUAN KE-${meetingNumber} (dari total ${formData.jumlahPertemuan || 1} pertemuan).
Topik Utama: ${formData.topik}
Sub Topik/Fokus Pertemuan ini: Bebas tentukan oleh AI berdasarkan silabus logis untuk pertemuan ke-${meetingNumber}.
Model Pembelajaran: ${formData.model || 'Problem Based Learning (PBL)'}
Metode: ${formData.metode || 'Diskusi, Ceramah Interaktif'}

Penting:
- Berikan judul pertemuan yang relevan.
- Fokus sintak harus berisi nama fase model ${formData.model} yang akan dijalankan pada pertemuan ini.
- Untuk kegiatan Pendahuluan, Inti, dan Penutup: berikan skenario rinci (ucapan/aktivitas guru & siswa) yang mencerminkan nilai PPRA Kemenag.
- "pertemuanKe" WAJIB diisi dengan angka ${meetingNumber}.`;
  }

  try {
    const data = await generateJsonWithRepair(ai, generalKbcRules, userPrompt, schema, 2);
    // Temporary fallback for Phase 2: return JSON string wrapped in <pre> so UI can still render it without crashing
    const jsonHtml = `<div class="bg-slate-900 text-emerald-400 p-4 rounded-xl text-left font-mono text-xs overflow-x-auto whitespace-pre-wrap">${JSON.stringify(data, null, 2)}</div>`;
    return { status: "success", html: jsonHtml, data };
  } catch (err) {
    console.error("Failed to generate JSON for KBC API:", err);
    return { status: "error", message: String(err) };
  }
};
