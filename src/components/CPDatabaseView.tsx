import React, { useState } from "react";
import { Database, Plus, Trash2, Edit, Save, X, Search, BookOpen } from "lucide-react";
import { Pengaturan, CpTemplate } from "../types";
import { savePengaturan } from "../lib/firebase";
import { notifySimpanSuccess, notifySimpanError } from "../lib/swal";

interface CPDatabaseViewProps {
  config: Pengaturan;
}

export const CPDatabaseView: React.FC<CPDatabaseViewProps> = ({ config }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<CpTemplate>({
    id: "",
    name: "",
    rasional: "",
    elemen: ""
  });

  const templates = config.cpTemplates || [];
  
  const filteredTemplates = templates.filter(t => 
    (t.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.rasional || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNew = () => {
    setEditForm({
      id: Date.now().toString(),
      name: "",
      rasional: "",
      elemen: ""
    });
    setIsEditing(true);
  };

  const handleEdit = (template: CpTemplate) => {
    setEditForm({ ...template });
    setIsEditing(true);
  };

  const handleDelete = async (id: string, name: string) => {
    const confirm = window.confirm(`Apakah Anda yakin ingin menghapus template "${name}"?`);
    if (!confirm) return;

    const updatedConfig = {
      ...config,
      cpTemplates: templates.filter(t => t.id !== id)
    };

    try {
      await savePengaturan(updatedConfig);
      notifySimpanSuccess(`Template "${name}" berhasil dihapus.`);
    } catch (err) {
      notifySimpanError("Gagal menghapus template dari Firebase.");
    }
  };

  const handleSave = async () => {
    if (!editForm.name.trim()) {
      notifySimpanError("Nama template tidak boleh kosong.");
      return;
    }

    let updatedTemplates = [...templates];
    const existingIndex = updatedTemplates.findIndex(t => t.id === editForm.id);

    if (existingIndex >= 0) {
      updatedTemplates[existingIndex] = editForm;
    } else {
      updatedTemplates.push(editForm);
    }

    const updatedConfig = {
      ...config,
      cpTemplates: updatedTemplates
    };

    try {
      await savePengaturan(updatedConfig);
      notifySimpanSuccess(`Template "${editForm.name}" berhasil disimpan.`);
      setIsEditing(false);
    } catch (err) {
      notifySimpanError("Gagal menyimpan template ke Firebase.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex items-center space-x-4">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
            <Database className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              Database CP Elemen
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Kelola template Capaian Pembelajaran untuk digunakan pada RPP & Modul KBC.
            </p>
          </div>
        </div>

        {!isEditing && (
          <button
            onClick={handleAddNew}
            className="relative z-10 flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah CP Baru</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-500" />
              {templates.some(t => t.id === editForm.id) ? "Edit Template CP" : "Buat Template CP Baru"}
            </h2>
            <button
              onClick={() => setIsEditing(false)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Nama Template <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Contoh: CP Fikih Fase D (MTs)"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                CP Umum / Rasional KBC (Panca Cinta & PPRA)
              </label>
              <textarea
                rows={4}
                value={editForm.rasional}
                onChange={e => setEditForm({ ...editForm, rasional: e.target.value })}
                placeholder="Masukkan redaksi rasional CP Umum di sini..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Capaian Pembelajaran (CP) Per Elemen
              </label>
              <textarea
                rows={6}
                value={editForm.elemen}
                onChange={e => setEditForm({ ...editForm, elemen: e.target.value })}
                placeholder="Elemen Pemahaman: ...&#10;Elemen Keterampilan: ..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Template</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px]">
          <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="relative max-w-md">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama atau isi CP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow"
              />
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
                  {searchTerm ? "Tidak ada template yang cocok dengan pencarian Anda." : "Anda belum menyimpan template Capaian Pembelajaran apapun. Klik 'Tambah CP Baru' untuk mulai membuat."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map(template => (
                  <div key={template.id} className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all flex flex-col">
                    
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 pr-8 line-clamp-2">
                        {template.name}
                      </h3>
                      <div className="flex items-center space-x-1 absolute top-4 right-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-1 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                        <button
                          onClick={() => handleEdit(template)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(template.id, template.name)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase block mb-1">Rasional</span>
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                          {template.rasional || <span className="text-slate-400 italic">Kosong</span>}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase block mb-1">Per Elemen</span>
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-4 leading-relaxed whitespace-pre-wrap">
                          {template.elemen || <span className="text-slate-400 italic">Kosong</span>}
                        </p>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
