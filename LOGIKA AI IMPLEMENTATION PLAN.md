# ANTIGRAVITY IDE — MASTER IMPLEMENTATION PLAN
## Refactoring AI Architecture Generator Perangkat Ajar KBC

Anda adalah **Lead AI Solutions Architect, Senior Full-Stack Engineer, LLM Application Engineer, Prompt Engineer, EdTech System Designer, dan QA Engineer**.

Tugas utama Anda adalah **mengaudit dan merefactor aplikasi Generator Perangkat Ajar KBC yang sudah ada** agar menerapkan arsitektur AI yang lebih stabil, hemat token, konsisten, mudah di-maintain, dan aman untuk menghasilkan 9 dokumen perangkat ajar.

---

# 0. ATURAN WAJIB SEBELUM MEMODIFIKASI KODE

JANGAN langsung melakukan rewrite besar.

Terlebih dahulu:

1. Baca seluruh struktur project.
2. Identifikasi framework.
3. Identifikasi entry point aplikasi.
4. Identifikasi state management.
5. Identifikasi komponen Form Tab 1.
6. Identifikasi komponen Form Tab 2.
7. Identifikasi service/API Gemini.
8. Identifikasi seluruh prompt yang digunakan.
9. Identifikasi parser output AI.
10. Identifikasi document renderer.
11. Identifikasi export Word/PDF.
12. Identifikasi storage/database.
13. Identifikasi authentication bila ada.
14. Identifikasi test/lint/typecheck/build command.

Jangan mengasumsikan nama file, framework, library, atau arsitektur.

Gunakan struktur project yang benar-benar ditemukan.

---

# 1. TUJUAN REFACTORING

Refactoring harus menghasilkan arsitektur:

```text
USER INPUT
   ↓
INPUT VALIDATION
   ↓
CANONICAL STATE
   ↓
CONTEXT BUILDER
   ↓
AI JOB
   ↓
STRUCTURED JSON
   ↓
SCHEMA VALIDATOR
   ↓
BUSINESS RULE VALIDATOR
   ↓
NORMALIZED DATASET
   ↓
DOCUMENT RENDERER
   ↓
DOCX / PDF / PRINT
```

Jangan menggunakan pola:

```text
FORM
↓
GIANT PROMPT
↓
GEMINI
↓
HTML RAKSASA
↓
FINAL DOCUMENT
```

---

# 2. PRINSIP DASAR

Terapkan prinsip berikut ke seluruh aplikasi:

> AI untuk reasoning dan generasi konten.  
> Program untuk kalkulasi.  
> State untuk penyimpanan.  
> ID untuk relasi.  
> Validator untuk verifikasi.  
> Renderer untuk layout.

Jangan meminta Gemini melakukan sesuatu yang sebenarnya bisa dilakukan deterministic oleh aplikasi.

---

# 3. DELIVERABLE UTAMA

Pada akhir implementasi harus tersedia:

### Architecture

- Canonical State
- Entity IDs
- Dependency graph
- Context Builders
- AI Job Manager
- Prompt Manager
- Schema Validation
- Business Validation
- Retry/Repair
- Versioning
- Document Renderer

### AI Pipeline

- ACP
- TP
- ATP
- Prota
- Prosem
- KKTP
- Module Plan
- Meeting Detail
- LKPD
- Rubrik

### UX

- Auto-fill TP
- Searchable TP selector
- Preset learning model
- Structured syntax editor
- Numeric time controls
- Progress indicator
- Per-job retry
- Stale-data warning

### Reliability

- Tidak ada giant AI call untuk seluruh dokumen
- Tidak ada AI-generated administrative ID
- Tidak ada AI-generated final HTML sebagai source of truth
- Tidak ada kalkulasi JP oleh AI
- Tidak ada full-state injection untuk setiap request

---

# 4. PHASE 0 — CODEBASE AUDIT

Sebelum coding, lakukan audit.

Buat file/dokumen internal:

```text
docs/AI_ARCHITECTURE_AUDIT.md
```

Isi minimal:

```text
1. Existing architecture
2. Framework
3. State management
4. Gemini integration
5. Prompt files
6. Tab 1 components
7. Tab 2 components
8. Document generators
9. Storage
10. Export system
11. Existing problems
12. Files that will change
13. Migration strategy
```

Jangan berhenti pada daftar file. Jelaskan dependency antar bagian.

---

# 5. PHASE 1 — CANONICAL STATE

Implementasikan canonical state.

Gunakan struktur konseptual:

```typescript
interface AppState {
  school: SchoolContext;
  curriculum: CurriculumContext;
  cp: CPData;

  tp: TujuanPembelajaran[];
  atp: ATPItem[];

  planning: {
    prota: ProtaItem[];
    prosem: ProsemItem[];
  };

  kktp: KKTPItem[];

  modules: {
    plans: ModulePlan[];
    meetings: MeetingDetail[];
    lkpds: LKPDData[];
    rubrics: RubricData[];
  };

  calendar: CalendarData;

  aiJobs: AIJob[];

  versions: VersionRegistry;
}
```

Sesuaikan naming/type dengan project existing.

---

# 6. SINGLE SOURCE OF TRUTH

Hilangkan duplikasi source-of-truth.

Data berikut hanya boleh memiliki satu sumber utama:

```text
Nama sekolah
Nama guru
Kepala sekolah
Mata pelajaran
Fase
Tahun Pelajaran
TP
ATP
```

Jangan menyimpan versi editable dari data yang sama di:

```text
formData
formDataModul
moduleForm
documentData
```

Jika legacy state masih diperlukan, buat adapter sementara.

---

# 7. LEGACY MIGRATION ADAPTER

Jika project existing menggunakan:

```javascript
formData
formDataModul
```

jangan langsung menghapusnya.

Buat:

```text
legacyToCanonicalState()
```

dan jika perlu:

```text
canonicalToLegacyState()
```

Pindahkan komponen satu per satu.

Setelah seluruh komponen pindah, hapus legacy adapter.

---

# 8. PHASE 2 — DOMAIN ENTITY ID

Buat internal ID untuk:

- CP
- Elemen
- TP
- ATP
- Prota
- Prosem
- Module
- Meeting
- LKPD
- Rubrik

Contoh:

```typescript
interface TujuanPembelajaran {
  id: string;
  code: string;
  elementId: string;
  elementName: string;
  rumusan: string;
  sequence: number;
}
```

Internal `id` tidak boleh sama konsepnya dengan `code`.

---

# 9. KODE TP HARUS DETERMINISTIC

JANGAN meminta Gemini menentukan kode final.

Gemini hanya menghasilkan:

```text
element
sequence
rumusan
```

Application Engine menghasilkan:

```text
[SINGKATAN]-[FASE]-[ELEMEN]-[NO]
```

Contoh:

```text
PAI-E-AKD-001
PAI-E-AKD-002
PAI-E-AKD-003
```

Buat service:

```text
generateTPCode()
```

Buat unit test untuk service tersebut.

---

# 10. PHASE 3 — INPUT VALIDATION

Sebelum AI dipanggil, semua input wajib divalidasi.

Minimal:

```text
schoolName required
subject required
level required
year required
totalJp > 0
jpPerMinggu > 0
cpElemen required
tpId required for module
jumlahPertemuan >= 1
jpPerPertemuan > 0
```

Bila invalid:

```text
NO AI REQUEST
```

Error harus muncul dekat field terkait.

---

# 11. PHASE 4 — AI JOB MANAGER

Buat abstraction:

```typescript
interface AIJob {
  id: string;

  type:
    | "ACP"
    | "TP"
    | "ATP"
    | "PROTA"
    | "PROSEM"
    | "KKTP"
    | "MODULE_PLAN"
    | "MEETING"
    | "LKPD"
    | "RUBRIC";

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

Implementasikan:

```text
createJob()
runJob()
retryJob()
cancelJob()
getJobStatus()
```

Jangan membuat setiap component melakukan API call Gemini secara langsung.

Semua AI request harus melalui AI service/job abstraction.

---

# 12. PHASE 5 — CONTEXT BUILDERS

Buat context builder terpisah:

```text
buildACPContext()
buildTPContext()
buildATPContext()
buildProtaContext()
buildProsemContext()
buildKKTPContext()
buildModulePlanContext()
buildMeetingContext()
buildLKPDContext()
buildRubricContext()
```

JANGAN mengirim:

```text
entireAppState
```

ke Gemini.

Setiap AI job hanya menerima context minimum yang dibutuhkan.

---

# 13. PHASE 6 — PROMPT ARCHITECTURE

Pisahkan:

```text
CORE SYSTEM RULES
DOMAIN RULES
TASK PROMPT
CONTEXT
OUTPUT SCHEMA
```

Struktur folder jika cocok dengan project:

```text
prompts/
  core/
  curriculum/
  module/
  assessment/
  tasks/
```

Gunakan abstraction:

```text
buildPrompt(jobType, context)
```

---

# 14. CORE SYSTEM PROMPT

System prompt global harus pendek.

Gunakan prinsip seperti:

```text
Anda adalah mesin generasi perangkat ajar KBC.

Gunakan bahasa Indonesia.
Gunakan hanya context yang diberikan.
Jangan mengarang fakta.
Jangan mengubah nilai deterministic.
Ikuti output schema.
Integrasikan KBC secara relevan.
Kembalikan output sesuai kontrak.
```

Jangan memasukkan seluruh aturan dokumen ke system prompt global.

---

# 15. DOMAIN RULES

Pisahkan:

```text
CURRICULUM_RULES
MODULE_RULES
ASSESSMENT_RULES
```

Jangan mengirim aturan Modul Ajar ketika sedang membuat ATP.

Jangan mengirim aturan Prosem ketika sedang membuat KKTP.

---

# 16. POSITIVE OUTPUT CONTRACT

Kurangi penggunaan instruksi negatif seperti:

```text
JANGAN pakai table
JANGAN pakai markdown
JANGAN ...
```

Utamakan:

```text
OUTPUT = JSON
FIELD scenario = array of activities
FIELD activity = object
FIELD html = forbidden / not requested
```

Lebih penting lagi:

**Jika HTML tidak dibutuhkan AI, jangan meminta AI membuat HTML sama sekali.**

---

# 17. PHASE 7 — OUTPUT SCHEMA

Semua AI output wajib memiliki schema.

Jika project menggunakan:

```text
Zod
Ajv
Yup
Joi
```

gunakan library yang sudah ada.

Jangan menambahkan dependency tanpa kebutuhan.

Contoh TP schema:

```text
{
  tp: [
    {
      elementId,
      sequence,
      rumusan,
      kko
    }
  ]
}
```

Setelah schema valid:

```text
application generates id
application generates code
application persists result
```

---

# 18. BUSINESS RULE VALIDATOR

Schema validation saja tidak cukup.

Buat:

```text
validateTP()
validateATP()
validateProta()
validateProsem()
validateKKTP()
validateModule()
validateMeeting()
```

Contoh:

```text
tpId harus ada
tpId harus benar-benar terdaftar
totalMinutes harus benar
jumlah meeting harus sesuai
alokasi JP tidak boleh negatif
```

---

# 19. PHASE 8 — AI REPAIR

Jika schema gagal:

```text
AI
 ↓
parse
 ↓
schema validation
 ↓
FAIL
 ↓
repair request
 ↓
AI
```

Repair request hanya mengirim:

```text
previous output
validation errors
required correction
```

Jangan mengirim ulang seluruh context jika tidak perlu.

Maximum retry:

```text
2
```

Bila tetap gagal:

```text
job = failed
```

dan tampilkan error yang bisa dipahami user.

---

# 20. PHASE 9 — DOC 1 ACP

Implementasikan:

```text
CP
 ↓
ACP AI Job
 ↓
JSON
 ↓
Validator
 ↓
ACP Dataset
 ↓
Renderer
```

AI bertugas:

- analisis;
- ekstraksi kompetensi;
- KKO;
- interpretasi KBC.

Renderer bertugas:

- tabel;
- heading;
- kop;
- signature;
- pagination.

---

# 21. PHASE 10 — DOC 2 TP

Flow:

```text
CP
 ↓
TP AI
 ↓
TP Schema Validator
 ↓
Application ID Generator
 ↓
Application Code Generator
 ↓
TP Dataset
```

AI tidak membuat code final.

AI juga tidak menentukan numeric total JP final.

---

# 22. PHASE 11 — DOC 3 ATP

Input:

```text
TP Dataset
```

AI hanya menghasilkan:

```text
sequence
predecessor relationship
pedagogical rationale
```

Contoh:

```json
{
  "atp": [
    {
      "tpId": "tp_001",
      "sequence": 1,
      "predecessorIds": []
    }
  ]
}
```

Diagram ATP harus di-render oleh aplikasi.

Jangan meminta Gemini menggambar ASCII/HTML final.

Renderer dapat menggunakan HTML/SVG/CSS deterministic.

---

# 23. PHASE 12 — DETERMINISTIC TIME ENGINE

Buat:

```text
calculateMeetingDuration()
calculateTotalCourseMinutes()
validateTimeAllocation()
```

Contoh:

```text
2 JP × 45 = 90
```

Aplikasi menghasilkan:

```text
opening = 15
core = 60
closing = 15
```

Jangan meminta AI menghitung nilai tersebut.

AI hanya menerima hasil final sebagai constraint.

---

# 24. PHASE 13 — CALENDAR ENGINE

Buat atau gunakan calendar engine yang sudah tersedia.

Calendar engine bertanggung jawab atas:

```text
bulan
minggu
minggu efektif
libur
PTS
PAS
semester
```

AI tidak boleh mengarang kalender.

Bila kalender memerlukan input spesifik sekolah, minta data tersebut dari user/admin.

Jangan menggunakan asumsi "kewajaran kalender nasional" sebagai source of truth bila data kalender nyata tersedia.

---

# 25. PHASE 14 — DOC 4 PROTA

Flow:

```text
TP Dataset
+
ATP Dataset
+
Calendar Dataset
+
JP Constraints
 ↓
Planning Engine
 ↓
AI Assistance jika diperlukan
 ↓
Validation
 ↓
Prota Dataset
```

Application Engine memastikan:

```text
sum(alokasi JP) === totalJp
```

AI tidak menjadi sumber final untuk kalkulasi.

---

# 26. PHASE 15 — DOC 5 PROSEM

Ini harus sepenuhnya memakai pendekatan:

```text
DATA FIRST
RENDER SECOND
```

Flow:

```text
Calendar Dataset
+
TP
+
ATP
+
Planning
 ↓
Prosem Engine
 ↓
Prosem Dataset
 ↓
Renderer
```

AI tidak boleh menghasilkan grid HTML final.

---

# 27. PROSEM DATA STRUCTURE

Gunakan struktur semacam:

```json
{
  "month": "September",
  "week": 1,
  "status": "ACTIVE",
  "tpIds": ["tp_003"],
  "jp": 2
}
```

Status:

```text
ACTIVE
HOLIDAY
PTS
PAS
OTHER
```

Renderer menentukan class CSS.

Contoh:

```text
active
holiday
pts
pas
```

AI tidak menentukan CSS.

---

# 28. PHASE 16 — DOC 6 KKTP

KKTP menggunakan TP Dataset.

AI membuat descriptor.

Application menentukan:

```text
level
score range
ordering
tpId
```

Pastikan:

```text
TP → KKTP
```

menggunakan `tpId`.

Jangan mengandalkan copy-paste rumusan TP.

---

# 29. PHASE 17 — TAB 2 / MODULE

Tab 2 harus membaca canonical TP Dataset.

JANGAN gunakan manual:

```text
Kode TP
Elemen CP
Rumusan TP
```

sebagai input bebas.

Gunakan:

```text
Searchable Select
Autocomplete
Dropdown
```

Flow:

```text
Pilih TP
 ↓
tpId
 ↓
auto-fill kode
 ↓
auto-fill elemen
 ↓
auto-fill rumusan
```

Field auto-fill:

```text
read-only
```

---

# 30. LEARNING MODEL UI

`learningModel` menggunakan preset.

Contoh:

```text
Problem Based Learning
Project Based Learning
Inquiry
Discovery Learning
Cooperative Learning
Contextual Learning
Direct Instruction
```

Tetap sediakan:

```text
Custom
```

untuk kebutuhan khusus.

---

# 31. SINTAK MODEL

Untuk model preset:

```text
learningModel
 ↓
master syntax
```

simpan sebagai array.

Contoh:

```json
[
  "Orientasi masalah",
  "Mengorganisasikan peserta didik",
  "Membimbing penyelidikan",
  "Mengembangkan hasil",
  "Evaluasi"
]
```

UI menggunakan:

```text
editable reorderable list
```

bukan textarea panjang.

---

# 32. NUMBER INPUT

Gunakan numeric controls untuk:

```text
jumlahPertemuan
jpPerPertemuan
jpPerMinggu
totalJp
```

Jangan simpan:

```text
"2 JP"
```

Simpan:

```text
2
```

---

# 33. PHASE 18 — MODULE PLAN

Jangan menghasilkan semua pertemuan sekaligus.

Flow:

```text
TP
+
Learning Model
+
Syntax
+
Jumlah Pertemuan
+
Topik Lokal
+
Time Constraints
 ↓
MODULE PLAN AI JOB
 ↓
Schema Validator
 ↓
Module Plan Dataset
```

Contoh:

```json
{
  "meetings": [
    {
      "meeting": 1,
      "tpIds": ["tp_001"],
      "focus": "...",
      "concepts": []
    }
  ]
}
```

---

# 34. PHASE 19 — MEETING DETAIL

Setiap pertemuan menjadi AI job terpisah.

```text
MEETING 1 → JOB
MEETING 2 → JOB
MEETING 3 → JOB
...
```

Jika Meeting 2 gagal:

```text
retry Meeting 2
```

Jangan generate ulang Meeting 1 dan 3.

---

# 35. MEETING CONTEXT

Meeting AI menerima hanya:

```text
Module Context
+
Current Meeting Plan
+
relevant TP
+
time constraints
+
KBC mapping
```

Jangan mengirim:

```text
seluruh CP
seluruh ATP
seluruh Prota
seluruh Prosem
```

kecuali bagian tersebut benar-benar relevan.

---

# 36. MODUL AJAR OUTPUT

AI menghasilkan structured content:

```json
{
  "meeting": 1,
  "duration": {
    "total": 90,
    "opening": 15,
    "core": 60,
    "closing": 15
  },
  "activities": [
    {
      "stage": "opening",
      "teacher": "...",
      "student": "...",
      "script": "...",
      "pc": "Cinta Ilmu",
      "ppra": ["Ta'addub"]
    }
  ]
}
```

AI tidak menghasilkan HTML.

---

# 37. PC / PPRA STRATEGY

Jangan memaksa seluruh Panca Cinta dan 10 PPRA muncul secara verbal pada setiap aktivitas.

Gunakan contextual mapping.

Contoh:

```json
{
  "pc": {
    "primary": "Cinta Ilmu",
    "secondary": "Cinta Diri"
  },
  "ppra": ["Ta'addub"]
}
```

Anotasi menjadi metadata.

Renderer dapat menampilkan metadata sesuai template dokumen.

---

# 38. SCRIPT GURU

`script` tetap dipertahankan.

Namun jangan membuat script sangat panjang.

Gunakan:

```text
1 aktivitas
→ 1 script singkat
```

bila memang diperlukan.

Tujuannya menjaga operasionalitas tanpa menyebabkan token explosion.

---

# 39. PHASE 20 — DOC 8 LKPD

LKPD tidak boleh memulai dari prompt generik jika Module Dataset telah tersedia.

Gunakan:

```text
Module Dataset
+
TP Dataset
+
Meeting Plan
+
relevant Meeting Detail
+
Topik Lokal
 ↓
LKPD Context Builder
 ↓
LKPD AI Job
 ↓
Validator
 ↓
LKPD Dataset
 ↓
Renderer
```

Jika Module belum tersedia, LKPD boleh menggunakan fallback context minimum dari TP.

---

# 40. PHASE 21 — DOC 9 RUBRIK

Rubrik juga menggunakan shared dataset.

Flow:

```text
TP
+
Module
+
Activity/Product
+
Assessment Intent
 ↓
Rubric Context Builder
 ↓
Rubric AI Job
 ↓
Validator
 ↓
Rubric Dataset
```

Jangan regenerate Module untuk membuat Rubrik.

---

# 41. MODULE / LKPD / RUBRIC RELATIONSHIP

Gunakan:

```text
TP
 ↓
MODULE PLAN
 ├── MEETING
 ├── LKPD
 └── RUBRIC
```

Bukan:

```text
TP → Module
TP → LKPD
TP → Rubric
```

dengan masing-masing berdiri sendiri tanpa hubungan.

---

# 42. PHASE 22 — DOCUMENT RENDERER

Pisahkan:

```text
Content Generation
```

dan:

```text
Document Rendering
```

AI:

```text
JSON
```

Renderer:

```text
JSON
 ↓
Template
 ↓
HTML
 ↓
CSS
 ↓
DOCX/PDF/PRINT
```

---

# 43. HTML/CSS

AI tidak boleh menjadi sumber final untuk:

```text
CSS
A4 layout
page break
header
footer
signature
table widths
colors
margin
font
```

Semua itu harus berasal dari renderer.

---

# 44. ATP DIAGRAM RENDERING

AI memberikan:

```text
relationship graph
```

Renderer menghasilkan:

```text
SVG / HTML / CSS
```

Jangan menggunakan ASCII sebagai sumber final kecuali benar-benar diperlukan.

---

# 45. PROSEM COLOR SYSTEM

Gunakan renderer CSS:

```text
ACTIVE
HOLIDAY
PTS
PAS
```

Jangan meminta AI memilih warna.

CSS didefinisikan aplikasi.

---

# 46. DOCUMENT TEMPLATE

Template A4 harus deterministic.

Pastikan tersedia:

```text
kop
judul
header
body
table
signature
footer
page-break
```

Dokumen tidak boleh tergantung pada keberhasilan AI menulis markup secara benar.

---

# 47. PHASE 23 — VERSIONING

Tambahkan:

```text
version
updatedAt
```

minimal pada:

```text
TP
ATP
Module Plan
Meeting
LKPD
Rubric
```

---

# 48. STALE DATA DETECTION

Jika:

```text
TP version = 2
Module source TP version = 1
```

tampilkan warning:

> Dokumen ini menggunakan versi TP yang lebih lama.

Jangan otomatis merusak dokumen lama.

---

# 49. DOCUMENT SNAPSHOT

Saat export final, simpan metadata:

```json
{
  "documentId": "...",
  "generatedAt": "...",
  "sourceVersions": {
    "tp": 2,
    "atp": 1,
    "module": 3
  }
}
```

Tujuannya agar dokumen lama dapat dilacak sumbernya.

---

# 50. PHASE 24 — LAZY LOADING

Dokumen berat jangan otomatis generate.

Gunakan:

```text
ACP → ketika diminta
TP → ketika diminta
ATP → ketika diminta
Prota → ketika diminta
Prosem → ketika diminta
KKTP → ketika diminta
Module → ketika dibuka
Meeting → ketika diminta
LKPD → ketika diminta
Rubric → ketika diminta
```

---

# 51. PARALLEL EXECUTION

Setelah TP final:

```text
ATP
KKTP
Planning analysis
```

dapat dijalankan paralel jika memang tidak saling membutuhkan output.

Jangan parallel jika dependency belum final.

---

# 52. SEQUENTIAL EXECUTION

Gunakan sequential:

```text
CP
 ↓
TP
 ↓
ATP
```

dan:

```text
TP
 ↓
Module Plan
 ↓
Meeting Detail
```

---

# 53. AI JOB STATE UI

Tampilkan:

```text
ACP             ✓
TP              ✓
ATP             ⏳
Prota           ○
Prosem          ○
KKTP            ○
```

Untuk Modul:

```text
Module Plan     ✓
Meeting 1       ✓
Meeting 2       ⏳
Meeting 3       ○
```

---

# 54. RETRY UI

Setiap failed job memiliki:

```text
[Generate Ulang]
```

Jangan:

```text
[Generate Semua Lagi]
```

sebagai satu-satunya opsi.

---

# 55. CACHE / REUSE

Jika Module Plan sudah berhasil:

```text
do not regenerate
```

saat user meminta:

```text
LKPD
Rubrik
```

Reuse dataset yang sudah tersedia.

---

# 56. TOKEN OPTIMIZATION

Untuk setiap AI job, lakukan:

```text
REMOVE DUPLICATE CONTEXT
REMOVE UNUSED RULES
REMOVE HTML
REMOVE CSS
REMOVE FULL APPLICATION STATE
REMOVE DUPLICATED TP TEXT
```

Pertahankan:

```text
minimum context
structured input
compact schema
```

---

# 57. CHUNKING STRATEGY

Gunakan chunking untuk:

### PROSEM

Jangan generate entire HTML grid dalam satu call.

### MODULE

Jangan generate N meeting detail sekaligus.

### ATP

Jangan generate diagram HTML secara langsung.

### LKPD

Jangan membuat seluruh modul ulang.

### RUBRIC

Jangan membuat ulang seluruh learning context.

---

# 58. FEW-SHOT

Gunakan few-shot hanya untuk pola yang sulit.

Contoh TP:

```text
BAD:
Peserta didik memahami ...

GOOD:
Peserta didik mampu menjelaskan ...
```

Contoh activity:

```text
GOOD:
teacher
student
script
pc
ppra
```

Jangan gunakan few-shot berupa dokumen HTML panjang.

---

# 59. CHAIN-OF-THOUGHT

Jangan meminta AI mengeluarkan reasoning panjang.

Gunakan intermediate structured data:

```text
CP Analysis
 ↓
TP Dataset
 ↓
ATP Relationship
 ↓
Planning Dataset
```

Aplikasi menggunakan intermediate representation tersebut.

---

# 60. RAG

Jangan gunakan RAG untuk menyimpan relasi:

```text
TP
ATP
Prota
Prosem
Module
```

Gunakan canonical database/state.

RAG hanya digunakan bila project membutuhkan pencarian knowledge/reference seperti:

```text
pedoman kurikulum
regulasi
referensi pembelajaran
dokumen kebijakan
```

---

# 61. KBC / PPRA POLICY

Buat mapping terstruktur.

Contoh:

```typescript
interface KBCMapping {
  primaryPC: string;
  secondaryPC?: string;
  ppra: string[];
}
```

Jangan menyisipkan penjelasan panjang KBC berulang-ulang ke setiap prompt.

---

# 62. PHASE 25 — TESTING

Buat test untuk:

## State

- canonical state
- migration
- persistence

## TP

- code generation
- uniqueness
- sequence

## Time

- JP calculation
- duration validation

## Dependency

- tpId
- stale data

## AI

- parse JSON
- schema validation
- retry
- repair

## Document

- renderer
- export
- snapshot

---

# 63. TEST CASE — TIME

Input:

```text
2 JP
45 minutes per JP
```

Expected:

```text
90 minutes
```

Validation:

```text
15 + 60 + 15 = 90
```

Tidak boleh lolos:

```text
15 + 50 + 15
```

---

# 64. TEST CASE — TP CODE

Input:

```text
PAI
E
AKD
1
```

Expected:

```text
PAI-E-AKD-001
```

Sequence 2:

```text
PAI-E-AKD-002
```

---

# 65. TEST CASE — MODULE

Input:

```text
tpId = tp_002
jumlahPertemuan = 3
jpPerPertemuan = 2
```

Expected:

```text
Meeting 1 = 90
Meeting 2 = 90
Meeting 3 = 90
```

---

# 66. TEST CASE — FAILURE ISOLATION

Jika:

```text
Meeting 1 = success
Meeting 2 = fail
Meeting 3 = success
```

maka:

```text
retry only Meeting 2
```

---

# 67. TEST CASE — TP RELATIONSHIP

Jika:

```text
module.tpId = tp_002
```

maka module harus mendapatkan:

```text
kode TP tp_002
elemen tp_002
rumusan tp_002
```

Tidak boleh mengambil TP lain.

---

# 68. TEST CASE — STALE DATA

Jika:

```text
TP current version = 2
Module source TP version = 1
```

maka:

```text
show stale warning
```

dan jangan silent overwrite.

---

# 69. BUILD SAFETY

Setelah setiap phase:

1. run lint;
2. run typecheck jika tersedia;
3. run unit tests;
4. run build;
5. cek runtime errors.

Jika salah satu gagal:

```text
STOP PHASE PROGRESSION
FIX ERROR
THEN CONTINUE
```

Jangan menumpuk banyak perubahan di atas build yang sudah rusak.

---

# 70. FILE CHANGE DISCIPLINE

Jangan membuat banyak file baru tanpa alasan.

Sebelum membuat file baru, tentukan apakah functionality dapat ditempatkan di:

```text
existing service
existing utility
existing domain module
```

Pertahankan struktur project yang sudah baik.

---

# 71. JANGAN MELAKUKAN

Jangan:

```text
rewrite entire application
switch framework
switch database
switch AI provider
remove working export feature
remove existing user data
replace working UI tanpa alasan
```

kecuali audit membuktikan benar-benar diperlukan.

---

# 72. IMPLEMENTATION ORDER

Gunakan urutan:

```text
PHASE 0  Audit
PHASE 1  Canonical State
PHASE 2  Entity IDs
PHASE 3  Validation
PHASE 4  AI Job Manager
PHASE 5  Context Builders
PHASE 6  Prompt Architecture
PHASE 7  Schema Validation
PHASE 8  Repair/Retry
PHASE 9  ACP
PHASE 10 TP
PHASE 11 ATP
PHASE 12 Time Engine
PHASE 13 Calendar Engine
PHASE 14 Prota
PHASE 15 Prosem
PHASE 16 KKTP
PHASE 17 Module Selector
PHASE 18 Module Plan
PHASE 19 Meeting Jobs
PHASE 20 LKPD
PHASE 21 Rubric
PHASE 22 Document Renderer
PHASE 23 Versioning
PHASE 24 Lazy Load
PHASE 25 Testing
PHASE 26 Cleanup
```

---

# 73. PRIORITY LEVEL

## P0 — MUST FIX

```text
Giant AI generation
AI-generated code
AI time calculations
AI-generated final HTML
Duplicate source-of-truth
No schema validator
```

## P1 — HIGH

```text
AI Job Manager
Context Builders
Retry
Module Plan
Meeting per job
TP selector
```

## P2 — MEDIUM

```text
Versioning
Stale warnings
Advanced caching
Prompt analytics
```

## P3 — POLISH

```text
animations
micro-interactions
advanced visual improvements
```

Jangan mengerjakan P3 sebelum P0 selesai.

---

# 74. TARGET DATA FLOW

```text
                 SCHOOL
                    │
                 CURRICULUM
                    │
                    ▼
                    CP
                    │
                   ACP
                    │
                    ▼
                   TP
                    │
        ┌───────────┼────────────┐
        ▼           ▼            ▼
       ATP         KKTP       PLANNING
        │                        │
        │                        ▼
        │                      PROTA
        │                        │
        │                        ▼
        │                      PROSEM
        │
        ▼
    MODULE PLAN
        │
   ┌────┼─────┐
   ▼    ▼     ▼
 M1     M2    M3
   │    │     │
   └────┼─────┘
        ▼
   MODULE DATASET
      ┌──┴──┐
      ▼     ▼
    LKPD  RUBRIC
```

---

# 75. TARGET AI FLOW

```text
SMALL CONTEXT
     ↓
TASK PROMPT
     ↓
GEMINI
     ↓
JSON
     ↓
SCHEMA VALIDATOR
     ↓
BUSINESS VALIDATOR
     ↓
PERSIST
```

Jika gagal:

```text
JSON
 ↓
VALIDATOR
 ↓
FAIL
 ↓
REPAIR
 ↓
GEMINI
```

---

# 76. TARGET DOCUMENT FLOW

```text
CANONICAL DATA
      ↓
DOCUMENT DATASET
      ↓
RENDERER
      ↓
HTML/CSS
      ↓
DOCX / PDF / PRINT
```

Bukan:

```text
Gemini
 ↓
HTML
 ↓
Docx
```

---

# 77. ACCEPTANCE CRITERIA

Refactoring dinyatakan berhasil jika:

### Data

- seluruh dokumen menggunakan canonical state;
- TP memiliki internal ID;
- TP memiliki kode deterministic;
- Modul menyimpan tpId;
- dependency antar dokumen eksplisit.

### AI

- AI calls telah dipecah berdasarkan tugas;
- context setiap request minimal;
- output structured JSON;
- schema validation berjalan;
- retry per job tersedia.

### Math

- JP dihitung aplikasi;
- waktu divalidasi aplikasi;
- kalender dikelola engine.

### UX

- TP searchable selector;
- auto-fill;
- learning model preset;
- syntax structured;
- numeric controls;
- progress;
- retry per item.

### Documents

- AI tidak menghasilkan final layout;
- renderer menghasilkan HTML/CSS;
- Prosem grid deterministic;
- ATP diagram deterministic;
- export existing tetap bekerja.

### KBC

- Panca Cinta tetap terintegrasi;
- PPRA tetap tersedia;
- integrasi tidak repetitif/artificial;
- metadata KBC tersedia pada dataset.

### Performance

- tidak ada full-app-state injection;
- tidak ada giant output yang tidak diperlukan;
- dokumen berat lazy-generated;
- context reusable;
- retry tidak menyebabkan full regeneration.

---

# 78. FINAL ARCHITECTURE RULE

Sepanjang implementasi, patuhi satu aturan:

> **Never ask the LLM to generate, calculate, remember, validate, or render something that the application can deterministically store, calculate, validate, or render.**

Dan aturan kedua:

> **Never regenerate data that already exists as a valid canonical dataset.**

Dan aturan ketiga:

> **Never make one failed AI generation invalidate unrelated successful work.**

---

# 79. OUTPUT YANG HARUS ANTIGRAVITY LAPORKAN

Setelah setiap phase, tampilkan ringkasan:

```text
PHASE:
STATUS:
FILES CHANGED:
KEY CHANGES:
TESTS RUN:
BUILD STATUS:
KNOWN ISSUES:
NEXT PHASE:
```

Setelah seluruh implementasi:

```text
FINAL ARCHITECTURE SUMMARY
MIGRATED COMPONENTS
LEGACY COMPONENTS REMAINING
AI JOBS
VALIDATORS
RENDERERS
TEST COVERAGE
KNOWN LIMITATIONS
```

Jangan menyatakan implementasi selesai jika terdapat build error, type error, atau regression yang belum diselesaikan.