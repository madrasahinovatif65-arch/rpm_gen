import React, { useEffect, useState } from "react";
import { Loader2, Sparkles, Building2, CheckCircle2, AlertCircle } from "lucide-react";
import { siakadSupabase, mapSiakadToPengaturan, fetchSiakadSekolahConfig } from "../lib/siakad-supabase";
import { savePengaturan } from "../lib/firebase";

interface SSOCallbackViewProps {
  onSuccess: () => void;
  config?: any;
}

export const SSOCallbackView: React.FC<SSOCallbackViewProps> = ({ onSuccess, config }) => {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Menghubungkan ke sesi SIAKAD...");

  useEffect(() => {
    const handleSSO = async () => {
      try {
        // Ambil token dari URL Hash (contoh: #access_token=...&refresh_token=...)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (!accessToken || !refreshToken) {
          setStatus("error");
          setMessage("Token sesi tidak ditemukan. SSO gagal.");
          return;
        }

        setStatus("loading");
        setMessage("Memvalidasi sesi autentikasi...");

        // Set session di Supabase APK Gen
        const { data, error } = await siakadSupabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error || !data.user) {
          throw new Error("Gagal memulihkan sesi SIAKAD.");
        }

        setMessage("Menarik data profil guru...");

        // Ambil profil user untuk memastikan data terbaru
        const { data: userData, error: userError } = await siakadSupabase
          .from("master_user")
          .select("*")
          .eq("user_id", data.user.id)
          .single();

        if (userError || !userData) {
          throw new Error("Data profil guru tidak ditemukan di database.");
        }

        // Ambil pengaturan sekolah
        const pengaturan = await fetchSiakadSekolahConfig();

        setMessage("Menyinkronkan pengaturan...");

        // Map dan simpan ke Firebase (seperti saat login normal)
        const pengaturanData = mapSiakadToPengaturan(userData, pengaturan || {});
        
        try {
          await savePengaturan({
            ...pengaturanData,
            Alamat_Sekolah: config?.Alamat_Sekolah || '',
            Tempat_Tanda_Tangan: config?.Tempat_Tanda_Tangan || '',
            Logo_Kiri: config?.Logo_Kiri || '',
            Logo_Kanan: config?.Logo_Kanan || '',
          });
        } catch (saveErr) {
          console.warn('⚠️ Gagal sync ke Firebase, tetap lanjut SSO:', saveErr);
        }

        // Simpan state autentikasi ke localStorage
        localStorage.setItem("edadmin_auth_token", accessToken);
        localStorage.setItem("edadmin_siakad_refresh", refreshToken);
        const expiresAt = Date.now() + ((data.session?.expires_in || 3600) * 1000);
        localStorage.setItem("edadmin_token_expires_at", expiresAt.toString());

        localStorage.setItem("edadmin_user", JSON.stringify({
          id_user: userData.id_user,
          username: userData.id_user,
          nama: userData.nama,
          role: userData.role,
          mapel: userData.mapel || '-',
          provider: 'siakad',
        }));

        // Hapus hash dari URL agar token tidak tersisa di address bar demi keamanan
        window.history.replaceState({}, document.title, window.location.pathname);

        setStatus("success");
        setMessage(`Selamat datang, ${userData.nama}!`);

        // Selesai, panggil onSuccess untuk masuk dashboard
        setTimeout(() => {
          onSuccess();
        }, 1500);

      } catch (err: any) {
        console.error("SSO Error:", err);
        setStatus("error");
        setMessage(err.message || "Terjadi kesalahan saat memproses Auto-Login.");
      }
    };

    handleSSO();
  }, [onSuccess, config]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-6 transition-colors">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800 text-center space-y-6">
        
        {status === "loading" && (
          <div className="space-y-6 flex flex-col items-center justify-center">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-emerald-100 dark:border-emerald-900/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-emerald-500">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Auto-Login SIAKAD</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{message}</p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Berhasil Masuk!</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{message}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Membuka dashboard...</p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">SSO Gagal</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{message}</p>
            </div>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold text-sm hover:scale-105 transition-transform"
            >
              Kembali ke Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
