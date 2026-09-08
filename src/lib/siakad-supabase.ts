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

    // Ambil data profil guru dari master_user
    const { data: userData, error: userError } = await siakadSupabase
      .from('master_user')
      .select('*')
      .eq('user_id', authData.user.id)
      .eq('status_aktif', 'Aktif')
      .single();

    if (userError || !userData) {
      await siakadSupabase.auth.signOut();
      return {
        success: false,
        message: 'Akun ditemukan tapi data profil guru tidak ada di database SIAKAD.',
      };
    }

    // Ambil konfigurasi sekolah (tabel pengaturan jika ada, fallback dari env)
    const pengaturan = await fetchSiakadSekolahConfig();

    console.log('✅ SIAKAD login berhasil:', userData.nama);
    return {
      success: true,
      user: userData as SiakadMasterUser,
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
 * Ambil konfigurasi sekolah dari tabel pengaturan SIAKAD
 * Fallback ke default MI Miftahul Khoir jika tabel tidak ada
 */
export async function fetchSiakadSekolahConfig(): Promise<SiakadSekolahConfig> {
  try {
    // Coba ambil dari tabel 'pengaturan' (jika ada di SIAKAD)
    const { data, error } = await siakadSupabase
      .from('pengaturan')
      .select('*')
      .limit(1)
      .single();

    if (!error && data) {
      return {
        nama_sekolah: data.nama_sekolah,
        nama_yayasan: data.nama_yayasan,
        alamat: data.alamat,
        nama_kepsek: data.nama_kepsek,
        nip_kepsek: data.nip_kepsek,
        logo_url: data.logo_url,
        tahun_pelajaran: data.tahun_pelajaran,
        semester: data.semester,
        kantor_kemenag: data.kantor_kemenag,
        pemerintah: data.pemerintah,
      };
    }
  } catch (err) {
    console.warn('⚠️ Tabel pengaturan SIAKAD tidak ditemukan, menggunakan default');
  }

  // Default fallback untuk MI Miftahul Khoir 1 Karangrejo
  return {
    nama_sekolah: 'MI Miftahul Khoir 1 Karangrejo',
    nama_yayasan: 'Yayasan Miftahul Khoir',
    kantor_kemenag: 'KEMENTERIAN AGAMA KABUPATEN MAGELANG',
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
    Pemerintah: sekolah.pemerintah || 'PEMERINTAH KABUPATEN MAGELANG',
    Kantor_Kemenag: sekolah.kantor_kemenag || 'KEMENTERIAN AGAMA KABUPATEN MAGELANG',
    Nama_Kepsek: sekolah.nama_kepsek || '',
    NIP_Kepsek: sekolah.nip_kepsek || '',
    Tahun_Pelajaran: sekolah.tahun_pelajaran || getTahunPelajaranOtomatis(),

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
