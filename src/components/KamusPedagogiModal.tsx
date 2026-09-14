import React, { useState, useEffect, useRef } from "react";
import { X, BookOpen, Lightbulb, Users, ArrowRightCircle } from "lucide-react";

interface KamusPedagogiModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "model" | "metode" | "asesmen";
}

export const KamusPedagogiModal: React.FC<KamusPedagogiModalProps> = ({ isOpen, onClose, initialTab = "model" }) => {
  const [activeTab, setActiveTab] = useState<"model" | "metode" | "asesmen">(initialTab);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement;
    setActiveTab(initialTab);
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isOpen, initialTab, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="kamus-pedagogi-title"
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 id="kamus-pedagogi-title" className="text-lg font-bold text-slate-800 dark:text-slate-100">Kamus Pedagogi KBC</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Referensi Model & Metode Pembelajaran Kurikulum Merdeka</p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="w-11 h-11 inline-flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Tutup Kamus Pedagogi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div role="tablist" aria-label="Kategori Kamus Pedagogi" className="flex border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 pt-4 gap-6">
          <button
            id="kamus-tab-model"
            type="button"
            role="tab"
            aria-selected={activeTab === "model"}
            aria-controls="kamus-panel-model"
            onClick={() => setActiveTab("model")}
            className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              activeTab === "model" 
                ? "border-amber-500 text-amber-600 dark:text-amber-400" 
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            Model Pembelajaran
          </button>
          <button
            id="kamus-tab-metode"
            type="button"
            role="tab"
            aria-selected={activeTab === "metode"}
            aria-controls="kamus-panel-metode"
            onClick={() => setActiveTab("metode")}
            className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              activeTab === "metode" 
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" 
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Users className="w-4 h-4" />
            Metode Pembelajaran
          </button>
          <button
            id="kamus-tab-asesmen"
            type="button"
            role="tab"
            aria-selected={activeTab === "asesmen"}
            aria-controls="kamus-panel-asesmen"
            onClick={() => setActiveTab("asesmen")}
            className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              activeTab === "asesmen" 
                ? "border-blue-500 text-blue-600 dark:text-blue-400" 
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Bentuk Asesmen
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Section: Model Pembelajaran */}
          {activeTab === "model" && (
            <section id="kamus-panel-model" role="tabpanel" aria-labelledby="kamus-tab-model" className="animate-in fade-in duration-300">
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
            <section id="kamus-panel-metode" role="tabpanel" aria-labelledby="kamus-tab-metode" className="animate-in fade-in duration-300">
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

          {activeTab === "asesmen" && (
            <section id="kamus-panel-asesmen" role="tabpanel" aria-labelledby="kamus-tab-asesmen" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-4">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span className="text-blue-500">Pedoman 10 Teknik Asesmen (Berdasarkan Fase & Metode)</span>
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Jika Anda memilih <b>Otomatis dari AI</b>, sistem akan menggunakan matriks riset ini untuk meracik instrumen yang paling akurat secara pedagogis untuk Fase (Kelas) Anda:
                </p>
              </div>
              
              <div className="space-y-4">
                {/* Diagnostik */}
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
                  <h4 className="font-bold text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2 mb-2">
                    <div className="p-1 bg-blue-100 dark:bg-blue-900/40 rounded-md">1</div> Asesmen Diagnostik / Kognitif TP
                  </h4>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 ml-6 list-disc">
                    <li><b>Wawancara / Lisan:</b> Fase A (tanya jawab konsep dasar, tanpa kendala calistung). Fase B&C (menggali miskonsepsi). <i>Metode: Diskusi/Pre-teaching.</i></li>
                    <li><b>Tes Tertulis / Kuis Prasyarat:</b> Fase A (menjodohkan gambar). Fase B&C (2-3 soal logika dasar). <i>Metode: Direct Instruction.</i></li>
                    <li><b>Angket / Survei Non-Kognitif:</b> Fase A (angket bergambar/emotikon). Fase B&C (survei/ceklis kesiapan). <i>Metode: Student-Centered.</i></li>
                  </ul>
                </div>

                {/* Formatif */}
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
                  <h4 className="font-bold text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-2">
                    <div className="p-1 bg-emerald-100 dark:bg-emerald-900/40 rounded-md">2</div> Asesmen Formatif (Mendapat Umpan Balik)
                  </h4>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 ml-6 list-disc">
                    <li><b>Observasi:</b> Berlaku semua fase (A, B, C). Guru menggunakan lembar ceklis untuk mengamati perilaku. <i>Metode: Cooperative Learning, Praktikum.</i></li>
                    <li><b>Kuis Singkat / Exit Ticket:</b> Fase A (pertanyaan lisan saat pulang). Fase B&C (1-3 soal pendek tertulis di akhir kelas). <i>Metode: Refleksi Harian.</i></li>
                    <li><b>Penilaian Diri (Self-Assessment):</b> Fase A (format sangat sederhana/centang). Fase B&C (metakognitif/refleksi tulis). <i>Metode: Deep Learning.</i></li>
                    <li><b>Penilaian Antarteman (Peer Assessment):</b> Belum disarankan untuk Fase A. Berlaku Fase B&C dengan dibekali rubrik ketat. <i>Metode: Tutor Sebaya.</i></li>
                  </ul>
                </div>

                {/* Sumatif */}
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
                  <h4 className="font-bold text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2 mb-2">
                    <div className="p-1 bg-amber-100 dark:bg-amber-900/40 rounded-md">3</div> Asesmen Sumatif (Mengukur Hasil Akhir)
                  </h4>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 ml-6 list-disc">
                    <li><b>Proyek:</b> Fase A (skala kecil 1-2 hari). Fase B&C (investigasi, perancangan, dan pembuatan solusi/produk). <i>Metode: PjBL.</i></li>
                    <li><b>Unjuk Kerja (Performance):</b> Berlaku semua fase (A, B, C). Demonstrasi kemampuan (seperti praktik wudu/presentasi). <i>Metode: Praktik.</i></li>
                    <li><b>Portofolio:</b> Fase A (kumpulan lembar mewarnai/tulisan). Fase B&C (karya terpilih beserta refleksi). <i>Metode: Penugasan Jangka Panjang.</i></li>
                    <li><b>Tes Tertulis:</b> Fase A (PG bergambar). Fase B&C (Soal HOTS / studi kasus / bukan hafalan). <i>Metode: Evaluasi Akhir Unit.</i></li>
                  </ul>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-xl font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            Tutup Kamus
          </button>
        </div>
      </div>
    </div>
  );
};
