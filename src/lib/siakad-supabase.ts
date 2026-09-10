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
  siakad_karakteristik?: string;
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
      let guruData: any = null;
      let activeRombelStr = 'Simulasi';
      const guruArr = json.Guru;
      if (guruArr && Array.isArray(guruArr) && guruArr.length > 0) {
        // Find the specific guru matching the expectedUserId, or fallback to index 0 if only 1 is returned (new API format)
        guruData = guruArr.find((g: any) => g.id_user === expectedUserId || g.NIP_Guru === expectedUserId);
        if (!guruData && guruArr.length === 1) {
            guruData = guruArr[0];
        }
        if (guruData && (guruData.siakadRombel || guruData.rombel)) {
            activeRombelStr = guruData.siakadRombel || guruData.rombel;
        }
      }

      let jumlahSiswa = 25;
      let cleanRombelStr = activeRombelStr.replace(/Fase\s+[A-F]\s*\/\s*/i, '');
      
      if (activeRombelStr !== 'Simulasi') {
        const { count } = await siakadSupabase
          .from('master_user')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'Siswa')
          .eq('rombel', guruData?.rombel || activeRombelStr);
        if (count) jumlahSiswa = count;
      }

      const sekolah: SiakadSekolahConfig = {
        nama_sekolah: json.Nama_Sekolah,
        nama_yayasan: json.Nama_Yayasan,
        alamat: json.Jalan,
        nama_kepsek: json.Nama_Kepala_Madrasah || json.Nama_Kepsek || json.Kepala_Madrasah,
        nip_kepsek: json.NIP_Kepala_Madrasah || json.NIP_Kepsek || json.NIP_Kepala,
        tahun_pelajaran: json.Tahun_Pelajaran,
        semester: json.Semester,
        siakad_karakteristik: json.siakadKarakteristik || `[Data Simulasi]
Berdasarkan data asesmen diagnostik untuk ${jumlahSiswa} siswa ${cleanRombelStr.includes('Kelas') ? cleanRombelStr : `Kelas ${cleanRombelStr}`}:

Profil Non-Kognitif:
- Kesiapan Sosial Emosional: Antusias (18), Biasa saja (5), Cemas/Takut (2)
- Dukungan Belajar di Rumah: Didampingi (15), Mandiri (7), Sering kesulitan (3)
- Minat Dominan: Teknologi (10), Olahraga (8), Seni (4), Membaca (3)

Profil Kognitif (Asesmen Awal):
- Kemampuan Literasi: Cakap (14), Berkembang (8), Perlu Bimbingan (3)
- Kemampuan Numerasi: Cakap (10), Berkembang (11), Perlu Bimbingan (4)`,
      };

        if (guruData) {
          const user: SiakadMasterUser = {
            id_user: guruData.id_user || guruData.NIP_Guru || 'ID_UNKNOWN',
            nama: guruData.Nama_Guru || '',
            nip: guruData.NIP_Guru || guruData.id_user || '',
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

  function formatRombelFallback(r: string) {
    if (!r || r === '-' || r.trim() === '') return '';
    const match = r.match(/\d+/);
    if (match) {
      const grade = parseInt(match[0], 10);
      let fase = '';
      if (grade === 1 || grade === 2) fase = 'A';
      else if (grade === 3 || grade === 4) fase = 'B';
      else if (grade === 5 || grade === 6) fase = 'C';
      if (fase) return `Fase ${fase} / Kelas ${r.trim()}`;
    }
    return r;
  }

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
      nip: userData2.nip || userData2.id_user || '',
      role: userData2.role || 'Guru Mapel',
      mapel: userData2.mapel || '',
      rombel: formatRombelFallback(userData2.rombel || ''),
      status_aktif: userData2.status_aktif || 'Aktif',
    };

    const sekolah = await fetchSiakadSekolahConfig(userData2.rombel || 'Simulasi');
    return { user, sekolah };
  }

  const user: SiakadMasterUser = {
    id_user: userData.id_user,
    nama: userData.nama || '',
    nip: userData.nip || userData.id_user || '',
    role: userData.role || 'Guru Mapel',
    mapel: userData.mapel || '',
    rombel: formatRombelFallback(userData.rombel || ''),
    status_aktif: userData.status_aktif || 'Aktif',
  };

  const sekolah = await fetchSiakadSekolahConfig(userData.rombel || 'Simulasi');
  return { user, sekolah };
}

/**
 * Fallback konfigurasi sekolah (jika API gagal untuk keperluan lain)
 */
export async function fetchSiakadSekolahConfig(rombel: string = 'Simulasi'): Promise<SiakadSekolahConfig> {
  let jumlahSiswa = 25;
  if (rombel && rombel !== 'Simulasi') {
    const { count } = await siakadSupabase
      .from('master_user')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'Siswa')
      .eq('rombel', rombel);
    if (count) jumlahSiswa = count;
  }
  // Ambil pengaturan sekolah (jika tabel ada)
  const { data: pengaturan } = await siakadSupabase
    .from('pengaturan_sekolah')
    .select('tahun_ajaran, semester')
    .limit(1)
    .maybeSingle();

  // Ambil data kepsek
  const { data: kepsek } = await siakadSupabase
    .from('master_user')
    .select('nama, id_user')
    .eq('role', 'Kepala Madrasah')
    .limit(1)
    .maybeSingle();

  return {
    nama_sekolah: 'MI Miftahul Khoir 1 Karangrejo',
    nama_yayasan: 'Yayasan NU Miftakhul Khoir Damarjati',
    alamat: 'Jalan Sumber Keling No. 11, Dsn. Krajan, Ds. Karangrejo',
    nama_kepsek: kepsek?.nama || '-',
    nip_kepsek: kepsek?.id_user || '-',
    tahun_pelajaran: pengaturan?.tahun_ajaran || getTahunPelajaranOtomatis(),
    semester: pengaturan?.semester || getSemesterOtomatis(),
    siakad_karakteristik: `[Data Simulasi]
Berdasarkan data asesmen diagnostik untuk ${jumlahSiswa} siswa ${rombel.replace(/Fase\s+[A-F]\s*\/\s*/i, '').includes('Kelas') ? rombel.replace(/Fase\s+[A-F]\s*\/\s*/i, '') : `Kelas ${rombel.replace(/Fase\s+[A-F]\s*\/\s*/i, '')}`}:

Profil Non-Kognitif:
- Kesiapan Sosial Emosional: Antusias (18), Biasa saja (5), Cemas/Takut (2)
- Dukungan Belajar di Rumah: Didampingi (15), Mandiri (7), Sering kesulitan (3)
- Minat Dominan: Teknologi (10), Olahraga (8), Seni (4), Membaca (3)

Profil Kognitif (Asesmen Awal):
- Kemampuan Literasi: Cakap (14), Berkembang (8), Perlu Bimbingan (3)
- Kemampuan Numerasi: Cakap (10), Berkembang (11), Perlu Bimbingan (4)`,
  };
}

/**
 * Logout dari SIAKAD
 */
export async function logoutSIAKAD(): Promise<void> {
  const { error } = await siakadSupabase.auth.signOut();
  if (error) {
    console.error('Logout SIAKAD gagal:', error.message);
    throw new Error(error.message);
  }
  localStorage.removeItem('siakad_apk_session');
  localStorage.removeItem('edadmin_siakad_user');
}

/**
 * Mengambil daftar rombel yang unik dari database (untuk dropdown)
 */
export async function fetchDistinctRombels(): Promise<string[]> {
  try {
    const { data, error } = await siakadSupabase
      .from('master_user')
      .select('rombel')
      .eq('role', 'Siswa')
      .neq('rombel', null)
      .neq('rombel', '')
      .neq('rombel', '-');
      
    if (error || !data) return [];
    
    const uniqueRombels = Array.from(new Set(data.map(d => d.rombel))).sort();
    return uniqueRombels;
  } catch (err) {
    return [];
  }
}

/**
 * Mengambil rekap karakteristik siswa secara spesifik berdasarkan rombel
 */
export async function fetchKarakteristikByRombel(rombel: string, tahunPelajaran: string = '2026/2027', semester: string = 'Ganjil'): Promise<string> {
  if (!rombel) return '';
  
  let rekapKarakteristik = '';
  
  try {
    // Non-Kognitif
    const { data: nkData, error: nkError } = await siakadSupabase
      .from('profil_non_kognitif')
      .select('sosial_emosional, dukungan_belajar, minat_dominan')
      .eq('rombel', rombel)
      .eq('tahun_ajaran', tahunPelajaran);
      
    if (!nkError && nkData && nkData.length > 0) {
      const total = nkData.length;
      const counts: any = { sosial: {}, dukungan: {}, minat: {} };
      nkData.forEach(d => {
        if (d.sosial_emosional) counts.sosial[d.sosial_emosional] = (counts.sosial[d.sosial_emosional] || 0) + 1;
        if (d.dukungan_belajar) counts.dukungan[d.dukungan_belajar] = (counts.dukungan[d.dukungan_belajar] || 0) + 1;
        if (d.minat_dominan) counts.minat[d.minat_dominan] = (counts.minat[d.minat_dominan] || 0) + 1;
      });

      rekapKarakteristik = `Berdasarkan data asesmen diagnostik untuk ${total} siswa ${rombel.includes('Kelas') ? rombel : `Kelas ${rombel}`}:\n`;
      rekapKarakteristik += `Profil Non-Kognitif:\n`;
      rekapKarakteristik += `- Kesiapan Sosial Emosional: ${Object.entries(counts.sosial).map(([k,v]) => `${k} (${v})`).join(', ')}\n`;
      rekapKarakteristik += `- Dukungan Belajar di Rumah: ${Object.entries(counts.dukungan).map(([k,v]) => `${k} (${v})`).join(', ')}\n`;
      rekapKarakteristik += `- Minat Dominan: ${Object.entries(counts.minat).map(([k,v]) => `${k} (${v})`).join(', ')}\n`;
    }

    // Kognitif Umum
    const { data: kogData, error: kogError } = await siakadSupabase
      .from('hasil_kognitif_murid')
      .select('kategori_literasi, kategori_numerasi')
      .eq('rombel', rombel)
      .eq('tahun_ajaran', tahunPelajaran)
      .eq('semester', semester);

    if (!kogError && kogData && kogData.length > 0) {
      const countsKog: any = { literasi: {}, numerasi: {} };
      kogData.forEach(d => {
        if (d.kategori_literasi) countsKog.literasi[d.kategori_literasi] = (countsKog.literasi[d.kategori_literasi] || 0) + 1;
        if (d.kategori_numerasi) countsKog.numerasi[d.kategori_numerasi] = (countsKog.numerasi[d.kategori_numerasi] || 0) + 1;
      });
      
      if (!rekapKarakteristik) {
        // Jika tidak ada data non-kognitif, kita buat header default
        const { count } = await siakadSupabase.from('master_user').select('*', { count: 'exact', head: true }).eq('role', 'Siswa').eq('rombel', rombel);
        rekapKarakteristik = `Berdasarkan data asesmen diagnostik untuk ${count || kogData.length} siswa ${rombel.includes('Kelas') ? rombel : `Kelas ${rombel}`}:\n`;
      }
      
      rekapKarakteristik += `\nProfil Kognitif (Asesmen Awal):\n`;
      rekapKarakteristik += `- Kemampuan Literasi: ${Object.entries(countsKog.literasi).map(([k,v]) => `${k} (${v})`).join(', ')}\n`;
      rekapKarakteristik += `- Kemampuan Numerasi: ${Object.entries(countsKog.numerasi).map(([k,v]) => `${k} (${v})`)}`;
    }

    // Fallback Simulasi jika kosong
    if (!rekapKarakteristik) {
      let jumlahSiswa = 25;
      const { count } = await siakadSupabase
        .from('master_user')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'Siswa')
        .eq('rombel', rombel);
      if (count) jumlahSiswa = count;
      
      const cleanRombel = rombel.replace(/Fase\s+[A-F]\s*\/\s*/i, '');
      const rombelLabel = cleanRombel.includes('Kelas') ? cleanRombel : `Kelas ${cleanRombel}`;
      
      rekapKarakteristik = `[Data Simulasi]
Berdasarkan data asesmen diagnostik untuk ${jumlahSiswa} siswa ${rombelLabel}:

Profil Non-Kognitif:
- Kesiapan Sosial Emosional: Antusias (18), Biasa saja (5), Cemas/Takut (2)
- Dukungan Belajar di Rumah: Didampingi (15), Mandiri (7), Sering kesulitan (3)
- Minat Dominan: Teknologi (10), Olahraga (8), Seni (4), Membaca (3)

Profil Kognitif (Asesmen Awal):
- Kemampuan Literasi: Cakap (14), Berkembang (8), Perlu Bimbingan (3)
- Kemampuan Numerasi: Cakap (10), Berkembang (11), Perlu Bimbingan (4)`;
    }

    return rekapKarakteristik;
  } catch (err) {
    console.error('Gagal mengambil karakteristik per rombel:', err);
    return '';
  }
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
    Nama_Sekolah: sekolah.nama_sekolah || '',
    Alamat_Sekolah: (sekolah as any).jalan || sekolah.alamat || '',
    Nama_Yayasan: sekolah.nama_yayasan || '',
    Nama_Kepsek: sekolah.nama_kepsek || '',
    NIP_Kepsek: sekolah.nip_kepsek || '',
    Tahun_Pelajaran: sekolah.tahun_pelajaran || getTahunPelajaranOtomatis(),
    Semester: sekolah.semester || getSemesterOtomatis(),

    // SIAKAD metadata
    siakadUserId: user.id_user,
    siakadRole: user.role,
    siakadMapel: user.mapel,
    siakadRombel: user.rombel,
    siakadKarakteristik: sekolah.siakad_karakteristik || '',
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
