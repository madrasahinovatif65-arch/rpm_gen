import React from "react";
import { Menu, CloudCheck, CloudOff, Moon, Sun, ShieldCheck, LogOut } from "lucide-react";
import { Pengaturan } from "../types";
import { Badge } from "./ui/Badge";

interface HeaderProps {
  activeTab: string;
  onToggleSidebar: () => void;
  isDarkMode: boolean;
  onSetDarkMode: (isDark: boolean) => void;
  onToggleDarkMode?: () => void;
  isConnected: boolean;
  config: Pengaturan;
  onLogout?: () => void;
  onNavigateToDashboard?: () => void;
  isAdmin?: boolean;
}

const TAB_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  downloadperangkat: "Download Perangkat Ajar",
  perangkat_kbc: "Perangkat Ajar KBC",
  riwayat_dokumen: "Riwayat Dokumen",
  cp_database: "Database CP Elemen",
  modulai: "Modul Ajar AI",
  asistenai: "Asisten Guru AI",
  lkpdai: "Generator LKPD AI",
  ailainnya: "Generator AI Lainnya",
  pengaturan: "Pengaturan & Profil",
  resetdb: "Hapus Database"
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onToggleSidebar,
  isDarkMode,
  onSetDarkMode,
  onToggleDarkMode,
  isConnected,
  config,
  onLogout,
  onNavigateToDashboard,
  isAdmin = false
}) => {
  const handleSelectDark = (dark: boolean) => {
    if (onSetDarkMode) {
      onSetDarkMode(dark);
    } else if (onToggleDarkMode) {
      onToggleDarkMode();
    }
  };

  return (
    <header className="sticky top-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6 shrink-0 z-30 shadow-sm">
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label="Buka menu navigasi"
          title="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button 
          onClick={() => onNavigateToDashboard && onNavigateToDashboard()}
          className="flex items-center gap-2 text-left active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
          title="Kembali ke Dashboard"
          aria-label="Dashboard"
        >
          <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
            <img 
              src="https://lh3.googleusercontent.com/d/1k4q401pC_PhtybY9T73snaJj6WzONMds" 
              alt="Logo" 
              className="w-full h-full object-contain p-1" 
            />
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-bold text-slate-900 dark:text-white text-base">
              Aplikasi Guru AI
            </span>
            {activeTab !== "dashboard" && TAB_TITLES[activeTab] && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold truncate max-w-xs">
                {TAB_TITLES[activeTab]}
              </span>
            )}
          </div>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Firebase Status */}
        <Badge 
          variant={isConnected ? "success" : "warning"}
          size="sm"
          className="hidden sm:flex items-center gap-1.5"
        >
          {isConnected ? (
            <>
              <CloudCheck className="w-3.5 h-3.5" />
              <span>Live</span>
            </>
          ) : (
            <>
              <CloudOff className="w-3.5 h-3.5" />
              <span>Connecting</span>
            </>
          )}
        </Badge>

        {/* Teacher Profile */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
            {isAdmin ? "Admin" : (config.Nama_Guru || "Guru")}
          </span>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 gap-0.5">
          <button
            type="button"
            onClick={() => handleSelectDark(false)}
            className={`p-2 rounded-md transition-all flex items-center justify-center min-w-[36px] min-h-[36px] focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              !isDarkMode
                ? "bg-amber-400 text-slate-950 shadow-sm"
                : "text-slate-500 hover:text-amber-500 active:scale-95"
            }`}
            title="Tema Terang"
            aria-label="Aktifkan tema terang"
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleSelectDark(true)}
            className={`p-2 rounded-md transition-all flex items-center justify-center min-w-[36px] min-h-[36px] focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              isDarkMode
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-500 hover:text-emerald-600 active:scale-95"
            }`}
            title="Tema Gelap"
            aria-label="Aktifkan tema gelap"
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>

        {/* Logout */}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 active:scale-95 transition-all min-w-[40px] min-h-[40px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-red-500"
            title="Keluar"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
