import React from "react";
import {
  Wand2,
  HeartHandshake,
  Bot,
  Settings,
  ArrowRight,
  Sparkles,
  LayoutGrid,
  FileCheck,
  Globe,
  Download
} from "lucide-react";

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate
}) => {
  // Full Menu Cards List matching all sidebar destinations
  const menuCards = [
    {
      id: "downloadperangkat",
      title: "Download Perangkat Ajar",
      desc: "Download RPP/Modul Ajar terlengkap.",
      icon: Download,
      badge: "Download",
      color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200"
    },
    {
      id: "perangkat_kbc",
      title: "Perangkat Ajar KBC",
      desc: "ACP, TP, ATP, Prota, Prosem, KKTP, Modul, LKPD & Rubrik KBC.",
      icon: HeartHandshake,
      badge: "KBC",
      color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200"
    },
    {
      id: "perangkat_ai",
      title: "Generator Perangkat Ajar AI",
      desc: "Buat RPP & ATP otomatis dengan AI.",
      icon: FileCheck,
      badge: "AI Pro",
      color: "bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200"
    },
    {
      id: "modulai",
      title: "Modul Ajar Deep Learning AI",
      desc: "Generator RPP Deep Learning Kurikulum Merdeka (hingga 5 pertemuan).",
      icon: Wand2,
      badge: "Fitur Unggulan AI",
      color: "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300"
    },
    {
      id: "asistenai",
      title: "Asisten Chatbot Guru AI",
      desc: "Konsultan pedagogi AI, pembuat soal HOTS, & draf narasi rapor.",
      icon: Bot,
      badge: "Asisten AI",
      color: "bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400 border-violet-200"
    },
    {
      id: "lkpdai",
      title: "Generator LKPD AI",
      desc: "Buat Lembar Kerja Peserta Didik interaktif.",
      icon: Sparkles,
      badge: "LKPD",
      color: "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200"
    },
    {
      id: "ailainnya",
      title: "Generator AI Lainnya",
      desc: "Generator Soal, Silabus, Rubrik Asesmen & Media.",
      icon: Globe,
      badge: "Multi-Tool",
      color: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400 border-cyan-200"
    },
    {
      id: "pengaturan",
      title: "Pengaturan & Profil",
      desc: "Kelola profil guru, instansi sekolah, & kop dokumen.",
      icon: Settings,
      badge: "Profil & Sekolah",
      color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300"
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto w-full select-none">
      {/* Quick Action Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 rounded-3xl p-5 sm:p-6 text-white shadow-lg flex flex-col items-start justify-between gap-4 sm:gap-5 border border-emerald-700/50">
        <div className="space-y-2.5">
          <div className="flex items-center space-x-2">
            <span className="bg-amber-400 text-slate-950 text-[10px] sm:text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Deep Learning AI Pro
            </span>
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          </div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-black leading-snug">Buat Modul Ajar Deep Learning Otomatis</h2>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
            Susun modul pembelajaran Kurikulum Merdeka lengkap dengan skenario kegiatan per pertemuan (hingga 5 pertemuan), tabel diagnostik, rubrik asesmen, dan LKPD interaktif siap cetak.
          </p>
        </div>
        <button
          onClick={() => onNavigate("modulai")}
          className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-slate-950 px-6 py-3 rounded-2xl text-xs sm:text-sm font-extrabold shadow-md transition-transform active:scale-95 flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
        >
          <Wand2 className="w-4 h-4" />
          <span>Buka Modul Ajar AI</span>
        </button>
      </div>

      {/* ALL SIDEBAR MENUS IN DASHBOARD GRID - Single Column for Mobile */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <LayoutGrid className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-white tracking-tight">
              Akses Cepat Modul & Menu Administrasi Guru
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">{menuCards.length} Menu Lengkap</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {menuCards.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="group bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-md border border-slate-200 dark:border-slate-800 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3.5 active:scale-[0.99]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-xs font-extrabold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform pt-1">
                  <span>Buka Fitur</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
