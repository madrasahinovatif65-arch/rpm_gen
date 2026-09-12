import React, { useState, useEffect } from 'react';
import { Save, Calendar, RefreshCw, AlertTriangle } from 'lucide-react';
import { getKaldik, saveKaldik } from '../lib/firebase';
import { notifySimpanSuccess, notifySimpanError } from '../lib/swal';
import { KaldikData, KaldikMonth } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

const DEFAULT_SEMESTER1 = [
  { namaBulan: 'Juli', totalMinggu: 4, mingguTidakEfektif: 2, mingguEfektif: 2, keterangan: 'Libur akhir tahun ajaran, MPLS' },
  { namaBulan: 'Agustus', totalMinggu: 5, mingguTidakEfektif: 1, mingguEfektif: 4, keterangan: 'Libur HUT RI' },
  { namaBulan: 'September', totalMinggu: 4, mingguTidakEfektif: 0, mingguEfektif: 4, keterangan: '' },
  { namaBulan: 'Oktober', totalMinggu: 4, mingguTidakEfektif: 0, mingguEfektif: 4, keterangan: '' },
  { namaBulan: 'November', totalMinggu: 5, mingguTidakEfektif: 0, mingguEfektif: 5, keterangan: '' },
  { namaBulan: 'Desember', totalMinggu: 4, mingguTidakEfektif: 3, mingguEfektif: 1, keterangan: 'PAS, Libur Semester 1' }
];

const DEFAULT_SEMESTER2 = [
  { namaBulan: 'Januari', totalMinggu: 5, mingguTidakEfektif: 1, mingguEfektif: 4, keterangan: 'Tahun Baru' },
  { namaBulan: 'Februari', totalMinggu: 4, mingguTidakEfektif: 0, mingguEfektif: 4, keterangan: '' },
  { namaBulan: 'Maret', totalMinggu: 4, mingguTidakEfektif: 1, mingguEfektif: 3, keterangan: 'Libur Awal Ramadhan / Libur Nasional' },
  { namaBulan: 'April', totalMinggu: 4, mingguTidakEfektif: 2, mingguEfektif: 2, keterangan: 'Idul Fitri' },
  { namaBulan: 'Mei', totalMinggu: 5, mingguTidakEfektif: 1, mingguEfektif: 4, keterangan: '' },
  { namaBulan: 'Juni', totalMinggu: 4, mingguTidakEfektif: 3, mingguEfektif: 1, keterangan: 'PAT, Libur Semester 2' }
];

export const KaldikAdminView: React.FC = () => {
  const [tahunAjaran, setTahunAjaran] = useState("2024/2025");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState<KaldikData>({
    tahunAjaran: "2024/2025",
    semester1: JSON.parse(JSON.stringify(DEFAULT_SEMESTER1)),
    semester2: JSON.parse(JSON.stringify(DEFAULT_SEMESTER2)),
    semester1_kls6: JSON.parse(JSON.stringify(DEFAULT_SEMESTER1)),
    semester2_kls6: JSON.parse(JSON.stringify(DEFAULT_SEMESTER2))
  });

  const loadKaldik = async () => {
    setLoading(true);
    try {
      const saved = await getKaldik(tahunAjaran);
      if (saved) {
        setData({
          tahunAjaran,
          semester1: saved.semester1 || JSON.parse(JSON.stringify(DEFAULT_SEMESTER1)),
          semester2: saved.semester2 || JSON.parse(JSON.stringify(DEFAULT_SEMESTER2)),
          semester1_kls6: saved.semester1_kls6 || saved.semester1 || JSON.parse(JSON.stringify(DEFAULT_SEMESTER1)),
          semester2_kls6: saved.semester2_kls6 || saved.semester2 || JSON.parse(JSON.stringify(DEFAULT_SEMESTER2))
        });
      } else {
        // Reset to default
        setData({
          tahunAjaran,
          semester1: JSON.parse(JSON.stringify(DEFAULT_SEMESTER1)),
          semester2: JSON.parse(JSON.stringify(DEFAULT_SEMESTER2)),
          semester1_kls6: JSON.parse(JSON.stringify(DEFAULT_SEMESTER1)),
          semester2_kls6: JSON.parse(JSON.stringify(DEFAULT_SEMESTER2))
        });
      }
    } catch (e: any) {
      notifySimpanError("Gagal meload Kaldik: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKaldik();
  }, [tahunAjaran]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const userStr = localStorage.getItem('edadmin_user');
      const user = userStr ? JSON.parse(userStr) : {};
      
      const toSave: KaldikData = {
        ...data,
        updatedAt: Date.now(),
        updatedBy: user.username || user.nama || 'admin'
      };
      
      await saveKaldik(tahunAjaran, toSave);
      notifySimpanSuccess("Kalender Akademik berhasil disimpan!");
    } catch (e: any) {
      notifySimpanError("Gagal menyimpan Kaldik: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleMonthChange = (
    semesterKey: keyof KaldikData,
    index: number,
    field: keyof KaldikMonth,
    value: string
  ) => {
    setData(prev => {
      const arr = [...(prev[semesterKey] as KaldikMonth[])];
      const month = { ...arr[index] };
      
      if (field === 'keterangan') {
        month[field] = value;
      } else {
        month[field] = parseInt(value) || 0;
        // Recalculate minggu efektif
        if (field === 'totalMinggu' || field === 'mingguTidakEfektif') {
          month.mingguEfektif = Math.max(0, month.totalMinggu - month.mingguTidakEfektif);
        }
      }
      
      arr[index] = month;
      return { ...prev, [semesterKey]: arr };
    });
  };

  const renderTable = (title: string, semesterKey: keyof KaldikData) => {
    const months = data[semesterKey] as KaldikMonth[];
    const sumTotal = months.reduce((acc, m) => acc + m.totalMinggu, 0);
    const sumTE = months.reduce((acc, m) => acc + m.mingguTidakEfektif, 0);
    const sumEf = months.reduce((acc, m) => acc + m.mingguEfektif, 0);

    return (
      <Card variant="bordered" padding="md" className="overflow-x-auto mb-6">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-lg border-b pb-2">{title}</h3>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100 dark:bg-slate-800">
            <tr>
              <th className="p-3 border border-slate-200 dark:border-slate-700 w-32">Bulan</th>
              <th className="p-3 border border-slate-200 dark:border-slate-700 w-24 text-center">Total Minggu</th>
              <th className="p-3 border border-slate-200 dark:border-slate-700 w-24 text-center">Tdk Efektif</th>
              <th className="p-3 border border-slate-200 dark:border-slate-700 w-24 text-center">Efektif (KBM)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-700">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m, idx) => (
              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                <td className="p-2 border border-slate-200 dark:border-slate-700 font-semibold">{m.namaBulan}</td>
                <td className="p-2 border border-slate-200 dark:border-slate-700 text-center">
                  <input 
                    type="number" min="0" max="6"
                    className="w-16 p-1 border rounded text-center bg-white dark:bg-slate-900"
                    value={m.totalMinggu}
                    onChange={(e) => handleMonthChange(semesterKey, idx, 'totalMinggu', e.target.value)}
                  />
                </td>
                <td className="p-2 border border-slate-200 dark:border-slate-700 text-center">
                  <input 
                    type="number" min="0" max="6"
                    className="w-16 p-1 border rounded text-center bg-white dark:bg-slate-900 text-red-600"
                    value={m.mingguTidakEfektif}
                    onChange={(e) => handleMonthChange(semesterKey, idx, 'mingguTidakEfektif', e.target.value)}
                  />
                </td>
                <td className="p-2 border border-slate-200 dark:border-slate-700 text-center font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10">
                  {m.mingguEfektif}
                </td>
                <td className="p-2 border border-slate-200 dark:border-slate-700">
                  <input 
                    type="text"
                    className="w-full p-1 border rounded bg-white dark:bg-slate-900"
                    value={m.keterangan}
                    placeholder="Contoh: Libur PAS, P5RA"
                    onChange={(e) => handleMonthChange(semesterKey, idx, 'keterangan', e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 dark:bg-slate-800 font-bold">
            <tr>
              <td className="p-3 border border-slate-200 dark:border-slate-700">JUMLAH</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700 text-center">{sumTotal}</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700 text-center text-red-600">{sumTE}</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700 text-center text-emerald-600">{sumEf}</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700"></td>
            </tr>
          </tfoot>
        </table>
      </Card>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <Card variant="elevated" padding="lg" className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white border-0">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <Badge variant="accent" size="md" className="uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>Kalender Akademik</span>
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold">
              Konfigurasi Kaldik Madrasah
            </h2>
            <p className="text-emerald-100 text-sm leading-relaxed max-w-2xl">
              Atur jumlah minggu efektif per bulan. Data ini akan otomatis diinjeksikan ke AI saat menyusun Program Tahunan (Prota) dan Program Semester (Prosem) agar matriks jadwalnya presisi 100%.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-emerald-900/50 p-3 rounded-lg border border-emerald-600/30">
            <label className="text-sm font-semibold whitespace-nowrap">Tahun Ajaran:</label>
            <select 
              value={tahunAjaran}
              onChange={(e) => setTahunAjaran(e.target.value)}
              className="px-3 py-1.5 rounded-md bg-white text-emerald-900 font-bold border-0 outline-none"
            >
              <option value="2023/2024">2023/2024</option>
              <option value="2024/2025">2024/2025</option>
              <option value="2025/2026">2025/2026</option>
            </select>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500">
          <RefreshCw className="w-10 h-10 animate-spin mb-4 text-emerald-500" />
          <p>Memuat Data Kaldik...</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
            <div className="text-sm text-amber-800 dark:text-amber-400">
              <strong className="block mb-1">Catatan Penting:</strong>
              Pastikan Anda mengisi jumlah minggu sesuai kalender masehi yang berlaku di madrasah Anda. Kolom "Keterangan" opsional namun sangat membantu AI menjelaskan alasan minggu tersebut tidak efektif (misal: PAS, Libur Ramadhan, P5RA, dll).
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white border-b-2 border-emerald-500 pb-2">
              Kaldik Standar (Kelas 1 s.d. 5)
            </h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {renderTable("Semester Ganjil", "semester1")}
              {renderTable("Semester Genap", "semester2")}
            </div>
          </div>

          <div className="space-y-6 mt-12 pt-8 border-t-2 border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white border-b-2 border-orange-500 pb-2">
              Kaldik Khusus (Kelas 6)
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Kelas 6 umumnya memiliki minggu efektif yang lebih pendek di semester genap karena jadwal Ujian Madrasah (UM) dan kelulusan.
            </p>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {renderTable("Semester Ganjil (Kls 6)", "semester1_kls6")}
              {renderTable("Semester Genap (Kls 6)", "semester2_kls6")}
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <Button
              variant="primary"
              size="lg"
              icon={Save}
              onClick={handleSave}
              disabled={saving}
              className="px-12"
            >
              {saving ? "Menyimpan..." : "Simpan Kalender Akademik"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
