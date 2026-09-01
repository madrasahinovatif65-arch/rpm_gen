import React from 'react';
import { 
  ModulAjarType, LkpdType, RubrikType 
} from '../../lib/kbcSchemas';
import { TableHeader, Td, DocumentHeader, DocumentFooter } from './AdministrasiRenderers';

interface RendererProps {
  data: any;
  context: any;
}

export const ModulAjarRenderer: React.FC<RendererProps> = ({ data, context }) => {
  const modul = data as ModulAjarType;
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#000', lineHeight: 1.5 }}>
      <DocumentHeader context={context} title="MODUL AJAR DEEP LEARNING" subtitle={`Kurikulum Berbasis Cinta (KBC) | Model: ${context.module?.learningModel}`} />
      
      <h4>A. INFORMASI UMUM</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <tbody>
          <tr><Td>Penyusun</Td><Td><strong>{context.school?.teacher}</strong></Td></tr>
          <tr><Td>Satuan Pendidikan</Td><Td><strong>{context.school?.schoolName}</strong></Td></tr>
          <tr><Td>Mata Pelajaran</Td><Td><strong>{context.curriculum?.subject}</strong></Td></tr>
          <tr><Td>Fase / Kelas</Td><Td><strong>{context.curriculum?.level}</strong></Td></tr>
          <tr><Td>Tujuan Pembelajaran</Td><Td><strong>{context.module?.kodeTp}: {context.module?.rumusanTp}</strong></Td></tr>
          <tr><Td>Alokasi Waktu</Td><Td><strong>{context.module?.jumlahPertemuan} Pertemuan ({context.module?.jumlahPertemuan * context.module?.jpPerPertemuan} JP)</strong></Td></tr>
          <tr><Td>Model Pembelajaran</Td><Td><strong>{context.module?.learningModel}</strong></Td></tr>
          <tr><Td>Topik Lokal</Td><Td><strong>{context.module?.topikLokal}</strong></Td></tr>
        </tbody>
      </table>

      <h4>1. Kesiapan & Karakteristik</h4>
      <p><strong>Identifikasi Kesiapan:</strong> {modul.kesiapanPesertaDidik}</p>
      <p><strong>Karakteristik Materi:</strong> {modul.karakteristikMateri}</p>
      
      <h4>2. Profil Lulusan & Integrasi KBC</h4>
      <ul>
        <li><strong>Dimensi Profil:</strong> {modul.profilLulusan?.join(', ')}</li>
        <li><strong>Panca Cinta Kemenag:</strong> {modul.integrasiKbc?.pancaCinta}</li>
        <li><strong>Nilai PPRA:</strong> {modul.integrasiKbc?.nilaiPpra}</li>
      </ul>

      <h4>3. Sarana & Target</h4>
      <p><strong>Sarana:</strong> {modul.saranaPrasarana?.join(', ')}</p>
      <p><strong>Target Siswa:</strong> {modul.targetPesertaDidik}</p>
      
      <hr />
      
      <h4>B. KOMPONEN INTI</h4>
      <div style={{ backgroundColor: '#f0fdf4', padding: '15px', borderLeft: '4px solid #16a34a', marginBottom: '20px' }}>
        <strong>Pemahaman Bermakna:</strong><br/>
        {modul.pemahamanBermakna}
      </div>

      <h4>Pertanyaan Pemantik</h4>
      <ul>
        {modul.pertanyaanPemantik?.map((p, i) => <li key={i}>{p}</li>)}
      </ul>

      <h4>Asesmen Diagnostik</h4>
      <p><strong>Non-Kognitif:</strong> {modul.asesmenDiagnostik?.nonKognitif?.join(', ')}</p>
      <p><strong>Kognitif:</strong> {modul.asesmenDiagnostik?.kognitif?.join(', ')}</p>

      <h4>C. KEGIATAN PEMBELAJARAN</h4>
      {modul.kegiatanPembelajaran?.map((pertemuan, i) => (
        <div key={i} style={{ marginBottom: '30px' }}>
          <h5 style={{ backgroundColor: '#1e293b', color: 'white', padding: '10px' }}>
            Pertemuan {pertemuan.pertemuanKe}: {pertemuan.fokusMateri} ({pertemuan.alokasiMenit} Menit)
          </h5>
          
          <strong>1. Kegiatan Pendahuluan ({pertemuan.langkah?.pendahuluan?.durasiMenit} Menit)</strong>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
            <thead>
              <tr><TableHeader>Aktivitas Guru</TableHeader><TableHeader>Aktivitas Siswa</TableHeader></tr>
            </thead>
            <tbody>
              {pertemuan.langkah?.pendahuluan?.aktivitas?.map((act, idx) => (
                <tr key={idx}>
                  <Td>{act.guru}</Td>
                  <Td>{act.siswa}</Td>
                </tr>
              ))}
            </tbody>
          </table>

          <strong>2. Kegiatan Inti ({pertemuan.langkah?.inti?.durasiMenit} Menit)</strong>
          {pertemuan.langkah?.inti?.sintak?.map((sintak, sIdx) => (
            <div key={sIdx} style={{ marginBottom: '10px' }}>
              <div style={{ padding: '5px', backgroundColor: '#e2e8f0', fontWeight: 'bold' }}>{sintak.namaSintak}</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {sintak.aktivitas?.map((act, actIdx) => (
                    <tr key={actIdx}>
                      <Td width="50%">{act.guru}</Td>
                      <Td width="50%">{act.siswa}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          <strong>3. Kegiatan Penutup ({pertemuan.langkah?.penutup?.durasiMenit} Menit)</strong>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
            <thead>
              <tr><TableHeader>Aktivitas Guru</TableHeader><TableHeader>Aktivitas Siswa</TableHeader></tr>
            </thead>
            <tbody>
              {pertemuan.langkah?.penutup?.aktivitas?.map((act, idx) => (
                <tr key={idx}>
                  <Td>{act.guru}</Td>
                  <Td>{act.siswa}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <h4>D. ASESMEN & REFLEKSI</h4>
      <p><strong>Asesmen Formatif:</strong> {modul.asesmenFormatif?.join(', ')}</p>
      <p><strong>Asesmen Sumatif:</strong> {modul.asesmenSumatif?.join(', ')}</p>
      
      <h5>Refleksi</h5>
      <p><strong>Guru:</strong> {modul.refleksi?.guru?.join(' ')}</p>
      <p><strong>Siswa:</strong> {modul.refleksi?.siswa?.join(' ')}</p>

      <DocumentFooter context={context} />
    </div>
  );
};

export const LkpdRenderer: React.FC<RendererProps> = ({ data, context }) => {
  const lkpd = data as LkpdType;
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#000', lineHeight: 1.5 }}>
      <DocumentHeader context={context} title="LEMBAR KERJA PESERTA DIDIK (LKPD)" subtitle={`Mata Pelajaran: ${context.curriculum?.subject} | Kelas: ${context.curriculum?.level}`} />
      
      <div style={{ border: '1px solid black', padding: '15px', marginBottom: '20px' }}>
        <strong>Nama Siswa / Kelompok:</strong> ..............................................................<br/><br/>
        <strong>Kelas:</strong> {context.curriculum?.level}<br/><br/>
        <strong>Materi:</strong> {context.module?.topikLokal}
      </div>

      <h4>A. Tujuan LKPD</h4>
      <ul>
        {lkpd.tujuanLkpd?.map((t, i) => <li key={i}>{t}</li>)}
      </ul>

      <h4>B. Langkah Kerja / Petunjuk</h4>
      <ol>
        {lkpd.langkahKerja?.map((l, i) => <li key={i}>{l}</li>)}
      </ol>

      <h4>C. Tugas / Pertanyaan</h4>
      <ol>
        {lkpd.tugas?.map((t, i) => (
          <li key={i} style={{ marginBottom: '20px' }}>
            <strong>{t.pertanyaan}</strong>
            <div style={{ border: '1px dashed #ccc', height: '100px', marginTop: '10px' }}></div>
          </li>
        ))}
      </ol>

      <DocumentFooter context={context} />
    </div>
  );
};

export const RubrikRenderer: React.FC<RendererProps> = ({ data, context }) => {
  const rubrik = data as RubrikType;
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#000', lineHeight: 1.5 }}>
      <DocumentHeader context={context} title="RUBRIK PENILAIAN" subtitle={`Penilaian Formatif & Sumatif | Mapel: ${context.curriculum?.subject}`} />
      
      <h4>A. RUBRIK SIKAP (KBC & PPRA)</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr>
            <TableHeader>Aspek</TableHeader>
            <TableHeader>Sangat Baik</TableHeader>
            <TableHeader>Baik</TableHeader>
            <TableHeader>Cukup</TableHeader>
            <TableHeader>Kurang</TableHeader>
          </tr>
        </thead>
        <tbody>
          {rubrik.rubrikSikap?.map((r, i) => (
            <tr key={i}>
              <Td><strong>{r.aspek}</strong></Td>
              <Td>{r.kriteria?.sangatBaik}</Td>
              <Td>{r.kriteria?.baik}</Td>
              <Td>{r.kriteria?.cukup}</Td>
              <Td>{r.kriteria?.kurang}</Td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4>B. RUBRIK PENGETAHUAN (KOGNITIF)</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr>
            <TableHeader>Aspek</TableHeader>
            <TableHeader>Sangat Baik</TableHeader>
            <TableHeader>Baik</TableHeader>
            <TableHeader>Cukup</TableHeader>
            <TableHeader>Kurang</TableHeader>
          </tr>
        </thead>
        <tbody>
          {rubrik.rubrikPengetahuan?.map((r, i) => (
            <tr key={i}>
              <Td><strong>{r.aspek}</strong></Td>
              <Td>{r.kriteria?.sangatBaik}</Td>
              <Td>{r.kriteria?.baik}</Td>
              <Td>{r.kriteria?.cukup}</Td>
              <Td>{r.kriteria?.kurang}</Td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4>C. RUBRIK KETERAMPILAN (PSIKOMOTOR)</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr>
            <TableHeader>Aspek</TableHeader>
            <TableHeader>Sangat Baik</TableHeader>
            <TableHeader>Baik</TableHeader>
            <TableHeader>Cukup</TableHeader>
            <TableHeader>Kurang</TableHeader>
          </tr>
        </thead>
        <tbody>
          {rubrik.rubrikKeterampilan?.map((r, i) => (
            <tr key={i}>
              <Td><strong>{r.aspek}</strong></Td>
              <Td>{r.kriteria?.sangatBaik}</Td>
              <Td>{r.kriteria?.baik}</Td>
              <Td>{r.kriteria?.cukup}</Td>
              <Td>{r.kriteria?.kurang}</Td>
            </tr>
          ))}
        </tbody>
      </table>

      <DocumentFooter context={context} />
    </div>
  );
};
