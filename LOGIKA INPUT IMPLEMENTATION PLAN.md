# IMPLEMENTATION PLAN
## Refactoring & Optimization — Generator Perangkat Ajar Kurikulum Berbasis Cinta (KBC)

Anda bertindak sebagai **Senior Software Architect, Full-Stack Engineer, AI Application Engineer, Prompt Engineer, dan UX Engineer**.

Tugas Anda adalah melakukan **refactoring menyeluruh** terhadap aplikasi **Generator Perangkat Ajar Kurikulum Berbasis Cinta (KBC)** yang sedang dikembangkan.

Jangan hanya memperbaiki tampilan. Ubah arsitektur aplikasi agar menerapkan prinsip:

> **AI untuk berpikir.  
> Program untuk menghitung.  
> State untuk menyimpan.  
> ID untuk menghubungkan.  
> Validator untuk memeriksa.  
> Renderer untuk mencetak.**

Tujuan akhir:

1. Mengurangi beban context window AI.
2. Mengurangi hallucination.
3. Mencegah output cut-off.
4. Menghilangkan input manual yang sebenarnya dapat diotomatisasi.
5. Menjamin konsistensi TP → ATP → Prota → Prosem → KKTP → Modul Ajar.
6. Memastikan perhitungan JP dilakukan aplikasi, bukan AI.
7. Menghasilkan output AI terstruktur dan tervalidasi.
8. Memudahkan retry ketika satu proses AI gagal.
9. Meningkatkan UX guru.
10. Memisahkan data akademik, proses AI, dan rendering dokumen.
11. Menjadikan aplikasi lebih mudah dikembangkan di masa depan.

---

# BAGIAN 1 — PRINSIP ARSITEKTUR BARU

Implementasikan arsitektur:

```text
USER INPUT
    ↓
VALIDATION ENGINE
    ↓
CANONICAL STATE
    ↓
AI GENERATION PIPELINE
    ↓
STRUCTURED JSON
    ↓
OUTPUT VALIDATOR
    ↓
NORMALIZED DATASET
    ↓
DOCUMENT RENDERER
    ↓
WORD / PDF / PRINT
```

Jangan lagi menggunakan pola:

```text
FORM
 ↓
PROMPT PANJANG
 ↓
AI
 ↓
FINAL DOCUMENT
```

---

# BAGIAN 2 — CANONICAL STATE

Hapus ketergantungan terhadap dua state besar yang saling menduplikasi:

```javascript
formData
formDataModul
```

Jika kode lama masih menggunakan keduanya, lakukan refactoring secara bertahap tanpa merusak fitur existing.

Gunakan satu sumber data utama:

```javascript
const appState = {
  school: {
    kemenagOffice: "",
    schoolName: "",
    teacher: "",
    nipTeacher: "",
    principal: "",
    nipPrincipal: "",
    cityDate: ""
  },

  curriculum: {
    subject: "",
    singkatanMapel: "",
    level: "",
    year: "",
    totalJp: 0,
    jpPerMinggu: 0,
    learningModel: ""
  },

  cp: {
    rasional: "",
    elemen: []
  },

  tp: [],

  atp: [],

  planning: {
    prota: [],
    prosem: []
  },

  kktp: [],

  module: {
    tpId: null,
    learningModel: "",
    sintakModel: [],
    jumlahPertemuan: 0,
    jpPerPertemuan: 0,
    minutesPerJp: 45,
    topikLokal: ""
  },

  meetingPlan: [],

  meetingDetails: [],

  generation: {
    status: "idle",
    currentJob: null,
    progress: 0,
    errors: []
  }
};
```

Gunakan struktur tersebut sebagai referensi arsitektur. Sesuaikan dengan struktur project existing bila framework/TypeScript/domain model berbeda.

---

# BAGIAN 3 — SINGLE SOURCE OF TRUTH

Pastikan data yang sama tidak diduplikasi di banyak tempat.

Contoh:

Nama sekolah hanya boleh bersumber dari:

```javascript
appState.school.schoolName
```

Jangan membuat:

```javascript
formData.schoolName
formDataModul.schoolName
module.schoolName
document.schoolName
```

yang semuanya dapat diedit sendiri.

Untuk Modul Ajar, gunakan reference:

```javascript
module.tpId
```

Kemudian data TP diperoleh dari:

```javascript
tp = appState.tp.find(item => item.id === module.tpId)
```

---

# BAGIAN 4 — GUNAKAN INTERNAL ID

Setiap entitas akademik harus mempunyai internal ID.

Contoh:

```javascript
{
  id: "tp_001",
  kode: "PAI-E-AKD-001",
  elemenId: "elemen_akidah_001",
  elemenName: "Akidah",
  rumusan: "..."
}
```

Pisahkan:

```text
id   = identifier internal aplikasi
kode = kode administratif yang ditampilkan pada dokumen
```

Jangan menggunakan kode administratif sebagai primary key.

ID harus stabil walaupun format kode administratif nantinya berubah.

---

# BAGIAN 5 — MASTER DATA TP

TP harus menjadi dataset terstruktur.

Minimal:

```typescript
interface TujuanPembelajaran {
  id: string;
  kode: string;
  elemenId?: string;
  elemenName: string;
  rumusan: string;
  kko?: string[];
  alokasiJp?: number;
  urutan: number;
}
```

Pastikan setiap TP mempunyai:

- ID unik
- kode
- elemen
- rumusan
- urutan

Jika memungkinkan simpan metadata AI seperti:

```text
sourceCp
competency
knowledge
skill
attitude
```

tetapi jangan menambahkan field tanpa kebutuhan nyata.

---

# BAGIAN 6 — TAB 1: CURRICULUM ENGINE

Tab 1 tidak lagi melakukan satu AI call besar.

Pisahkan pipeline.

## Pipeline:

```text
STEP 1
CP → CP Analysis

STEP 2
CP Analysis → TP

STEP 3
TP → ATP

STEP 4
TP + Planning Constraints → Prota

STEP 5
TP + Prota + Planning Constraints → Prosem

STEP 6
TP → KKTP
```

Jangan menjalankan:

```text
CP → TP + ATP + Prota + Prosem + KKTP
```

dalam satu AI request.

---

# BAGIAN 7 — AI JOB MANAGER

Buat abstraction khusus untuk AI generation.

Contoh:

```typescript
interface AiJob {
  id: string;
  type:
    | "CP_ANALYSIS"
    | "TP_GENERATION"
    | "ATP_GENERATION"
    | "PROTA_GENERATION"
    | "PROSEM_GENERATION"
    | "KKTP_GENERATION"
    | "MODULE_PLAN"
    | "MEETING_DETAIL";

  status:
    | "queued"
    | "running"
    | "success"
    | "failed"
    | "retrying";

  input: unknown;
  output?: unknown;
  error?: string;
  retryCount: number;
}
```

Buat service:

```text
AiJobManager
```

yang menangani:

- queue
- execution
- retry
- error handling
- progress
- cancellation bila memungkinkan
- logging

---

# BAGIAN 8 — CHUNKING STRATEGY

Setiap AI request harus mempunyai context sekecil mungkin.

AI hanya menerima data yang diperlukan untuk tugas tersebut.

Contoh TP generation:

```text
CP yang relevan
+
aturan TP
+
format JSON
```

Jangan mengirim:

```text
CP
ATP
Prota
Prosem
KKTP
Modul
Panca Cinta
PPRA
```

secara bersamaan.

---

# BAGIAN 9 — OUTPUT AI HARUS STRUCTURED JSON

Jangan menggunakan output AI berbentuk dokumen final sebagai source of truth.

AI harus menghasilkan JSON.

Contoh TP:

```json
{
  "tp": [
    {
      "kode": "PAI-E-AKD-001",
      "elemen": "Akidah",
      "rumusan": "Peserta didik mampu ...",
      "urutan": 1
    }
  ]
}
```

Contoh ATP:

```json
{
  "atp": [
    {
      "id": "atp_001",
      "tpId": "tp_001",
      "sequence": 1,
      "alur": "..."
    }
  ]
}
```

Contoh Module Plan:

```json
{
  "meetingPlan": [
    {
      "meeting": 1,
      "tpIds": ["tp_001"],
      "focus": "...",
      "concepts": ["..."]
    }
  ]
}
```

---

# BAGIAN 10 — JSON SCHEMA VALIDATION

Buat schema validator untuk setiap AI output.

Gunakan library validation yang sudah digunakan project bila ada, misalnya:

```text
Zod
Yup
Joi
Ajv
```

Jangan menambahkan library baru bila project sudah memiliki solusi setara.

Validator minimal memastikan:

```text
JSON valid
field wajib ada
type benar
ID valid
kode valid
urutan valid
angka tidak negatif
array tidak kosong jika diwajibkan
```

---

# BAGIAN 11 — VALIDATION + REPAIR LOOP

Gunakan pola:

```text
AI
 ↓
JSON Parser
 ↓
Schema Validator
 ↓
VALID?
 ├── YES → simpan
 └── NO
       ↓
    Repair Request
       ↓
       AI
```

Repair request tidak perlu mengirim ulang seluruh context besar.

Kirim hanya:

```text
output sebelumnya
+
error validation
+
aturan perbaikan
```

Batasi retry, misalnya:

```javascript
MAX_RETRY = 2
```

Jangan membuat infinite loop.

---

# BAGIAN 12 — PERHITUNGAN JP WAJIB DILAKUKAN APLIKASI

AI tidak boleh menjadi sumber utama perhitungan waktu.

Buat utility:

```javascript
calculateDuration()
```

Contoh:

```javascript
const totalMinutes =
  jpPerPertemuan * minutesPerJp;
```

Default:

```text
1 JP = 45 menit
```

tetapi jangan hard-code jika aplikasi nantinya membutuhkan konfigurasi.

---

# BAGIAN 13 — TIME ALLOCATION ENGINE

Buat:

```typescript
interface MeetingDuration {
  totalMinutes: number;
  openingMinutes: number;
  coreMinutes: number;
  closingMinutes: number;
}
```

Buat function:

```javascript
calculateMeetingDuration({
  jpPerPertemuan,
  minutesPerJp
})
```

Kemudian tentukan pembagian awal melalui rule engine.

Contoh:

```text
90 menit
15 pembuka
60 inti
15 penutup
```

Tetapi sistem harus mampu memvalidasi:

```text
opening + core + closing === totalMinutes
```

AI tidak boleh mengubah total durasi.

---

# BAGIAN 14 — TAB 2: MODULE ENGINE

Tab 2 harus menggunakan TP dari dataset Tab 1.

Jangan meminta guru mengetik:

```text
Kode TP
Elemen CP
Rumusan TP
```

secara manual.

Gunakan:

```text
Dropdown / Searchable Select / Autocomplete
```

Flow:

```text
Guru klik "Pilih TP"
       ↓
Cari TP
       ↓
Pilih TP
       ↓
tpId disimpan
       ↓
Kode TP otomatis tampil
       ↓
Elemen CP otomatis tampil
       ↓
Rumusan TP otomatis tampil
```

Field otomatis:

```text
Kode TP
Elemen CP
Rumusan TP
```

harus read-only.

---

# BAGIAN 15 — MODULE CONTEXT FILTERING

Saat membuat Modul Ajar, jangan mengirim seluruh state Tab 1.

Buat function:

```javascript
buildModuleContext(tpId)
```

Function tersebut hanya menghasilkan:

```javascript
{
  tpId,
  kodeTp,
  elemenCp,
  rumusanTp,
  learningModel,
  sintakModel,
  jumlahPertemuan,
  jpPerPertemuan,
  minutesPerJp,
  topikLokal
}
```

Dengan demikian implementasi menggunakan prinsip:

```text
Shared Canonical State
+
Context Filtering
```

bukan duplikasi state.

---

# BAGIAN 16 — LEARNING MODEL

Field:

```text
learningModel
```

jangan hanya berupa free text.

Buat daftar preset:

```text
Problem Based Learning
Project Based Learning
Inquiry
Discovery Learning
Cooperative Learning
Contextual Teaching and Learning
Direct Instruction
dan model lain yang memang sudah tersedia pada aplikasi
```

Sediakan:

```text
Custom
```

untuk model di luar preset.

---

# BAGIAN 17 — SINTAK MODEL

Untuk model preset, sintaks otomatis berasal dari master data.

Contoh:

```javascript
learningModels = {
  PBL: [
    "...",
    "...",
    "..."
  ],

  PJBL: [
    "...",
    "...",
    "..."
  ]
}
```

Jika model diganti:

```text
PBL → PJBL
```

sintaks otomatis berubah.

Sediakan opsi:

```text
Edit Sintaks
```

Tetapi simpan sintaks sebagai array:

```javascript
[
  "Langkah 1",
  "Langkah 2",
  "Langkah 3"
]
```

bukan satu textarea panjang.

Gunakan UI:

```text
Tag / Reorderable List
```

agar guru dapat:

- menambah;
- menghapus;
- mengedit;
- mengurutkan.

---

# BAGIAN 18 — JUMLAH PERTEMUAN

`jumlahPertemuan` harus berupa:

```text
Number Input / Stepper
```

dengan validation.

Contoh:

```text
minimum = 1
maximum = 20
```

Sesuaikan batas maksimum dengan kebutuhan project.

---

# BAGIAN 19 — JP PER PERTEMUAN

Gunakan:

```text
Number Input / Select
```

bukan text field.

Simpan angka:

```javascript
jpPerPertemuan: 2
```

Bukan:

```javascript
jpPerPertemuan: "2 JP"
```

---

# BAGIAN 20 — MASTER MEETING PLAN

Jangan langsung meminta AI membuat 3–10 pertemuan secara detail.

Tahap pertama:

```text
Module Plan
```

AI hanya menentukan:

```text
Pertemuan 1
fokus
TP yang dicakup
konsep

Pertemuan 2
fokus
TP yang dicakup
konsep

Pertemuan 3
...
```

Contoh:

```json
{
  "meetingPlan": [
    {
      "meeting": 1,
      "tpIds": ["tp_001"],
      "focus": "Pengenalan konsep",
      "concepts": ["..."]
    },
    {
      "meeting": 2,
      "tpIds": ["tp_001"],
      "focus": "Penerapan",
      "concepts": ["..."]
    }
  ]
}
```

---

# BAGIAN 21 — MEETING DETAIL GENERATION

Setelah Module Plan valid:

```text
Meeting Plan
      ↓
Generate Meeting 1
      ↓
Validator
      ↓
Generate Meeting 2
      ↓
Validator
      ↓
Generate Meeting 3
      ↓
Validator
```

Jangan meminta AI mengeluarkan seluruh detail seluruh pertemuan sekaligus kecuali user secara eksplisit memilih mode batch.

---

# BAGIAN 22 — SETIAP MEETING MERUPAKAN AI JOB

Contoh:

```text
MODULE_PLAN → success

MEETING_1 → success
MEETING_2 → failed
MEETING_3 → success
```

User cukup melakukan:

```text
[Generate Ulang Pertemuan 2]
```

Jangan menghasilkan ulang seluruh modul.

---

# BAGIAN 23 — KONSISTENSI ANTAR PERTEMUAN

Meeting detail harus menerima:

```text
Module Context
+
Master Meeting Plan
+
Meeting sebelumnya yang relevan
+
Meeting saat ini
+
constraint waktu
```

Tetapi jangan memberikan seluruh dokumen jika tidak dibutuhkan.

Gunakan context minimum.

Pastikan:

```text
TP
konsep
terminologi
target kompetensi
```

tetap konsisten.

---

# BAGIAN 24 — KBC / PANCA CINTA

Jangan memaksa semua kategori Panca Cinta muncul secara verbal di setiap bagian.

Gunakan mapping:

```json
{
  "pancaCinta": {
    "primary": "Cinta Ilmu",
    "secondary": "Cinta Alam"
  }
}
```

AI harus memasukkan nilai hanya jika relevan terhadap konteks pembelajaran.

Hindari output seperti:

```text
Cinta Ilmu:
...

Cinta Alam:
...

Cinta Bangsa:
...

Cinta Diri:
...
```

di setiap aktivitas jika tidak diperlukan.

Tujuannya adalah integrasi pedagogis yang natural, bukan sekadar menempelkan label.

---

# BAGIAN 25 — PPRA

PPRA juga jangan selalu dipaksakan sebagai paragraf tambahan.

Gunakan metadata/mapping.

Contoh:

```json
{
  "ppra": [
    "Ta'addub",
    "Qudwah"
  ]
}
```

Jika dokumen membutuhkan anotasi, renderer dapat menampilkannya.

Dengan cara ini AI tidak harus terus-menerus menulis ulang penjelasan panjang.

---

# BAGIAN 26 — UNIVERSAL SYSTEM PROMPT

Pisahkan:

```text
SYSTEM RULES
```

dengan:

```text
TASK PROMPT
```

System prompt berisi aturan global yang benar-benar permanen.

Contoh:

```text
Anda adalah AI Generator Perangkat Ajar KBC.

Aturan global:
- Gunakan bahasa Indonesia.
- Jangan mengarang fakta.
- Ikuti schema output.
- Jangan menambahkan pengantar.
- Jangan menambahkan kesimpulan yang tidak diminta.
- Integrasikan KBC secara relevan.
- Ikuti seluruh constraint yang diberikan aplikasi.
- Jangan mengubah angka yang telah ditentukan engine.
- Keluarkan hanya format output yang diminta.
```

Jangan memasukkan seluruh context akademik tahunan dalam system prompt.

---

# BAGIAN 27 — TASK PROMPT

Task prompt hanya berisi pekerjaan saat itu.

Contoh:

```text
Tugas:
Buat detail Pertemuan 2.

TP:
...

Elemen:
...

Model Pembelajaran:
...

Sintaks:
...

Total Durasi:
90 menit

Pembuka:
15 menit

Inti:
60 menit

Penutup:
15 menit

Topik Lokal:
...
```

Jangan mengulang universal rules panjang setiap request jika API sudah mendukung system message.

---

# BAGIAN 28 — AI PROMPT BUILDER

Buat abstraction:

```javascript
buildPrompt(jobType, context)
```

atau architecture equivalent.

Setiap job mempunyai prompt template sendiri.

Contoh:

```text
prompts/
  cpAnalysisPrompt
  tpPrompt
  atpPrompt
  protaPrompt
  prosemPrompt
  kktpPrompt
  modulePlanPrompt
  meetingDetailPrompt
```

Jangan menyimpan semua prompt dalam satu file raksasa.

---

# BAGIAN 29 — PROTA DAN PROSEM

Gunakan AI hanya untuk aspek yang memerlukan interpretasi pedagogis.

Perhitungan dan mapping numeriknya dilakukan program.

Jika:

```text
totalJp = 72
jpPerMinggu = 4
```

jangan meminta AI menghitung semuanya dari nol.

Buat planning engine yang menjaga constraint:

```text
sum(alokasiJp) === totalJp
```

dan:

```text
weeklyAllocation
```

harus konsisten dengan konfigurasi aplikasi.

AI dapat membantu menentukan distribusi pedagogis, tetapi final validation dilakukan aplikasi.

---

# BAGIAN 30 — KKTP

KKTP harus mereferensikan:

```text
tpId
```

bukan hanya menyalin rumusan TP secara bebas.

Contoh:

```json
{
  "tpId": "tp_003",
  "kodeTp": "PAI-E-AKD-003",
  "criteria": [
    "..."
  ],
  "assessment": {
    "technique": "...",
    "instrument": "..."
  }
}
```

Dengan demikian jika rumusan TP diubah melalui UI, sistem dapat mendeteksi dokumen yang terdampak.

---

# BAGIAN 31 — DOCUMENT RENDERER

Pisahkan AI dari proses pencetakan.

Arsitektur:

```text
AI JSON
 ↓
Normalized Dataset
 ↓
Document Renderer
 ↓
Word
PDF
HTML
Print
```

AI tidak boleh bertanggung jawab atas:

- layout A4;
- border;
- margin;
- page break;
- kop;
- footer;
- tanda tangan;
- nomor halaman;
- table width.

Semua tersebut ditangani renderer.

---

# BAGIAN 32 — PRINT-READY OUTPUT

Pertahankan kebutuhan:

```text
Print-ready A4
```

tetapi jadikan renderer deterministic.

AI hanya menghasilkan:

```text
content
```

Renderer menentukan:

```text
layout
style
pagination
```

---

# BAGIAN 33 — UI/UX TAB 1

Buat alur UX berbasis progress.

Contoh:

```text
① Informasi Sekolah
② Kurikulum
③ CP
④ Generate TP
⑤ Review TP
⑥ Generate ATP
⑦ Review
⑧ Planning
⑨ KKTP
```

Jangan memaksa guru menekan satu tombol untuk menghasilkan semuanya tanpa review.

Sediakan status:

```text
Belum dibuat
Sedang diproses
Berhasil
Perlu review
Gagal
```

---

# BAGIAN 34 — UI/UX TAB 2

Alur:

```text
1. Pilih TP
2. Periksa tujuan
3. Tentukan model
4. Periksa sintaks
5. Tentukan jumlah pertemuan
6. Tentukan JP
7. Masukkan topik lokal
8. Generate Master Plan
9. Review
10. Generate Detail Pertemuan
11. Review
12. Generate LKPD
13. Generate Rubrik
14. Export
```

---

# BAGIAN 35 — READ-ONLY DATA

Data berikut tidak boleh diketik ulang pada Tab 2:

```text
Kode TP
Elemen CP
Rumusan TP
Nama sekolah
Nama guru
Kepala sekolah
Tahun pelajaran
Mata pelajaran
Fase
```

Data tersebut harus berasal dari canonical state.

---

# BAGIAN 36 — TOPIK LOKAL

`topikLokal` tetap boleh menggunakan free text.

Namun berikan UX:

```text
Textarea
+
Suggestion
+
Recent Topics
```

Contoh:

```text
Pelestarian lingkungan sekitar
Tradisi masyarakat
Kegiatan sosial desa
Budaya lokal
```

Jangan memaksa guru memilih preset jika konteks lokal bersifat unik.

---

# BAGIAN 37 — INPUT VALIDATION

Validasi sebelum AI dipanggil.

Contoh:

```text
schoolName        required
subject           required
level             required
year              required
totalJp            > 0
jpPerMinggu       > 0
cpElemen          required
tpId              required pada Modul
jumlahPertemuan   >= 1
jpPerPertemuan    > 0
```

Jika gagal:

```text
jangan panggil AI
```

Tampilkan pesan error yang jelas dan berada dekat field terkait.

---

# BAGIAN 38 — AUTO-GENERATED SINGKATAN MAPEL

`singkatanMapel` jangan selalu meminta input manual.

Sistem harus mencoba generate otomatis dari nama mapel.

Contoh:

```text
Pendidikan Agama Islam
→ PAI
```

Guru dapat mengubahnya secara manual bila diperlukan.

Validasi:

```text
uppercase
tanpa spasi ilegal
karakter terbatas
```

---

# BAGIAN 39 — KODE TP GENERATOR

Kode TP sebaiknya dihasilkan deterministic.

Contoh:

```text
{SINGKATAN}-{FASE}-{ELEMEN}-{SEQUENCE}
```

Contoh:

```text
PAI-E-AKD-001
PAI-E-AKD-002
PAI-E-AKD-003
```

AI tidak perlu menciptakan kode tersebut.

AI cukup menghasilkan:

```text
elemen
rumusan
urutan
```

Program membuat kode final.

Ini penting untuk mencegah AI menghasilkan kode tidak konsisten.

---

# BAGIAN 40 — ERROR RECOVERY

Setiap job AI harus dapat:

```text
retry
retry failed item
view error
continue other jobs
```

Jangan menghentikan seluruh pipeline hanya karena satu job gagal.

Contoh:

```text
TP Generation
✓ TP 1
✓ TP 2
✗ TP 3
✓ TP 4
```

Sistem dapat melakukan retry hanya untuk TP 3 bila arsitekturnya memungkinkan.

---

# BAGIAN 41 — PROGRESS INDICATOR

Jangan hanya menampilkan:

```text
Generating...
```

Tampilkan:

```text
Analisis CP       ✓
Generate TP       ✓
Generate ATP      ⏳
Generate Prota    ○
Generate Prosem   ○
Generate KKTP     ○
```

Untuk Modul:

```text
Master Plan       ✓
Pertemuan 1       ✓
Pertemuan 2       ⏳
Pertemuan 3       ○
```

---

# BAGIAN 42 — PERSISTENCE

Jika aplikasi sudah menggunakan localStorage/database/backend, gunakan persistence untuk canonical state.

Pastikan progress tidak hilang ketika:

- browser refresh;
- AI job gagal;
- pindah tab;
- membuka kembali modul.

Gunakan mekanisme persistence yang sesuai dengan stack project.

Jangan menambahkan backend baru jika belum dibutuhkan.

---

# BAGIAN 43 — DEPENDENCY GRAPH

Pastikan perubahan data mempunyai relasi jelas.

Contoh:

```text
CP
 ↓
TP
 ↓
ATP
 ↓
Prota
 ↓
Prosem

TP
 ↓
KKTP

TP
 ↓
Module
 ↓
Meeting Plan
 ↓
Meeting Detail
 ↓
LKPD
 ↓
Rubric
```

Jangan biarkan Modul hanya menyimpan hasil copy-paste TP.

Simpan:

```text
tpId
```

sebagai dependency.

---

# BAGIAN 44 — DETEKSI DATA STALE

Jika TP berubah setelah Modul dibuat, sistem harus dapat mendeteksi:

```text
TP updated
```

dan memberi warning:

> Modul Ajar ini menggunakan versi TP yang lebih lama.

Bila mudah diterapkan, gunakan:

```javascript
version
updatedAt
```

pada dataset penting.

---

# BAGIAN 45 — VERSIONING

Minimal entitas berikut mempunyai:

```text
version
updatedAt
```

yaitu:

```text
TP
ATP
Module
Meeting Plan
Meeting Detail
```

Tidak perlu membuat sistem version control kompleks; cukup metadata yang berguna untuk dependency tracking.

---

# BAGIAN 46 — SECURITY DAN API KEY

Jangan menyimpan API key secara hard-coded di frontend.

Jika aplikasi memang membutuhkan environment variables, gunakan mekanisme existing project.

Contoh:

```text
.env
```

atau secret manager sesuai arsitektur existing.

Jangan menampilkan secret dalam log.

---

# BAGIAN 47 — LOGGING

Buat logging yang aman untuk debugging.

Catat:

```text
jobId
jobType
timestamp
duration
status
retryCount
validationStatus
```

Jangan mencatat API key.

Jangan log seluruh data sensitif siswa/guru bila tidak diperlukan.

---

# BAGIAN 48 — PERFORMA

Prioritaskan:

```text
small prompts
small responses
incremental generation
cache
retry per job
structured output
```

Hindari:

```text
giant prompt
giant context
giant response
one-shot generation
```

---

# BAGIAN 49 — MIGRATION STRATEGY

Jangan langsung menghapus implementation lama sebelum pipeline baru terbukti bekerja.

Gunakan tahapan:

## Phase 1
Audit code existing.

Identifikasi:

```text
state
forms
AI services
prompt builders
document renderer
API integration
storage
```

Buat dependency map internal.

## Phase 2
Implement canonical state.

## Phase 3
Implement TP dataset + IDs.

## Phase 4
Refactor Tab 1 pipeline.

## Phase 5
Refactor Tab 2 TP selection.

## Phase 6
Implement Master Meeting Plan.

## Phase 7
Implement Meeting Detail jobs.

## Phase 8
Implement schema validation.

## Phase 9
Refactor renderer.

## Phase 10
UX polish + migration cleanup.

Jangan menghapus fitur existing yang belum memiliki replacement.

---

# BAGIAN 50 — JANGAN MERUSAK FITUR EXISTING

Selama refactoring:

- pertahankan fitur export yang sudah bekerja;
- pertahankan template dokumen;
- pertahankan koneksi API yang sudah bekerja;
- pertahankan data user;
- pertahankan styling existing kecuali memang perlu diubah;
- jangan mengganti framework;
- jangan mengganti database;
- jangan mengganti provider AI;
- jangan melakukan rewrite project total tanpa alasan.

Lakukan perubahan secara incremental.

---

# BAGIAN 51 — BACKWARD COMPATIBILITY

Jika state lama masih digunakan:

```javascript
formData
formDataModul
```

buat adapter sementara:

```javascript
legacyToCanonicalState()
```

dan bila diperlukan:

```javascript
canonicalToLegacyState()
```

Tujuannya agar komponen lama tetap dapat berjalan selama proses migrasi.

Setelah semua fitur berpindah, hapus adapter yang sudah tidak diperlukan.

---

# BAGIAN 52 — TESTING

Buat test minimal untuk:

## State

```text
school
curriculum
tp
atp
planning
module
```

## Utility

```text
calculateDuration
generateTpCode
calculatePlanningAllocation
```

## Validation

```text
TP schema
ATP schema
Meeting schema
```

## Relationships

```text
tpId valid
kode valid
missing TP detected
```

## AI jobs

```text
success
validation failure
retry
permanent failure
```

---

# BAGIAN 53 — TIME TEST CASE

Pastikan:

```text
2 JP × 45 = 90 menit
```

validator menerima:

```text
15 + 60 + 15 = 90
```

Tetapi menolak:

```text
15 + 50 + 15 = 80
```

atau:

```text
20 + 60 + 20 = 100
```

---

# BAGIAN 54 — TP CODE TEST CASE

Input:

```text
subject = PAI
level = E
element = AKD
sequence = 1
```

Expected:

```text
PAI-E-AKD-001
```

Sequence 2:

```text
PAI-E-AKD-002
```

AI tidak boleh menentukan kode final.

---

# BAGIAN 55 — MODULE SELECTION TEST CASE

Jika database:

```text
tp_001
tp_002
tp_003
```

Guru memilih:

```text
tp_002
```

Maka:

```text
module.tpId === "tp_002"
```

dan:

```text
kodeTp
elemenCp
rumusanTp
```

harus otomatis mengambil data dari TP tersebut.

---

# BAGIAN 56 — MEETING TEST CASE

Input:

```text
jumlahPertemuan = 3
jpPerPertemuan = 2
minutesPerJp = 45
```

Expected:

```text
meeting 1 = 90 min
meeting 2 = 90 min
meeting 3 = 90 min
```

Jika Meeting 2 gagal:

```text
Meeting 1 = tetap berhasil
Meeting 3 = tetap berhasil
Meeting 2 = retryable
```

---

# BAGIAN 57 — AI OUTPUT TEST CASE

Jika AI mengembalikan:

```json
{
  "meeting": 2,
  "activities": []
}
```

padahal field wajib tidak lengkap:

```text
validator → FAIL
```

Kemudian repair request dijalankan.

---

# BAGIAN 58 — ACCEPTANCE CRITERIA

Implementasi dianggap berhasil hanya apabila:

### A. State

- Tidak ada duplikasi source-of-truth yang tidak diperlukan.
- Tab 1 dan Tab 2 menggunakan canonical state.
- Modul menggunakan `tpId`.

### B. AI

- Tidak ada lagi giant one-shot generation untuk semua dokumen.
- Prompt setiap job hanya membawa context yang diperlukan.
- Output AI berupa structured JSON.
- Output divalidasi schema.

### C. Calculation

- JP dihitung oleh program.
- AI tidak boleh mengubah total durasi.
- Total alokasi harus tervalidasi.

### D. UX

- Kode TP tidak perlu diketik manual.
- Elemen CP dan Rumusan TP auto-fill.
- Model pembelajaran menggunakan preset.
- Sintaks menggunakan structured list.
- JP menggunakan numeric/select input.
- Jumlah pertemuan menggunakan numeric input.

### E. Reliability

- AI job memiliki retry.
- Failure satu job tidak merusak semua job.
- Progress ditampilkan.
- Error ditampilkan dengan jelas.

### F. Documents

- AI tidak menentukan layout.
- Renderer menentukan layout.
- Existing export tetap bekerja.
- Output tetap print-ready.

---

# BAGIAN 59 — PRIORITAS IMPLEMENTASI

Kerjakan dengan urutan berikut:

```text
P0 — Audit existing codebase
P1 — Canonical State
P2 — Entity ID + TP Dataset
P3 — Input Validation
P4 — TP/ATP Pipeline
P5 — Planning Engine
P6 — Tab 2 TP Selector
P7 — Module Context Filtering
P8 — Module Plan
P9 — Meeting AI Jobs
P10 — JSON Schema Validator
P11 — Retry/Repair System
P12 — KBC/PPRA Mapping
P13 — Document Renderer separation
P14 — UX refinement
P15 — Tests
P16 — Cleanup legacy code
```

Jangan melompat ke P14 sebelum arsitektur P1–P12 stabil.

---

# BAGIAN 60 — ATURAN SAAT MENGEDIT CODE

Sebelum mengubah file:

1. Baca struktur project.
2. Identifikasi framework.
3. Identifikasi state manager.
4. Identifikasi AI service.
5. Identifikasi API integration.
6. Identifikasi document renderer.
7. Identifikasi storage.
8. Identifikasi komponen Tab 1.
9. Identifikasi komponen Tab 2.

Setelah itu buat dependency map.

Jangan berasumsi nama file atau framework.

---

# BAGIAN 61 — CARA EKSEKUSI DI ANTIGRAVITY

Jangan langsung menulis seluruh refactor sekaligus.

Lakukan:

```text
AUDIT
 ↓
IMPLEMENT
 ↓
RUN TEST
 ↓
VERIFY
 ↓
CONTINUE
```

Setiap fase harus:

1. membaca code terkait;
2. membuat perubahan minimal;
3. menjalankan lint/typecheck/test bila tersedia;
4. memastikan build tetap berjalan;
5. baru melanjutkan fase berikutnya.

Jika terdapat error akibat perubahan, selesaikan terlebih dahulu sebelum lanjut.

---

# BAGIAN 62 — OUTPUT YANG HARUS DIBERIKAN ANTIGRAVITY SETELAH AUDIT

Sebelum implementasi besar dimulai, buat laporan internal dengan format:

```text
1. Existing Architecture
2. Existing State Structure
3. Existing AI Flow
4. Existing Prompt Structure
5. Existing Document Rendering
6. Existing Risks
7. Files Affected
8. Proposed Migration Order
```

Kemudian implementasikan plan ini tanpa menunggu konfirmasi tambahan selama tidak ada blocker teknis nyata.

---

# BAGIAN 63 — FINAL TARGET ARCHITECTURE

Target akhir:

```text
                    ┌───────────────────┐
                    │    SCHOOL DATA    │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │ CANONICAL STATE   │
                    └─────────┬─────────┘
                              │
              ┌───────────────┼────────────────┐
              │               │                │
              ▼               ▼                ▼
         CP ENGINE       CURRICULUM       MODULE ENGINE
                            ENGINE              │
              │               │                 │
              ▼               ▼                 ▼
             TP             ATP            MODULE PLAN
              │               │                 │
              ├───────────────┤                 ▼
              │                         MEETING JOBS
              ▼                              │
            KKTP                             ▼
              │                         VALIDATED JSON
              ▼                              │
          PROTA/PROSEM                         │
              │                                │
              └──────────────┬─────────────────┘
                             ▼
                    NORMALIZED DATASET
                             │
                             ▼
                     DOCUMENT RENDERER
                             │
                    ┌────────┼────────┐
                    ▼        ▼        ▼
                   DOCX     PDF      PRINT
```

---

# BAGIAN 64 — PRINSIP FINAL

Jaga prinsip berikut selama seluruh implementasi:

```text
DO NOT:
- membuat AI menghitung angka yang dapat dihitung program;
- membuat guru mengetik ulang data yang sudah tersedia;
- mengirim seluruh state ke setiap AI request;
- mengandalkan prompt untuk menjamin format;
- mengandalkan AI untuk membuat kode ID;
- membuat satu AI request menghasilkan seluruh sistem dokumen;
- menyimpan dokumen final sebagai satu-satunya source of truth.

DO:
- gunakan canonical state;
- gunakan internal ID;
- gunakan dataset terstruktur;
- gunakan context filtering;
- gunakan chunked AI jobs;
- gunakan JSON schema;
- gunakan validator;
- gunakan retry;
- gunakan deterministic calculation;
- gunakan document renderer;
- tampilkan progress;
- izinkan retry per item;
- pertahankan existing functionality.
```

## HASIL AKHIR YANG DIHARAPKAN

Setelah refactoring selesai, guru seharusnya dapat melakukan:

```text
Input data sekolah
       ↓
Masukkan CP
       ↓
Generate TP
       ↓
Review TP
       ↓
Generate ATP
       ↓
Generate Prota/Prosem
       ↓
Generate KKTP
       ↓
Pilih TP
       ↓
Modul Ajar otomatis mengambil data TP
       ↓
Tentukan model + sintaks
       ↓
Tentukan jumlah pertemuan + JP
       ↓
Generate Master Plan
       ↓
Generate setiap pertemuan
       ↓
Generate LKPD / Rubrik
       ↓
Validate
       ↓
Export Word / PDF
```

Dengan demikian aplikasi tidak lagi bergantung pada "AI yang harus mengingat semuanya", tetapi memiliki **arsitektur data yang mengikat seluruh perangkat ajar melalui relasi ID dan dataset yang konsisten**.