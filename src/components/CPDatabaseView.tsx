import React, { useState, useRef } from "react";
import { Database, Plus, Trash2, Edit, Save, X, Search, BookOpen, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, HelpCircle } from "lucide-react";
import { Pengaturan, CpTemplate } from "../types";
import { savePengaturan } from "../lib/firebase";
import { notifySimpanSuccess, notifySimpanError } from "../lib/swal";
import { KamusPedagogiModal } from "./KamusPedagogiModal";
import { Button } from "./ui";
import * as XLSX from "xlsx";

interface CPDatabaseViewProps {
  config: Pengaturan;
}

interface ImportRow {
  rowIndex: number;
  name: string;
  rasional: string;
  elemen: string;
  valid: boolean;
  error?: string;
}

export const CPDatabaseView: React.FC<CPDatabaseViewProps> = ({ config }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<CpTemplate>({ id: "", name: "", rasional: "", elemen: "" });
  const [showImportModal, setShowImportModal] = useState(false);
  const [showKamusModal, setShowKamusModal] = useState<"model" | "metode" | null>(null);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const templates = config.cpTemplates || [];

  const filteredTemplates = templates.filter(t =>
    (t.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.rasional || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNew = () => {
    setEditForm({ id: Date.now().toString(), name: "", rasional: "", elemen: "", mataPelajaran: "", singkatanMapel: "", faseKelas: "", jpPerMinggu: "", alokasiWaktuTotal: "", modelPembelajaran: "", metodePembelajaran: "" });
    setIsEditing(true);
  };

  const handleEdit = (template: CpTemplate) => {
    setEditForm({ ...template });
    setIsEditing(true);
  };

  const handleDelete = async (id: string, name: string) => {
    const confirm = window.confirm(`Apakah Anda yakin ingin menghapus template "${name}"?`);
    if (!confirm) return;
    const updatedConfig = { ...config, cpTemplates: templates.filter(t => t.id !== id) };
    try {
      await savePengaturan(updatedConfig);
      notifySimpanSuccess(`Template "${name}" berhasil dihapus.`);
    } catch (err) {
      notifySimpanError("Gagal menghapus template dari Firebase.");
    }
  };

  const handleSave = async () => {
    if (!editForm.name.trim()) { notifySimpanError("Nama template tidak boleh kosong."); return; }
    let updatedTemplates = [...templates];
    const existingIndex = updatedTemplates.findIndex(t => t.id === editForm.id);
    if (existingIndex >= 0) { updatedTemplates[existingIndex] = editForm; } else { updatedTemplates.push(editForm); }
    try {
      await savePengaturan({ ...config, cpTemplates: updatedTemplates });
      notifySimpanSuccess(`Template "${editForm.name}" berhasil disimpan.`);
      setIsEditing(false);
    } catch (err) {
      notifySimpanError("Gagal menyimpan template ke Firebase.");
    }
  };

  // â”€â”€ EXCEL IMPORT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["Nama Template", "Rasional Mapel", "CP Per Elemen"],
      ["CP Akidah Akhlak Fase B (MI Kelas 3-4)", "Mata pelajaran Akidah Akhlak bertujuan membentuk peserta didik yang beriman, berakhlak mulia...", "Elemen Akidah: Peserta didik mampu memahami dan meyakini rukun iman...\n\nElemen Akhlak: Peserta didik mampu mengamalkan perilaku terpuji..."],
      ["CP Fikih Fase C (MI Kelas 5-6)", "Mata pelajaran Fikih menekankan kemampuan peserta didik dalam memahami dan mempraktikkan hukum Islam...", "Elemen Fikih Ibadah: Peserta didik mampu melaksanakan ibadah mahdhah dengan benar...\n\nElemen Fikih Muamalah: Peserta didik mampu menjelaskan hukum muamalah dasar..."],
    ]);
    ws["!cols"] = [{ wch: 35 }, { wch: 60 }, { wch: 80 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template CP");
    XLSX.writeFile(wb, "Template_Import_CP_KBC.xlsx");
    notifySimpanSuccess("Template Excel berhasil diunduh!");
  };

  const handleExportData = () => {
    if (templates.length === 0) {
      notifySimpanError("Belum ada data template untuk diekspor.");
      return;
    }

    const exportData = templates.map(t => [t.name, t.rasional || "", t.elemen || ""]);
    const ws = XLSX.utils.aoa_to_sheet([
      ["Nama Template", "Rasional Mapel", "CP Per Elemen"],
      ...exportData
    ]);
    
    ws["!cols"] = [{ wch: 35 }, { wch: 60 }, { wch: 80 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Database CP");
    
    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Backup_Database_CP_${timestamp}.xlsx`);
    notifySimpanSuccess("Data berhasil diekspor ke Excel!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Skip header row (row 0)
        const parsed: ImportRow[] = rows.slice(1).filter(r => r.some(cell => cell !== undefined && cell !== "")).map((row, idx) => {
          const name = String(row[0] || "").trim();
          const rasional = String(row[1] || "").trim();
          const elemen = String(row[2] || "").trim();
          const valid = name.length > 0 && elemen.length > 0;
          return {
            rowIndex: idx + 2,
            name,
            rasional,
            elemen,
            valid,
            error: !name ? "Kolom 'Nama Template' wajib diisi" : !elemen ? "Kolom 'CP Per Elemen' wajib diisi" : undefined
          };
        });

        setImportRows(parsed);
        setShowImportModal(true);
      } catch (err) {
        notifySimpanError("Gagal membaca file Excel. Pastikan format file benar (.xlsx atau .xls).");
      }
    };
    reader.readAsArrayBuffer(file);
    // Reset input agar file yang sama bisa di-upload ulang
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConfirmImport = async () => {
    const validRows = importRows.filter(r => r.valid);
    if (validRows.length === 0) { notifySimpanError("Tidak ada baris data yang valid untuk diimpor."); return; }

    setIsImporting(true);
    const newTemplates: CpTemplate[] = validRows.map(r => ({
      id: `import_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: r.name,
      rasional: r.rasional,
      elemen: r.elemen
    }));

    const updatedConfig = {
      ...config,
      cpTemplates: [...templates, ...newTemplates]
    };

    try {
      await savePengaturan(updatedConfig);
      notifySimpanSuccess(`âœ… ${validRows.length} template CP berhasil diimpor ke database!`);
      setShowImportModal(false);
      setImportRows([]);
    } catch (err) {
      notifySimpanError("Gagal menyimpan data ke Firebase. Coba lagi.");
    } finally {
      setIsImporting(false);
    }
  };

  const validCount = importRows.filter(r => r.valid).length;
  const invalidCount = importRows.filter(r => !r.valid).length;

  // â”€â”€ RENDER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex items-center space-x-4">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
            <Database className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Database CP Elemen</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Kelola template Capaian Pembelajaran untuk digunakan pada RPP & Modul KBC.
            </p>
          </div>
        </div>

        {!isEditing && (
          <div className="relative z-10 flex items-center gap-2 flex-wrap">
            <Button onClick={handleDownloadTemplate} variant="outline" size="sm" icon={Download} title="Unduh template Excel untuk import bulk">
              Unduh Template Excel
            </Button>

            <Button onClick={handleExportData} variant="secondary" size="sm" icon={Download} title="Ekspor semua template ke file Excel">
              Ekspor Data
            </Button>

            <label
              className="inline-flex h-8 items-center gap-2 rounded-lg bg-emerald-600 px-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2 cursor-pointer"
              title="Import banyak CP sekaligus dari file Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import Excel</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="sr-only"
                onChange={handleFileUpload}
              />
            </label>

            <Button onClick={handleAddNew} variant="primary" size="sm" icon={Plus}>
              Tambah CP Baru
            </Button>
          </div>
        )}
      </div>

      {/* Import Preview Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="cp-import-title" className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-3xl max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
                <h2 id="cp-import-title" className="text-lg font-black text-slate-800 dark:text-white">Pratinjau Import Excel</h2>
              </div>
              <button type="button" aria-label="Tutup pratinjau import" onClick={() => { setShowImportModal(false); setImportRows([]); }} className="w-11 h-11 inline-flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Stats */}
            <div className="px-6 py-4 flex gap-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-sm font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{validCount} baris valid</span>
              </div>
              {invalidCount > 0 && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-lg text-sm font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>{invalidCount} baris error (tidak akan diimpor)</span>
                </div>
              )}
            </div>

            {/* Rows Preview */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {importRows.map((row) => (
                <div key={row.rowIndex} className={`rounded-2xl border p-4 text-sm ${row.valid ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10" : "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="font-black text-slate-800 dark:text-slate-100 leading-snug">{row.name || <span className="text-slate-400 italic">Nama kosong</span>}</span>
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${row.valid ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400" : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400"}`}>
                      Baris {row.rowIndex} {row.valid ? "✓" : "✕"}
                    </span>
                  </div>
                  {row.error && <p className="text-red-600 dark:text-red-400 text-xs font-medium mb-1">⚠ {row.error}</p>}
                  {row.rasional && <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed mb-1"><span className="font-semibold text-slate-600 dark:text-slate-300">Rasional:</span> {row.rasional}</p>}
                  {row.elemen && <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed"><span className="font-semibold text-slate-600 dark:text-slate-300">Elemen:</span> {row.elemen}</p>}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <Button type="button" variant="ghost" onClick={() => { setShowImportModal(false); setImportRows([]); }}>Batal</Button>
              <Button type="button" variant="primary" onClick={handleConfirmImport} disabled={validCount === 0} loading={isImporting} icon={Upload}>
                {isImporting ? "Menyimpan..." : `Impor ${validCount} Template`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      {isEditing ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-500" />
              {templates.some(t => t.id === editForm.id) ? "Edit Template CP" : "Buat Template CP Baru"}
            </h2>
            <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Template <span className="text-red-500">*</span></label>
              <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Contoh: CP Fikih Fase B (MI Kelas 3-4)" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Rasional Mata Pelajaran
                <span className="ml-2 text-[10px] font-normal bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">âœ¨ KBC otomatis</span>
              </label>
              <textarea rows={4} value={editForm.rasional} onChange={e => setEditForm({ ...editForm, rasional: e.target.value })} placeholder="Tulis rasional mapel secara ringkas. Integrasi 8 DPL, Panca Cinta & PPRA dilakukan otomatis oleh AI." className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal" />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Capaian Pembelajaran (CP) Per Elemen <span className="text-red-500">*</span></label>
              <textarea rows={6} value={editForm.elemen} onChange={e => setEditForm({ ...editForm, elemen: e.target.value })} placeholder={"Elemen Pemahaman: ...\nElemen Keterampilan: ..."} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
            </div>

            {/* Data Per Mapel */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span className="w-4 h-4 bg-teal-100 dark:bg-teal-900/40 rounded flex items-center justify-center text-[9px]">⚙</span>
                Data Spesifik Mata Pelajaran
                <span className="font-normal normal-case text-slate-400 dark:text-slate-500">(otomatis mengisi form saat template ini dipilih)</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-sm">Mata Pelajaran <span className="text-red-500">*</span></label>
                  <input type="text" value={editForm.mataPelajaran || ""} onChange={e => setEditForm({ ...editForm, mataPelajaran: e.target.value })} placeholder="Contoh: Al Qur'an Hadis" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-sm">Singkatan / Kode TP</label>
                  <input type="text" value={editForm.singkatanMapel || ""} onChange={e => setEditForm({ ...editForm, singkatanMapel: e.target.value })} placeholder="Contoh: QH" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-sm">Fase / Kelas</label>
                  <input type="text" value={editForm.faseKelas || ""} onChange={e => setEditForm({ ...editForm, faseKelas: e.target.value })} placeholder="Contoh: Fase D / Kelas VII" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-sm">JP per Minggu</label>
                  <input type="text" value={editForm.jpPerMinggu || ""} onChange={e => setEditForm({ ...editForm, jpPerMinggu: e.target.value })} placeholder="Contoh: 2" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-sm">Alokasi Waktu Total (JP)</label>
                  <input type="text" value={editForm.alokasiWaktuTotal || ""} onChange={e => setEditForm({ ...editForm, alokasiWaktuTotal: e.target.value })} placeholder="Contoh: 72" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 text-sm">Model Pembelajaran</label>
                    <button onClick={() => setShowKamusModal("model")} title="Lihat Kamus Pedagogi" className="text-emerald-600 hover:text-emerald-500 transition-colors">
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </div>
                  <input type="text" list="cp-model-pembelajaran-list" value={editForm.modelPembelajaran || ""} onChange={e => setEditForm({ ...editForm, modelPembelajaran: e.target.value })} placeholder="Contoh: Discovery Learning" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm" />
                  <datalist id="cp-model-pembelajaran-list">
                    <option value="Discovery Learning" />
                    <option value="Problem Based Learning (PBL)" />
                    <option value="Project Based Learning (PjBL)" />
                    <option value="Inquiry Learning" />
                    <option value="Pembelajaran Berdiferensiasi" />
                    <option value="Cooperative Learning" />
                    <option value="Flipped Classroom" />
                    <option value="Teaching at the Right Level (TaRL)" />
                  </datalist>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 text-sm">Metode Pembelajaran <span className="text-slate-400 font-normal">(Opsional)</span></label>
                    <button onClick={() => setShowKamusModal("metode")} title="Lihat Kamus Pedagogi" className="text-emerald-600 hover:text-emerald-500 transition-colors">
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </div>
                  <input type="text" list="cp-metode-pembelajaran-list" value={editForm.metodePembelajaran || ""} onChange={e => setEditForm({ ...editForm, metodePembelajaran: e.target.value })} placeholder="Bila kosong, AI akan memilih otomatis" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm" />
                  <datalist id="cp-metode-pembelajaran-list">
                    <option value="Diskusi" />
                    <option value="Ceramah Interaktif" />
                    <option value="Tanya Jawab" />
                    <option value="Role Playing" />
                    <option value="Demonstrasi" />
                    <option value="Eksperimen Terbimbing" />
                    <option value="Kerja Kelompok (Kolaborasi)" />
                    <option value="Presentasi" />
                    <option value="Observasi" />
                    <option value="Penugasan Proyek" />
                  </datalist>
                </div>
              </div>
            </div>
          </div>


          <div className="mt-8 flex justify-end gap-3">
            <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Batal</button>
            <button onClick={handleSave} className="px-6 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" />
              <span>Simpan Template</span>
            </button>
          </div>
        </div>
      ) : (
        /* Template List */
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px]">
          <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="relative max-w-md">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Cari nama atau isi CP..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow" />
            </div>
          </div>

          <div className="flex-1 p-4 sm:p-6">
            {filteredTemplates.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Database className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">Belum Ada Template</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                  {searchTerm ? "Tidak ada template yang cocok dengan pencarian Anda." : "Tambah template satu per satu atau klik 'Import Excel' untuk memasukkan banyak CP sekaligus."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map(template => (
                  <div key={template.id} className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 pr-8 line-clamp-2">{template.name}</h3>
                      <div className="flex items-center space-x-1 absolute top-4 right-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 p-1 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                        <button type="button" onClick={() => handleEdit(template)} className="w-9 h-9 inline-flex items-center justify-center text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" title="Edit" aria-label={`Edit template ${template.name}`}><Edit className="w-4 h-4" /></button>
                        <button type="button" onClick={() => handleDelete(template.id, template.name)} className="w-9 h-9 inline-flex items-center justify-center text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500" title="Hapus" aria-label={`Hapus template ${template.name}`}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase block mb-1">Rasional</span>
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">{template.rasional || <span className="text-slate-400 italic">Kosong</span>}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase block mb-1">Per Elemen</span>
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-4 leading-relaxed whitespace-pre-wrap">{template.elemen || <span className="text-slate-400 italic">Kosong</span>}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      <KamusPedagogiModal isOpen={!!showKamusModal} initialTab={showKamusModal || "model"} onClose={() => setShowKamusModal(null)} />
    </div>
  );
};

