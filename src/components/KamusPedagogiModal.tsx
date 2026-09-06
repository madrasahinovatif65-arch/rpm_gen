import React, { useState, useEffect } from "react";
import { X, BookOpen, Lightbulb, Users, ArrowRightCircle } from "lucide-react";

interface KamusPedagogiModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "model" | "metode";
}

export const KamusPedagogiModal: React.FC<KamusPedagogiModalProps> = ({ isOpen, onClose, initialTab = "model" }) => {
  const [activeTab, setActiveTab] = useState<"model" | "metode">(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Kamus Pedagogi KBC</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Referensi Model & Metode Pembelajaran Kurikulum Merdeka</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 pt-4 gap-6">
          <button
            onClick={() => setActiveTab("model")}
            className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "model" 
                ? "border-amber-500 text-amber-600 dark:text-amber-400" 
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            Model Pembelajaran
          </button>
          <button
            onClick={() => setActiveTab("metode")}
            className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "metode" 
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" 
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Users className="w-4 h-4" />
            Metode Pembelajaran
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Section: Model Pembelajaran */}
          {activeTab === "model" && (
            <section className="animate-in fade-in duration-300">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-900/50 font-medium">
                <strong className="text-amber-700 dark:text-amber-400">Model</strong> adalah kerangka utuh (sintaks/langkah-langkah baku) dari awal sampai akhir kelas.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Discovery Learning</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Siswa didorong menemukan sendiri konsep materi melalui observasi dan eksperimen (berpusat pada rasa ingin tahu).</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Problem Based Learning (PBL)</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Dimulai dengan memberikan masalah nyata yang harus dipecahkan siswa melalui diskusi & penyelidikan kritis.</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Project Based Learning (PjBL)</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Berbasis proyek karya/produk. Siswa menyusun perencanaan, membuat jadwal, dan menghasilkan karya nyata.</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Inquiry Learning</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Mirip penemuan, namun lebih terstruktur seperti peneliti ilmiah (merumuskan hipotesis & menguji data).</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Pembelajaran Berdiferensiasi</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Materi dan tugas disesuaikan dengan kesiapan belajar, minat, dan profil setiap siswa agar tidak ada yang tertinggal.</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Cooperative Learning</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Fokus pada gotong royong dan kerjasama. Contoh: Jigsaw (saling mengajar ahli materi ke kelompok asal).</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Flipped Classroom</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Teori dipelajari siswa di rumah (via video/buku), sementara di kelas murni untuk diskusi dan praktik.</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Teaching at the Right Level (TaRL)</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Pengelompokan siswa bukan berdasarkan umur/kelas, melainkan level kemampuan fondasi awalnya.</p>
                </div>
              </div>
            </section>
          )}

          {/* Section: Metode Pembelajaran */}
          {activeTab === "metode" && (
            <section className="animate-in fade-in duration-300">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/50 font-medium">
                <strong className="text-emerald-700 dark:text-emerald-400">Metode</strong> adalah teknik spesifik yang bebas dipilih/diganti dan disisipkan di dalam sintaks sebuah model pembelajaran.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { name: "Diskusi", desc: "Tukar menukar pendapat di kelas." },
                  { name: "Ceramah Interaktif", desc: "Penjelasan dua arah dengan tanya jawab." },
                  { name: "Role Playing", desc: "Bermain peran / simulasi keadaan nyata." },
                  { name: "Demonstrasi", desc: "Guru memperagakan alat/fenomena." },
                  { name: "Eksperimen", desc: "Siswa mencoba dan mengamati langsung." },
                  { name: "Tanya Jawab", desc: "Pancingan berpikir kritis dua arah." },
                  { name: "Presentasi", desc: "Siswa memaparkan hasil kerjanya." },
                  { name: "Resitasi", desc: "Penugasan khusus yang harus dipertanggungjawabkan." },
                  { name: "Mind Mapping", desc: "Pembuatan peta konsep visual." }
                ].map((m, i) => (
                  <div key={i} className="flex gap-2 items-start bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                    <ArrowRightCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-sm text-slate-700 dark:text-slate-300">{m.name}</h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-xl font-bold transition-colors shadow-md"
          >
            Tutup Kamus
          </button>
        </div>
      </div>
    </div>
  );
};
