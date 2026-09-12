import React from "react";
import { 
  PieChart, 
  HeartHandshake, 
  Wand2, 
  Bot, 
  Sparkles,
  Settings, 
  Trash2,
  X,
  Download,
  Globe,
  History,
  Calendar
} from "lucide-react";
import { Badge } from "./ui/Badge";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isAdmin?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  isAdmin = false
}) => {
  const navItems = [
    {
      group: "MENU UTAMA",
      items: [
        { id: "dashboard", label: "Dashboard", icon: PieChart },
      ]
    },
    {
      group: "GENERATOR AI",
      items: [
        { id: "downloadperangkat", label: "Download Perangkat", icon: Download },
        { id: "perangkat_kbc", label: "Perangkat KBC", icon: HeartHandshake },
        { id: "riwayat_dokumen", label: "Riwayat Dokumen", icon: History },
        { id: "modulai", label: "Modul Ajar AI", icon: Wand2, highlight: true },
        { id: "asistenai", label: "Asisten Guru AI", icon: Bot, highlight: true },
        { id: "lkpdai", label: "Generator LKPD", icon: Sparkles, highlight: true },
        { id: "ailainnya", label: "Generator Lainnya", icon: Globe, highlight: true },
      ]
    },
    {
      group: "PENGATURAN",
      items: [
        { id: "pengaturan", label: "Pengaturan & Kop", icon: Settings },
        { id: "kaldik", label: "Kalender Akademik", icon: Calendar },
        { id: "resetdb", label: "Hapus Database", icon: Trash2, dangerous: true },
      ]
    }
  ];

  // Sembunyikan grup pengaturan jika bukan admin
  const visibleNavItems = isAdmin 
    ? navItems 
    : navItems.filter(group => group.group !== "PENGATURAN");

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Menu navigasi utama"
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md overflow-hidden">
              <img 
                src="https://lh3.googleusercontent.com/d/1k4q401pC_PhtybY9T73snaJj6WzONMds" 
                alt="Logo" 
                className="w-full h-full object-contain p-1" 
              />
            </div>
            <div>
              <span className="font-bold text-base text-white block leading-tight">
                Aplikasi Guru AI
              </span>
              <span className="text-xs text-slate-400 block">Generator Perangkat</span>
            </div>
          </div>

          <button 
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500"
            onClick={() => setIsOpen(false)}
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar pb-safe">
          {visibleNavItems.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
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
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-[0.98] min-h-[44px] focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                      isActive
                        ? (item as any).dangerous
                          ? "bg-red-600 text-white shadow-md"
                          : "bg-emerald-600 text-white shadow-md"
                        : (item as any).dangerous
                        ? "text-red-400 hover:bg-red-950/40 hover:text-red-300"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate flex-1 text-left">{item.label}</span>
                    {item.highlight && !isActive && (
                      <Badge variant="primary" size="sm" className="text-[9px] px-1.5 py-0.5">
                        AI
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 text-center text-xs text-slate-400 bg-slate-950/50">
          <p className="font-semibold text-slate-300">Aplikasi Guru AI © 2026</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Generator Perangkat Ajar</p>
        </div>
      </aside>
    </>
  );
};
