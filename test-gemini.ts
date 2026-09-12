import * as dotenv from 'dotenv';
dotenv.config();

// Mock import.meta.env for Node.js
(globalThis as any).importMetaEnv = process.env;

// Replace import.meta.env with globalThis.importMetaEnv in geminiClient.ts dynamically if possible
// Instead of messing with globals, let's just create a mock client function and see the actual JSON Schema output.
import { getAiClient, generateJsonWithRepair } from './src/lib/geminiClient.ts';
import { AcpSchema } from './src/lib/kbcSchemas.ts';
import { GoogleGenAI } from '@google/genai';

const dummyData = {
  subject: "Al-Qur'an Hadis",
  level: "Fase C",
  cp: {
    rasional: "Mata pelajaran Al-Qur'an Hadis adalah pendidikan untuk memberikan pemahaman kepada peserta didik tentang Al-Qur'an dan Hadis.",
    tujuanMapel: "Membekali peserta didik agar dapat membaca, menulis, menghafal, dan memahami makna Al-Qur'an dan Hadis.",
    karakteristikMapel: "Mempelajari bacaan, terjemahan, dan kandungan ayat-ayat pendek.",
    cpFase: "Peserta didik mampu membaca, menghafal, dan memahami surat-surat pendek dalam Al-Qur'an serta hadis tentang akhlak.",
    elemen: "Ilmu Tajwid, Hafalan Surat Pendek, Pemahaman Hadis."
  }
};

async function run() {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.VITE_GEMINI_API_KEY,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } }
    });
    console.log("Using API KEY:", process.env.VITE_GEMINI_API_KEY ? "YES" : "NO");
    const result = await generateJsonWithRepair(ai, "System prompt", JSON.stringify(dummyData), AcpSchema);
    console.log("RESULT:", JSON.stringify(result, null, 2));
  } catch(e) {
    console.error("ERROR:", e);
  }
}

run();
