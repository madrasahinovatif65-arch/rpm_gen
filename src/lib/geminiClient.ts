import { GoogleGenAI } from "@google/genai";
import { ZodSchema } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  generateModulAjarFallback,
  generateChatAssistantFallback,
} from "./aiGenerators";
import { KbcSchemas } from "./kbcSchemas";
import { getKaldik } from "./firebase";
import { parseAtomicCpTopics } from "./atomicCpParser";

export const getAiClient = (): GoogleGenAI | null => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });
};

const generateContentWithRetry = async (
  ai: GoogleGenAI | null,
  contents: any,
  config?: any,
  onProgress?: (text: string) => void
): Promise<{ text: string }> => {
  if (!ai) {
    throw new Error("GEMINI_API_KEY tidak dikonfigurasi.");
  }

  const modelCandidates = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-flash-lite"];
  let lastError: any = null;

  for (const modelCandidate of modelCandidates) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        if (onProgress) {
          const responseStream = await ai.models.generateContentStream({
            model: modelCandidate,
            contents,
            config,
          });

          let fullText = "";
          for await (const chunk of responseStream) {
            if (chunk.text) {
              fullText += chunk.text;
              onProgress(fullText);
            }
          }
          return { text: fullText };
        }

        const response = await ai.models.generateContent({
          model: modelCandidate,
          contents,
          config,
        });

        if (response && response.text) {
          return { text: response.text };
        }
      } catch (error: any) {
        lastError = error;
        const status = error?.status || error?.code || error?.error?.code;
        const errMsg = String(error?.message || error || "");

        const isApiKeyInvalid =
          status === 400 ||
          errMsg.includes("API_KEY_INVALID") ||
          errMsg.includes("API key not valid") ||
          errMsg.includes("API_KEY");

        if (isApiKeyInvalid) {
          throw error;
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

export const generateJsonWithRepair = async (
  ai: GoogleGenAI | null,
  systemPrompt: string,
  userPrompt: string,
  schema: ZodSchema<any>,
  maxRetries = 2,
  onProgress?: (text: string) => void
): Promise<any> => {
  if (!ai) {
    throw new Error("GEMINI_API_KEY tidak dikonfigurasi.");
  }

  const jsonSchema = zodToJsonSchema(schema, "OutputSchema");
  const schemaStr = JSON.stringify(jsonSchema, null, 2);

  let currentPrompt = `${systemPrompt}\n\nIMPORTANT: You must return a valid JSON object that strictly follows this JSON Schema:\n${schemaStr}\n\nDo not include markdown blocks like \`\`\`json. Return ONLY the JSON object.\n\n${userPrompt}`;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await generateContentWithRetry(
        ai,
        [{ role: "user", parts: [{ text: currentPrompt }] }],
        { responseMimeType: "application/json" },
        onProgress
      );

      let text = response?.text || "";
      text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      const parsed = JSON.parse(text);
      const validationResult = schema.safeParse(parsed);

      if (validationResult.success) {
        return validationResult.data;
      }

      const errorMsg = ((validationResult.error as any).issues || [])
        .map((e: any) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");

      console.warn(`JSON validation failed on attempt ${attempt + 1}:`, errorMsg);
      currentPrompt = `You previously returned invalid JSON. Please fix the following validation errors:\n${errorMsg}\n\nPrevious JSON:\n${text}\n\nReturn ONLY the corrected JSON object.`;
    } catch (err: any) {
      console.warn(`JSON parsing failed on attempt ${attempt + 1}:`, err);
      const message = String(err?.message || err || "");
      if (!(err instanceof SyntaxError) && !message.includes("Unexpected token") && !message.includes("Unexpected end of JSON")) {
        throw err;
      }
      currentPrompt = `You previously returned invalid JSON that could not be parsed. Error: ${message}\n\nPlease ensure your response is ONLY a valid JSON object. Do not include markdown blocks.`;
    }
  }

  throw new Error("Gagal menghasilkan JSON yang valid setelah beberapa kali percobaan perbaikan.");
};

export const generateModulAjarAPI = async (formData: any) => {
  const ai = getAiClient();
  const metodeText = formData.metode && formData.metode.trim()
    ? formData.metode.trim()
    : "Otomatis ditentukan oleh AI secara variatif dan interaktif";

  const systemPrompt = `Bertindaklah sebagai Ahli Kurikulum Nasional dan pengembang Sistem Modul Ajar. Susun modul ajar dalam HTML murni tanpa markdown.`;
  const userPrompt = `DATA MODUL AJAR:\n${JSON.stringify(formData, null, 2)}\n\nMetode Pembelajaran: ${metodeText}\n\nFormat wajib: HTML murni, tanpa kode fence, tanpa teks tambahan.`;

  try {
    if (!ai) throw new Error("AI unavailable");
    const response = await generateContentWithRetry(ai, [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }]);
    const text = response.text.replace(/```[a-zA-Z]*\n?/g, "").replace(/```/g, "").trim();
    if (text && text.length > 50) {
      return { status: "success", html: text };
    }
  } catch (geminiError) {
    console.warn("Gemini API unavailable for Modul Ajar, using built-in generator engine:", geminiError);
  }

  return { status: "success", html: generateModulAjarFallback(formData) };
};

export const chatAssistantAPI = async (message: string, context: any) => {
  const ai = getAiClient();
  const systemPrompt = `Anda adalah "EdAdmin AI Assistant" ...`;

  try {
    if (!ai) throw new Error("AI unavailable");
    const response = await generateContentWithRetry(ai, [{
      role: "user",
      parts: [{ text: `${systemPrompt}\n\nPertanyaan/Permintaan Guru:\n${message}` }],
    }]);
    const rawText = response?.text || "";
    const cleanReply = rawText.replace(/```[a-zA-Z]*\n?/g, "").replace(/```/g, "").replace(/^`+|`+$/g, "").trim();
    if (cleanReply && cleanReply.length > 10) {
      return { status: "success", reply: cleanReply };
    }
  } catch (geminiError) {
    console.warn("Gemini API unavailable for Chat Assistant, using built-in engine:", geminiError);
  }

  return { status: "success", reply: generateChatAssistantFallback(message, context) };
};

export const generatePerangkatAjarAPI = async (docType: string, formData: any) => {
  const ai = getAiClient();
  const schema = KbcSchemas[docType];
  if (!schema) {
    return { status: "error", message: `Schema untuk dokumen ${docType} tidak ditemukan.` };
  }

  try {
    const data = await generateJsonWithRepair(
      ai,
      "Anda adalah ahli perangkat ajar Kurikulum Merdeka. Gunakan bahasa Indonesia.",
      `Buat data JSON untuk dokumen ${docType}. Data: ${JSON.stringify(formData, null, 2)}`,
      schema
    );
    return { status: "success", data, html: `<pre>${JSON.stringify(data, null, 2)}</pre>` };
  } catch (error: any) {
    return { status: "error", message: String(error?.message || error) };
  }
};

export const generatePerangkatAjarKBCAPI = async (
  docType: string,
  formData: any,
  onProgress?: (text: string) => void
) => {
  const ai = getAiClient();

  let kaldikInfo = "";
  if (docType === "prota" || docType === "prosem") {
    try {
      const savedKaldik = await getKaldik(formData.tahunAjaran || "2024/2025");
      if (savedKaldik) {
        const isKelas6 = formData.kelas === "VI" || formData.kelas === "6";
        const sem1 = isKelas6 && savedKaldik.semester1_kls6 ? savedKaldik.semester1_kls6 : savedKaldik.semester1;
        const sem2 = isKelas6 && savedKaldik.semester2_kls6 ? savedKaldik.semester2_kls6 : savedKaldik.semester2;

        kaldikInfo = `\nMATRIKS KALENDER AKADEMIK MADRASAH (Tahun Ajaran ${savedKaldik.tahunAjaran}):\n- Semester Ganjil: ${sem1 ? sem1.map((m: any) => `* ${m.namaBulan}: ${m.totalMinggu} mgg (Efektif: ${m.mingguEfektif}, Tidak Efektif: ${m.mingguTidakEfektif})`).join("\n") : "Tidak ada data"}\n- Semester Genap: ${sem2 ? sem2.map((m: any) => `* ${m.namaBulan}: ${m.totalMinggu} mgg (Efektif: ${m.mingguEfektif}, Tidak Efektif: ${m.mingguTidakEfektif})`).join("\n") : "Tidak ada data"}`;
      }
    } catch (e) {
      console.warn("Gagal fetch kaldik", e);
    }
  }

  let schemaKey = docType;
  let meetingNumber = 0;
  if (docType.startsWith("modul_ajar_meeting_")) {
    schemaKey = "modul_ajar_meeting";
    meetingNumber = parseInt(docType.split("_")[3] || "0", 10);
  }

  const schema = KbcSchemas[schemaKey];
  if (!schema) {
    return { status: "error", message: `Schema untuk dokumen ${docType} tidak ditemukan.` };
  }

  const baseKbcRules = `Kamu adalah Ahli Kurikulum & Pengembang Perangkat Ajar Kemenag RI.\nDalam setiap analisis, penyusunan tujuan, dan modul ajar, fokus pada prinsip KBC dan validasi schema JSON.`;
  const modulKbcRules = `\nJika dokumen adalah modul/asesmen/rubrik, gunakan format pembelajaran yang sesuai model dan sintaks secara sistematis.`;
  const isModulType = schemaKey.startsWith("modul_ajar") || schemaKey.startsWith("asesmen_") || schemaKey === "rubrik";
  const generalKbcRules = isModulType ? baseKbcRules + modulKbcRules : baseKbcRules;

  let optimizedData: any = { ...formData };
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

  let userPrompt = `Buatkan konten JSON untuk dokumen ${docType} berdasarkan data berikut:\n${JSON.stringify(optimizedData, null, 2)}\n\nPastikan data terisi lengkap, akurat, dan kaya akan nilai pedagogis.`;

  if (["tp", "atp", "prota", "prosem"].includes(schemaKey)) {
    const tpUserPrompt = `Tugasmu adalah menghasilkan data JSON sesuai dengan skema JSON yang diminta untuk dokumen: ${docType}.\n${kaldikInfo}\nIni adalah data mentah (form data) yang diinputkan oleh guru:\n${JSON.stringify(optimizedData, null, 2)}\n\nPENTING:\n- Fokus utama Anda adalah merumuskan materi pokok, kompetensi, dan memecah Capaian Pembelajaran.\n- Jangan membatasi jumlah TP karena takut kehabisan alokasi JP.\n- Pastikan setiap array terisi dengan struktur valid.`;

    if (schemaKey === "tp") {
      const cpText = String(
        optimizedData.cpElemen ||
        optimizedData.cp?.elemen ||
        optimizedData.cpText ||
        optimizedData.cp ||
        ""
      );

      const atomicTopics = parseAtomicCpTopics(cpText);
      let atomicBlock = "";
      if (atomicTopics.length > 0) {
        atomicBlock = `\n\n[SUB-TOPIK ATOMIK OTOMATIS]\n${atomicTopics
          .map((item, idx) => `  ${idx + 1}. [Elemen: ${item.elemen}] ${item.topik}`)
          .join("\n")}\n\nSetiap item di atas WAJIB muncul sebagai satu TP yang terpisah.`;
      }

      userPrompt = tpUserPrompt + atomicBlock + `\n\nKHUSUS UNTUK TP:\n1. PEMECAHAN ATOMIK: Jika paragraf CP menyebutkan daftar materi yang dipisah koma, titik koma, atau "dan", pecah menjadi 1 TP untuk setiap materi tunggal.\n2. SETIAP TP HARUS fokus pada 1 sub-materi, 1 kompetensi utama, dan 1 objek belajar utama.\n3. INTEGRASI NILAI DI DALAM KALIMAT TP: properti rumusanTp harus diakhiri dengan kata-kata yang mencerminkan tujuan karakter/sikap dari DPL dan Panca Cinta.\n4. Hasilkan minimal 3-5 TP per elemen, lebih banyak jika materinya padat.`;
    } else {
      userPrompt = tpUserPrompt;
    }
  }

  if (schemaKey === "modul_ajar_umum") {
    const isMultiTp = Array.isArray(optimizedData.kodeTp) && optimizedData.kodeTp.length > 1;
    const tpText = isMultiTp ? `Beberapa Tujuan Pembelajaran (Gabungan dari: ${optimizedData.kodeTp.join(", ")})` : (optimizedData.topik || "Topik pembelajaran");
    userPrompt = `Buatkan struktur MODUL AJAR UMUM untuk topik: ${tpText}.\nData pendukung:\n${JSON.stringify(optimizedData, null, 2)}`;
  }

  if (schemaKey === "modul_ajar_meeting" && meetingNumber > 0) {
    const isMultiTp = Array.isArray(optimizedData.kodeTp) && optimizedData.kodeTp.length > 1;
    userPrompt = `Buatkan detail skenario pembelajaran untuk PERTEMUAN KE-${meetingNumber}.\nData pendukung (Model/Sintak):\n${JSON.stringify(optimizedData, null, 2)}\n\nPenting:\n- Berikan judul pertemuan yang relevan.\n- Fokus sintak harus memuat model ${optimizedData.model || "Pembelajaran"}.\n- Kegiatan Pendahuluan, Inti, dan Penutup harus ringkas dan operasional.`;
    if (isMultiTp) {
      userPrompt += "\n- Pastikan skenario memfasilitasi pencapaian berbagai TP yang dipilih secara bertahap.";
    }
  }

  if (schemaKey === "asesmen_kognitif") {
    userPrompt = `Buatkan dokumen Asesmen Kognitif TP / Diagnostik.\nInput Detail Guru: ${optimizedData.asesmenKognitifDetail || "Kuis interaktif singkat"}.\nFase/Kelas: ${optimizedData.fase} - ${optimizedData.kelas}. Model: ${optimizedData.model}. Metode: ${optimizedData.metode}.\nData Modul: ${JSON.stringify(optimizedData, null, 2)}`;
  }

  if (schemaKey === "asesmen_formatif") {
    userPrompt = `Buatkan dokumen Asesmen Formatif.\nTarget Instrumen Utama: ${optimizedData.asesmenFormatifTarget || "Otomatis dari AI"}.\nDetail Guru: ${optimizedData.asesmenFormatifDetail || "Susun instrumen proses yang relevan"}.\nFase/Kelas: ${optimizedData.fase} - ${optimizedData.kelas}. Model: ${optimizedData.model}. Metode: ${optimizedData.metode}.\nData Modul: ${JSON.stringify(optimizedData, null, 2)}`;
  }

  if (schemaKey === "asesmen_sumatif") {
    userPrompt = `Buatkan dokumen Asesmen Sumatif.\nTarget Instrumen Utama: ${optimizedData.asesmenSumatifTarget || "Otomatis dari AI"}.\nDetail Guru: ${optimizedData.asesmenSumatifDetail || "Susun evaluasi akhir yang relevan"}.\nFase/Kelas: ${optimizedData.fase} - ${optimizedData.kelas}. Model: ${optimizedData.model}. Metode: ${optimizedData.metode}.\nData Modul: ${JSON.stringify(optimizedData, null, 2)}`;
  }

  if (schemaKey === "rubrik") {
    userPrompt = `Susun Dokumen Rubrik Penilaian berdasarkan data berikut:\n${JSON.stringify(optimizedData, null, 2)}`;
  }

  if (schemaKey === "analisis_penilaian") {
    userPrompt = `Buatkan Laporan Analisis Penilaian dan Tindak Lanjut berdasarkan data berikut:\n${JSON.stringify(optimizedData, null, 2)}`;
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
