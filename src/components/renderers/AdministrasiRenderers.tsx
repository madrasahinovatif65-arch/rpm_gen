import React from 'react';
import { 
  AcpType, TpType, AtpType, ProtaType, ProsemType, KktpType 
} from '../../lib/kbcSchemas';

interface RendererProps {
  data: any;
  context: any;
}

export const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <th style={{ backgroundColor: '#1a3a5c', color: '#ffffff', fontWeight: 'bold', textAlign: 'center', padding: '8px', border: '1px solid #ddd' }}>
    {children}
  </th>
);

export const Td: React.FC<{ children: React.ReactNode; align?: 'left'|'center'|'right'; colSpan?: number }> = ({ children, align = 'left', colSpan = 1 }) => (
  <td colSpan={colSpan} style={{ padding: '8px', border: '1px solid #ddd', textAlign: align, verticalAlign: 'top' }}>
    {children}
  </td>
);

export const DocumentHeader: React.FC<{ context: any, title: string, subtitle?: string }> = ({ context, title, subtitle }) => (
  <div style={{ textAlign: 'center', marginBottom: '20px', fontFamily: 'Arial, sans-serif' }}>
    <h3 style={{ margin: 0 }}>KEMENTERIAN AGAMA REPUBLIK INDONESIA</h3>
    <h3 style={{ margin: 0 }}>{context.school?.kemenagOffice?.toUpperCase()}</h3>
    <h2 style={{ margin: 0 }}>{context.school?.schoolName?.toUpperCase()}</h2>
    <hr style={{ border: '1px solid black', margin: '10px 0' }} />
    <h3 style={{ margin: 0, marginTop: '20px' }}>{title}</h3>
    {subtitle && <h4 style={{ margin: 0 }}>{subtitle}</h4>}
  </div>
);

export const DocumentFooter: React.FC<{ context: any }> = ({ context }) => (
  <table style={{ width: '100%', border: 'none', marginTop: '40px', fontFamily: 'Arial, sans-serif' }}>
    <tbody>
      <tr>
        <td style={{ width: '50%', textAlign: 'center', border: 'none' }}>
          Mengetahui,<br/>
          Kepala Madrasah<br/><br/><br/><br/>
          <strong>{context.school?.principal}</strong><br/>
          NIP. {context.school?.nipPrincipal}
        </td>
        <td style={{ width: '50%', textAlign: 'center', border: 'none' }}>
          {context.school?.cityDate}<br/>
          Guru Mata Pelajaran<br/><br/><br/><br/>
          <strong>{context.school?.teacher}</strong><br/>
          NIP. {context.school?.nipTeacher}
        </td>
      </tr>
    </tbody>
  </table>
);

export const AcpRenderer: React.FC<RendererProps> = ({ data, context }) => {
  const acp = data as AcpType;
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#000', lineHeight: 1.5 }}>
      <DocumentHeader context={context} title="ANALISIS CAPAIAN PEMBELAJARAN" subtitle={`Kurikulum Berbasis Cinta (KBC) | Tahun Pelajaran ${context.curriculum?.year}`} />
      
      <h4>A. IDENTITAS</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <tbody>
          <tr><Td>Satuan Pendidikan</Td><Td><strong>{context.school?.schoolName}</strong></Td></tr>
          <tr><Td>Mata Pelajaran</Td><Td><strong>{context.curriculum?.subject}</strong></Td></tr>
          <tr><Td>Fase / Kelas</Td><Td><strong>{context.curriculum?.level}</strong></Td></tr>
          <tr><Td>Tahun Pelajaran</Td><Td><strong>{context.curriculum?.year}</strong></Td></tr>
          <tr><Td>Nama Guru</Td><Td><strong>{context.school?.teacher}</strong></Td></tr>
        </tbody>
      </table>

      <h4>B. RASIONAL & TUJUAN MATA PELAJARAN</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr><TableHeader>Kategori</TableHeader><TableHeader>Deskripsi</TableHeader></tr>
        </thead>
        <tbody>
          <tr><Td><strong>Rasional</strong></Td><Td>{acp.rasional || context.cp?.rasional}</Td></tr>
          <tr>
            <Td><strong>Tujuan Mapel</strong></Td>
            <Td>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {acp.tujuan?.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </Td>
          </tr>
        </tbody>
      </table>

      <h4>C. KARAKTERISTIK MATA PELAJARAN & ELEMEN</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr>
            <TableHeader>No</TableHeader>
            <TableHeader>Elemen</TableHeader>
            <TableHeader>Deskripsi</TableHeader>
            <TableHeader>Topik Pokok</TableHeader>
          </tr>
        </thead>
        <tbody>
          {acp.karakteristik?.map((k, i) => (
            <tr key={i}>
              <Td align="center">{i + 1}</Td>
              <Td><strong>{k.elemen}</strong></Td>
              <Td>{k.deskripsi}</Td>
              <Td>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {k.topikPokok?.map((tp, idx) => <li key={idx}>{tp}</li>)}
                </ul>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4>D. KETERKAITAN DENGAN NILAI PPRA</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr>
            <TableHeader>No</TableHeader>
            <TableHeader>Nilai PPRA</TableHeader>
            <TableHeader>Deskripsi</TableHeader>
            <TableHeader>Integrasi</TableHeader>
          </tr>
        </thead>
        <tbody>
          {acp.keterkaitanPpra?.map((p, i) => (
            <tr key={i}>
              <Td align="center">{i + 1}</Td>
              <Td><strong>{p.nilaiPpra}</strong></Td>
              <Td>{p.deskripsi}</Td>
              <Td>{p.integrasi}</Td>
            </tr>
          ))}
        </tbody>
      </table>

      <DocumentFooter context={context} />
    </div>
  );
};

export const TpRenderer: React.FC<RendererProps> = ({ data, context }) => {
  const tp = data as TpType;
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#000', lineHeight: 1.5 }}>
      <DocumentHeader context={context} title="TUJUAN PEMBELAJARAN (TP)" subtitle={`Kurikulum Berbasis Cinta (KBC) | Tahun Pelajaran ${context.curriculum?.year}`} />
      
      <h4>A. DAFTAR TUJUAN PEMBELAJARAN</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr>
            <TableHeader>No</TableHeader>
            <TableHeader>Kode TP</TableHeader>
            <TableHeader>Elemen</TableHeader>
            <TableHeader>Tujuan Pembelajaran</TableHeader>
            <TableHeader>Kompetensi</TableHeader>
            <TableHeader>Integrasi Nilai</TableHeader>
            <TableHeader>JP</TableHeader>
          </tr>
        </thead>
        <tbody>
          {tp.daftarTp?.map((item, i) => (
            <tr key={i}>
              <Td align="center">{i + 1}</Td>
              <Td align="center"><strong>{item.kodeTp}</strong></Td>
              <Td>{item.elemen}</Td>
              <Td>{item.rumusanTp}</Td>
              <Td>{item.kompetensi}</Td>
              <Td>{item.integrasiNilai}</Td>
              <Td align="center"><strong>{item.alokasiJp}</strong></Td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4>B. REKAPITULASI ALOKASI WAKTU PER ELEMEN</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr>
            <TableHeader>No</TableHeader>
            <TableHeader>Elemen</TableHeader>
            <TableHeader>Jumlah TP</TableHeader>
            <TableHeader>Total JP</TableHeader>
            <TableHeader>Persentase</TableHeader>
          </tr>
        </thead>
        <tbody>
          {tp.rekapAlokasi?.map((item, i) => (
            <tr key={i}>
              <Td align="center">{i + 1}</Td>
              <Td><strong>{item.elemen}</strong></Td>
              <Td align="center">{item.jumlahTp}</Td>
              <Td align="center">{item.totalJp} JP</Td>
              <Td align="center">{item.persentase}%</Td>
            </tr>
          ))}
        </tbody>
      </table>

      <DocumentFooter context={context} />
    </div>
  );
};

export const AtpRenderer: React.FC<RendererProps> = ({ data, context }) => {
  const atp = data as AtpType;
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#000', lineHeight: 1.5 }}>
      <DocumentHeader context={context} title="ALUR TUJUAN PEMBELAJARAN (ATP)" subtitle={`Kurikulum Berbasis Cinta (KBC) | Tahun Pelajaran ${context.curriculum?.year}`} />
      
      <h4>A. TABEL ALUR TUJUAN PEMBELAJARAN</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr>
            <TableHeader>No</TableHeader>
            <TableHeader>Kode TP</TableHeader>
            <TableHeader>Elemen</TableHeader>
            <TableHeader>Tujuan Pembelajaran</TableHeader>
            <TableHeader>Materi Pokok</TableHeader>
            <TableHeader>Integrasi Nilai</TableHeader>
            <TableHeader>JP</TableHeader>
            <TableHeader>Semester</TableHeader>
          </tr>
        </thead>
        <tbody>
          {atp.alur?.map((item, i) => (
            <tr key={i}>
              <Td align="center">{i + 1}</Td>
              <Td align="center"><strong>{item.kodeTp}</strong></Td>
              <Td>{item.elemen}</Td>
              <Td>{item.rumusanTp}</Td>
              <Td>{item.materiPokok}</Td>
              <Td>{item.integrasiNilai}</Td>
              <Td align="center"><strong>{item.alokasiJp}</strong></Td>
              <Td align="center">{item.semester}</Td>
            </tr>
          ))}
        </tbody>
      </table>

      <DocumentFooter context={context} />
    </div>
  );
};

export const ProtaRenderer: React.FC<RendererProps> = ({ data, context }) => {
  const prota = data as ProtaType;
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#000', lineHeight: 1.5 }}>
      <DocumentHeader context={context} title="PROGRAM TAHUNAN (PROTA)" subtitle={`Kurikulum Berbasis Cinta (KBC) | Tahun Pelajaran ${context.curriculum?.year}`} />
      
      <h4>A. DISTRIBUSI MINGGU EFEKTIF</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr>
            <TableHeader>Semester</TableHeader>
            <TableHeader>Bulan</TableHeader>
            <TableHeader>Minggu Kalender</TableHeader>
            <TableHeader>Minggu Tdk Efektif</TableHeader>
            <TableHeader>Minggu Efektif</TableHeader>
            <TableHeader>JP</TableHeader>
            <TableHeader>Keterangan</TableHeader>
          </tr>
        </thead>
        <tbody>
          {prota.distribusiMinggu?.map((item, i) => (
            <tr key={i}>
              <Td align="center">{item.semester}</Td>
              <Td>{item.bulan}</Td>
              <Td align="center">{item.mingguKalender}</Td>
              <Td align="center">{item.tidakEfektif}</Td>
              <Td align="center">{item.efektif}</Td>
              <Td align="center">{item.jp}</Td>
              <Td>{item.keterangan}</Td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4>B. RENCANA PROGRAM TAHUNAN</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr>
            <TableHeader>Kode TP</TableHeader>
            <TableHeader>Tujuan Pembelajaran</TableHeader>
            <TableHeader>Materi Pokok</TableHeader>
            <TableHeader>Elemen</TableHeader>
            <TableHeader>JP</TableHeader>
            <TableHeader>Semester</TableHeader>
          </tr>
        </thead>
        <tbody>
          {prota.programTahunan?.map((item, i) => (
            <tr key={i}>
              <Td align="center"><strong>{item.kodeTp}</strong></Td>
              <Td>{item.rumusanTp}</Td>
              <Td>{item.materiPokok}</Td>
              <Td>{item.elemen}</Td>
              <Td align="center"><strong>{item.alokasiJp}</strong></Td>
              <Td align="center">{item.semester}</Td>
            </tr>
          ))}
        </tbody>
      </table>

      <DocumentFooter context={context} />
    </div>
  );
};

export const ProsemRenderer: React.FC<RendererProps> = ({ data, context }) => {
  const prosem = data as ProsemType;
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#000', lineHeight: 1.5 }}>
      <DocumentHeader context={context} title="PROGRAM SEMESTER (PROSEM)" subtitle={`Kurikulum Berbasis Cinta (KBC) | Tahun Pelajaran ${context.curriculum?.year}`} />
      
      <h4>A. DISTRIBUSI PEMBELAJARAN (ALOKASI MINGGUAN)</h4>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '11px' }}>
          <thead>
            <tr>
              <TableHeader>Kode TP</TableHeader>
              <TableHeader>Tujuan Pembelajaran</TableHeader>
              <TableHeader>JP</TableHeader>
              <TableHeader>Alokasi Mingguan (Bulan/Minggu)</TableHeader>
            </tr>
          </thead>
          <tbody>
            {prosem.prosem?.map((item, i) => (
              <tr key={i}>
                <Td align="center"><strong>{item.kodeTp}</strong></Td>
                <Td>{item.rumusanTp}</Td>
                <Td align="center"><strong>{item.alokasiJp}</strong></Td>
                <Td>
                  {Object.entries(item.bulanMinggu || {}).map(([bulan, m]) => (
                    <div key={bulan} style={{ marginBottom: '4px' }}>
                      <strong>{bulan}:</strong> M1({m[0]||0}), M2({m[1]||0}), M3({m[2]||0}), M4({m[3]||0}), M5({m[4]||0})
                    </div>
                  ))}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h4>KETERANGAN</h4>
      <ul>
        {prosem.keterangan?.map((k, i) => <li key={i}>{k}</li>)}
      </ul>

      <DocumentFooter context={context} />
    </div>
  );
};

export const KktpRenderer: React.FC<RendererProps> = ({ data, context }) => {
  const kktp = data as KktpType;
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#000', lineHeight: 1.5 }}>
      <DocumentHeader context={context} title="KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP)" subtitle={`Kurikulum Berbasis Cinta (KBC) | Tahun Pelajaran ${context.curriculum?.year}`} />
      
      <h4>A. RUBRIK KKTP PER TUJUAN PEMBELAJARAN</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr>
            <TableHeader>Kode TP</TableHeader>
            <TableHeader>Tujuan Pembelajaran</TableHeader>
            <TableHeader>Mulai Berkembang (0-55)</TableHeader>
            <TableHeader>Layak (56-70)</TableHeader>
            <TableHeader>Cakap (71-85)</TableHeader>
            <TableHeader>Mahir (86-100)</TableHeader>
          </tr>
        </thead>
        <tbody>
          {kktp.kktp?.map((item, i) => (
            <tr key={i}>
              <Td align="center"><strong>{item.kodeTp}</strong></Td>
              <Td>{item.rumusanTp}</Td>
              <Td>{item.rubrik?.mulaiBerkembang}</Td>
              <Td>{item.rubrik?.layak}</Td>
              <Td>{item.rubrik?.cakap}</Td>
              <Td>{item.rubrik?.mahir}</Td>
            </tr>
          ))}
        </tbody>
      </table>

      <DocumentFooter context={context} />
    </div>
  );
};
