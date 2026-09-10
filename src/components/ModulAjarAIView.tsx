import React, { useState, useEffect } from "react";
import { Wand2, Printer, Download, Sparkles, FileText, Loader2, AlertTriangle, BookOpen, HelpCircle } from "lucide-react";
import { ModulFormState, Pengaturan } from "../types";
import { generateModulAjarAPI } from "../lib/geminiClient";
import { notifySimpanSuccess, notifySimpanError, notifyCetakSuccess, notifyUnduhSuccess, notifyUnduhError } from "../lib/swal";
import { Button } from "./ui";
import { KamusPedagogiModal } from "./KamusPedagogiModal";
import { useKbcState } from "../store/kbcState";

interface ModulAjarAIViewProps {
  config: Pengaturan;
}

export const ModulAjarAIView: React.FC<ModulAjarAIViewProps> = ({ config }) => {
  const [showKamusModal, setShowKamusModal] = useState<string | null>(null);
  const { state: kbcState } = useKbcState();
  const safeConfig = config || {} as Pengaturan;

  const [form, setForm] = useState<ModulFormState>({
    namaGuru: safeConfig?.Nama_Guru || "",
    namaSekolah: safeConfig?.Nama_Sekolah || "",
    tahunAjaran: kbcState?.curriculum?.year || safeConfig?.Tahun_Pelajaran || "",
    jenjang: "MI",
    fase: "",
    kelas: "",
    waktu: "",
    mataPelajaran: kbcState?.curriculum?.subject || "",
    topik: "",
    subTopik: "",
    jumlahPertemuan: "2",
    model: "",
    tujuan: "",
    karakteristik: ""
  });

  // Sinkronkan data dari KBC state ke form jika form masih kosong
  useEffect(() => {
    if (!kbcState) return;

    setForm(prev => {
      // Ekstraksi nilai Fase & Kelas dari kbcLevel
      let parsedFase = prev.fase;
      let parsedKelas = prev.kelas;
      const kbcLevel = kbcState.curriculum?.level || "";
      
      if (kbcLevel) {
        const lvl = kbcLevel.toLowerCase();
        if (lvl.includes("fase a")) parsedFase = "Fase A (Kelas 1-2)";
        else if (lvl.includes("fase b")) parsedFase = "Fase B (Kelas 3-4)";
        else if (lvl.includes("fase c")) parsedFase = "Fase C (Kelas 5-6)";
        
        // Cari angka/romawi setelah kata "kelas"
        const match = lvl.match(/kelas\s*([ivx0-9]+)/i);
        if (match) parsedKelas = match[1].toUpperCase();
      }

      return {
        ...prev,
        mataPelajaran: kbcState.curriculum?.subject || prev.mataPelajaran,
        tahunAjaran: kbcState.curriculum?.year || prev.tahunAjaran,
        fase: parsedFase,
        kelas: parsedKelas,
        model: kbcState.module?.learningModel || kbcState.curriculum?.learningModel || prev.model,
        tujuan: kbcState.module?.rumusanTp || prev.tujuan,
        metode: kbcState.curriculum?.learningMethod || prev.metode,
        jumlahPertemuan: kbcState.module?.jumlahPertemuan?.toString() || prev.jumlahPertemuan,
      };
    });
  }, [
    kbcState?.curriculum?.subject,
    kbcState?.curriculum?.year,
    kbcState?.curriculum?.level,
    kbcState?.curriculum?.learningModel,
    kbcState?.curriculum?.learningMethod,
    kbcState?.module?.learningModel,
    kbcState?.module?.rumusanTp,
    kbcState?.module?.jumlahPertemuan,
  ]);

  const [loading, setLoading] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const cleanHtmlContent = (rawHtml: string): string => {
    if (!rawHtml) return "";
    return rawHtml
      .replace(/```[a-zA-Z]*\n?/g, "")
      .replace(/```/g, "")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/^#+\s*(.*?)$/gm, "<h3>$1</h3>")
      .replace(/`/g, "")
      .trim();
  };

  const handleGenerate = async () => {
    if (
      !form.namaGuru ||
      !form.namaSekolah ||
      !form.tahunAjaran ||
      !form.jenjang ||
      !form.fase ||
      !form.kelas ||
      !form.mataPelajaran ||
      !form.topik ||
      !form.waktu ||
      !form.model
    ) {
      notifySimpanError("Mohon lengkapi seluruh kolom bertanda bintang (*)");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await generateModulAjarAPI(form);
      if (res.status === "success" && res.html) {
        const cleaned = cleanHtmlContent(res.html);
        setGeneratedHtml(cleaned);
        notifySimpanSuccess("Modul Ajar AI berhasil dibuat dan siap dicetak!");
      } else {
        throw new Error((res as any).message || "Gagal membuat modul AI.");
      }
    } catch (err: any) {
      notifySimpanError(err.message || "Terjadi kesalahan saat memproses generator AI.");
    } finally {
      setLoading(false);
    }
  };

  // Export Word .doc
  const handleExportWord = () => {
    if (!generatedHtml) return;

    try {
      const header = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>Modul Ajar Deep Learning</title>
          <style>
            @page { size: A4 portrait; margin: 2cm 1.5cm 2cm 1.5cm; }
            body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.25; color: #000000; }
            h1 { font-size: 16pt; text-align: center; font-weight: bold; margin-bottom: 14pt; text-transform: uppercase; color: #000000; }
            h2 { font-size: 12pt; font-weight: bold; border-bottom: 1.5pt solid #000000; padding-bottom: 3pt; margin-top: 16pt; margin-bottom: 8pt; color: #000000; text-transform: uppercase; }
            h3 { font-size: 11pt; font-weight: bold; margin-top: 12pt; margin-bottom: 6pt; color: #000000; }
            p { margin-bottom: 6pt; text-align: justify; color: #000000; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 12pt; page-break-inside: auto; }
            thead { display: table-header-group; }
            tr { page-break-inside: avoid !important; break-inside: avoid !important; }
            th { border: 1pt solid #000000; padding: 6pt 8pt; vertical-align: middle; text-align: center; font-size: 10pt; font-weight: bold; background-color: #1e3a8a !important; color: #ffffff !important; }
            td { border: 1pt solid #000000; padding: 6pt 8pt; vertical-align: top; text-align: left; font-size: 10pt; color: #000000 !important; background-color: #ffffff !important; }
            ul, ol { margin-bottom: 6pt; padding-left: 18pt; }
            li { margin-bottom: 3pt; color: #000000; }
          </style>
        </head>
        <body>
      `;
      const footer = "</body></html>";
      const fullSource = header + generatedHtml + footer;

      const blob = new Blob(["\ufeff", fullSource], { type: "application/msword" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const cleanTopic = form.topik ? form.topik.replace(/\s+/g, "_") : "Modul";
      link.href = url;
      link.download = `Modul_Ajar_DeepLearning_${cleanTopic}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      notifyUnduhSuccess("Modul Ajar (.DOC) berhasil diunduh!");
    } catch (err: any) {
      notifyUnduhError("Gagal mengunduh file Word.");
    }
  };

  // Print PDF
  const handlePrint = () => {
    if (!generatedHtml) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      notifyCetakSuccess("Gagal membuka jendela cetak.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cetak Modul Ajar - ${form.topik}</title>
          <style>
            @page { size: A4 portrait; margin: 1.5cm; }
            body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.25; color: #000000; margin: 0; padding: 0; }
            h1 { font-size: 16pt; text-align: center; font-weight: bold; text-transform: uppercase; margin-bottom: 15px; color: #000000; }
            h2 { font-size: 12pt; font-weight: bold; border-bottom: 1.5px solid #000000; padding-bottom: 4px; margin-top: 18px; margin-bottom: 8px; color: #000000; text-transform: uppercase; }
            h3 { font-size: 11pt; font-weight: bold; margin-top: 12px; margin-bottom: 6px; color: #000000; }
            p { margin-bottom: 8px; text-align: justify; color: #000000; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 14px; page-break-inside: auto; }
            thead { display: table-header-group !important; }
            tr { page-break-inside: avoid !important; break-inside: avoid !important; }
            th { border: 1px solid #000000 !important; padding: 6px 8px; vertical-align: middle; text-align: center; font-size: 10pt; font-weight: bold; background-color: #1e3a8a !important; color: #ffffff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            td { border: 1px solid #000000 !important; padding: 6px 8px; vertical-align: top; text-align: left; font-size: 10pt; color: #000000 !important; background-color: #ffffff !important; }
            ul, ol { margin-bottom: 8px; padding-left: 18px; }
            li { margin-bottom: 3px; color: #000000; }
            img, .logo-sekolah, .kop-logo { max-height: 75px; width: auto; object-fit: contain; float: left; margin-right: 15px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            @media print {
              body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              img, .logo-sekolah, .kop-logo { display: inline-block !important; visibility: visible !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid !important; break-inside: avoid !important; }
              thead { display: table-header-group !important; }
            }
          </style>
        </head>
        <body>
          ${generatedHtml}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      notifyCetakSuccess("Dokumen dikirim ke printer!");
    }, 500);
  };

  return (
    <>
    <div className="flex flex-col lg:flex-row gap-6 min-h-[80vh]">
      {/* Left Form Panel */}
      <div className="w-full lg:w-[420px] bg-white dark:bg-slate-800 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-br from-blue-800 via-indigo-800 to-slate-900 text-white space-y-1 relative">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <h2 className="font-extrabold text-base tracking-tight">AI Modul Ajar Generator</h2>
          </div>
          <p className="text-xs text-blue-200 font-medium">Deep Learning Pro - Kurikulum Merdeka</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 text-xs font-semibold rounded-xl flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 text-xs font-semibold rounded-xl flex items-center space-x-2">
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Section Data Pengajar */}
          <div className="space-y-3">
            <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider border-b pb-1">
              Data Pengajar & Sekolah
            </p>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Guru / Penyusun *</label>
              <input
                type="text"
                id="namaGuru"
                value={form.namaGuru}
                onChange={handleChange}
                placeholder="Gelar dan Nama Lengkap"
                className="w-full px-3 py-2 text-xs border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Sekolah *</label>
                <input
                  type="text"
                  id="namaSekolah"
                  value={form.namaSekolah}
                  onChange={handleChange}
                  placeholder="Misal: SMPN 1 Maju"
                  className="w-full px-3 py-2 text-xs border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tahun Ajaran *</label>
                <input
                  type="text"
                  id="tahunAjaran"
                  value={form.tahunAjaran}
                  onChange={handleChange}
                  placeholder="2026/2027"
                  className="w-full px-3 py-2 text-xs border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section Informasi Modul */}
          <div className="space-y-3">
            <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider border-b pb-1">
              Informasi Modul
            </p>

            <div className="grid grid-cols-2 gap-2">
              {/* Jenjang hardcode MI */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Jenjang</label>
                <div className="w-full px-3 py-2 text-xs font-bold border rounded-lg bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 select-none">
                  MI (Madrasah Ibtidaiyah)
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Fase *</label>
                <select
                  id="fase"
                  value={form.fase}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs font-semibold border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 outline-none"
                >
                  <option value="">— Pilih Fase —</option>
                  <option value="Fase A (Kelas 1-2)">Fase A (Kelas 1-2)</option>
                  <option value="Fase B (Kelas 3-4)">Fase B (Kelas 3-4)</option>
                  <option value="Fase C (Kelas 5-6)">Fase C (Kelas 5-6)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kelas *</label>
                <input
                  type="text"
                  id="kelas"
                  value={form.kelas}
                  onChange={handleChange}
                  placeholder="VII"
                  className="w-full px-3 py-2 text-xs border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Waktu Total *</label>
                <input
                  type="text"
                  id="waktu"
                  value={form.waktu}
                  onChange={handleChange}
                  placeholder="2 x 45 JP"
                  className="w-full px-3 py-2 text-xs border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mata Pelajaran *</label>
              <input
                type="text"
                id="mataPelajaran"
                value={form.mataPelajaran}
                onChange={handleChange}
                placeholder="Informatika"
                className="w-full px-3 py-2 text-xs border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 outline-none"
              />
            </div>
          </div>

          {/* Section Materi & Model */}
          <div className="space-y-3">
            <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider border-b pb-1">
              Materi & Model Pembelajaran
            </p>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Bab / Topik Utama *</label>
              <input
                type="text"
                id="topik"
                value={form.topik}
                onChange={handleChange}
                placeholder="Topik Pembelajaran"
                className="w-full px-3 py-2 text-xs font-bold text-blue-900 dark:text-blue-200 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sub-Topik</label>
              <input
                type="text"
                id="subTopik"
                value={form.subTopik}
                onChange={handleChange}
                placeholder="Opsional / Sub-Materi"
                className="w-full px-3 py-2 text-xs border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 outline-none"
              />
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900 space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-blue-900 dark:text-blue-200 uppercase mb-1">Jumlah Pertemuan *</label>
                <select
                  id="jumlahPertemuan"
                  value={form.jumlahPertemuan}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs font-bold border rounded-lg bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 outline-none"
                >
                  <option value="1">1 Pertemuan</option>
                  <option value="2">2 Pertemuan</option>
                  <option value="3">3 Pertemuan</option>
                  <option value="4">4 Pertemuan</option>
                  <option value="5">5 Pertemuan</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-blue-900 dark:text-blue-200 uppercase">Model Pembelajaran *</label>
                  <button
                    type="button"
                    onClick={() => setShowKamusModal("model")}
                    title="Lihat Kamus Pedagogi"
                    className="text-emerald-600 hover:text-emerald-500 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  id="model"
                  list="modul-ai-model-list"
                  value={form.model}
                  onChange={handleChange}
                  placeholder="Pilih atau ketik model pembelajaran..."
                  className="w-full px-3 py-2 text-xs font-semibold border rounded-lg bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800 outline-none"
                />
                <datalist id="modul-ai-model-list">
                  <option value="Problem Based Learning (PBL)" />
                  <option value="Project Based Learning (PjBL)" />
                  <option value="Discovery Learning" />
                  <option value="Inquiry Learning" />
                  <option value="Cooperative Learning" />
                  <option value="Pembelajaran Berdiferensiasi" />
                  <option value="Flipped Classroom" />
                  <option value="Teaching at the Right Level (TaRL)" />
                </datalist>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-blue-900 dark:text-blue-200 uppercase mb-1">Metode Pembelajaran (Opsional)</label>
                <input
                  type="text"
                  id="metode"
                  value={form.metode || ""}
                  onChange={handleChange}
                  placeholder="Misal: Diskusi, Eksperimen, Unjuk Kerja (Kosongkan jika AI yang menentukan)"
                  className="w-full px-3 py-2 text-xs border rounded-lg bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800 outline-none placeholder:text-slate-400"
                />
                <p className="text-[10px] text-slate-500 mt-1">Jika dikosongkan, AI akan menentukan metode terbaik secara otomatis.</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-blue-900 dark:text-blue-200 uppercase mb-1">Karakteristik Siswa / Profil Kelas</label>
                <textarea
                  id="karakteristik"
                  value={form.karakteristik || ""}
                  onChange={handleChange}
                  placeholder="Misal: Mayoritas siswa visual, 2 anak inklusi lambat belajar, sangat antusias pada praktik."
                  className="w-full px-3 py-2 text-xs border rounded-lg bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800 outline-none placeholder:text-slate-400 min-h-[60px] custom-scrollbar"
                />
                <p className="text-[10px] text-slate-500 mt-1">Panduan AI untuk meracik Modul Berdiferensiasi berdasarkan Asesmen Diagnostik.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
          <Button
            onClick={handleGenerate}
            loading={loading}
            variant="primary"
            size="lg"
            icon={Wand2}
            className="w-full shadow-lg"
          >
            {loading ? "Meracik Modul AI..." : "GENERATE MODUL PREMIUM"}
          </Button>
        </div>
      </div>

      {/* Right Preview Workspace */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Workspace Toolbar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Workspace Pratinjau Dokumen</h3>
              <p className="text-[11px] text-slate-500">Hasil racikan AI siap ekspor ke Word (.doc) atau cetak langsung</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Button
              onClick={handlePrint}
              disabled={!generatedHtml}
              variant="primary"
              size="sm"
              icon={Printer}
              className="flex-1 sm:flex-none"
            >
              Cetak PDF
            </Button>

            <Button
              onClick={handleExportWord}
              disabled={!generatedHtml}
              variant="secondary"
              size="sm"
              icon={Download}
              className="flex-1 sm:flex-none"
            >
              Word (.DOC)
            </Button>
          </div>
        </div>

        {/* Content Display */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-slate-950/80 custom-scrollbar">
          {!generatedHtml && !loading && (
            <div className="h-[500px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-white/50 dark:bg-slate-900/50">
              <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
              <h4 className="font-bold text-slate-700 dark:text-slate-300 text-base">Kertas Modul Masih Kosong</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Lengkapi formulir di sebelah kiri dan klik <b>GENERATE MODUL PREMIUM</b> untuk meminta AI menyusun RPP Deep Learning otomatis.
              </p>
            </div>
          )}

          {loading && (
            <div className="h-[500px] flex flex-col items-center justify-center text-center p-8 space-y-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <h4 className="font-bold text-slate-800 dark:text-white text-base">Meracik Modul Pembelajaran...</h4>
              <p className="text-xs text-slate-500 max-w-md">
                Gemini AI sedang menyusun kerangka Deep Learning, skenario kegiatan guru & siswa per sintak model, tabel diagnostik, serta LKPD interaktif.
              </p>
            </div>
          )}

          {generatedHtml && !loading && (
            <div className="max-w-3xl mx-auto bg-white text-slate-900 p-8 sm:p-12 shadow-xl rounded-xl border border-slate-200 text-xs leading-relaxed space-y-4 font-serif">
              <div
                dangerouslySetInnerHTML={{ __html: generatedHtml }}
                className="prose max-w-none prose-headings:font-sans prose-h1:text-xl prose-h1:font-black prose-h1:text-center prose-h1:text-blue-900 prose-h2:text-sm prose-h2:font-bold prose-h2:border-b-2 prose-h2:border-blue-900 prose-h2:pb-1 prose-h2:mt-6 prose-table:w-full prose-table:border-collapse prose-th:border prose-th:border-slate-700 prose-th:p-2.5 prose-th:bg-blue-900 prose-th:text-white prose-th:font-bold prose-th:text-center prose-td:border prose-td:border-slate-300 prose-td:p-2 prose-td:text-slate-800"
              />
            </div>
          )}
        </div>
      </div>
    </div>

    <KamusPedagogiModal
      isOpen={!!showKamusModal}
      initialTab={showKamusModal || "model"}
      onClose={() => setShowKamusModal(null)}
    />
    </>
  );
};
