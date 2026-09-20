import { GoogleGenAI } from "@google/genai";
import { ZodSchema } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { generateModulAjarFallback, generateChatAssistantFallback } from "./aiGenerators";
import { KbcSchemas } from "./kbcSchemas";
import { getKaldik } from "./firebase";
import { parseAtomicCpTopics } from "./atomicCpParser";

export const getAiClient = (): GoogleGenAI | null => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") return null;
  return new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
};

const generateContentWithRetry = async (ai: GoogleGenAI | null, contents: any, config?: any, onProgress?: (text: string) => void): Promise<{ text: string }> => {
  if (!ai) throw new Error("GEMINI_API_KEY tidak dikonfigurasi.");
  const modelCandidates = ["gemini-3.1-flash-lite", "gemini-3.6-flash", "gemini-3.7-flash"];
  let lastError: any = null;
  for (const model of modelCandidates) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        if (onProgress) {
          const stream = await ai.models.generateContentStream({ model, contents, config });
          let text = "";
          for await (const chunk of stream) { if (chunk.text) { text += chunk.text; onProgress(text); } }
          return { text };
        }
        const response = await ai.models.generateContent({ model, contents, config });
        if (response?.text) return { text: response.text };
      } catch (error: any) {
        lastError = error;
        const status = error?.status || error?.code || error?.error?.code;
        const message = String(error?.message || error || "");
        if (status === 400 || message.includes("API_KEY")) throw error;
        const transient = [429, 500, 503].includes(Number(status)) || /UNAVAILABLE|quota|resource exhausted|high demand/i.test(message);
        if (transient && attempt === 0) await new Promise((resolve) => setTimeout(resolve, 1500));
        else if (!transient) break;
      }
    }
  }
  throw lastError || new Error("Layanan AI sedang sibuk.");
};

export const generateJsonWithRepair = async (ai: GoogleGenAI | null, systemPrompt: string, userPrompt: string, schema: ZodSchema<any>, maxRetries = 2, onProgress?: (text: string) => void): Promise<any> => {
  if (!ai) throw new Error("GEMINI_API_KEY tidak dikonfigurasi.");
  const schemaText = JSON.stringify(zodToJsonSchema(schema, "OutputSchema"), null, 2);
  let prompt = `${systemPrompt}\n\n${userPrompt}\n\nReturn ONLY valid JSON matching this schema:\n${schemaText}`;
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const response = await generateContentWithRetry(ai, [{ role: "user", parts: [{ text: prompt }] }], { responseMimeType: "application/json" }, onProgress);
    const text = response.text.replace(/```json\s*|```/g, "").trim();
    try {
      const parsed = JSON.parse(text);
      const validation = schema.safeParse(parsed);
      if (validation.success) return validation.data;
      prompt = `Fix validation errors: ${JSON.stringify(validation.error.issues)}\nPrevious JSON:\n${text}`;
    } catch (error) {
      if (attempt === maxRetries) throw error;
      prompt = `Return only valid JSON. Previous response:\n${text}`;
    }
  }
  throw new Error("Gagal menghasilkan JSON yang valid.");
};

export const generateModulAjarAPI = async (formData: any) => {
  try {
    const ai = getAiClient();
    if (!ai) throw new Error("AI unavailable");
    const response = await generateContentWithRetry(ai, [{ role: "user", parts: [{ text: `Buat modul ajar HTML murni berdasarkan data berikut:\n${JSON.stringify(formData, null, 2)}` }] }]);
    return { status: "success", html: response.text.replace(/```[a-zA-Z]*\s*|```/g, "").trim() };
  } catch {
    return { status: "success", html: generateModulAjarFallback(formData) };
  }
};

export const chatAssistantAPI = async (message: string, context: any) => {
  try {
    const ai = getAiClient();
    if (!ai) throw new Error("AI unavailable");
    const response = await generateContentWithRetry(ai, [{ role: "user", parts: [{ text: `Anda adalah asisten administrasi pembelajaran. Konteks: ${JSON.stringify(context || {})}\nPertanyaan: ${message}` }] }]);
    return { status: "success", reply: response.text.trim() };
  } catch {
    return { status: "success", reply: generateChatAssistantFallback(message, context) };
  }
};

export const generatePerangkatAjarAPI = async (docType: string, formData: any) => {
  const schema = KbcSchemas[docType];
  if (!schema) return { status: "error", message: `Schema untuk dokumen ${docType} tidak ditemukan.` };
  try {
    const data = await generateJsonWithRepair(getAiClient(), "Anda adalah ahli perangkat ajar Kurikulum Merdeka.", `Buat data JSON dokumen ${docType}:\n${JSON.stringify(formData, null, 2)}`, schema);
    return { status: "success", data, html: `<pre>${JSON.stringify(data, null, 2)}</pre>` };
  } catch (error: any) {
    return { status: "error", message: String(error?.message || error) };
  }
};

export const generatePerangkatAjarKBCAPI = async (docType: string, formData: any, onProgress?: (text: string) => void) => {
  const ai = getAiClient();
  const schemaKey = docType.startsWith("modul_ajar_meeting_") ? "modul_ajar_meeting" : docType;
  const schema = KbcSchemas[schemaKey];
  if (!schema) return { status: "error", message: `Schema untuk dokumen ${docType} tidak ditemukan.` };

  let optimizedData = { ...formData };
  if (["tp", "atp", "prota", "prosem", "kktp"].includes(schemaKey)) {
    delete optimizedData.topikLokal;
    delete optimizedData.topik;
    delete optimizedData.kodeTp;
    delete optimizedData.metode;
    delete optimizedData.jumlahPertemuan;
    delete optimizedData.karakteristik;
    delete optimizedData.blockedWeeks;
  }

  let prompt = `Buat JSON untuk dokumen ${docType}. Data guru:\n${JSON.stringify(optimizedData, null, 2)}`;
  if (schemaKey === "tp") {
    const cpText = String(optimizedData.cpElemen || optimizedData.cpText || optimizedData.cp || "");
    const atomicTopics = parseAtomicCpTopics(cpText);
    const atomicBlock = atomicTopics.length ? `\n\nSUB-TOPIK ATOMIK WAJIB:\n${atomicTopics.map((item, i) => `${i + 1}. [${item.elemen}] ${item.topik}`).join("\n")}` : "";
    prompt += `${atomicBlock}\n\nAturan TP: setiap sub-topik atomik wajib menjadi tepat satu TP; jangan menggabungkan materi atau kompetensi; setiap TP memiliki satu objek belajar dan satu kompetensi utama.\n\nAturan integrasi nilai: setiap integrasiNilai WAJIB memuat secara eksplisit minimal 3 DPL, minimal 3 Panca Cinta/KBC, dan minimal 3 PPRA yang relevan. Gunakan format: DPL: ...; Panca Cinta/KBC: ...; PPRA: ...; Penerapan: ....`;
  }

  try {
    const data = await generateJsonWithRepair(ai, "Anda ahli perangkat ajar Kurikulum Berbasis Cinta. Kembalikan JSON saja.", prompt, schema, 2, onProgress);
    return { status: "success", data, html: `<pre>${JSON.stringify(data, null, 2)}</pre>` };
  } catch (error: any) {
    return { status: "error", message: String(error?.message || error) };
  }
};
