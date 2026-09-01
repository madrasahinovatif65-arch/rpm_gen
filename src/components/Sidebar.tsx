import React from "react";
import { 
  PieChart, 
  HeartHandshake, 
  Wand2, 
  Bot, 
  Sparkles,
  Settings, 
  GraduationCap,
  Trash2,
  X,
  FileCheck,
  Download,
  Globe
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen
}) => {
  const navItems = [
    {
      group: "MENU UTAMA",
      items: [
        { id: "dashboard", label: "Dashboard", icon: PieChart },
      ]
    },
    {
      group: "KECERDASAN BUATAN (AI)",
      items: [
        { id: "downloadperangkat", label: "Download Perangkat Ajar", icon: Download },
        { id: "perangkat_kbc", label: "Perangkat Ajar KBC", icon: HeartHandshake, highlight: true },
        { id: "perangkat_ai", label: "Generator Perangkat Ajar AI", icon: FileCheck, highlight: true },
        { id: "modulai", label: "Modul Ajar AI", icon: Wand2, highlight: true },
        { id: "asistenai", label: "Asisten Guru AI", icon: Bot, highlight: true },
        { id: "lkpdai", label: "Generator LKPD AI", icon: Sparkles, highlight: true },
        { id: "ailainnya", label: "Generator AI Lainnya", icon: Globe, highlight: true },
      ]
    },
    {
      group: "SISTEM & PENGATURAN",
      items: [
        { id: "pengaturan", label: "Pengaturan & Kop", icon: Settings },
        { id: "resetdb", label: "Hapus Pengaturan", icon: Trash2, dangerous: true },
      ]
    }
  ];

  return (
    <>
      {/* Drawer backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 backdrop-blur-xs transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar drawer navigation (Laci Samping) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col shadow-2xl transition-transform duration-300 rounded-r-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-amber-400 rounded-xl flex items-center justify-center text-slate-950 font-black shadow-lg">
              <GraduationCap className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white block leading-none">
                Aplikasi Guru AI
              </span>
              <span className="text-[10px] text-slate-400 font-medium block mt-1">Generator Perangkat Cerdas</span>
            </div>
          </div>

          <button 
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95 transition-all"
            onClick={() => setIsOpen(false)}
            aria-label="Tutup Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar pb-safe">
          {navItems.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2">
                {group.group}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-[0.98] min-h-[44px] ${
                      isActive
                        ? (item as any).dangerous
                          ? "bg-red-600 text-white shadow-md font-bold"
                          : item.highlight
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md font-bold"
                          : "bg-blue-600 text-white shadow-md font-bold"
                        : (item as any).dangerous
                        ? "text-red-400 hover:bg-red-950/50 hover:text-red-300"
                        : item.highlight
                        ? "text-amber-300 hover:bg-slate-800 hover:text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : (item as any).dangerous ? "text-red-400" : item.highlight ? "text-amber-400" : "text-slate-400"}`} />
                    <span className="truncate">{item.label}</span>
                    {item.highlight && (
                      <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30 shrink-0">
                        AI
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-center text-[11px] text-slate-400 bg-slate-950/50">
          <p className="font-semibold text-slate-300">Aplikasi Guru AI &copy; 2026</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Sistem Generator Perangkat Ajar</p>
        </div>
      </aside>
    </>
  );
};
