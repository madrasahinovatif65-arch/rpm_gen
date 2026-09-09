import React, { useState, useEffect } from "react";
import {
  PieChart,
  Sparkles,
  Settings,
  ChevronRight,
  X,
  SlidersHorizontal,
  Download,
  FileCheck,
  Wand2,
  Bot,
  Globe,
  HeartHandshake,
  Database
} from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { DashboardView } from "./components/DashboardView";
import { DownloadPerangkatAjarView } from "./components/DownloadPerangkatAjarView";
import { PerangkatAjarKBCView } from "./components/PerangkatAjarKBCView";
import { RiwayatDokumenView } from "./components/RiwayatDokumenView";
import { ModulAjarAIView } from "./components/ModulAjarAIView";
import { AsistenGuruAIView } from "./components/AsistenGuruAIView";
import { GeneratorLkpdAIView } from "./components/GeneratorLkpdAIView";
import { GeneratorAILainnyaView } from "./components/GeneratorAILainnyaView";
import { CPDatabaseView } from "./components/CPDatabaseView";
import { PengaturanView } from "./components/PengaturanView";
import { ResetDatabaseView } from "./components/ResetDatabaseView";
import { LoginView } from "./components/LoginView";
import { SSOCallbackView } from "./components/SSOCallbackView";

import {
  subscribePengaturan,
  savePengaturan,
} from "./lib/firebase";

import { Pengaturan } from "./types";

const DEFAULT_CONFIG: Pengaturan = {
  Nama_Guru: "M. Andry S.H., M.Pd.",
  NIP_Guru: "19900101 201501 1 002",
  Nama_Sekolah: "SMP NEGERI 3 KERINCI",
  Alamat_Sekolah: "Jalan Raya Lintas Sungai Penuh, Telp: (0748) 21102",
  Nama_Kepsek: "Hamdani, S.Pd., M.Si.",
  NIP_Kepsek: "19780514 200212 1 003",
  Tempat_Tanda_Tangan: "Karangrejo",
  Logo_Kiri: "https://lh3.googleusercontent.com/d/1k4q401pC_PhtybY9T73snaJj6WzONMds",
};

const AI_TOOLS_ITEMS = [
  { id: "downloadperangkat", label: "Download Perangkat Ajar", icon: Download, desc: "Download RPP/Modul Ajar terlengkap", badge: "Download" },
  { id: "perangkat_kbc", label: "Perangkat Ajar KBC", icon: HeartHandshake, desc: "ACP, TP, ATP, Prota, Prosem, KKTP, Modul, LKPD & Rubrik KBC", badge: "KBC" },
  { id: "cp_database", label: "Database CP Elemen", icon: Database, desc: "Kelola template Capaian Pembelajaran", badge: "Database" },
  { id: "modulai", label: "Modul Ajar AI", icon: Wand2, desc: "Susun Modul Ajar Deep Learning Kurikulum Merdeka", badge: "Deep Learning" },
  { id: "asistenai", label: "Asisten Guru AI", icon: Bot, desc: "Tanya jawab & konsultasi materi mengajar", badge: "Chatbot" },
  { id: "lkpdai", label: "Generator LKPD AI", icon: Sparkles, desc: "Buat Lembar Kerja Peserta Didik interaktif", badge: "LKPD" },
  { id: "ailainnya", label: "Generator AI Lainnya", icon: Globe, desc: "Generator Soal, Silabus, Rubrik Asesmen & Media", badge: "Multi-Tool" },
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem("edadmin_auth_token"));
  });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategorySheet, setActiveCategorySheet] = useState<"ai" | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("edadmin_theme") === "dark";
  });
  const [isConnected, setIsConnected] = useState(false);

  // Sync dark class on documentElement and body for Tailwind CSS theme switching
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
      localStorage.setItem("edadmin_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
      localStorage.setItem("edadmin_theme", "light");
    }
  }, [isDarkMode]);

  const [config, setConfig] = useState<Pengaturan>(DEFAULT_CONFIG);

  // Subscribe to Firebase real-time collections
  useEffect(() => {
    if (!isAuthenticated) return;

    let unsubs: Array<() => void> = [];

    unsubs.push(subscribePengaturan((cfg) => {
      if (cfg && Object.keys(cfg).length > 0) {
        setConfig((prev) => ({ ...prev, ...cfg }));
      }
      setIsConnected(true);
    }));

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [isAuthenticated]);

  // Run migration once on mount
  useEffect(() => {
    const runMigration = async () => {
      try {
        const { migrateKbcCacheToFirestore } = await import("./lib/migrations/migrateKbcCache");
        const result = await migrateKbcCacheToFirestore();
        if (result.success > 0) {
          console.log(`Migrated ${result.success} documents from cache`);
        }
      } catch (err) {
        console.warn("Migration failed:", err);
      }
    };
    runMigration();
  }, []);

  // Token auto-refresh untuk SIAKAD Supabase session
  useEffect(() => {
    const checkAndRefreshToken = async () => {
      if (!isAuthenticated) return;

      const refreshToken = localStorage.getItem("edadmin_siakad_refresh");
      const expiresAtStr = localStorage.getItem("edadmin_token_expires_at");

      // Skip jika bukan login SIAKAD (tidak ada refresh token)
      if (!refreshToken || !expiresAtStr) return;

      const expiresAt = parseInt(expiresAtStr, 10);
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      const fiveMinutes = 5 * 60 * 1000;

      // Refresh 5 menit sebelum expired
      if (timeUntilExpiry < fiveMinutes && timeUntilExpiry > 0) {
        try {
          const { siakadSupabase } = await import("./lib/siakad-supabase");
          const { data, error } = await siakadSupabase.auth.refreshSession();
          if (!error && data.session) {
            localStorage.setItem("edadmin_auth_token", data.session.access_token);
            localStorage.setItem("edadmin_siakad_refresh", data.session.refresh_token);
            const newExpiry = Date.now() + (data.session.expires_in * 1000);
            localStorage.setItem("edadmin_token_expires_at", newExpiry.toString());
            console.log('✅ SIAKAD session refreshed');
          }
        } catch (error) {
          console.error('❌ SIAKAD session refresh failed:', error);
        }
      }
    };

    checkAndRefreshToken();
    const intervalId = setInterval(checkAndRefreshToken, 60000);
    return () => clearInterval(intervalId);
  }, [isAuthenticated]);


  // Save initial config if empty
  useEffect(() => {
    const seedInitialData = async () => {
      if (
        localStorage.getItem("edadmin_database_cleared") === "true" ||
        config?.isDatabaseCleared === true
      ) {
        return;
      }

      if (!config.Nama_Guru && isConnected) {
        await savePengaturan(DEFAULT_CONFIG);
      }
    };
    seedInitialData();
  }, [isConnected, config.Nama_Guru, config.isDatabaseCleared]);

  const handleSuccessReset = () => {
    setConfig((prev) => ({ ...prev, isDatabaseCleared: true }));
  };

  const handleLogout = () => {
    localStorage.removeItem("edadmin_auth_token");
    localStorage.removeItem("edadmin_user");
    localStorage.removeItem("edadmin_user_id");
    localStorage.removeItem("edadmin_siakad_refresh");
    localStorage.removeItem("edadmin_token_expires_at");
    localStorage.removeItem("edadmin_kbc_state_isolated");
    localStorage.removeItem("edadmin_pengaturan_isolated");
    setIsAuthenticated(false);
    window.location.reload();
  };

  // Check if we are handling SSO callback (hanya jika belum authenticated)
  const isSSOCallback = typeof window !== 'undefined'
    && window.location.pathname === '/sso'
    && !isAuthenticated;

  if (isSSOCallback) {
    return (
      <SSOCallbackView
        onSuccess={() => {
          setIsAuthenticated(true);
          window.location.href = "/";
        }}
        config={config}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginView
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          window.location.reload();
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        config={config}
      />
    );
  }


  const userJson = localStorage.getItem("edadmin_user");
  let isAdmin = false;
  let isSiakadGuru = false;
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      isAdmin = user.provider === 'local' || user.username === 'madrasahinovatif';
      isSiakadGuru = user.provider === 'siakad';
    } catch (e) {
      console.error("Gagal parse user data", e);
    }
  }

  return (
    <div className={`min-h-screen flex bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans transition-colors ${isDarkMode ? "dark" : ""}`}>
      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isAdmin={isAdmin}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          activeTab={activeTab}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          isDarkMode={isDarkMode}
          onSetDarkMode={(isDark) => setIsDarkMode(isDark)}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          isConnected={isConnected}
          config={config}
          onLogout={handleLogout}
          onNavigateToDashboard={() => setActiveTab("dashboard")}
          isAdmin={isAdmin}
        />

        {AI_TOOLS_ITEMS.some(item => item.id === activeTab) && (
          <div className="bg-emerald-50 dark:bg-slate-900 border-b border-emerald-200/50 dark:border-slate-800 px-3 py-2 flex items-center space-x-2 overflow-x-auto custom-scrollbar shrink-0 select-none">
            <button
              onClick={() => setActiveCategorySheet("ai")}
              className="flex items-center space-x-1 pr-2 border-r border-emerald-200 dark:border-slate-800 shrink-0 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs active:scale-95 transition-transform cursor-pointer"
              title="Buka Laci Menu AI Tools"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Tools:</span>
              <SlidersHorizontal className="w-3 h-3 text-emerald-400 ml-0.5" />
            </button>
            {AI_TOOLS_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer active:scale-95 ${isActive
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-100/50 dark:hover:bg-slate-700"
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-8 custom-scrollbar pb-24 lg:pb-8">
          {activeTab === "dashboard" && (
            <DashboardView
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === "downloadperangkat" && <DownloadPerangkatAjarView />}
          {activeTab === "perangkat_kbc" && <PerangkatAjarKBCView config={config} onNavigateToCP={() => setActiveTab("cp_database")} />}
          {activeTab === "riwayat_dokumen" && <RiwayatDokumenView />}
          {activeTab === "cp_database" && <CPDatabaseView config={config} />}
          {activeTab === "modulai" && <ModulAjarAIView config={config} />}
          {activeTab === "asistenai" && <AsistenGuruAIView config={config} />}
          {activeTab === "lkpdai" && <GeneratorLkpdAIView config={config} />}
          {activeTab === "ailainnya" && <GeneratorAILainnyaView />}

          {/* Admin & Guru: Pengaturan View (readonly untuk guru) */}
          {(isAdmin || isSiakadGuru) && activeTab === "pengaturan" && (
            <PengaturanView
              config={config}
              onNavigateToReset={() => setActiveTab("resetdb")}
              readOnly={isSiakadGuru && !isAdmin}
            />
          )}

          {isAdmin && activeTab === "resetdb" && (
            <ResetDatabaseView onSuccessReset={handleSuccessReset} />
          )}
        </main>

        {/* Native Android Bottom Navigation Bar */}
        <nav
          className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-30 px-2 py-1.5 pb-safe shadow-lg flex items-center justify-around transition-colors select-none"
          aria-label="Navigasi Bawah Android"
        >
          <button
            onClick={() => {
              setActiveCategorySheet(null);
              setActiveTab("dashboard");
            }}
            className={`flex flex-col items-center justify-center flex-1 min-w-[56px] py-1 px-2 rounded-xl transition-all active:scale-90 ${activeTab === "dashboard"
                ? "text-teal-600 dark:text-teal-400 font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
          >
            <PieChart className={`w-5 h-5 ${activeTab === "dashboard" ? "scale-110" : ""}`} />
            <span className="text-[11px] mt-0.5 tracking-tight truncate">Dashboard</span>
          </button>

          <button
            onClick={() => {
              setActiveCategorySheet(activeCategorySheet === "ai" ? null : "ai");
              if (!AI_TOOLS_ITEMS.some(i => i.id === activeTab)) {
                setActiveTab("modulai");
              }
            }}
            className={`flex flex-col items-center justify-center flex-1 min-w-[56px] py-1 px-2 rounded-xl transition-all active:scale-90 ${AI_TOOLS_ITEMS.some(i => i.id === activeTab)
                ? "text-emerald-500 dark:text-emerald-400 font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400"
              }`}
          >
            <Sparkles className={`w-5 h-5 ${AI_TOOLS_ITEMS.some(i => i.id === activeTab) ? "scale-110 text-emerald-500" : ""}`} />
            <span className="text-[11px] mt-0.5 tracking-tight truncate">AI Tools</span>
          </button>

          {/* Pengaturan: tampil untuk Admin dan Guru SIAKAD */}
          {(isAdmin || isSiakadGuru) && (
            <button
              onClick={() => {
                setActiveCategorySheet(null);
                setActiveTab("pengaturan");
              }}
              className={`flex flex-col items-center justify-center flex-1 min-w-[56px] py-1 px-2 rounded-xl transition-all active:scale-90 ${activeTab === "pengaturan" || activeTab === "resetdb"
                  ? "text-slate-800 dark:text-white font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
            >
              <Settings className={`w-5 h-5 ${activeTab === "pengaturan" || activeTab === "resetdb" ? "scale-110" : ""}`} />
              <span className="text-[11px] mt-0.5 tracking-tight truncate">Profil Sync</span>
            </button>
          )}
        </nav>

        {/* Android Native Bottom Sheet Chooser Modal */}
        {activeCategorySheet === "ai" && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end select-none">
            {/* Dark Backdrop */}
            <div
              className="fixed inset-0 bg-slate-950/70 transition-opacity"
              onClick={() => setActiveCategorySheet(null)}
            />

            {/* Bottom Sheet Modal Container */}
            <div className="relative bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-5 shadow-2xl z-10 max-h-[80vh] overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom duration-200 pb-20">
              {/* Top Drag Handle Bar */}
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4" />

              {/* Sheet Header Title */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Pilih Tool AI Lengkap
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Seluruh generator & kecerdasan buatan AI Pro
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveCategorySheet(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Item List Options */}
              <div className="space-y-2.5">
                {AI_TOOLS_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setActiveCategorySheet(null);
                      }}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all active:scale-[0.99] cursor-pointer ${isActive
                          ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 font-bold"
                          : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                        }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isActive ? "bg-emerald-500 text-white" : "bg-white dark:bg-slate-700 text-emerald-500"
                          }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-xs sm:text-sm truncate">{item.label}</span>
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-700 dark:text-emerald-300 font-extrabold border border-emerald-400/30">
                              {item.badge}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{item.desc}</div>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 shrink-0 ${isActive ? "text-emerald-500" : "text-slate-400"}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
