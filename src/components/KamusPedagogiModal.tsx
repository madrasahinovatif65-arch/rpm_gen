import React from "react";
import { X, BookOpen, Lightbulb, Users, ArrowRightCircle } from "lucide-react";

interface KamusPedagogiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KamusPedagogiModal: React.FC<KamusPedagogiModalProps> = ({ isOpen, onClose }) => {
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Section: Model Pembelajaran */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">1. Model Pembelajaran</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Model adalah kerangka utuh (sintaks/langkah-langkah baku) dari awal sampai akhir kelas.</p>
            
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

          {/* Section: Metode Pembelajaran */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">2. Metode Pembelajaran</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Metode adalah teknik spesifik yang disisipkan di dalam model pembelajaran.</p>
            
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
                <div key={i} className="flex gap-2 items-start bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                  <ArrowRightCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm text-slate-700 dark:text-slate-300">{m.name}</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-xl font-bold transition-colors"
          >
            Tutup Kamus
          </button>
        </div>
      </div>
    </div>
  );
};
