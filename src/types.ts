

export interface Pengaturan {
  Nama_Guru: string;
  NIP_Guru: string;
  Pemerintah: string;
  Nama_Sekolah: string;
  Alamat_Sekolah: string;
  Nama_Kepsek: string;
  NIP_Kepsek: string;
  Tempat_Tanda_Tangan: string;
  Logo_Kiri: string;
  Logo_Kanan: string;
  username?: string;
  password?: string;
  isDatabaseCleared?: boolean;
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
