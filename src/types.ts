
export interface CpTemplate {
  id: string;
  name: string;
  rasional: string;
  elemen: string;
  // Per-mapel fields (dikelola di Kelola CP Elemen)
  mataPelajaran?: string;
  singkatanMapel?: string;
  faseKelas?: string;
  jpPerMinggu?: string;
  alokasiWaktuTotal?: string;
  modelPembelajaran?: string;
  metodePembelajaran?: string;
}

export interface Pengaturan {
  Nama_Guru: string;
  NIP_Guru: string;
  Nama_Sekolah: string;
  Alamat_Sekolah: string;
  Nama_Kepsek: string;
  NIP_Kepsek: string;
  Tempat_Tanda_Tangan: string;
  Logo_Kiri: string;
  // Madrasah-level KBC fields (tetap, dikelola di Pengaturan Profil)
  Tahun_Pelajaran?: string;
  Semester?: string;            // Semester aktif (dari SIAKAD)
  Nama_Yayasan?: string;        // Nama yayasan madrasah (dari SIAKAD)
  username?: string;
  password?: string;
  isDatabaseCleared?: boolean;
  cpTemplates?: CpTemplate[];
  // SIAKAD Integration fields
  siakadUserId?: string;        // Guru ID dari SIAKAD (primary key SSO users)
  siakadRole?: string;          // Role guru di SIAKAD (Guru Mapel, Wali Kelas, dll)
  siakadMapel?: string;         // Mata pelajaran yang diampu (dari SIAKAD)
  siakadSyncedAt?: number;      // Timestamp terakhir sync dengan SIAKAD
  authProvider?: 'local' | 'siakad';  // Metode autentikasi yang digunakan
}


export interface ModulFormState {
  namaGuru: string;
  namaSekolah: string;
  tahunAjaran: string;
  jenjang: string;
  fase: string;
  kelas: string;
  waktu: string;
  mataPelajaran: string;
  topik: string;
  subTopik: string;
  jumlahPertemuan: string;
  model: string;
  metode?: string;
  tujuan: string;
  karakteristik: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface PerangkatDoc {
  id: string;
  docType: string;
  docTitle: string;
  data: any;
  formData: any;
  createdAt: number;
  createdBy: string;
  schoolName: string;
  subject: string;
  shareToken?: string;
}

export interface AuthSession {
  token: string;
  tokenType: 'local' | 'siakad';
  expiresAt?: number;
  user: {
    id: string;
    username: string;
    nama: string;
    role: string;
    provider: 'local' | 'siakad';
  };
}
