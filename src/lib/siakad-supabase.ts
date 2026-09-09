// ============================================================
// SIAKAD Supabase Direct Integration
// Koneksi langsung ke database Supabase SIAKAD MI Miftahul Khoir 1
// Auth: email convention = {id_user}@siakad.local, password = PIN
// ============================================================

import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';

const SIAKAD_URL = import.meta.env.VITE_SIAKAD_SUPABASE_URL as string;
const SIAKAD_ANON_KEY = import.meta.env.VITE_SIAKAD_SUPABASE_ANON_KEY as string;

if (!SIAKAD_URL || !SIAKAD_ANON_KEY) {
  console.warn('⚠️ SIAKAD Supabase credentials belum dikonfigurasi di .env');
}

// Client Supabase khusus SIAKAD (terpisah dari Firebase APK Gen)
export const siakadSupabase: SupabaseClient = createClient(
  SIAKAD_URL || 'https://placeholder.supabase.co',
  SIAKAD_ANON_KEY || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      storageKey: 'siakad_apk_session', // key terpisah agar tidak conflict
    }
  }
);

// ============================================================
// Types
// ============================================================

export interface SiakadMasterUser {
  id_user: string;
  nama: string;
  role: 'Admin' | 'Kepala Madrasah' | 'Wali Kelas' | 'Guru Mapel' | 'Murid';
  rombel: string;
  mapel?: string;
  nip?: string;
  status_aktif: 'Aktif' | 'Nonaktif';
  foto?: string;
  foto_app?: string;
  rfid?: string;
}

export interface SiakadSekolahConfig {
  nama_sekolah?: string;
  nama_yayasan?: string;
  alamat?: string;
  nama_kepsek?: string;
  nip_kepsek?: string;
  logo_url?: string;
  tahun_pelajaran?: string;
  semester?: string;
  kantor_kemenag?: string;
  pemerintah?: string;
}

export interface SiakadLoginResult {
  success: boolean;
  message?: string;
  user?: SiakadMasterUser;
  session?: Session;
  pengaturan?: SiakadSekolahConfig;
}

// ============================================================
// Auth Functions
// ============================================================

/**
 * Login ke SIAKAD menggunakan ID Guru + PIN
 * Konversi ke email: {id_user}@siakad.local
 */
export async function loginWithSiakad(
  idUser: string,
  pin: string
): Promise<SiakadLoginResult> {
  try {
    const email = `${idUser.trim().toLowerCase()}@siakad.local`;

    const { data: authData, error: authError } = await siakadSupabase.auth.signInWithPassword({
      email,
      password: pin.trim(),
    });

    if (authError || !authData.user) {
      console.error('❌ SIAKAD login error:', authError?.message);
      return {
        success: false,
        message: authError?.message?.includes('Invalid login credentials')
          ? 'ID Guru atau PIN salah. Periksa kembali.'
          : `Gagal login: ${authError?.message || 'Tidak diketahui'}`,
      };
    }

    // Ambil data profil guru dan konfigurasi sekolah dari Endpoint API JSON
    const { user: userData, sekolah: pengaturan } = await fetchSiakadDataFromApi(authData.session.access_token, idUser.trim());

    console.log('✅ SIAKAD login berhasil via API:', userData.nama);
    return {
      success: true,
      user: userData,
      session: authData.session,
      pengaturan,
    };
  } catch (err: any) {
    console.error('❌ SIAKAD login exception:', err);
    return {
      success: false,
      message: `Terjadi kesalahan: ${err.message || 'Error tidak diketahui'}`,
    };
  }
}

/**
 * Fetch data tersinkronisasi dari SIAKAD REST API (JSON)
 */
export async function fetchSiakadDataFromApi(token: string, expectedUserId: string): Promise<{ user: SiakadMasterUser, sekolah: SiakadSekolahConfig }> {
  const apiUrl = "https://siakad-app-phi.vercel.app/api/apk-gen-sync";

  // Coba REST API JSON terlebih dahulu
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }
    });

    if (response.ok) {
      const json = await response.json();
      const sekolah: SiakadSekolahConfig = {
        nama_sekolah: json.Nama_Sekolah,
        nama_yayasan: json.Nama_Yayasan,
        alamat: json.Jalan,
        nama_kepsek: json.Nama_Kepala_Madrasah || json.Nama_Kepsek || json.Kepala_Madrasah,
        nip_kepsek: json.NIP_Kepala_Madrasah || json.NIP_Kepsek || json.NIP_Kepala,
        tahun_pelajaran: json.Tahun_Pelajaran,
        semester: json.Semester,
      };

      const guruArr = json.Guru;
      if (guruArr && Array.isArray(guruArr) && guruArr.length > 0) {
        // Find the specific guru matching the expectedUserId, or fallback to index 0 if only 1 is returned (new API format)
        let guruData = guruArr.find(g => g.id_user === expectedUserId || g.NIP_Guru === expectedUserId);
        if (!guruData && guruArr.length === 1) {
            guruData = guruArr[0];
        }

        if (guruData) {
          const user: SiakadMasterUser = {
            id_user: guruData.id_user || guruData.NIP_Guru || 'ID_UNKNOWN',
            nama: guruData.Nama_Guru || '',
            nip: guruData.NIP_Guru || '',
            role: guruData.siakadRole || 'Guru Mapel',
            mapel: guruData.siakadMapel === "-" ? "" : (guruData.siakadMapel || ""),
            rombel: guruData.siakadRombel || guruData.rombel || "",
            status_aktif: 'Aktif',
          };
          console.log('✅ Data guru diambil dari REST API JSON untuk:', user.nama);
          return { user, sekolah };
        }
      }
    }
  } catch (apiErr) {
    console.warn('⚠️ REST API gagal, fallback ke Supabase langsung:', apiErr);
  }

  // === Fallback: Ambil langsung dari Supabase SIAKAD ===
  console.log('🔄 Menggunakan fallback Supabase untuk mengambil data profil...');

  // Dapatkan user ID dari session aktif
  const { data: sessionData } = await siakadSupabase.auth.getUser(token);
  if (!sessionData?.user) {
    throw new Error('Sesi tidak valid. Silakan login ulang dari SIAKAD.');
  }

  const { data: userData, error: userError } = await siakadSupabase
    .from('master_user')
    .select('*')
    .eq('user_id', sessionData.user.id)
    .maybeSingle();

  if (userError || !userData) {
    // Coba cari berdasarkan id_user jika user_id tidak cocok
    const { data: userData2, error: userError2 } = await siakadSupabase
      .from('master_user')
      .select('*')
      .eq('id_user', sessionData.user.email?.split('@')[0] || '')
      .maybeSingle();

    if (userError2 || !userData2) {
      throw new Error('Data profil guru tidak ditemukan. Endpoint API /api/apk-gen-sync belum tersedia.');
    }

    const user: SiakadMasterUser = {
      id_user: userData2.id_user,
      nama: userData2.nama || '',
      nip: userData2.nip || '',
      role: userData2.role || 'Guru Mapel',
      mapel: userData2.mapel || '',
      rombel: userData2.rombel || '',
      status_aktif: userData2.status_aktif || 'Aktif',
    };

    const sekolah = await fetchSiakadSekolahConfig();
    return { user, sekolah };
  }

  const user: SiakadMasterUser = {
    id_user: userData.id_user,
    nama: userData.nama || '',
    nip: userData.nip || '',
    role: userData.role || 'Guru Mapel',
    mapel: userData.mapel || '',
    rombel: userData.rombel || '',
    status_aktif: userData.status_aktif || 'Aktif',
  };

  const sekolah = await fetchSiakadSekolahConfig();
  return { user, sekolah };
}

/**
 * Fallback konfigurasi sekolah (jika API gagal untuk keperluan lain)
 */
export async function fetchSiakadSekolahConfig(): Promise<SiakadSekolahConfig> {
  // Default fallback untuk MI Miftahul Khoir 1 Karangrejo
  return {
    nama_sekolah: 'MI Miftahul Khoir 1 Karangrejo',
    nama_yayasan: 'Yayasan Miftahul Khoir',
    pemerintah: 'PEMERINTAH KABUPATEN MAGELANG',
    tahun_pelajaran: getTahunPelajaranOtomatis(),
    semester: getSemesterOtomatis(),
  };
}

/**
 * Logout dari SIAKAD
 */
export async function logoutFromSiakad(): Promise<void> {
  await siakadSupabase.auth.signOut();
  localStorage.removeItem('siakad_apk_session');
  localStorage.removeItem('edadmin_siakad_user');
}

/**
 * Cek apakah masih ada sesi SIAKAD aktif
 */
export async function getSiakadSession() {
  const { data } = await siakadSupabase.auth.getSession();
  return data.session;
}

/**
 * Cek apakah SIAKAD dapat dijangkau
 */
export async function checkSiakadSupabaseHealth(): Promise<boolean> {
  try {
    const { error } = await siakadSupabase
      .from('master_user')
      .select('id_user')
      .limit(1);
    return !error;
  } catch {
    return false;
  }
}

// ============================================================
// Helper: Data Mapping untuk APK Gen Pengaturan
// ============================================================

/**
 * Map data SIAKAD ke format Pengaturan APK Gen
 */
export function mapSiakadToPengaturan(
  user: SiakadMasterUser,
  sekolah: SiakadSekolahConfig
) {
  return {
    // Data guru dari SIAKAD
    Nama_Guru: user.nama || '',
    NIP_Guru: user.nip || '',

    // Data sekolah dari SIAKAD
    Nama_Sekolah: sekolah.nama_sekolah || 'MI Miftahul Khoir 1 Karangrejo',
    // JSON SIAKAD menggunakan field 'Jalan', fallback ke 'alamat' jika ada
    Alamat_Sekolah: (sekolah as any).jalan || sekolah.alamat || '-',
    Nama_Yayasan: sekolah.nama_yayasan || 'Yayasan NU Miftakhul Khoir Damarjati',
    Nama_Kepsek: sekolah.nama_kepsek || '',
    NIP_Kepsek: sekolah.nip_kepsek || '',
    Tahun_Pelajaran: sekolah.tahun_pelajaran || getTahunPelajaranOtomatis(),
    Semester: sekolah.semester || getSemesterOtomatis(),

    // SIAKAD metadata
    siakadUserId: user.id_user,
    siakadSyncedAt: Date.now(),
    authProvider: 'siakad' as const,
  };
}

// ============================================================
// Utilities
// ============================================================

function getTahunPelajaranOtomatis(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  // Tahun ajaran baru mulai Juli
  if (month >= 7) {
    return `${year}/${year + 1}`;
  }
  return `${year - 1}/${year}`;
}

function getSemesterOtomatis(): string {
  const month = new Date().getMonth() + 1;
  // Juli-Desember = Semester 1, Januari-Juni = Semester 2
  return month >= 7 ? '1 (Ganjil)' : '2 (Genap)';
}
