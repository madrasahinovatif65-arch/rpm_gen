import React from 'react';
import { 
  ModulAjarUmumType, ModulAjarMeetingType, LkpdType, RubrikType 
} from '../../lib/kbcSchemas';
import { TableHeader, Td, DocumentHeader, DocumentFooter } from './AdministrasiRenderers';

interface RendererProps {
  data?: any;
  umum?: ModulAjarUmumType;
  meetings?: ModulAjarMeetingType[];
  context: any;
}

export const ModulAjarRenderer: React.FC<RendererProps> = ({ umum, meetings, context }) => {
  if (!umum) return <div>Menunggu data Modul Umum...</div>;
  
  const mUmum = umum;
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
      <p><strong>Identifikasi Kesiapan:</strong> {mUmum.informasiUmum?.kesiapanPesertaDidik}</p>
      <p><strong>Karakteristik Materi:</strong> {mUmum.informasiUmum?.karakteristikMateri}</p>
      
      <h4>2. Target & Kompetensi</h4>
      <p><strong>Target Reguler:</strong> {mUmum.informasiUmum?.targetPesertaDidik?.reguler?.perlakuan}</p>
      <p><strong>Kebutuhan Khusus:</strong> {mUmum.informasiUmum?.targetPesertaDidik?.kesulitanBelajar?.perlakuan}</p>
      <p><strong>Berbakat:</strong> {mUmum.informasiUmum?.targetPesertaDidik?.berbakat?.perlakuan}</p>

      <h4>3. Sarana & Prasarana</h4>
      <ul>
        {mUmum.informasiUmum?.saranaPrasarana?.map((s, i) => (
          <li key={i}><strong>{s.kategori}:</strong> {s.rincian}</li>
        ))}
      </ul>
      
      <hr />
      
      <h4>B. KOMPONEN INTI</h4>
      <div style={{ backgroundColor: '#f0fdf4', padding: '15px', borderLeft: '4px solid #16a34a', marginBottom: '20px' }}>
        <strong>Pemahaman Bermakna:</strong><br/>
        {mUmum.komponenInti?.pemahamanBermakna}
      </div>

      <h4>Pertanyaan Pemantik</h4>
      <ul>
        {mUmum.komponenInti?.pertanyaanPemantik?.map((p, i) => <li key={i}>{p}</li>)}
      </ul>

      <h4>Asesmen Diagnostik</h4>
      <p><strong>Non-Kognitif:</strong> {mUmum.komponenInti?.asesmenDiagnostik?.nonKognitif?.join(', ')}</p>
      <p><strong>Kognitif:</strong> {mUmum.komponenInti?.asesmenDiagnostik?.kognitif?.join(', ')}</p>

      <h4>C. SKENARIO PENGALAMAN BELAJAR (PERTEMUAN)</h4>
      {(!meetings || meetings.length === 0) ? (
         <div style={{ padding: '10px', backgroundColor: '#fef9c3', color: '#854d0e', fontStyle: 'italic' }}>
           Skenario pertemuan sedang diproses oleh AI...
         </div>
      ) : (
         meetings.map((pertemuan, i) => (
          <div key={i} style={{ marginBottom: '30px' }}>
            <h5 style={{ backgroundColor: '#1e293b', color: 'white', padding: '10px', fontSize: '14px' }}>
              Pertemuan {pertemuan.pertemuanKe}: {pertemuan.judul}
            </h5>
            
            <p><strong>Fokus Sintak:</strong> {pertemuan.fokusSintak?.join(', ')}</p>

            <strong>1. Kegiatan Pendahuluan</strong>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', marginTop: '5px' }}>
              <thead>
                <tr><TableHeader>Aktivitas Guru</TableHeader><TableHeader>Aktivitas Siswa</TableHeader><TableHeader>PPRA</TableHeader></tr>
              </thead>
              <tbody>
                {pertemuan.kegiatanPendahuluan?.map((act, idx) => (
                  <tr key={idx}>
                    <Td>{act.guru}</Td>
                    <Td>{act.siswa}</Td>
                    <Td>{act.anotasiPpra}</Td>
                  </tr>
                ))}
              </tbody>
            </table>

            <strong>2. Kegiatan Inti</strong>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', marginTop: '5px' }}>
              <thead>
                <tr><TableHeader>Sintak</TableHeader><TableHeader>Aktivitas Guru</TableHeader><TableHeader>Aktivitas Siswa</TableHeader><TableHeader>PPRA</TableHeader></tr>
              </thead>
              <tbody>
                {pertemuan.kegiatanInti?.map((act, idx) => (
                  <tr key={idx}>
                    <Td><strong>{act.sintak}</strong></Td>
                    <Td>{act.guru}</Td>
                    <Td>{act.siswa}</Td>
                    <Td>{act.anotasiPpra}</Td>
                  </tr>
                ))}
              </tbody>
            </table>

            <strong>3. Kegiatan Penutup</strong>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', marginTop: '5px' }}>
              <thead>
                <tr><TableHeader>Aktivitas Guru</TableHeader><TableHeader>Aktivitas Siswa</TableHeader><TableHeader>PPRA</TableHeader></tr>
              </thead>
              <tbody>
                {pertemuan.kegiatanPenutup?.map((act, idx) => (
                  <tr key={idx}>
                    <Td>{act.guru}</Td>
                    <Td>{act.siswa}</Td>
                    <Td>{act.anotasiPpra}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}

      <h4>D. ASESMEN & PENGAYAAN</h4>
      <p><strong>Formatif:</strong></p>
      <ul>
        {mUmum.komponenInti?.asesmenFormatif?.map((a, i) => (
          <li key={i}>{a.teknik} - {a.aspek} ({a.instrumen})</li>
        ))}
      </ul>
      
      <p><strong>Sumatif:</strong></p>
      <ul>
        {mUmum.komponenInti?.asesmenSumatif?.map((a, i) => (
          <li key={i}>{a.deskripsi} (Bobot: {a.bobot}%)</li>
        ))}
      </ul>

      <p><strong>Pengayaan:</strong> {mUmum.komponenInti?.pengayaanRemedial?.pengayaan}</p>
      <p><strong>Remedial:</strong> {mUmum.komponenInti?.pengayaanRemedial?.remedial}</p>
      
      <h5>Refleksi</h5>
      <p><strong>Guru:</strong> {mUmum.komponenInti?.refleksi?.guru?.join(' ')}</p>
      <p><strong>Siswa:</strong> {mUmum.komponenInti?.refleksi?.siswa?.join(' ')}</p>

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
