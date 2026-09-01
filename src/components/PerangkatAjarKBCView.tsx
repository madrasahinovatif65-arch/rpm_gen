import React, { useState } from "react";
import { 
  FileCheck, 
  Sparkles, 
  Printer, 
  Download, 
  BookOpen, 
  Loader2, 
  CheckCircle2, 
  CheckCircle,
  AlertTriangle,
  Layers, 
  Calendar, 
  Award,
  RefreshCw,
  FileSpreadsheet,
  Building2,
  HeartHandshake,
  FileText,
  CheckSquare,
  BookMarked,
  LayoutList
} from "lucide-react";
import { Pengaturan } from "../types";
import { generatePerangkatAjarKBCAPI } from "../lib/geminiClient";
import { notifySimpanSuccess, notifySimpanError, notifyUnduhSuccess } from "../lib/swal";
import { useKbcState, defaultKbcState } from "../store/kbcState";
import { subscribeToJobs, enqueueJob, AIJob } from "../lib/aiJobManager";
import { AcpRenderer, TpRenderer, AtpRenderer, ProtaRenderer, ProsemRenderer, KktpRenderer } from './renderers/AdministrasiRenderers';
import { ModulAjarRenderer, LkpdRenderer, RubrikRenderer } from './renderers/ModulRenderers';
import { DATA_MAPEL_KEMENAG } from "../lib/kemenagMapel";

interface PerangkatAjarKBCViewProps {
  config?: Pengaturan;
}

export const PerangkatAjarKBCView: React.FC<PerangkatAjarKBCViewProps> = ({ config }) => {
  const [activeDoc, setActiveDoc] = useState<
    "analisis_cp" | "tp" | "atp" | "prota" | "prosem" | "kktp" | "modul_ajar" | "lkpd" | "rubrik"
  >("analisis_cp");

  const [inputTab, setInputTab] = useState<"admin" | "modul">("admin");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState("");

  const [generatedDocs, setGeneratedDocs] = useState<Record<string, string>>({});
  const [generatedJson, setGeneratedJson] = useState<Record<string, any>>({});
  const [jobs, setJobs] = useState<Record<string, AIJob>>({});

  React.useEffect(() => {
    const unsubscribe = subscribeToJobs((updatedJobs) => {
      setJobs(updatedJobs);
      
      const newJson: Record<string, any> = {};
      const newHtml: Record<string, string> = {};
      let isAnyRunning = false;
      
      Object.keys(updatedJobs).forEach(id => {
        if (updatedJobs[id].status === "running") isAnyRunning = true;
        if (updatedJobs[id].data) {
          newJson[id] = updatedJobs[id].data;
          // Legacy support for older docs mapping
          newHtml[id] = "<div>Dimuat dari state AI Job Manager</div>";
        }
      });
      
      setGeneratedJson(prev => ({...prev, ...newJson}));
      setGeneratedDocs(prev => ({...prev, ...newHtml}));
      setIsGenerating(isAnyRunning);
    });
    return () => unsubscribe();
  }, []);

  const [state, updateState] = useKbcState();

  const formData = {
    ...state.school,
    ...state.curriculum,
    ...state.cp
  };

  const formDataModul = {
    ...state.school,
    ...state.curriculum,
    ...state.module
  };


  const docTypeList = [
    { id: "analisis_cp", label: "1. Analisis CP", fullTitle: "Analisis Capaian Pembelajaran (ACP) KBC", icon: BookOpen },
    { id: "tp", label: "2. Tujuan Pembelajaran", fullTitle: "Tujuan Pembelajaran (TP) KBC", icon: FileCheck },
    { id: "atp", label: "3. Alur TP (ATP)", fullTitle: "Alur Tujuan Pembelajaran (ATP) KBC", icon: Layers },
    { id: "prota", label: "4. Program Tahunan", fullTitle: "Program Tahunan (Prota) KBC", icon: Calendar },
    { id: "prosem", label: "5. Program Semester", fullTitle: "Program Semester (Prosem) KBC", icon: FileSpreadsheet },
    { id: "kktp", label: "6. KKTP KBC", fullTitle: "Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) KBC", icon: Award },
    { id: "modul_ajar", label: "7. Modul Ajar KBC", fullTitle: "Modul Ajar Deep Learning KBC", icon: HeartHandshake },
    { id: "lkpd", label: "8. LKPD KBC", fullTitle: "Lembar Kerja Peserta Didik (LKPD) KBC", icon: FileText },
    { id: "rubrik", label: "9. Rubrik Formatif & Sumatif", fullTitle: "Rubrik Penilaian Formatif & Sumatif KBC", icon: CheckSquare }
  ];

  const handleSelectDoc = (docId: any) => {
    setActiveDoc(docId);
    if (docId === "modul_ajar" || docId === "lkpd" || docId === "rubrik") {
      setInputTab("modul");
    } else {
      setInputTab("admin");
    }
  };

  const handleFillSample = () => {
    updateState((prev) => ({
      ...prev,
      school: defaultKbcState.school,
      curriculum: defaultKbcState.curriculum,
      cp: defaultKbcState.cp
    }));
    notifySimpanSuccess("Contoh data Administrasi KBC berhasil dimuat!");
  };

  const handleFillSampleModul = () => {
    updateState((prev) => ({
      ...prev,
      module: defaultKbcState.module
    }));
    notifySimpanSuccess("Contoh data Khusus Modul Ajar, LKPD & Rubrik KBC berhasil dimuat!");
  };

  const handleAutofillFromProfile = () => {
    if (!config) {
      notifySimpanError("Gagal mengambil data profil pengaturan.");
      return;
    }
    updateState((prev) => ({
      ...prev,
      school: {
        ...prev.school,
        kemenagOffice: config.Pemerintah || prev.school.kemenagOffice,
        schoolName: config.Nama_Sekolah || prev.school.schoolName,
        teacher: config.Nama_Guru || prev.school.teacher,
        nipTeacher: config.NIP_Guru || prev.school.nipTeacher,
        principal: config.Nama_Kepsek || prev.school.principal,
        nipPrincipal: config.NIP_Kepsek || prev.school.nipPrincipal,
        cityDate: `${config.Tempat_Tanda_Tangan || "Kota"}, ${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}`
      }
    }));
    notifySimpanSuccess("Berhasil menyalin data dari Profil Madrasah!");
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const value = e.target.value;
    updateState(s => {
      let newState = { ...s, curriculum: { ...s.curriculum, subject: value } };
      
      // Auto-fill singkatan jika mapel terdaftar
      const foundMapel = DATA_MAPEL_KEMENAG.find(m => m.namaMapel === value);
      if (foundMapel) {
        newState.curriculum.singkatanMapel = foundMapel.singkatan;
      } else if (value === "Lainnya") {
        newState.curriculum.subject = ""; // Reset let user type
      }
      
      return newState;
    });
  };

  const sanitizeHtmlForOutput = (rawHtml: string) => {
    if (!rawHtml) return "";
    let clean = rawHtml;
    const defaultLogoTag = `<img src="${config.Logo_Kiri || config.Logo_Kanan || 'https://lh3.googleusercontent.com/d/19TVwFRIp_t7sHTMntziM9SgZVoJAkhQU'}" alt="Logo Kemenag/Sekolah" class="logo-sekolah" style="max-height: 70px; width: auto; float: left; margin-right: 15px; object-fit: contain;" />`;
    
    clean = clean.replace(/\[\s*LOGO[^\n\]]*\]/gi, defaultLogoTag);
    clean = clean.replace(/\[\s*Gambar Logo[^\n\]]*\]/gi, defaultLogoTag);
    clean = clean.replace(/<button[^>]*>.*?cetak.*?<\/button>/gi, "");
    clean = clean.replace(/<a[^>]*>.*?cetak.*?<\/a>/gi, "");
    clean = clean.replace(/🖨️?\s*Cetak\s*Dokumen/gi, "");
    clean = clean.replace(/🖨️/g, "");
    return clean;
  };

  const handleGenerateDoc = async (targetType: string) => {
    const docMeta = docTypeList.find((d) => d.id === targetType);
    setGeneratingProgress(`Antre menyusun ${docMeta?.fullTitle || targetType}...`);

    const isModulType = targetType === "modul_ajar" || targetType === "lkpd" || targetType === "rubrik";
    const payloadData = isModulType ? formDataModul : formData;

    if (targetType === "modul_ajar") {
      enqueueJob("modul_ajar_umum", "modul_ajar_umum", payloadData);
      const jmlPertemuan = parseInt(payloadData.jumlahPertemuan || "1", 10);
      for (let i = 1; i <= jmlPertemuan; i++) {
        enqueueJob(`modul_ajar_meeting_${i}`, `modul_ajar_meeting_${i}`, payloadData);
      }
    } else {
      enqueueJob(targetType, targetType, payloadData);
    }
    notifySimpanSuccess(`${docMeta?.fullTitle || "Dokumen"} telah ditambahkan ke antrean.`);
  };

  const handleGenerate3ModulDocs = async () => {
    enqueueJob("modul_ajar_umum", "modul_ajar_umum", formDataModul);
    const jmlPertemuan = parseInt(formDataModul.jumlahPertemuan || "1", 10);
    for (let i = 1; i <= jmlPertemuan; i++) {
      enqueueJob(`modul_ajar_meeting_${i}`, `modul_ajar_meeting_${i}`, formDataModul);
    }
    enqueueJob("lkpd", "lkpd", formDataModul);
    enqueueJob("rubrik", "rubrik", formDataModul);
    setActiveDoc("modul_ajar");
    notifySimpanSuccess("3 Dokumen Modul Ajar telah ditambahkan ke antrean!");
  };

  const handleGenerateAllDocs = async () => {
    const types = docTypeList.map((d) => d.id);
    types.forEach(t => {
      const isModulType = t === "modul_ajar" || t === "lkpd" || t === "rubrik";
      const payloadData = isModulType ? formDataModul : formData;
      
      if (t === "modul_ajar") {
        enqueueJob("modul_ajar_umum", "modul_ajar_umum", payloadData);
        const jmlPertemuan = parseInt(payloadData.jumlahPertemuan || "1", 10);
        for (let i = 1; i <= jmlPertemuan; i++) {
          enqueueJob(`modul_ajar_meeting_${i}`, `modul_ajar_meeting_${i}`, payloadData);
        }
      } else {
        enqueueJob(t, t, payloadData);
      }
    });
    notifySimpanSuccess("Ke-9 Dokumen telah ditambahkan ke antrean AI secara berurutan!");
  };

  const handlePrintA4 = () => {
    const printArea = document.getElementById("kbc-document-render-area");
    const htmlToPrint = printArea ? printArea.innerHTML : generatedDocs[activeDoc];
    
    if (!htmlToPrint) {
      notifySimpanError("Belum ada dokumen KBC yang dihasilkan untuk dicetak.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      notifySimpanError("Gagal membuka jendela cetak. Periksa pembatas pop-up browser Anda.");
      return;
    }

    const isLandscape = activeDoc === "atp" || activeDoc === "prosem" || activeDoc === "kktp" || activeDoc === "rubrik";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cetak Perangkat Ajar KBC</title>
          <meta charset="utf-8" />
          <style>
            @page { size: A4 ${isLandscape ? "landscape" : "portrait"}; margin: 1.2cm; }
            body { font-family: Arial, Helvetica, sans-serif; color: #000; background: #fff; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #333; padding: 6px; font-size: 10pt; }
            th { background: #eee; }
          </style>
        </head>
        <body>${htmlToPrint}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownloadWord = () => {
    const printArea = document.getElementById("kbc-document-render-area");
    const htmlToPrint = printArea ? printArea.innerHTML : generatedDocs[activeDoc];

    if (!htmlToPrint) {
      notifySimpanError("Belum ada dokumen untuk diunduh.");
      return;
    }
    const docMeta = docTypeList.find((d) => d.id === activeDoc);
    const title = docMeta?.fullTitle || "Dokumen_KBC";
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${title}</title></head><body>
      ${htmlToPrint}
      </body></html>
    `;
    const blob = new Blob([content], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notifyUnduhSuccess(`File Word (.doc) ${title} berhasil diunduh!`);
  };

  const renderDocument = (docType: string) => {
    const data = generatedJson[docType];
    if (!data) {
      return <div dangerouslySetInnerHTML={{ __html: generatedDocs[docType] || "" }} />;
    }
    switch (docType) {
      case 'analisis_cp': return <AcpRenderer data={data} context={state} />;
      case 'tp': return <TpRenderer data={data} context={state} />;
      case 'atp': return <AtpRenderer data={data} context={state} />;
      case 'prota': return <ProtaRenderer data={data} context={state} />;
      case 'prosem': return <ProsemRenderer data={data} context={state} />;
      case 'kktp': return <KktpRenderer data={data} context={state} />;
      case 'modul_ajar': {
        const umum = generatedJson['modul_ajar_umum'];
        const meetings: any[] = [];
        const jml = parseInt(state.module.jumlahPertemuan || "1", 10);
        for (let i = 1; i <= jml; i++) {
          if (generatedJson[`modul_ajar_meeting_${i}`]) {
            meetings.push(generatedJson[`modul_ajar_meeting_${i}`]);
          }
        }
        return <ModulAjarRenderer umum={umum} meetings={meetings} context={state} />;
      }
      case 'lkpd': return <LkpdRenderer data={data} context={state} />;
      case 'rubrik': return <RubrikRenderer data={data} context={state} />;
      default: return <div dangerouslySetInnerHTML={{ __html: generatedDocs[docType] || "" }} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-emerald-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-emerald-400 text-slate-950 font-black px-3 py-1 rounded-full text-xs uppercase tracking-wider shadow-xs">
              <HeartHandshake className="w-4 h-4 text-slate-950" />
              <span>Kurikulum Berbasis Cinta (KBC) Kemenag RI</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-emerald-300">
              Perangkat Ajar KBC AI
            </h2>
            <p className="text-slate-200 text-xs md:text-sm leading-relaxed">
              Generator 9 Paket Perangkat Administrasi Pembelajaran KBC (Analisis CP, TP, ATP, Prota, Prosem, KKTP, Modul Ajar Deep Learning, LKPD, & Rubrik Formatif/Sumatif) terintegrasi Panca Cinta Kemenag & 10 Nilai PPRA!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
            {inputTab === "modul" ? (
              <button
                onClick={handleGenerate3ModulDocs}
                disabled={isGenerating}
                className="bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-950 font-black px-5 py-3 rounded-xl shadow-lg transition flex items-center justify-center space-x-2 text-xs md:text-sm cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Modul + LKPD + Rubrik</span>
              </button>
            ) : (
              <button
                onClick={handleGenerateAllDocs}
                disabled={isGenerating}
                className="bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black px-5 py-3 rounded-xl shadow-lg transition flex items-center justify-center space-x-2 text-xs md:text-sm cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate 9 Dokumen KBC</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setInputTab("admin")}
          className={`flex-1 py-3 px-4 rounded-xl text-xs md:text-sm font-black transition flex items-center justify-center space-x-2 cursor-pointer ${
            inputTab === "admin"
              ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-md border border-emerald-200 dark:border-emerald-800"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <LayoutList className="w-4 h-4 text-emerald-600" />
          <span>1. Input Administrasi KBC (ACP, TP, ATP, Prota, Prosem, KKTP)</span>
        </button>

        <button
          onClick={() => setInputTab("modul")}
          className={`flex-1 py-3 px-4 rounded-xl text-xs md:text-sm font-black transition flex items-center justify-center space-x-2 cursor-pointer ${
            inputTab === "modul"
              ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-md border border-emerald-200 dark:border-emerald-800"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <BookMarked className="w-4 h-4 text-amber-500" />
          <span>2. Input Khusus Modul Ajar, LKPD & Rubrik KBC</span>
        </button>
      </div>

      {inputTab === "admin" && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3 flex-wrap gap-2">
            <h3 className="text-base md:text-lg font-black text-slate-800 dark:text-slate-100 flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <span>Data Identitas Madrasah & Capaian Pembelajaran (Dokumen Administrasi 1-6)</span>
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleAutofillFromProfile}
                className="bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-400 font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center space-x-1.5 cursor-pointer border border-amber-300 dark:border-amber-800"
                title="Isi Otomatis dari Tab Pengaturan"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Isi dari Profil</span>
              </button>
              <button
                onClick={handleFillSample}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Isi Contoh Manual</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Kantor / Yayasan Kemenag</label>
              <input
                type="text"
                value={formData.kemenagOffice}
                onChange={(e) => updateState(s => ({ ...s, school: { ...s.school, kemenagOffice: e.target.value } }))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Satuan Pendidikan / Madrasah</label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => updateState(s => ({ ...s, school: { ...s.school, schoolName: e.target.value } }))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Mata Pelajaran</label>
              {!DATA_MAPEL_KEMENAG.some(m => m.namaMapel === formData.subject) && formData.subject !== "" && !["Lainnya"].includes(formData.subject) ? (
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => updateState(s => ({ ...s, curriculum: { ...s.curriculum, subject: e.target.value } }))}
                  placeholder="Ketik nama mapel lokal..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                />
              ) : (
                <select
                  value={DATA_MAPEL_KEMENAG.some(m => m.namaMapel === formData.subject) ? formData.subject : (formData.subject === "" ? "" : "Lainnya")}
                  onChange={handleSubjectChange}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  <option value="" disabled>Pilih Mata Pelajaran...</option>
                  {DATA_MAPEL_KEMENAG.map(m => (
                    <option key={m.id} value={m.namaMapel}>{m.namaMapel}</option>
                  ))}
                  <option value="Lainnya">Lainnya (Ketik Manual)...</option>
                </select>
              )}
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Singkatan Mapel (Kode TP)</label>
              <input
                type="text"
                value={formData.singkatanMapel}
                onChange={(e) => updateState(s => ({ ...s, curriculum: { ...s.curriculum, singkatanMapel: e.target.value } }))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Fase / Kelas</label>
              <input
                type="text"
                value={formData.level}
                onChange={(e) => updateState(s => ({ ...s, curriculum: { ...s.curriculum, level: e.target.value } }))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tahun Pelajaran</label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => updateState(s => ({ ...s, curriculum: { ...s.curriculum, year: e.target.value } }))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Alokasi Waktu Total</label>
              <input
                type="number"
                value={formData.totalJp}
                onChange={(e) => updateState(s => ({ ...s, curriculum: { ...s.curriculum, totalJp: Number(e.target.value) || 0 } }))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">JP per Minggu</label>
              <input
                type="number"
                value={formData.jpPerMinggu}
                onChange={(e) => updateState(s => ({ ...s, curriculum: { ...s.curriculum, jpPerMinggu: Number(e.target.value) || 0 } }))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Model Pembelajaran Sintaks</label>
              <select
                value={formData.learningModel}
                onChange={(e) => updateState(s => ({ ...s, curriculum: { ...s.curriculum, learningModel: e.target.value } }))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold cursor-pointer"
              >
                <option value="Discovery Learning">Discovery Learning</option>
                <option value="Problem Based Learning">Problem Based Learning</option>
                <option value="Project Based Learning">Project Based Learning</option>
                <option value="Inquiry Learning">Inquiry Learning</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Guru Penyusun</label>
              <input
                type="text"
                value={formData.teacher}
                onChange={(e) => updateState(s => ({ ...s, school: { ...s.school, teacher: e.target.value } }))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">NIP / NUPTK Guru</label>
              <input
                type="text"
                value={formData.nipTeacher}
                onChange={(e) => updateState(s => ({ ...s, school: { ...s.school, nipTeacher: e.target.value } }))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Kota & Tanggal TTD</label>
              <input
                type="text"
                value={formData.cityDate}
                onChange={(e) => updateState(s => ({ ...s, school: { ...s.school, cityDate: e.target.value } }))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Kepala Madrasah</label>
              <input
                type="text"
                value={formData.principal}
                onChange={(e) => updateState(s => ({ ...s, school: { ...s.school, principal: e.target.value } }))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">NIP Kepala Madrasah</label>
              <input
                type="text"
                value={formData.nipPrincipal}
                onChange={(e) => updateState(s => ({ ...s, school: { ...s.school, nipPrincipal: e.target.value } }))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                CP Umum / Rasional KBC (Panca Cinta & PPRA)
              </label>
              <textarea
                rows={4}
                value={formData.cpRasional}
                onChange={(e) => updateState(s => ({ ...s, cp: { ...s.cp, rasional: e.target.value } }))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-medium leading-relaxed"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Capaian Pembelajaran (CP) Per Elemen
              </label>
              <textarea
                rows={4}
                value={formData.cpElemen}
                onChange={(e) => updateState(s => ({ ...s, cp: { ...s.cp, elemen: e.target.value } }))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-medium leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {inputTab === "modul" && (
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl p-6 border-2 border-emerald-300 dark:border-emerald-800 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800 pb-3 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <BookMarked className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 className="text-base md:text-lg font-black text-emerald-950 dark:text-emerald-200">
                  Input Khusus: Modul Ajar Deep Learning, LKPD, & Rubrik KBC
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-400 font-medium">
                  Perangkat Pembelajaran Terhubung (1 TP, Sintak Model, Alokasi JP & Konteks Lokal Relevan)
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleFillSampleModul}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Isi Contoh Modul + LKPD + Rubrik</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-white dark:bg-slate-800 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900">
              <div className="md:col-span-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-800 dark:text-slate-200">
                    Pilih Tujuan Pembelajaran (Sumber Data: Tab Administrasi KBC)
                  </label>
                  {generatedJson["tp"] ? (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" /> Tersinkronisasi
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" /> TP Belum Digenerate
                    </span>
                  )}
                </div>
                
                <select
                  value={formDataModul.kodeTp}
                  disabled={!generatedJson["tp"]?.daftarTp}
                  onChange={(e) => {
                    const selectedKode = e.target.value;
                    const tpList = generatedJson["tp"]?.daftarTp || [];
                    const selectedTp = tpList.find((t: any) => t.kodeTp === selectedKode);
                    if (selectedTp) {
                      updateState(s => ({ 
                        ...s, 
                        module: { 
                          ...s.module, 
                          kodeTp: selectedTp.kodeTp,
                          elemenCp: selectedTp.elemen,
                          rumusanTp: selectedTp.rumusanTp
                        } 
                      }));
                    }
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-emerald-700 dark:text-emerald-400 cursor-pointer disabled:opacity-50"
                >
                  <option value="">-- {generatedJson["tp"]?.daftarTp ? "Silakan Pilih TP..." : "Generate TP di Tab 1 Terlebih Dahulu"} --</option>
                  {(generatedJson["tp"]?.daftarTp || []).map((tp: any, i: number) => (
                    <option key={i} value={tp.kodeTp}>
                      [{tp.kodeTp}] - {tp.elemen} - {tp.rumusanTp.substring(0, 100)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-500 dark:text-slate-400 block mb-1">Elemen CP (Read-Only)</label>
                <input
                  type="text"
                  value={formDataModul.elemenCp}
                  readOnly
                  placeholder="Terisi otomatis dari TP..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 font-semibold text-slate-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-bold text-slate-500 dark:text-slate-400 block mb-1">
                  Rumusan Lengkap Tujuan Pembelajaran (Read-Only)
                </label>
                <textarea
                  rows={2}
                  value={formDataModul.rumusanTp}
                  readOnly
                  placeholder="Terisi otomatis dari TP..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 font-semibold text-slate-500 leading-relaxed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-white dark:bg-slate-800 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900">
              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Model Pembelajaran</label>
                <select
                  value={formDataModul.learningModel}
                  onChange={(e) => updateState(s => ({ ...s, module: { ...s.module, learningModel: e.target.value } }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-emerald-700 dark:text-emerald-400 cursor-pointer"
                >
                  <option value="Discovery Learning">Discovery Learning</option>
                  <option value="Problem Based Learning (PBL)">Problem Based Learning (PBL)</option>
                  <option value="Project Based Learning (PjBL)">Project Based Learning (PjBL)</option>
                  <option value="Inquiry Learning">Inquiry Learning</option>
                  <option value="Cooperative Learning">Cooperative Learning</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Jumlah Pertemuan</label>
                <input
                  type="number"
                  value={formDataModul.jumlahPertemuan}
                  onChange={(e) => updateState(s => ({ ...s, module: { ...s.module, jumlahPertemuan: Number(e.target.value) || 0 } }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Alokasi JP Per Pertemuan</label>
                <input
                  type="number"
                  value={formDataModul.jpPerPertemuan}
                  onChange={(e) => updateState(s => ({ ...s, module: { ...s.module, jpPerPertemuan: Number(e.target.value) || 0 } }))}
                  placeholder="misal: 2 JP (2 x 45 menit)"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold"
                />
              </div>

              <div className="md:col-span-3">
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Urutan Sintaks Model Pembelajaran
                </label>
                <input
                  type="text"
                  value={formDataModul.sintakModel as string}
                  onChange={(e) => updateState(s => ({ ...s, module: { ...s.module, sintakModel: e.target.value } }))}
                  placeholder="Urutan sintaks lengkap..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="md:col-span-3">
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Topik / Konteks Lokal Relevan (Kearifan Lokal Kerinci / Isu Lingkungan / Budaya)
                </label>
                <textarea
                  rows={2}
                  value={formDataModul.topikLokal}
                  onChange={(e) => updateState(s => ({ ...s, module: { ...s.module, topikLokal: e.target.value } }))}
                  placeholder="misal: Isu lingkungan Hutan TNKS Kerinci, Budaya Gotong Royong Adat Kerinci, Tradisi Mudik Kerinci..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold leading-relaxed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-white dark:bg-slate-800 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Kantor Kemenag Kabupaten/Kota</label>
                <input
                  type="text"
                  value={formDataModul.kemenagOffice}
                  onChange={(e) => updateState(s => ({ ...s, school: { ...s.school, kemenagOffice: e.target.value } }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Madrasah / Sekolah</label>
                <input
                  type="text"
                  value={formDataModul.schoolName}
                  onChange={(e) => updateState(s => ({ ...s, school: { ...s.school, schoolName: e.target.value } }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Alamat Lengkap Madrasah</label>
                <input
                  type="text"
                  value={formDataModul.schoolAddress}
                  onChange={(e) => updateState(s => ({ ...s, school: { ...s.school, schoolAddress: e.target.value } }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Mata Pelajaran</label>
                <input
                  type="text"
                  value={formDataModul.subject}
                  onChange={(e) => updateState(s => ({ ...s, curriculum: { ...s.curriculum, subject: e.target.value } }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Fase / Kelas</label>
                <input
                  type="text"
                  value={formDataModul.level}
                  onChange={(e) => updateState(s => ({ ...s, curriculum: { ...s.curriculum, level: e.target.value } }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tahun Pelajaran</label>
                <input
                  type="text"
                  value={formDataModul.year}
                  onChange={(e) => updateState(s => ({ ...s, curriculum: { ...s.curriculum, year: e.target.value } }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Guru Penyusun</label>
                <input
                  type="text"
                  value={formDataModul.teacher}
                  onChange={(e) => updateState(s => ({ ...s, school: { ...s.school, teacher: e.target.value } }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">NIP Guru</label>
                <input
                  type="text"
                  value={formDataModul.nipTeacher}
                  onChange={(e) => updateState(s => ({ ...s, school: { ...s.school, nipTeacher: e.target.value } }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Kota & Tanggal TTD</label>
                <input
                  type="text"
                  value={formDataModul.cityDate}
                  onChange={(e) => updateState(s => ({ ...s, school: { ...s.school, cityDate: e.target.value } }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Kepala Madrasah</label>
                <input
                  type="text"
                  value={formDataModul.principal}
                  onChange={(e) => updateState(s => ({ ...s, school: { ...s.school, principal: e.target.value } }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">NIP Kepala Madrasah</label>
                <input
                  type="text"
                  value={formDataModul.nipPrincipal}
                  onChange={(e) => updateState(s => ({ ...s, school: { ...s.school, nipPrincipal: e.target.value } }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md p-4 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
          <div className="flex items-center space-x-2">
            <HeartHandshake className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm md:text-base">
              Pilih Dokumen KBC Yang Ingin Digenerate / Ditampilkan:
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleGenerateDoc(activeDoc)}
              disabled={isGenerating}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Generate {docTypeList.find((d) => d.id === activeDoc)?.label}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
          {docTypeList.map((doc) => {
            const Icon = doc.icon;
            
            let jobStatus = jobs[doc.id]?.status;
            let isFinished = jobStatus === "success" || !!generatedJson[doc.id];

            if (doc.id === "modul_ajar") {
              const umumStatus = jobs["modul_ajar_umum"]?.status;
              const anyMeetingRunning = Object.keys(jobs).some(k => k.startsWith("modul_ajar_meeting_") && jobs[k].status === "running");
              if (umumStatus === "running" || anyMeetingRunning) jobStatus = "running";
              else if (umumStatus === "success") isFinished = true;
            }
            
            return (
              <button
                key={doc.id}
                onClick={() => handleSelectDoc(doc.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  activeDoc === doc.id
                    ? "bg-emerald-50 dark:bg-emerald-900/50 border-emerald-500 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 hover:border-emerald-300"
                }`}
                title={doc.fullTitle}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 mb-1 ${activeDoc === doc.id ? "text-emerald-600" : "text-slate-400"}`} />
                  {jobStatus === "running" && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping"></span>
                  )}
                  {isFinished && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white"></span>
                  )}
                </div>
                <span className="text-[10px] font-medium text-center leading-tight mt-1">{doc.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {isGenerating && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-xl flex items-center space-x-4">
          <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
          <div className="text-left">
            <h4 className="font-bold text-yellow-800 dark:text-yellow-400 text-sm">AI Sedang Memproses Antrean...</h4>
            <p className="text-xs text-yellow-700 dark:text-yellow-500">
              {Object.values(jobs).filter(j => j.status === 'running').map(j => j.progressMessage).join(', ') || "Silakan tunggu..."}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <HeartHandshake className="w-5 h-5 text-emerald-400" />
            <span className="font-extrabold text-sm md:text-base text-emerald-300">
              {docTypeList.find((d) => d.id === activeDoc)?.fullTitle}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrintA4}
              disabled={!generatedDocs[activeDoc]}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center space-x-2 disabled:opacity-40 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak PDF (A4)</span>
            </button>
            <button
              onClick={handleDownloadWord}
              disabled={!generatedDocs[activeDoc]}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center space-x-2 disabled:opacity-40 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Word (.doc)</span>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-x-auto min-h-[500px] bg-slate-50 dark:bg-slate-900">
          {generatedDocs[activeDoc] ? (
            <div id="kbc-document-render-area" className="a4-preview-container bg-white text-black p-8 rounded-lg shadow-inner min-h-[800px] relative">
              {renderDocument(activeDoc)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-slate-800 text-emerald-600 rounded-full flex items-center justify-center">
                <HeartHandshake className="w-8 h-8" />
              </div>
              <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg">
                Belum ada dokumen {docTypeList.find((d) => d.id === activeDoc)?.label}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                Klik tombol "Generate {docTypeList.find((d) => d.id === activeDoc)?.label}" di atas untuk menyusun dokumen KBC secara otomatis menggunakan AI.
              </p>
              <button
                onClick={() => handleGenerateDoc(activeDoc)}
                disabled={isGenerating}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-md transition flex items-center space-x-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Mulai Generate {docTypeList.find((d) => d.id === activeDoc)?.label}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
