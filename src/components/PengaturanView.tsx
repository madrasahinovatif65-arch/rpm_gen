import React, { useState, useEffect } from "react";
import { Settings, Save, ShieldCheck, School, UserCheck, Trash2, ShieldAlert, KeyRound, Eye, EyeOff, BookOpen } from "lucide-react";
import { Pengaturan } from "../types";
import { savePengaturan } from "../lib/firebase";
import { notifySimpanSuccess, notifySimpanError } from "../lib/swal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

interface PengaturanViewProps {
  config: Pengaturan;
  onNavigateToReset?: () => void;
  readOnly?: boolean;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({ config, onNavigateToReset, readOnly = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<Pengaturan>({
    Nama_Guru: "",
    NIP_Guru: "",
    Pemerintah: "PEMERINTAH PROVINSI",
    Nama_Sekolah: "",
    Alamat_Sekolah: "",
    Nama_Kepsek: "",
    NIP_Kepsek: "",
    Tempat_Tanda_Tangan: "Karangrejo",
    Logo_Kiri: "https://lh3.googleusercontent.com/d/19TVwFRIp_t7sHTMntziM9SgZVoJAkhQU",
    Logo_Kanan: "https://lh3.googleusercontent.com/d/19TVwFRIp_t7sHTMntziM9SgZVoJAkhQU",
    Kantor_Kemenag: "",
    Nama_Yayasan: "",
    Tahun_Pelajaran: "",
    username: "madrasahinovatif",
    password: "123456"
  });

  useEffect(() => {
    if (config) {
      setForm({
        Nama_Guru: config.Nama_Guru || "",
        NIP_Guru: config.NIP_Guru || "",
        Pemerintah: config.Pemerintah || "",
        Nama_Sekolah: config.Nama_Sekolah || "MI Miftahul Khoir 1 Karangrejo",
        Alamat_Sekolah: config.Alamat_Sekolah || "",
        Nama_Kepsek: config.Nama_Kepsek || "",
        NIP_Kepsek: config.NIP_Kepsek || "",
        Tempat_Tanda_Tangan: config.Tempat_Tanda_Tangan || "Karangrejo",
        Logo_Kiri: config.Logo_Kiri || "https://lh3.googleusercontent.com/d/19TVwFRIp_t7sHTMntziM9SgZVoJAkhQU",
        Logo_Kanan: config.Logo_Kanan || "https://lh3.googleusercontent.com/d/19TVwFRIp_t7sHTMntziM9SgZVoJAkhQU",
        Kantor_Kemenag: config.Kantor_Kemenag || "",
        Nama_Yayasan: config.Nama_Yayasan || "",
        Tahun_Pelajaran: config.Tahun_Pelajaran || "",
        username: config.username || "madrasahinovatif",
        password: config.password || "123456"
      });
    }
  }, [config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await savePengaturan(form);
      notifySimpanSuccess("Pengaturan profil & kredensial akun tersimpan ke Firebase!");
    } catch (err: any) {
      notifySimpanError(err.message || "Gagal menyimpan pengaturan.");
    }
  };

  const inputClassName = "text-xs";

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            {readOnly ? 'Data Tersinkronisasi dari SIAKAD' : 'Pengaturan Profil Guru & Kop Sekolah'}
          </h2>
          <p className="text-xs text-slate-500">
            {readOnly
              ? 'Data berikut diambil otomatis dari database SIAKAD saat login. Untuk mengubah, hubungi Admin SIAKAD.'
              : 'Data ini digunakan secara otomatis pada Kop Surat Laporan PDF, Kartu Pelajar, dan Nama Penandatangan.'}
          </p>
          {readOnly && (
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Login via SIAKAD — data hanya bisa diubah oleh Admin. Tampilan ini untuk verifikasi data sinkronisasi.</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: Identitas Guru */}
            <div className="p-5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2 border-b pb-2">
                <ShieldCheck className="w-4 h-4" />
                Identitas Guru Pengampu
              </h3>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nama Guru Lengkap & Gelar</label>
                <Input
                  type="text"
                  id="Nama_Guru"
                  value={form.Nama_Guru}
                  onChange={handleChange}
                  placeholder="Contoh: Budi Santoso, S.Pd., M.Pd."
                  className={inputClassName}
                  disabled={readOnly}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">NIP Guru</label>
                <Input
                  type="text"
                  id="NIP_Guru"
                  value={form.NIP_Guru}
                  onChange={handleChange}
                  placeholder="19900101 201501 1 002"
                  className={inputClassName}
                  disabled={readOnly}
                />
              </div>
            </div>

            {/* Box 2: Identitas Kepsek */}
            <div className="p-5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2 border-b pb-2">
                <UserCheck className="w-4 h-4" />
                Identitas Kepala Sekolah
              </h3>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nama Kepala Sekolah</label>
                <Input
                  type="text"
                  id="Nama_Kepsek"
                  value={form.Nama_Kepsek}
                  onChange={handleChange}
                  placeholder="Nama & Gelar Kepala Sekolah"
                  className={inputClassName}
                  disabled={readOnly}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">NIP Kepala Sekolah</label>
                <Input
                  type="text"
                  id="NIP_Kepsek"
                  value={form.NIP_Kepsek}
                  onChange={handleChange}
                  placeholder="NIP Kepala Sekolah"
                  className={inputClassName}
                  disabled={readOnly}
                />
              </div>
            </div>
          </div>

          {/* Box 3: Identitas Sekolah & Kop Surat */}
          <div className="p-5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2 border-b pb-2">
              <School className="w-4 h-4" />
              Identitas Sekolah & Kop Surat Laporan
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nama Resmi Sekolah</label>
                <Input
                  type="text"
                  id="Nama_Sekolah"
                  value={form.Nama_Sekolah}
                  onChange={handleChange}
                  placeholder="SMA NEGERI 1 KOTA"
                  className={inputClassName}
                  disabled={readOnly}
                />
              </div>


              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Alamat Lengkap & Telepon Sekolah</label>
                <Input
                  type="text"
                  id="Alamat_Sekolah"
                  value={form.Alamat_Sekolah}
                  onChange={handleChange}
                  placeholder="Jalan Pendidikan No. 1, Telp: 021-xxxxxx"
                  className={inputClassName}
                  disabled={readOnly}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Kota / Tempat Tanda Tangan Laporan</label>
                <Input
                  type="text"
                  id="Tempat_Tanda_Tangan"
                  value={form.Tempat_Tanda_Tangan}
                  onChange={handleChange}
                  placeholder="Contoh: Bandung / Jakarta"
                  className={inputClassName}
                  disabled={readOnly}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">URL Logo Sekolah (Sebelah Kiri Kop)</label>
                <Input
                  type="text"
                  id="Logo_Kiri"
                  value={form.Logo_Kiri || ""}
                  onChange={handleChange}
                  placeholder="Link gambar HTTPS logo"
                  className={inputClassName}
                  disabled={readOnly}
                />
              </div>
            </div>
          </div>

          {/* Box 4: Profil Default KBC (madrasah-level) */}
          <div className="p-5 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2 border-b border-emerald-200 dark:border-emerald-800 pb-2">
              <BookOpen className="w-4 h-4" />
              Info Madrasah untuk Dokumen KBC
              <span className="ml-1 text-[10px] font-normal normal-case text-emerald-600 dark:text-emerald-500">(Berlaku untuk semua mapel — diisi otomatis saat klik "Isi dari Profil")</span>
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-1">
              📌 Data per mata pelajaran (Mapel, Fase, JP, Model Pembelajaran, dll) dikelola di menu <strong>Kelola Database CP Elemen</strong>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nama Yayasan</label>
                <Input
                  type="text"
                  id="Nama_Yayasan"
                  value={form.Nama_Yayasan || ""}
                  onChange={handleChange}
                  placeholder="Contoh: Yayasan NU Miftakhul Khoir"
                  className={inputClassName}
                  disabled={readOnly}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Tahun Pelajaran</label>
                <Input
                  type="text"
                  id="Tahun_Pelajaran"
                  value={form.Tahun_Pelajaran || ""}
                  onChange={handleChange}
                  placeholder="Contoh: 2026/2027"
                  className={inputClassName}
                  disabled={readOnly}
                />
              </div>
            </div>
          </div>

          <div className="p-5 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-800/60 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-2 border-b border-blue-200 dark:border-blue-800 pb-2">
              <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Akses Kredensial Akun (Ganti Username & Password Login)
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Perbarui username dan kata sandi akses aplikasi Anda di sini. Data kredensial disimpan langsung secara otomatis ke database Firebase dan divalidasi aman pada sisi server.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Username Login</label>
                <Input
                  type="text"
                  id="username"
                  value={form.username || ""}
                  onChange={handleChange}
                  placeholder="admin.madrasah"
                  autoComplete="username"
                  className={inputClassName}
                  disabled={readOnly}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Password Baru (Standar: 123456)</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={form.password || ""}
                    onChange={handleChange}
                    placeholder="123456"
                    autoComplete="current-password"
                    className="text-xs font-mono pr-12"
                    disabled={readOnly}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus-visible:ring-2 focus-visible:ring-emerald-500"
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {!readOnly && (
            <div className="flex justify-end">
              <Button type="submit" variant="primary" size="md" icon={Save}>
                Simpan Pengaturan ke Firebase
              </Button>
            </div>
          )}
        </form>

        {/* Zona Bahaya / Reset Total */}
        {onNavigateToReset && (
          <div className="pt-6 border-t border-red-200 dark:border-red-900/50 space-y-3">
            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-900/40">
              <div className="space-y-1">
                <h4 className="text-xs font-black text-red-900 dark:text-red-200 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  ZONA BAHAYA: Hapus / Kosongkan Semua Isi Database
                </h4>
                <p className="text-[11px] text-red-700 dark:text-red-300 font-medium">
                  Hapus secara permanen seluruh siswa, absensi, nilai, agenda, bimbingan, dan data sekolah untuk digunakan dari nol.
                </p>
              </div>

              <Button
                type="button"
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={onNavigateToReset}
              >
                Buka Menu Hapus Database
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
