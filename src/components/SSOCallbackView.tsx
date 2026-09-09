import React, { useEffect, useState } from "react";
import { Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
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
        // --- Robust Hash Parsing ---
        // Hash format dari SIAKAD: #access_token=...&refresh_token=...
        // Beberapa router menghasilkan "#/" di awal, kita handle keduanya
        const rawHash = window.location.hash;
        console.log('[SSO] Raw hash (60 char pertama):', rawHash.substring(0, 60));

        // Bersihkan tanda # di awal, tangani variasi "#/" dan "#"
        let cleanHash = rawHash;
        if (cleanHash.startsWith('#/')) cleanHash = cleanHash.substring(2);
        else if (cleanHash.startsWith('#')) cleanHash = cleanHash.substring(1);

        const hashParams = new URLSearchParams(cleanHash);

        // Prioritas 1: ambil dari hash URL
        let accessToken = hashParams.get("access_token");
        let refreshToken = hashParams.get("refresh_token");

        // Prioritas 2: fallback dari query string (kalau hash tidak berhasil)
        if (!accessToken) {
          const searchParams = new URLSearchParams(window.location.search);
          accessToken = searchParams.get("access_token");
          refreshToken = searchParams.get("refresh_token");
          if (accessToken) console.log('[SSO] Token dibaca dari query string (fallback)');
        }

        console.log('[SSO] access_token ada:', !!accessToken, '| refresh_token ada:', !!refreshToken);

        if (!accessToken || !refreshToken) {
          setStatus("error");
          setMessage(
            "Token sesi tidak ditemukan.\n\nKemungkinan penyebab:\n• Klik tombol dari dashboard SIAKAD lagi\n• Pastikan popup/tab tidak diblokir browser"
          );
          return;
        }

        setMessage("Memvalidasi sesi autentikasi...");

        // Pulihkan sesi Supabase menggunakan token dari SIAKAD
        const { data, error } = await siakadSupabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error || !data.user) {
          throw new Error(`Sesi tidak valid: ${error?.message || 'User tidak ditemukan'}`);
        }

        console.log('[SSO] Sesi aktif untuk user ID:', data.user.id);
        setMessage("Mengambil profil guru dari SIAKAD...");

        // Ambil profil guru dan konfigurasi sekolah dari Endpoint API JSON
        const { fetchSiakadDataFromApi } = await import("../lib/siakad-supabase");
        const { user: userData, sekolah: pengaturan } = await fetchSiakadDataFromApi(accessToken);

        setMessage("Menyinkronkan pengaturan aplikasi...");

        // ⚠️ CRITICAL: Simpan Supabase Auth UUID sebagai Firebase path key SEBELUM savePengaturan
        // Ini memastikan path users/{uid}/pengaturan/config menggunakan UUID yang benar
        const supabaseUid = data.user.id; // Supabase Auth UUID (unik per akun)
        localStorage.setItem("edadmin_user_id", supabaseUid);
        localStorage.setItem("edadmin_auth_token", accessToken);
        localStorage.setItem("edadmin_siakad_refresh", refreshToken);
        const expiresAt = Date.now() + ((data.session?.expires_in || 3600) * 1000);
        localStorage.setItem("edadmin_token_expires_at", expiresAt.toString());
        localStorage.setItem("edadmin_user", JSON.stringify({
          id_user: userData.id_user,
          supabase_uid: supabaseUid,
          username: userData.id_user,
          nama: userData.nama,
          role: userData.role,
          rombel: userData.rombel || '',
          mapel: userData.mapel || '-',
          provider: 'siakad',
        }));

        // Simpan ke Firebase pengaturan APK Gen (setelah user_id diset)
        const pengaturanData = mapSiakadToPengaturan(userData, pengaturan || {});
        try {
          // Ambil admin config terlebih dahulu agar tidak menimpa pengaturan global
          const { getDocs, collection } = await import('firebase/firestore');
          const { firestore, COLLECTIONS } = await import('../lib/firebase');
          const adminSnap = await getDocs(collection(firestore, COLLECTIONS.PENGATURAN));
          let adminConfig: any = {};
          adminSnap.forEach(d => { if (d.id === 'config') adminConfig = d.data(); });

          const payload: any = { ...adminConfig };
          
          if (pengaturanData.Nama_Guru) payload.Nama_Guru = pengaturanData.Nama_Guru;
          if (pengaturanData.NIP_Guru) payload.NIP_Guru = pengaturanData.NIP_Guru;
          if (pengaturanData.Nama_Sekolah) payload.Nama_Sekolah = pengaturanData.Nama_Sekolah;
          if (pengaturanData.Alamat_Sekolah && pengaturanData.Alamat_Sekolah !== '-') payload.Alamat_Sekolah = pengaturanData.Alamat_Sekolah;
          if (pengaturanData.Nama_Yayasan) payload.Nama_Yayasan = pengaturanData.Nama_Yayasan;
          if (pengaturanData.Nama_Kepsek) payload.Nama_Kepsek = pengaturanData.Nama_Kepsek;
          if (pengaturanData.NIP_Kepsek) payload.NIP_Kepsek = pengaturanData.NIP_Kepsek;
          if (pengaturanData.Tahun_Pelajaran) payload.Tahun_Pelajaran = pengaturanData.Tahun_Pelajaran;
          if (pengaturanData.Semester) payload.Semester = pengaturanData.Semester;

          payload.siakadUserId = pengaturanData.siakadUserId;
          payload.siakadSyncedAt = pengaturanData.siakadSyncedAt;
          payload.authProvider = pengaturanData.authProvider;

          await savePengaturan(payload);
          console.log('[SSO] ✅ Pengaturan tersimpan ke Firebase path: users/' + supabaseUid);
        } catch (saveErr) {
          console.warn('[SSO] Gagal sync Firebase (non-fatal):', saveErr);
        }

        // Seed KBC State dari data rombel
        try {
          const { saveKbcState, subscribeKbcState } = await import("../lib/firebase");
          const rombelStr: string = userData.rombel || '';
          
          let levelValue = rombelStr;
          
          // Jika role adalah Guru Mapel, kosongkan kelas karena mereka mengajar di banyak kelas
          if (userData.role === "Guru Mapel") {
            levelValue = "";
          }
          // Abaikan jika rombel berupa strip "-" atau kosong
          else if (rombelStr === "-" || rombelStr.trim() === "") {
            levelValue = "";
          } 
          // Jika rombel dari SIAKAD sudah mengandung kata "Fase", gunakan teks aslinya
          else if (!rombelStr.toLowerCase().includes("fase") && rombelStr.length > 0) {
            // Jika hanya "Kelas 1A", coba ekstrak angkanya
            const kelasMatch = rombelStr.match(/(\d+[A-Za-z]*)\s*$/);
            if (kelasMatch) {
              levelValue = `Kelas ${kelasMatch[1]}`;
            } else {
              levelValue = `Kelas ${rombelStr}`; // fallback
            }
          }

          // Tentukan Mapel KBC: kosong untuk Wali Kelas, ambil yang pertama untuk Guru Mapel
          let kbcMapel = "";
          if (userData.role === "Guru Mapel" && userData.mapel && userData.mapel !== "-") {
            kbcMapel = userData.mapel.split(",")[0].trim();
          }

          // Cek apakah user sudah punya KBC state sendiri (dan data lengkap)
          let hasCompleteState = false;
          const existingCached = localStorage.getItem("edadmin_kbc_state_isolated");
          if (existingCached) {
            try {
              const p = JSON.parse(existingCached);
              // Hanya skip seed jika data kepsek sudah ada secara riil (bukan default "-" atau "Kepala Madrasah")
              const isNotDefaultPrincipal = p?.school?.principal && p.school.principal !== "Kepala Madrasah" && p.school.principal !== "-";
              const isNotDefaultNip = p?.school?.nipTeacher && p.school.nipTeacher !== "-";
              hasCompleteState = !!p?.updatedAt && isNotDefaultPrincipal && isNotDefaultNip;
            } catch { /* ignore */ }
          }

          if (!hasCompleteState) {
            const nipGuru = userData.nip || '';
            // Gunakan nilai hasil merge (payload) untuk KBC state
            const namaKepsek = payload.Nama_Kepsek || '';
            const nipKepsek = payload.NIP_Kepsek || '';
            const namaSekolah = payload.Nama_Sekolah || '';
            const tahunPelajaran = payload.Tahun_Pelajaran || '';
            console.log('[SSO] Seeding KBC dengan - NIP Guru:', nipGuru, '| Kepsek:', namaKepsek, '| NIP Kepsek:', nipKepsek);

            await saveKbcState({
              curriculum: {
                school: namaSekolah,
                year: tahunPelajaran,
                level: levelValue,
                subject: kbcMapel,
                learningModel: "", // Kosongkan model pembelajaran
              },
              school: {
                teacher: userData.nama || '',
                nipTeacher: nipGuru,
                principal: namaKepsek,
                nipPrincipal: nipKepsek,
                cityDate: `Karangrejo, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
              },
              _seededFromSiakad: true,
            });
            console.log('[SSO] ✅ KBC State di-seed (rombel:', levelValue || 'kosong', ')');
          }
        } catch (kbcErr) {
          console.warn('[SSO] Gagal seed KBC state (non-fatal):', kbcErr);
        }

        // Hapus hash dari address bar demi keamanan (token tidak terlihat)
        // Sekaligus pindahkan path dari /sso ke / agar App.tsx render dashboard
        window.history.replaceState({}, document.title, '/');

        setStatus("success");
        setMessage(`Selamat datang, ${userData.nama}!`);
        console.log('[SSO] ✅ Login berhasil untuk:', userData.nama);

        setTimeout(() => onSuccess(), 1200);


      } catch (err: any) {
        console.error('[SSO] ❌ Error:', err);
        setStatus("error");
        setMessage(err.message || "Terjadi kesalahan saat memproses Auto-Login.");
      }
    };

    handleSSO();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-6 transition-colors">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800 text-center space-y-6">

        {status === "loading" && (
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-emerald-100 dark:border-emerald-900/30 rounded-full" />
              <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-emerald-500 animate-pulse" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Auto-Login SIAKAD</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{message}</p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Berhasil Masuk!</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{message}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Membuka dashboard...</p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">SSO Gagal</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 whitespace-pre-line text-left">{message}</p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={() => window.close()}
                className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold text-sm hover:scale-105 transition-transform"
              >
                Tutup Tab Ini
              </button>
              <button
                onClick={() => { window.location.hash = ''; window.location.href = '/'; }}
                className="text-slate-400 text-xs hover:underline py-1"
              >
                atau login manual
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
