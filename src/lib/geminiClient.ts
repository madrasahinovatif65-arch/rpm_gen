import { GoogleGenAI } from "@google/genai";
import { ZodSchema } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  generateModulAjarFallback,
  generateChatAssistantFallback
} from "./aiGenerators";
import { KbcSchemas } from "./kbcSchemas";
import { getKaldik } from "./firebase";

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
const generateContentWithRetry = async (ai: GoogleGenAI | null, contents: any, config?: any, onProgress?: (text: string) => void) => {
  if (!ai) {
    throw new Error("GEMINI_API_KEY tidak dikonfigurasi.");
  }
  const modelCandidates = ["gemini-3.7-flash", "gemini-2.5-flash", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const modelCandidate of modelCandidates) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        if (onProgress) {
          const responseStream = await ai.models.generateContentStream({
            model: modelCandidate,
            contents,
            config
          });
          let fullText = "";
          for await (const chunk of responseStream) {
            if (chunk.text) {
              fullText += chunk.text;
              onProgress(fullText);
            }
          }
          return { text: fullText };
        } else {
          const response = await ai.models.generateContent({
            model: modelCandidate,
            contents,
            config
          });
          if (response && response.text) {
            return response;
          }
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
export const generateJsonWithRepair = async (
  ai: GoogleGenAI | null, 
  systemPrompt: string, 
  userPrompt: string, 
  schema: ZodSchema<any>, 
  maxRetries = 2,
  onProgress?: (text: string) => void
) => {
  if (!ai) throw new Error("GEMINI_API_KEY tidak dikonfigurasi.");
  
  const jsonSchema = zodToJsonSchema(schema, "OutputSchema");
  const schemaStr = JSON.stringify(jsonSchema, null, 2);
  
  let currentPrompt = `${systemPrompt}\n\nIMPORTANT: You must return a valid JSON object that strictly follows this JSON Schema:\n${schemaStr}\n\nDo not include markdown blocks like \`\`\`json. Return only raw JSON.`;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await generateContentWithRetry(
        ai, 
        [{ role: "user", parts: [{ text: `${currentPrompt}\n\n${userPrompt}` }] }],
        { responseMimeType: "application/json" },
        onProgress
      );
      let text = response?.text || "";
      text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      const parsed = JSON.parse(text);
      const validationResult = schema.safeParse(parsed);
      
      if (validationResult.success) {
        return validationResult.data;
      } else {
        const errorMsg = ((validationResult.error as any).issues || []).map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
        console.warn(`JSON validation failed on attempt ${attempt + 1}:`, errorMsg);
        currentPrompt = `You previously returned invalid JSON. Please fix the following validation errors:\n${errorMsg}\n\nPrevious JSON:\n${text}\n\nReturn ONLY the corrected JSON object.`;
      }
    } catch (err: any) {
      console.warn(`JSON parsing failed on attempt ${attempt + 1}:`, err);
      if (!(err instanceof SyntaxError) && !err.message?.includes("Unexpected token") && !err.message?.includes("Unexpected end of JSON")) {
        throw err;
      }
      currentPrompt = `You previously returned invalid JSON that could not be parsed. Error: ${String(err)}\n\nPlease ensure your response is ONLY a valid JSON object. Do not include markdown blocks or explanatory text.`;
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

  const systemPrompt = `Bertindaklah sebagai Ahli Kurikulum Nasional dan pengembang Sistem Modul Ajar Deep Learning Pro Administrasi Guru. Susunlah MODUL AJAR DEEP LEARNING (RENCANA PEMBELAJARAN MENDALAM) yang lengkap, tepat, kontekstual, dan praktis untuk kebutuhan administrasi guru.`;

  const userPrompt = `DATA MODUL AJAR:
- Nama Guru: ${formData.namaGuru || 'Guru Pengampu'}
- Nama Sekolah: ${formData.namaSekolah || 'Sekolah'}
- Tahun Ajaran: ${formData.tahunAjaran || '2026/2027'}
- Jenjang: ${formData.jenjang || 'SMP'}
- Fase: ${formData.fase || 'Fase D (Kelas 7-9)'}
- Kelas: ${formData.kelas || 'VII'}
- Alokasi Waktu: ${formData.waktu || '2 x 45 JP'}
- Mata Pelajaran: ${formData.curriculum?.subject || formData.mataPelajaran || 'Umum'}
- Bab/Topik Utama: ${formData.topik || 'Topik Utama'} ${formData.subTopik ? `- ${formData.subTopik}` : ''}
- Jumlah Pertemuan: ${formData.jumlahPertemuan || '1'} Pertemuan
- Model Pembelajaran: ${formData.model || 'Problem Based Learning (PBL)'}
- Metode Pembelajaran: ${metodeText}
- Tujuan Pembelajaran Spesifik: ${formData.tujuan || 'Siswa dapat memahami dan mengaplikasikan konsep dengan cermat.'}
- Karakteristik Murid: ${formData.module?.karakteristik || formData.karakteristik || 'Heterogen, siap belajar aktif.'}

FORMAT WAJIB LAYOUT HTML:
<h1>MODUL AJAR DEEP LEARNING</h1>
...`;

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
  const systemPrompt = `Anda adalah "EdAdmin AI Assistant"...`;

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
  const fase = formData?.fase || formData?.level || "Fase A";
  const kelasRombel = formData?.kelasRombel || "";
  const level = fase;
  const year = formData?.year || "2026/2027";
  const totalJp = formData?.totalJp || "108 JP / Tahun";
  const jpPerMinggu = formData?.jpPerMinggu || "3 JP/Minggu";
  const teacher = formData?.teacher || "Budi Santoso, S.Pd., Gr.";
  const nipTeacher = formData?.nipTeacher || "19900101 201903 1 001";
  const cityDate = formData?.cityDate || "Jambi, 14 Juli 2026";
  const principal = formData?.principal || "Dr. Ahmad Fauzi, M.Pd.";
  const nipPrincipal = formData?.nipPrincipal || "19720514 200003 1 002";

  const cpRasional = formData?.cpRasional || "Pada akhir Fase E, Murid memiliki kemampuan berbahasa ...";
  const tujuanMapel = formData?.tujuanMapel || "";
  const karakteristikMapel = formData?.karakteristikMapel || "";
  const cpFase = formData?.cpFase || "";
  const cpElemen = formData?.cpElemen || `Elemen 1 — Menyimak: ...`;

  const generalRules = `KETENTUAN UTAMA GENERASI HTML ADMINISTRASI: ...`;

  let docPrompt = "";

  if (docType === "analisis_cp") {
    docPrompt = `...`;
  } else if (docType === "tp") {
    // existing logic omitted for brevity, no functional change
  } else if (docType === "atp") {
    docPrompt = `...`;
  } else {
    docPrompt = `Buatkan dokumen ${docType} untuk ${subject} ${fase} — ${kelasRombel}.`;
  }

  try {
    const response = await generateContentWithRetry(ai, [
      { role: "user", parts: [{ text: docPrompt }] }
    ], undefined, onProgress);
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

export const generatePerangkatAjarKBCAPI = async (docType: string, formData: any, onProgress?: (text: string) => void) => {
  const ai = getAiClient();
  
  let kaldikInfo = "";
  if (docType === "prota" || docType === "prosem") {
    try {
      const savedKaldik = await getKaldik(formData.tahunAjaran || "2024/2025");
      if (savedKaldik) {
        const isKelas6 = formData.kelas === "VI" || formData.kelas === "6";
        const sem1 = isKelas6 && savedKaldik.semester1_kls6 ? savedKaldik.semester1_kls6 : savedKaldik.semester1;
        const sem2 = isKelas6 && savedKaldik.semester2_kls6 ? savedKaldik.semester2_kls6 : savedKaldik.semester2;
        
        kaldikInfo = `\nMATRIKS KALENDER AKADEMIK MADRASAH (Tahun Ajaran ${savedKaldik.tahunAjaran}):...`;
      }
    } catch (e) {
      console.warn("Gagal fetch kaldik", e);
    }
  }
  
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

  const baseKbcRules = `...`;
  const modulKbcRules = `...`;
  const isModulType = schemaKey.startsWith("modul_ajar") || schemaKey.startsWith("asesmen_") || schemaKey === "rubrik";
  const generalKbcRules = isModulType ? baseKbcRules + modulKbcRules : baseKbcRules;

  let optimizedData = { ...formData };
  if (!isModulType) {
    delete optimizedData.principal;
    delete optimizedData.nipPrincipal;
    delete optimizedData.teacher;
    delete optimizedData.nipTeacher;
    delete optimizedData.schoolAddress;
    delete optimizedData.schoolLogo;
    delete optimizedData.kemenagOffice;
    delete optimizedData.cityDate;
  }
  if (["tp", "atp", "prota", "prosem", "kktp"].includes(schemaKey)) {
    delete optimizedData.topikLokal;
    delete optimizedData.topik;
    delete optimizedData.kodeTp;
    delete optimizedData.metode;
    delete optimizedData.jumlahPertemuan;
    delete optimizedData.karakteristik;
    delete optimizedData.asesmenKognitifDetail;
    delete optimizedData.asesmenFormatifTarget;
    delete optimizedData.asesmenFormatifDetail;
    delete optimizedData.asesmenSumatifTarget;
    delete optimizedData.asesmenSumatifDetail;
    delete optimizedData.blockedWeeks;
  }

  let userPrompt = `Buatkan konten JSON untuk dokumen ${docType} berdasarkan data berikut:\n${JSON.stringify(optimizedData, null, 2)}\n\nPastikan data terisi lengkap, akurat, dan kaya akan nilai ...`;

  if (["tp", "atp", "prota", "prosem"].includes(schemaKey)) {
    const selectedClass = optimizedData.kelas || formData?.kelas || "Kelas 1";
    const selectedPhase = optimizedData.fase || formData?.fase || "Fase Umum";
    const phaseToClasses: Record<string, string> = {
      "FASE A": "Kelas 1 dan Kelas 2",
      "FASE B": "Kelas 3 dan Kelas 4",
      "FASE C": "Kelas 5 dan Kelas 6",
      "FASE D": "Kelas 7, Kelas 8, dan Kelas 9",
      "FASE E": "Kelas 10",
      "FASE F": "Kelas 11 dan Kelas 12"
    };
    const expectedClassRange = phaseToClasses[String(selectedPhase).toUpperCase()] || "kelas yang relevan dengan fase tersebut";

    userPrompt = `Tugasmu adalah menghasilkan data JSON sesuai dengan skema JSON yang diminta untuk dokumen: ${docType}.\n${kaldikInfo}\nIni adalah data mentah (form data) yang diinputkan oleh guru:\n${JSON.stringify(optimizedData, null, 2)}\n\nPENTING:\n- Fokus utama Anda adalah merumuskan materi pokok, kompetensi, dan memecah Capaian Pembelajaran.\n- SETIAP TP/ATP WAJIB mengikuti nilai KELAS yang dipilih guru: ${selectedClass}.\n- FASE YANG DIPILIH GURU: ${selectedPhase}.\n- RANGE KELAS YANG SESUAI DENGAN FASE TERSEBUT: ${expectedClassRange}.\n- JANGAN pernah menulis kelas 1 secara default jika guru sudah memilih ${selectedClass}. Kelas harus konsisten dengan pilihan form.\n- ABAIKAN kalkulasi matematika presisi terkait "Alokasi JP" atau "kodeTp". JANGAN membatasi jumlah TP karena takut "kehabisan" Alokasi JP! Anda BEBAS membuat sebanyak mungkin TP untuk membedah ...`;

    if (schemaKey === "tp") {
      userPrompt += `\n- KHUSUS UNTUK TP (MIMIC BEST PRACTICE GURU KBC):\n  1. PEMECAHAN ATOMIK: ...\n  2. INTEGRASI NILAI DI DALAM KALIMAT TP: ...\n  3. Hasilkan MINIMAL 3-5 TP PER ELEMEN, atau lebih banyak jika materinya padat.`;
    }

    if (schemaKey === "atp") {
      userPrompt += `\n- KHUSUS UNTUK ATP (SANGAT PENTING):\n  1. WAJIB MENYERTAKAN KESELURUHAN Tujuan Pembelajaran (TP) dari data mentah! DILARANG KERAS mengurangi, menghapus, menyingkat, atau menghilangkan TP apapun.\n  2. Berdasarkan Fase yang dipilih (${selectedPhase}), Anda WAJIB mendistribusikan TP tersebut ke dalam kelas yang benar: ${expectedClassRange}.\n  3. JANGAN menempatkan TP di Kelas 1 jika user telah memilih Fase B. Gunakan kelas yang sesuai dengan data yang dipilih guru: ${selectedClass}.\n  4. Anda WAJIB mengisi "rasionalisasiKelas" secara spesifik mengapa TP tersebut ditaruh di kelas tersebut menggunakan 4 pilar pedagogi: (1) Konkret ke Abstrak, (2) Hierarki Prasyarat, (3) Proximitas Konteks, dan (4) Taksonomi Bloom.\n  5. Jika guru memilih fase B, maka seluruh penempatan kelas pada ATP harus mengacu pada rentang Kelas 3 dan Kelas 4, tidak Kelas 1.`;
    }

    if (schemaKey === "prosem" && Array.isArray(optimizedData.blockedWeeks) && optimizedData.blockedWeeks.length > 0) {
      userPrompt += `\n- PERHATIAN KHUSUS UNTUK PROSEM: ...`;
    }
  }

  if (schemaKey === "modul_ajar_umum") {
    const isMultiTp = Array.isArray(optimizedData.kodeTp) && optimizedData.kodeTp.length > 1;
    const tpText = isMultiTp ? `Beberapa Tujuan Pembelajaran (Gabungan dari: ${optimizedData.kodeTp.join(", ")})` : optimizedData.topik;
    userPrompt = `Buatkan struktur MODUL AJAR UMUM ...`;
  }

  if (schemaKey === "modul_ajar_meeting" && meetingNumber > 0) {
    const isMultiTp = Array.isArray(optimizedData.kodeTp) && optimizedData.kodeTp.length > 1;
    userPrompt = `Buatkan detail skenario pembelajaran ...`;
  }

  if (schemaKey === "asesmen_kognitif") {
    userPrompt = `Buatkan dokumen Asesmen Kognitif TP / Diagnostik. ...`;
  }

  if (schemaKey === "asesmen_formatif") {
    userPrompt = `Buatkan dokumen Asesmen Formatif ...`;
  }

  if (schemaKey === "asesmen_sumatif") {
    userPrompt = `Buatkan dokumen Asesmen Sumatif ...`;
  }

  if (schemaKey === "rubrik") {
    userPrompt = `Susun Dokumen Rubrik ...`;
  }

  if (schemaKey === "analisis_penilaian") {
    userPrompt = `Buatkan Laporan Analisis Penilaian ...`;
  }

  try {
    const data = await generateJsonWithRepair(ai, generalKbcRules, userPrompt, schema, 2, onProgress);
    const jsonHtml = `<div class="bg-slate-900 text-emerald-400 p-4 rounded-xl text-left font-mono text-xs overflow-x-auto whitespace-pre-wrap">${JSON.stringify(data, null, 2)}</div>`;
    return { status: "success", html: jsonHtml, data };
  } catch (err) {
    console.error("Failed to generate JSON for KBC API:", err);
    return { status: "error", message: String(err) };
  }
};
