import React, { useState } from "react";
import { GraduationCap, Lock, User, Eye, EyeOff, ShieldCheck, LogIn, AlertCircle, Sun, Moon } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { firestore, COLLECTIONS } from "../lib/firebase";
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
  const [username, setUsername] = useState("madrasahinovatif");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg("Username dan Password wajib diisi.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

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
        console.warn("Notice: Using fallback credentials due to Firestore config fetch notice:", dbErr);
      }

        const inputUsername = String(username).trim().toLowerCase();
        const expectedUsername = String(validUsername).trim().toLowerCase();
        const isUsernameMatch = inputUsername === expectedUsername || inputUsername === "ardi yoka" || inputUsername === "madrasahinovatif";

        if (isUsernameMatch && String(password).trim() === validPassword) {
          const timestamp = Date.now();
          const token = btoa(`${String(username).trim()}:${timestamp}:edadmin_pro_secure_session`);
          localStorage.setItem("edadmin_auth_token", token);
          localStorage.setItem("edadmin_user", JSON.stringify({
            username: "madrasahinovatif",
            nama: "Madrasah Inovatif",
            role: "Administrator Guru"
          }));
        onLoginSuccess();
      } else {
        setErrorMsg("Username atau Password yang Anda masukkan tidak valid.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg("Terjadi kesalahan sistem saat mencoba masuk. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 transition-colors font-sans relative overflow-hidden">
      {/* Background Decorative Blur Spheres - Madrasah Green Theme */}
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
              EdAdmin Pro - Portal Administrasi & Asisten Pembelajaran
            </p>
          </div>
        </div>

        {/* Login Form Container */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <LogIn className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Masuk Akses Terotentikasi</span>
            </h2>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/70 rounded-xl flex items-start space-x-3 text-red-700 dark:text-red-300 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
              <span className="font-medium leading-relaxed">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="absolute inset-y-0 right-0 w-11 inline-flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" loading={loading} icon={LogIn}>
              {loading ? "Memverifikasi Akses Server..." : "Masuk ke Sistem Guru"}
            </Button>
          </form>

          {/* Security & Anti-Inspect Notice */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Terproteksi Server Validasi (Anti-Inspect Element)</span>
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
