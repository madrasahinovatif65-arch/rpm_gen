import React, { useState, useEffect } from "react";
import { GraduationCap, Lock, User, Eye, EyeOff, ShieldCheck, LogIn, AlertCircle, Sun, Moon, Building2, ChevronDown, ChevronUp, WifiOff, Loader2 } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { firestore, COLLECTIONS } from "../lib/firebase";
import { loginWithSiakad, checkSiakadSupabaseHealth, mapSiakadToPengaturan } from "../lib/siakad-supabase";
import { savePengaturan } from "../lib/firebase";
import { Button, Input } from "./ui";

interface LoginViewProps {
  onLoginSuccess: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  config?: any;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  isDarkMode,
  onToggleDarkMode,
  config
}) => {
  // SIAKAD login state
  const [siakadId, setSiakadId] = useState("");
  const [siakadPin, setSiakadPin] = useState("");
  const [showSiakadPin, setShowSiakadPin] = useState(false);
  const [siakadLoading, setSiakadLoading] = useState(false);
  const [siakadError, setSiakadError] = useState<string | null>(null);

  // Local (emergency) login state
  const [username, setUsername] = useState("madrasahinovatif");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showLocalLogin, setShowLocalLogin] = useState(false);

  // SIAKAD health state
  const [siakadOnline, setSiakadOnline] = useState<boolean | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(true);

  // Check SIAKAD health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const healthy = await checkSiakadSupabaseHealth();
        setSiakadOnline(healthy);
      } catch {
        setSiakadOnline(false);
      } finally {
        setCheckingHealth(false);
      }
    };
    checkHealth();
  }, []);

  // Handle SIAKAD login
  const handleSiakadLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siakadId.trim() || !siakadPin.trim()) {
      setSiakadError("ID Guru dan PIN wajib diisi.");
      return;
    }
    setSiakadLoading(true);
    setSiakadError(null);

    try {
      const result = await loginWithSiakad(siakadId, siakadPin);

      if (!result.success || !result.user) {
        setSiakadError(result.message || "Login gagal. Periksa ID dan PIN Anda.");
        return;
      }

      // Map data SIAKAD ke format Pengaturan APK Gen
      const pengaturanData = mapSiakadToPengaturan(result.user, result.pengaturan || {});

      // Simpan ke Firebase pengaturan APK Gen (merge dengan data yang sudah ada)
      try {
        await savePengaturan({
          ...pengaturanData,
          // Pertahankan beberapa field yang mungkin sudah diisi manual
          Alamat_Sekolah: config?.Alamat_Sekolah || '',
          Tempat_Tanda_Tangan: config?.Tempat_Tanda_Tangan || 'Karangrejo',
          Logo_Kiri: config?.Logo_Kiri || '',
        });
      } catch (saveErr) {
        console.warn('⚠️ Gagal sync ke Firebase, tetap lanjut login:', saveErr);
      }

      // Simpan token auth ke localStorage
      const token = result.session?.access_token || btoa(`siakad:${result.user.id_user}:${Date.now()}`);
      localStorage.setItem("edadmin_auth_token", token);
      // Set userId untuk isolasi data per-akun di Firebase
      localStorage.setItem("edadmin_user_id", result.user.id_user);
      localStorage.setItem("edadmin_user", JSON.stringify({
        id_user: result.user.id_user,
        username: result.user.id_user,
        nama: result.user.nama,
        role: result.user.role,
        rombel: result.user.rombel || '',
        mapel: result.user.mapel || '-',
        provider: 'siakad',
      }));

      // Simpan refresh token jika ada
      if (result.session?.refresh_token) {
        localStorage.setItem("edadmin_siakad_refresh", result.session.refresh_token);
        const expiresAt = Date.now() + ((result.session.expires_in || 3600) * 1000);
        localStorage.setItem("edadmin_token_expires_at", expiresAt.toString());
      }

      onLoginSuccess();
    } catch (err: any) {
      setSiakadError(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setSiakadLoading(false);
    }
  };

  // Handle local (emergency) login
  const handleLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setLocalError("Username dan Password wajib diisi.");
      return;
    }

    setLocalLoading(true);
    setLocalError(null);

    try {
      let validUsername = "madrasahinovatif";
      let validPassword = "123456";

      try {
        const configRef = doc(firestore, COLLECTIONS.PENGATURAN, "config");
        const docSnap = await getDoc(configRef);
        if (docSnap.exists()) {
          const configData = docSnap.data();
          if (configData.username) validUsername = configData.username;
          if (configData.password) validPassword = configData.password;
        }
      } catch (dbErr) {
        console.warn("Notice: Using fallback credentials:", dbErr);
      }

      const inputUsername = String(username).trim().toLowerCase();
      const expectedUsername = String(validUsername).trim().toLowerCase();
      const isUsernameMatch = inputUsername === expectedUsername || inputUsername === "ardi yoka" || inputUsername === "madrasahinovatif";

      if (isUsernameMatch && String(password).trim() === validPassword) {
        const timestamp = Date.now();
        const token = btoa(`${String(username).trim()}:${timestamp}:edadmin_pro_secure_session`);
        localStorage.setItem("edadmin_auth_token", token);
        // Admin selalu pakai userId 'admin' — data disimpan di path global (tidak per-user)
        localStorage.setItem("edadmin_user_id", "admin");
        localStorage.setItem("edadmin_user", JSON.stringify({
          username: "madrasahinovatif",
          nama: "Madrasah Inovatif",
          role: "Administrator Guru",
          provider: 'local',
        }));
        onLoginSuccess();
      } else {
        setLocalError("Username atau Password tidak valid.");
      }
    } catch (err) {
      setLocalError("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 transition-colors font-sans relative overflow-hidden">
      {/* Background Decorative Blur Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] bg-emerald-500/10 dark:bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/10 dark:bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          type="button"
          onClick={onToggleDarkMode}
          variant="outline"
          size="sm"
          aria-label={isDarkMode ? "Aktifkan tema terang" : "Aktifkan tema gelap"}
          aria-pressed={isDarkMode}
          icon={isDarkMode ? Sun : Moon}
        >
          {isDarkMode ? "Tema Terang" : "Tema Gelap"}
        </Button>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-lg shadow-emerald-400/20 transform hover:scale-105 transition-transform overflow-hidden">
            <img src="https://lh3.googleusercontent.com/d/1k4q401pC_PhtybY9T73snaJj6WzONMds" alt="Logo" className="w-full h-full object-contain p-2" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Aplikasi Guru AI
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">
              EdAdmin Pro · Terintegrasi SIAKAD MI Miftahul Khoir
            </p>
          </div>
        </div>

        {/* Login Form Container */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Login dengan Akun SIAKAD</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gunakan ID dan PIN yang sama seperti di aplikasi SIAKAD madrasah
            </p>
          </div>

          {/* SIAKAD Status Indicator */}
          {!checkingHealth && (
            <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
              siakadOnline
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
            }`}>
              <div className={`w-2 h-2 rounded-full shrink-0 ${siakadOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {siakadOnline
                ? 'SIAKAD Terhubung — Siap untuk login'
                : 'SIAKAD Tidak Dapat Dijangkau — Gunakan Login Lokal'
              }
            </div>
          )}
          {checkingHealth && (
            <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
              <Loader2 className="w-3 h-3 animate-spin shrink-0" />
              Memeriksa koneksi ke SIAKAD...
            </div>
          )}

          {/* SIAKAD Error */}
          {siakadError && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/70 rounded-xl flex items-start space-x-3 text-red-700 dark:text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
              <span className="font-medium leading-relaxed">{siakadError}</span>
            </div>
          )}

          {/* SIAKAD Login Form */}
          <form onSubmit={handleSiakadLogin} className="space-y-4">
            {/* ID Guru */}
            <div className="space-y-1.5">
              <label htmlFor="siakad-id" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                ID Guru / NISN
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <Input
                  id="siakad-id"
                  type="text"
                  required
                  autoComplete="username"
                  value={siakadId}
                  onChange={(e) => setSiakadId(e.target.value)}
                  placeholder="Contoh: guru001"
                  className="pl-10 text-sm"
                />
              </div>
            </div>

            {/* PIN */}
            <div className="space-y-1.5">
              <label htmlFor="siakad-pin" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                PIN (6 Digit)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <Input
                  id="siakad-pin"
                  type={showSiakadPin ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={siakadPin}
                  onChange={(e) => setSiakadPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  maxLength={6}
                  inputMode="numeric"
                  className="pl-10 pr-12 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowSiakadPin(!showSiakadPin)}
                  className="absolute inset-y-0 right-0 w-11 inline-flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus-visible:outline-none"
                  aria-label={showSiakadPin ? "Sembunyikan PIN" : "Tampilkan PIN"}
                >
                  {showSiakadPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              loading={siakadLoading}
              disabled={checkingHealth || siakadLoading}
              icon={siakadLoading ? undefined : Building2}
            >
              {siakadLoading ? "Memverifikasi ke SIAKAD..." : "Masuk dengan SIAKAD"}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="font-medium">atau</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Collapsible Local Login */}
          <button
            type="button"
            onClick={() => setShowLocalLogin(!showLocalLogin)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Login Lokal (Emergency Access)
            </span>
            {showLocalLogin ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Local Login Form (Collapsible) */}
          {showLocalLogin && (
            <form onSubmit={handleLocalSubmit} className="space-y-4 pt-2">
              {localError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/70 rounded-xl flex items-start space-x-2 text-red-700 dark:text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{localError}</span>
                </div>
              )}
              {/* Username Input */}
              <div className="space-y-1.5">
                <label htmlFor="login-username" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Username / Alamat Web
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <Input
                    id="login-username"
                    type="text"
                    required
                    readOnly
                    autoComplete="username"
                    value={username}
                    className="pl-10 cursor-not-allowed select-none text-sm font-bold"
                  />
                </div>
              </div>
              {/* Password Input */}
              <div className="space-y-1.5">
                <label htmlFor="login-password" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="pl-10 pr-12 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 w-11 inline-flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus-visible:outline-none"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full mt-2" loading={localLoading} icon={LogIn}>
                {localLoading ? "Memverifikasi..." : "Masuk ke Sistem Guru"}
              </Button>
            </form>
          )}

          {/* Security Notice */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Login terenkripsi via SIAKAD Supabase Auth</span>
          </div>
        </div>

        {/* Footer Credit */}
        <p className="text-center text-[11px] text-slate-500 dark:text-slate-500 font-medium">
          Hak Cipta &copy; {new Date().getFullYear()} Aplikasi Guru AI &bull; Madrasah Inovatif
        </p>
      </div>
    </div>
  );
};
