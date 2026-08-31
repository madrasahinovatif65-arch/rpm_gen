// Helper module for resilient Curriculum, Modul Ajar, and Assistant generation fallback
// Guarantees 100% reliable document creation even if external AI APIs are unreachable or lack credentials.

export function generateKbcDocumentFallback(docType: string, formData: any): string {
  const {
    schoolName = "MAN 1 Kerinci",
    kemenagOffice = "KANTOR KEMENTERIAN AGAMA KABUPATEN KERINCI",
    schoolAddress = "Jl. Raya Semurup No. 45, Semurup, Kabupaten Kerinci",
    subject = "Akidah Akhlak",
    singkatanMapel = "AA",
    level = "Fase E / Kelas X",
    year = "2026/2027",
    totalJp = "72 JP / Tahun",
    jpPerMinggu = "2 JP/Minggu",
    teacher = "Drs. Yefri Haryanto, M.Pd.",
    nipTeacher = "19850312 201001 1 008",
    cityDate = "Kerinci, 14 Juli 2026",
    principal = "Hamdani, S.Pd., M.Si.",
    nipPrincipal = "19780514 200212 1 003",
    cpRasional = "",
    cpElemen = "",
    learningModel = "Discovery Learning",
    sintakModel = "1. Stimulasi/Pemberian Rangsangan, 2. Identifikasi Masalah, 3. Pengumpulan Data, 4. Pengolahan Data, 5. Pembuktian, 6. Penarikan Kesimpulan",
    kodeTp = "TP.AA.ELE.10.01",
    rumusanTp = "Peserta didik mampu menganalisis konsep tauhid dan Asmaul Husna secara mendalam, serta menginternalisasi nilai kasih sayang Allah Swt. dalam kehidupan sehari-hari dan kearifan lokal Kerinci.",
    elemenCp = "Akidah",
    jumlahPertemuan = "3",
    jpPerPertemuan = "2",
    topikLokal = "Pelestarian Lingkungan Hutan TNKS & Budaya Adat Mudik Kerinci"
  } = formData || {};

  const cleanTotalJpNum = parseInt(totalJp) || 72;
  const thStyle = `style="background-color:#1a3a5c; color:#ffffff; font-weight:bold; text-align:center; padding:8px; border:1px solid #cbd5e1;"`;
  const tdStyle = `style="padding:8px; border:1px solid #cbd5e1; vertical-align:top;"`;
  const tdCenter = `style="padding:8px; border:1px solid #cbd5e1; text-align:center; vertical-align:top;"`;

  const kopHtml = `
    <div style="text-align: center; border-bottom: 3px double #1a3a5c; padding-bottom: 12px; margin-bottom: 20px; font-family: 'Segoe UI', Arial, sans-serif;">
      <h4 style="margin: 0; font-size: 13pt; text-transform: uppercase; color: #334155; letter-spacing: 0.5px;">KEMENTERIAN AGAMA REPUBLIK INDONESIA</h4>
      <h4 style="margin: 3px 0; font-size: 13pt; text-transform: uppercase; color: #334155; letter-spacing: 0.5px;">${kemenagOffice}</h4>
      <h2 style="margin: 4px 0; font-size: 16pt; font-weight: bold; text-transform: uppercase; color: #1a3a5c;">${schoolName}</h2>
      <p style="margin: 2px 0 0 0; font-size: 9pt; color: #64748b;">${schoolAddress}</p>
    </div>
  `;

  const ttdHtml = `
    <table style="width:100%; border:none; margin-top:35px; page-break-inside:avoid; font-family: 'Segoe UI', Arial, sans-serif; font-size: 10pt;">
      <tr>
        <td style="border:none; text-align:center; width:50%; vertical-align:top;">
          <p style="margin:0;">Mengetahui,<br>Kepala Madrasah</p>
          <br><br><br><br>
          <p style="margin:0; font-weight:bold; text-decoration:underline;">${principal}</p>
          <p style="margin:0; font-size:9pt; color:#475569;">NIP. ${nipPrincipal}</p>
        </td>
        <td style="border:none; text-align:center; width:50%; vertical-align:top;">
          <p style="margin:0;">${cityDate}<br>Guru Mata Pelajaran</p>
          <br><br><br><br>
          <p style="margin:0; font-weight:bold; text-decoration:underline;">${teacher}</p>
          <p style="margin:0; font-size:9pt; color:#475569;">NIP. ${nipTeacher}</p>
        </td>
      </tr>
    </table>
  `;

  if (docType === "analisis_cp") {
    return `
      ${kopHtml}
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #1a3a5c; font-size: 15pt; text-transform: uppercase;">ANALISIS CAPAIAN PEMBELAJARAN (ACP)</h2>
        <h3 style="margin: 4px 0 0 0; color: #475569; font-size: 12pt; font-weight: normal;">Kurikulum Berbasis Cinta (KBC) & Integrasi 10 Nilai PPRA | Tahun Pelajaran ${year}</h3>
      </div>

      <h3 style="color:#1a3a5c; border-bottom:2px solid #1a3a5c; padding-bottom:4px; margin-top:20px;">A. IDENTITAS DOKUMEN</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:10pt;">
        <tr><td ${tdStyle} style="width:25%; font-weight:bold; background:#f8fafc;">Satuan Pendidikan</td><td ${tdStyle}>${schoolName}</td></tr>
        <tr><td ${tdStyle} style="font-weight:bold; background:#f8fafc;">Mata Pelajaran</td><td ${tdStyle}>${subject} (${singkatanMapel})</td></tr>
        <tr><td ${tdStyle} style="font-weight:bold; background:#f8fafc;">Fase / Kelas</td><td ${tdStyle}>${level}</td></tr>
        <tr><td ${tdStyle} style="font-weight:bold; background:#f8fafc;">Alokasi Waktu</td><td ${tdStyle}>${totalJp} (${jpPerMinggu})</td></tr>
        <tr><td ${tdStyle} style="font-weight:bold; background:#f8fafc;">Nama Pendidik</td><td ${tdStyle}>${teacher} (NIP: ${nipTeacher})</td></tr>
        <tr><td ${tdStyle} style="font-weight:bold; background:#f8fafc;">Pendekatan Kurikulum</td><td ${tdStyle}>Kurikulum Merdeka Kemenag — Kurikulum Berbasis Cinta (KBC) & 10 Nilai PPRA</td></tr>
      </table>

      <h3 style="color:#1a3a5c; border-bottom:2px solid #1a3a5c; padding-bottom:4px; margin-top:20px;">B. RASIONAL MATA PELAJARAN</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:10pt;">
        <thead>
          <tr><th ${thStyle} style="width:5%;">No</th><th ${thStyle} style="width:25%;">Uraian</th><th ${thStyle}>Deskripsi Rasional</th></tr>
        </thead>
        <tbody>
          <tr>
            <td ${tdCenter}>1</td>
            <td ${tdStyle}><strong>Pentingnya Mapel & Panca Cinta</strong></td>
            <td ${tdStyle}>Mata pelajaran ${subject} membentuk fondasi spiritual, moralitas, dan keadaban luhur berlandaskan Panca Cinta Kemenag (Cinta Allah & Rasul, Cinta Diri & Sesama, Cinta Ilmu, Cinta Bangsa & Negara, Cinta Alam).</td>
          </tr>
          <tr>
            <td ${tdCenter}>2</td>
            <td ${tdStyle}><strong>Kaitan dengan 10 Nilai PPRA</strong></td>
            <td ${tdStyle}>Mengintegrasikan sepuluh pilar Profil Pelajar Rahmatan lil 'Alamin (Ta'addub, Qudwah, Muwaṭanah, Tawassuṭ, Tawāzun, I'tidāl, Musāwah, Syūrā, Tasāmuh, Tathawwur wa Ibtikār) guna melahirkan generasi moderat dan solutif.</td>
          </tr>
          <tr>
            <td ${tdCenter}>3</td>
            <td ${tdStyle}><strong>Orientasi Pembelajaran</strong></td>
            <td ${tdStyle}>Pembelajaran mendalam (Deep Learning: Mindful, Meaningful, Joyful) yang menekankan pengamalan nyata, pemecahan masalah kontekstual, dan harmonisasi dengan kearifan lokal ${topikLokal}.</td>
          </tr>
        </tbody>
      </table>

      <h3 style="color:#1a3a5c; border-bottom:2px solid #1a3a5c; padding-bottom:4px; margin-top:20px;">C. TUJUAN MATA PELAJARAN</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:10pt;">
        <thead>
          <tr><th ${thStyle} style="width:5%;">No</th><th ${thStyle} style="width:40%;">Tujuan Mata Pelajaran</th><th ${thStyle}>Indikator Ketercapaian Umum</th></tr>
        </thead>
        <tbody>
          <tr>
            <td ${tdCenter}>1</td>
            <td ${tdStyle}>Menumbuhkan pemahaman mendalam tentang prinsip-prinsip ${subject} yang bersumber dari wahyu ilahi dan akal sehat.</td>
            <td ${tdStyle}>Peserta didik mampu menjelaskan dalil naqli dan aqli dengan tepat dan kontekstual.</td>
          </tr>
          <tr>
            <td ${tdCenter}>2</td>
            <td ${tdStyle}>Menginternalisasikan nilai kasih sayang (Rahmah), toleransi, dan kesantunan dalam pergaulan sosial maupun digital.</td>
            <td ${tdStyle}>Peserta didik menunjukkan sikap santun (Ta'addub), keteladanan (Qudwah), dan gotong royong aktif di kelas.</td>
          </tr>
          <tr>
            <td ${tdCenter}>3</td>
            <td ${tdStyle}>Membiasakan nalar kritis dan inovatif (Tathawwur wa Ibtikār) dalam merespons tantangan zaman dan pelestarian lingkungan.</td>
            <td ${tdStyle}>Peserta didik mampu merumuskan gagasan solutif berwawasan pelestarian alam dan kearifan lokal.</td>
          </tr>
        </tbody>
      </table>

      <h3 style="color:#1a3a5c; border-bottom:2px solid #1a3a5c; padding-bottom:4px; margin-top:20px;">D. KARAKTERISTIK MATA PELAJARAN & ELEMEN CP</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:10pt;">
        <thead>
          <tr><th ${thStyle} style="width:5%;">No</th><th ${thStyle} style="width:20%;">Elemen CP</th><th ${thStyle}>Deskripsi Karakteristik</th><th ${thStyle} style="width:30%;">Cakupan Konten Utama</th></tr>
        </thead>
        <tbody>
          <tr>
            <td ${tdCenter}>1</td>
            <td ${tdStyle}><strong>Akidah</strong></td>
            <td ${tdStyle}>Mengembangkan keyakinan kokoh terhadap rukun iman, tauhid asma wa sifat, serta penghayatan kasih sayang Allah Swt.</td>
            <td ${tdStyle}>Konsep Tauhid, Asmaul Husna, Iman kepada Kitab/Rasul, Nilai Kasih Sayang Ilahi.</td>
          </tr>
          <tr>
            <td ${tdCenter}>2</td>
            <td ${tdStyle}><strong>Akhlak & Adab</strong></td>
            <td ${tdStyle}>Membiasakan perilaku terpuji (Mahmudah) dan tata krama islami kepada sesama manusia dan alam semesta.</td>
            <td ${tdStyle}>Ta'addub (Etika Pergaulan), Hormat Orang Tua/Guru, Adab Digital, Kepedulian Alam Sekitar.</td>
          </tr>
          <tr>
            <td ${tdCenter}>3</td>
            <td ${tdStyle}><strong>Muamalah & Sosial</strong></td>
            <td ${tdStyle}>Membangun kesadaran hukum, toleransi, dan musyawarah dalam kehidupan berbangsa dan bermasyarakat.</td>
            <td ${tdStyle}>Tasāmuh (Toleransi), Syūrā (Musyawarah), Musāwah (Kesetaraan), Anti-Perundungan.</td>
          </tr>
        </tbody>
      </table>

      <h3 style="color:#1a3a5c; border-bottom:2px solid #1a3a5c; padding-bottom:4px; margin-top:20px;">E. KETERKAITAN DENGAN 10 NILAI PPRA (PROFIL PELAJAR RAHMATAN LIL 'ALAMIN)</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:9.5pt;">
        <thead>
          <tr><th ${thStyle} style="width:5%;">No</th><th ${thStyle} style="width:20%;">Nilai PPRA</th><th ${thStyle} style="width:35%;">Deskripsi Nilai</th><th ${thStyle}>Bentuk Integrasi Pembelajaran</th></tr>
        </thead>
        <tbody>
          <tr><td ${tdCenter}>1</td><td ${tdStyle}><strong>1. Ta'addub</strong> (Berkeadaban)</td><td ${tdStyle}>Menjunjung tinggi adab, sopan santun, dan keluhuran budi pekerti.</td><td ${tdStyle}>Membudayakan 5S (Senyum, Salam, Sapa, Sopan, Santun) dan etika diskusi santun.</td></tr>
          <tr><td ${tdCenter}>2</td><td ${tdStyle}><strong>2. Qudwah</strong> (Keteladanan)</td><td ${tdStyle}>Menjadi panutan inspiratif dalam kebaikan dan kejujuran.</td><td ${tdStyle}>Menampilkan integritas tinggi, tepat waktu, dan disiplin belajar mandiri.</td></tr>
          <tr><td ${tdCenter}>3</td><td ${tdStyle}><strong>3. Muwaṭanah</strong> (Kewarganegaraan)</td><td ${tdStyle}>Mencintai tanah air, menghormati hukum, dan merawat persatuan.</td><td ${tdStyle}>Kajian wawasan kebangsaan dan apresiasi kearifan budaya daerah Kerinci.</td></tr>
          <tr><td ${tdCenter}>4</td><td ${tdStyle}><strong>4. Tawassuṭ</strong> (Mengambil Jalan Tengah)</td><td ${tdStyle}>Menolak ekstremisme dan bersikap moderat dalam beragama.</td><td ${tdStyle}>Diskusi berpikir kritis dan dialog keberagaman sudut pandang.</td></tr>
          <tr><td ${tdCenter}>5</td><td ${tdStyle}><strong>5. Tawāzun</strong> (Berimbang)</td><td ${tdStyle}>Keseimbangan antara akal, rasa, jasmani, dan rohani.</td><td ${tdStyle}>Pengelolaan waktu efektif antara ibadah, akademik, dan aktivitas sosial.</td></tr>
          <tr><td ${tdCenter}>6</td><td ${tdStyle}><strong>6. I'tidāl</strong> (Lurus & Tegas)</td><td ${tdStyle}>Menegakkan kebenaran dan keadilan secara proporsional.</td><td ${tdStyle}>Objektivitas dalam menilai tugas kelompok dan keberanian menyampaikan kebenaran.</td></tr>
          <tr><td ${tdCenter}>7</td><td ${tdStyle}><strong>7. Musāwah</strong> (Kesetaraan)</td><td ${tdStyle}>Menghargai martabat sesama tanpa diskriminasi latar belakang.</td><td ${tdStyle}>Kerja kelompok inklusif dan kolaborasi lintas minat tanpa membeda-bedakan.</td></tr>
          <tr><td ${tdCenter}>8</td><td ${tdStyle}><strong>8. Syūrā</strong> (Musyawarah)</td><td ${tdStyle}>Menyelesaikan masalah melalui dialog mufakat dan keterbukaan.</td><td ${tdStyle}>Aktivitas kelompok berbasis problem solving dan presentasi tim demokratis.</td></tr>
          <tr><td ${tdCenter}>9</td><td ${tdStyle}><strong>9. Tasāmuh</strong> (Toleransi)</td><td ${tdStyle}>Menghargai perbedaan pendapat, agama, dan budaya.</td><td ${tdStyle}>Sikap saling menghormati pendapat dalam sesi tanya jawab kelas.</td></tr>
          <tr><td ${tdCenter}>10</td><td ${tdStyle}><strong>10. Tathawwur wa Ibtikār</strong> (Dinamis & Inovatif)</td><td ${tdStyle}>Berpikir maju, adaptif terhadap iptek, dan berdaya cipta.</td><td ${tdStyle}>Pembuatan karya kreatif digital, infografik pembelajaran, dan riset mini.</td></tr>
        </tbody>
      </table>

      ${ttdHtml}
    `;
  }

  if (docType === "tp") {
    return `
      ${kopHtml}
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #1a3a5c; font-size: 15pt; text-transform: uppercase;">TUJUAN PEMBELAJARAN (TP)</h2>
        <h3 style="margin: 4px 0 0 0; color: #475569; font-size: 12pt; font-weight: normal;">Kurikulum Berbasis Cinta (KBC) | Tahun Pelajaran ${year}</h3>
      </div>

      <h3 style="color:#1a3a5c; border-bottom:2px solid #1a3a5c; padding-bottom:4px; margin-top:20px;">A. IDENTITAS</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:10pt;">
        <tr><td ${tdStyle} style="width:25%; font-weight:bold; background:#f8fafc;">Satuan Pendidikan</td><td ${tdStyle}>${schoolName}</td></tr>
        <tr><td ${tdStyle} style="font-weight:bold; background:#f8fafc;">Mata Pelajaran</td><td ${tdStyle}>${subject} (${singkatanMapel})</td></tr>
        <tr><td ${tdStyle} style="font-weight:bold; background:#f8fafc;">Fase / Kelas</td><td ${tdStyle}>${level}</td></tr>
        <tr><td ${tdStyle} style="font-weight:bold; background:#f8fafc;">Alokasi Waktu Total</td><td ${tdStyle}>${totalJp} (${jpPerMinggu})</td></tr>
      </table>

      <h3 style="color:#1a3a5c; border-bottom:2px solid #1a3a5c; padding-bottom:4px; margin-top:20px;">B. DAFTAR TUJUAN PEMBELAJARAN & INTEGRASI NILAI KBC/PPRA</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:9.5pt;">
        <thead>
          <tr>
            <th ${thStyle} style="width:5%;">No</th>
            <th ${thStyle} style="width:14%;">Kode TP</th>
            <th ${thStyle} style="width:14%;">Elemen</th>
            <th ${thStyle}>Rumusan Tujuan Pembelajaran (TP)</th>
            <th ${thStyle} style="width:22%;">Integrasi Panca Cinta & Nilai PPRA</th>
            <th ${thStyle} style="width:8%;">Alokasi JP</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td ${tdCenter}>1</td>
            <td ${tdCenter}><strong>${singkatanMapel}-E-AKD-001</strong></td>
            <td ${tdStyle}>Akidah</td>
            <td ${tdStyle}>Peserta didik mampu menganalisis konsep tauhid dan hakikat Asmaul Husna secara komprehensif serta menginternalisasi kasih sayang Allah Swt.</td>
            <td ${tdStyle}>Cinta Allah & Rasul<br><em>PPRA: Ta'addub & Qudwah</em></td>
            <td ${tdCenter}>8 JP</td>
          </tr>
          <tr>
            <td ${tdCenter}>2</td>
            <td ${tdStyle}><strong>${singkatanMapel}-E-AKD-002</strong></td>
            <td ${tdStyle}>Akidah</td>
            <td ${tdStyle}>Peserta didik mampu mengevaluasi dalil aqli dan naqli tentang kekuasaan Allah dalam penciptaan alam semesta Kerinci.</td>
            <td ${tdStyle}>Cinta Ilmu & Cinta Alam<br><em>PPRA: Tawāzun & I'tidāl</em></td>
            <td ${tdCenter}>8 JP</td>
          </tr>
          <tr>
            <td ${tdCenter}>3</td>
            <td ${tdStyle}><strong>${singkatanMapel}-E-AKH-001</strong></td>
            <td ${tdStyle}>Akhlak</td>
            <td ${tdStyle}>Peserta didik mampu mengidentifikasi dan mempraktikkan sikap santun dan hormat kepada orang tua dan guru dalam keseharian.</td>
            <td ${tdStyle}>Cinta Diri & Sesama<br><em>PPRA: Ta'addub & Qudwah</em></td>
            <td ${tdCenter}>8 JP</td>
          </tr>
          <tr>
            <td ${tdCenter}>4</td>
            <td ${tdStyle}><strong>${singkatanMapel}-E-AKH-002</strong></td>
            <td ${tdStyle}>Akhlak</td>
            <td ${tdStyle}>Peserta didik mampu menganalisis bahaya perilaku tercela (ghibah, fitnah, perundungan siber) serta merancang kampanye akhlak mulia.</td>
            <td ${tdStyle}>Cinta Sesama<br><em>PPRA: Musāwah & Tasāmuh</em></td>
            <td ${tdCenter}>10 JP</td>
          </tr>
          <tr>
            <td ${tdCenter}>5</td>
            <td ${tdStyle}><strong>${singkatanMapel}-E-ADB-001</strong></td>
            <td ${tdStyle}>Adab</td>
            <td ${tdStyle}>Peserta didik mampu menerapkan etika bermusyawarah dan menghargai perbedaan pendapat dalam forum kelas.</td>
            <td ${tdStyle}>Cinta Bangsa & Negara<br><em>PPRA: Syūrā & Tasāmuh</em></td>
            <td ${tdCenter}>8 JP</td>
          </tr>
          <tr>
            <td ${tdCenter}>6</td>
            <td ${tdStyle}><strong>${singkatanMapel}-E-ADB-002</strong></td>
            <td ${tdStyle}>Adab</td>
            <td ${tdStyle}>Peserta didik mampu merancang aksi nyata kepedulian lingkungan madrasah berbasis nilai cinta lingkungan hidup (${topikLokal}).</td>
            <td ${tdStyle}>Cinta Alam & Lingkungan<br><em>PPRA: Tathawwur wa Ibtikār</em></td>
            <td ${tdCenter}>10 JP</td>
          </tr>
          <tr>
            <td ${tdCenter}>7</td>
            <td ${tdStyle}><strong>${singkatanMapel}-E-SOC-001</strong></td>
            <td ${tdStyle}>Sosial & Moderasi</td>
            <td ${tdStyle}>Peserta didik mampu menganalisis prinsip moderasi beragama dan kerukunan antarumat beragama di Indonesia.</td>
            <td ${tdStyle}>Cinta Tanah Air<br><em>PPRA: Tawassuṭ & Muwaṭanah</em></td>
            <td ${tdCenter}>10 JP</td>
          </tr>
          <tr>
            <td ${tdCenter}>8</td>
            <td ${tdStyle}><strong>${singkatanMapel}-E-SOC-002</strong></td>
            <td ${tdStyle}>Sosial & Proyek</td>
            <td ${tdStyle}>Peserta didik mampu membuat portofolio aksi cinta madrasah dan karya kreatif pengamalan nilai PPRA.</td>
            <td ${tdStyle}>Panca Cinta Komprehensif<br><em>PPRA: Tathawwur wa Ibtikār</em></td>
            <td ${tdCenter}>10 JP</td>
          </tr>
        </tbody>
        <tfoot>
          <tr style="background:#f1f5f9; font-weight:bold;">
            <td colspan="5" style="padding:8px; text-align:right; border:1px solid #cbd5e1;">TOTAL ALOKASI WAKTU SATU TAHUN:</td>
            <td ${tdCenter}>${cleanTotalJpNum} JP</td>
          </tr>
        </tfoot>
      </table>

      ${ttdHtml}
    `;
  }

  if (docType === "atp") {
    return `
      ${kopHtml}
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #1a3a5c; font-size: 15pt; text-transform: uppercase;">ALUR TUJUAN PEMBELAJARAN (ATP)</h2>
        <h3 style="margin: 4px 0 0 0; color: #475569; font-size: 12pt; font-weight: normal;">Kurikulum Berbasis Cinta (KBC) & Panca Cinta Kemenag | Tahun Pelajaran ${year}</h3>
      </div>

      <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:12px; margin-bottom:20px; text-align:center;">
        <h4 style="margin:0 0 8px 0; color:#1a3a5c; font-size:10pt;">DIAGRAM ALUR PROGRESI PEMBELAJARAN FASE ${level}</h4>
        <div style="font-family:monospace; font-size:9pt; color:#334155; line-height:1.8;">
          [${singkatanMapel}-E-01: Tauhid & Asmaul Husna] ➔ [${singkatanMapel}-E-02: Harmoni Alam & Sains] ➔ [${singkatanMapel}-E-03: Adab Orang Tua/Guru] ➔ [${singkatanMapel}-E-04: Akhlak Mulia & Digital]<br>
          ➔ [${singkatanMapel}-E-05: Syura & Musyawarah] ➔ [${singkatanMapel}-E-06: Aksi Peduli Alam Kerinci] ➔ [${singkatanMapel}-E-07: Moderasi Beragama] ➔ [${singkatanMapel}-E-08: Portofolio PPRA]
        </div>
      </div>

      <h3 style="color:#1a3a5c; border-bottom:2px solid #1a3a5c; padding-bottom:4px; margin-top:20px;">TABEL ALUR TUJUAN PEMBELAJARAN</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:9pt;">
        <thead>
          <tr>
            <th ${thStyle} style="width:4%;">No</th>
            <th ${thStyle} style="width:12%;">Kode TP</th>
            <th ${thStyle} style="width:10%;">Elemen</th>
            <th ${thStyle}>Tujuan Pembelajaran</th>
            <th ${thStyle} style="width:18%;">Materi Pokok Esensial</th>
            <th ${thStyle} style="width:16%;">Integrasi Panca Cinta & PPRA</th>
            <th ${thStyle} style="width:6%;">JP</th>
            <th ${thStyle} style="width:7%;">Sem</th>
          </tr>
        </thead>
        <tbody>
          <tr><td ${tdCenter}>1</td><td ${tdCenter}>${singkatanMapel}-E-01</td><td ${tdStyle}>Akidah</td><td ${tdStyle}>Memahami Tauhid & Asmaul Husna</td><td ${tdStyle}>Ar-Rahman, Ar-Rahim, Al-Adl</td><td ${tdStyle}>Cinta Allah | Ta'addub</td><td ${tdCenter}>8</td><td ${tdCenter}>1</td></tr>
          <tr><td ${tdCenter}>2</td><td ${tdCenter}>${singkatanMapel}-E-02</td><td ${tdStyle}>Akidah</td><td ${tdStyle}>Menghayati Keteraturan Alam Semesta</td><td ${tdStyle}>Tadabbur Alam & Dalil Aqli</td><td ${tdStyle}>Cinta Alam | Tawāzun</td><td ${tdCenter}>8</td><td ${tdCenter}>1</td></tr>
          <tr><td ${tdCenter}>3</td><td ${tdCenter}>${singkatanMapel}-E-03</td><td ${tdStyle}>Akhlak</td><td ${tdStyle}>Membiasakan Adab Berbakti & Santun</td><td ${tdStyle}>Birrul Walidain & Hormat Guru</td><td ${tdStyle}>Cinta Sesama | Qudwah</td><td ${tdCenter}>8</td><td ${tdCenter}>1</td></tr>
          <tr><td ${tdCenter}>4</td><td ${tdCenter}>${singkatanMapel}-E-04</td><td ${tdStyle}>Akhlak</td><td ${tdStyle}>Mencegah Perilaku Tercela & Adab Digital</td><td ${tdStyle}>Etika Komunikasi Islami</td><td ${tdStyle}>Cinta Kebaikan | I'tidāl</td><td ${tdCenter}>10</td><td ${tdCenter}>1</td></tr>
          <tr style="background:#f8fafc; font-weight:bold;"><td colspan="6" style="padding:6px; text-align:right;">Subtotal Semester 1:</td><td ${tdCenter}>34 JP</td><td ${tdCenter}>Sem 1</td></tr>

          <tr><td ${tdCenter}>5</td><td ${tdCenter}>${singkatanMapel}-E-05</td><td ${tdStyle}>Adab</td><td ${tdStyle}>Musyawarah & Menghargai Keragaman</td><td ${tdStyle}>Prinsip Syura dalam Kelas</td><td ${tdStyle}>Cinta Bangsa | Syūrā</td><td ${tdCenter}>8</td><td ${tdCenter}>2</td></tr>
          <tr><td ${tdCenter}>6</td><td ${tdCenter}>${singkatanMapel}-E-06</td><td ${tdStyle}>Adab</td><td ${tdStyle}>Aksi Pelestarian Lingkungan Kerinci</td><td ${tdStyle}>Kearifan Lokal TNKS & Kebersihan</td><td ${tdStyle}>Cinta Alam | Ibtikār</td><td ${tdCenter}>10</td><td ${tdCenter}>2</td></tr>
          <tr><td ${tdCenter}>7</td><td ${tdCenter}>${singkatanMapel}-E-07</td><td ${tdStyle}>Sosial</td><td ${tdStyle}>Moderasi Beragama & Cinta Tanah Air</td><td ${tdStyle}>Konsep Tasamuh & NKRI</td><td ${tdStyle}>Cinta Bangsa | Muwaṭanah</td><td ${tdCenter}>10</td><td ${tdCenter}>2</td></tr>
          <tr><td ${tdCenter}>8</td><td ${tdCenter}>${singkatanMapel}-E-08</td><td ${tdStyle}>Sosial</td><td ${tdStyle}>Pameran Portofolio Aksi Cinta Madrasah</td><td ${tdStyle}>Gelar Karya PPRA & Refleksi</td><td ${tdStyle}>Panca Cinta Utuh</td><td ${tdCenter}>10</td><td ${tdCenter}>2</td></tr>
          <tr style="background:#f8fafc; font-weight:bold;"><td colspan="6" style="padding:6px; text-align:right;">Subtotal Semester 2:</td><td ${tdCenter}>38 JP</td><td ${tdCenter}>Sem 2</td></tr>
        </tbody>
        <tfoot>
          <tr style="background:#e2e8f0; font-weight:bold;">
            <td colspan="6" style="padding:8px; text-align:right; border:1px solid #cbd5e1;">TOTAL ALOKASI JP KESELURUHAN (SEM 1 + SEM 2):</td>
            <td ${tdCenter}>${cleanTotalJpNum} JP</td>
            <td ${tdCenter}>1 Tahun</td>
          </tr>
        </tfoot>
      </table>

      ${ttdHtml}
    `;
  }

  if (docType === "prota") {
    return `
      ${kopHtml}
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #1a3a5c; font-size: 15pt; text-transform: uppercase;">PROGRAM TAHUNAN (PROTA)</h2>
        <h3 style="margin: 4px 0 0 0; color: #475569; font-size: 12pt; font-weight: normal;">Kurikulum Berbasis Cinta (KBC) | Tahun Pelajaran ${year}</h3>
      </div>

      <h3 style="color:#1a3a5c; border-bottom:2px solid #1a3a5c; padding-bottom:4px; margin-top:20px;">A. DISTRIBUSI ALOKASI WAKTU MINGGU EFEKTIF</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:9.5pt;">
        <thead>
          <tr>
            <th ${thStyle} style="width:5%;">No</th>
            <th ${thStyle} style="width:15%;">Semester</th>
            <th ${thStyle} style="width:20%;">Jumlah Minggu Kalender</th>
            <th ${thStyle} style="width:20%;">Minggu Tidak Efektif</th>
            <th ${thStyle} style="width:20%;">Minggu Efektif KBM</th>
            <th ${thStyle}>Jam Pelajaran Efektif</th>
          </tr>
        </thead>
        <tbody>
          <tr><td ${tdCenter}>1</td><td ${tdCenter}>Semester Ganjil (1)</td><td ${tdCenter}>26 Minggu</td><td ${tdCenter}>9 Minggu</td><td ${tdCenter}>17 Minggu</td><td ${tdCenter}>34 JP</td></tr>
          <tr><td ${tdCenter}>2</td><td ${tdCenter}>Semester Genap (2)</td><td ${tdCenter}>26 Minggu</td><td ${tdCenter}>7 Minggu</td><td ${tdCenter}>19 Minggu</td><td ${tdCenter}>38 JP</td></tr>
        </tbody>
        <tfoot>
          <tr style="background:#f1f5f9; font-weight:bold;">
            <td colspan="4" style="padding:8px; text-align:right; border:1px solid #cbd5e1;">TOTAL KESELURUHAN DALAM SATU TAHUN:</td>
            <td ${tdCenter}>36 Minggu</td>
            <td ${tdCenter}>${cleanTotalJpNum} JP</td>
          </tr>
        </tfoot>
      </table>

      <h3 style="color:#1a3a5c; border-bottom:2px solid #1a3a5c; padding-bottom:4px; margin-top:20px;">B. RENCANA MATERI DAN DISTRIBUSI PROGRAM TAHUNAN</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:9.5pt;">
        <thead>
          <tr>
            <th ${thStyle} style="width:5%;">No</th>
            <th ${thStyle} style="width:15%;">Kode TP</th>
            <th ${thStyle}>Tujuan Pembelajaran & Materi Esensial</th>
            <th ${thStyle} style="width:20%;">Integrasi KBC & Nilai PPRA</th>
            <th ${thStyle} style="width:10%;">Alokasi JP</th>
            <th ${thStyle} style="width:10%;">Semester</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#f8fafc; font-weight:bold;"><td colspan="6" style="padding:6px; color:#1a3a5c;">SEMESTER 1 (GANJIL)</td></tr>
          <tr><td ${tdCenter}>1</td><td ${tdCenter}>${singkatanMapel}-E-01</td><td ${tdStyle}>Konsep Tauhid dan Penghayatan Asmaul Husna Kasih Sayang</td><td ${tdStyle}>Cinta Allah & Rasul (Ta'addub)</td><td ${tdCenter}>8 JP</td><td ${tdCenter}>1</td></tr>
          <tr><td ${tdCenter}>2</td><td ${tdCenter}>${singkatanMapel}-E-02</td><td ${tdStyle}>Eksplorasi Bukti Kekuasaan Ilahi pada Alam Kerinci</td><td ${tdStyle}>Cinta Alam (Tawāzun)</td><td ${tdCenter}>8 JP</td><td ${tdCenter}>1</td></tr>
          <tr><td ${tdCenter}>3</td><td ${tdCenter}>${singkatanMapel}-E-03</td><td ${tdStyle}>Adab Berbakti kepada Orang Tua & Menghormati Guru</td><td ${tdStyle}>Cinta Sesama (Qudwah)</td><td ${tdCenter}>8 JP</td><td ${tdCenter}>1</td></tr>
          <tr><td ${tdCenter}>4</td><td ${tdCenter}>${singkatanMapel}-E-04</td><td ${tdStyle}>Mencegah Akhlak Mazmumah & Beretika dalam Media Sosial</td><td ${tdStyle}>Cinta Kebaikan (I'tidāl)</td><td ${tdCenter}>10 JP</td><td ${tdCenter}>1</td></tr>

          <tr style="background:#f8fafc; font-weight:bold;"><td colspan="6" style="padding:6px; color:#1a3a5c;">SEMESTER 2 (GENAP)</td></tr>
          <tr><td ${tdCenter}>5</td><td ${tdCenter}>${singkatanMapel}-E-05</td><td ${tdStyle}>Prinsip Syura & Menghargai Keragaman Sudut Pandang</td><td ${tdStyle}>Cinta Bangsa (Syūrā & Tasāmuh)</td><td ${tdCenter}>8 JP</td><td ${tdCenter}>2</td></tr>
          <tr><td ${tdCenter}>6</td><td ${tdCenter}>${singkatanMapel}-E-06</td><td ${tdStyle}>Aksi Peduli Lingkungan Madrasah & Hutan TNKS Kerinci</td><td ${tdStyle}>Cinta Alam (Ibtikār)</td><td ${tdCenter}>10 JP</td><td ${tdCenter}>2</td></tr>
          <tr><td ${tdCenter}>7</td><td ${tdCenter}>${singkatanMapel}-E-07</td><td ${tdStyle}>Moderasi Beragama & Merawat Persaudaraan Sebangsa</td><td ${tdStyle}>Cinta Tanah Air (Muwaṭanah)</td><td ${tdCenter}>10 JP</td><td ${tdCenter}>2</td></tr>
          <tr><td ${tdCenter}>8</td><td ${tdCenter}>${singkatanMapel}-E-08</td><td ${tdStyle}>Pameran Karya Portofolio & Gelar Seni Cinta Madrasah</td><td ${tdStyle}>Panca Cinta Komprehensif</td><td ${tdCenter}>10 JP</td><td ${tdCenter}>2</td></tr>
        </tbody>
        <tfoot>
          <tr style="background:#f1f5f9; font-weight:bold;">
            <td colspan="4" style="padding:8px; text-align:right; border:1px solid #cbd5e1;">TOTAL ALOKASI PROGRAM TAHUNAN:</td>
            <td ${tdCenter}>${cleanTotalJpNum} JP</td>
            <td ${tdCenter}>Tuntas</td>
          </tr>
        </tfoot>
      </table>

      ${ttdHtml}
    `;
  }

  if (docType === "prosem") {
    return `
      ${kopHtml}
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #1a3a5c; font-size: 15pt; text-transform: uppercase;">PROGRAM SEMESTER (PROSEM)</h2>
        <h3 style="margin: 4px 0 0 0; color: #475569; font-size: 12pt; font-weight: normal;">Kurikulum Berbasis Cinta (KBC) | Tahun Pelajaran ${year}</h3>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; font-size:9pt;">
        <div><strong>Mata Pelajaran:</strong> ${subject} (${singkatanMapel}) | <strong>Fase/Kelas:</strong> ${level}</div>
        <div style="display:flex; gap:12px;">
          <span><span style="display:inline-block; width:12px; height:12px; background:#3b82f6; border-radius:2px;"></span> KBM Aktif</span>
          <span><span style="display:inline-block; width:12px; height:12px; background:#f59e0b; border-radius:2px;"></span> PTS / STS</span>
          <span><span style="display:inline-block; width:12px; height:12px; background:#ef4444; border-radius:2px;"></span> PAS / SAS</span>
          <span><span style="display:inline-block; width:12px; height:12px; background:#94a3b8; border-radius:2px;"></span> Libur</span>
        </div>
      </div>

      <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:8.5pt;">
        <thead>
          <tr>
            <th ${thStyle} rowspan="2" style="width:4%;">No</th>
            <th ${thStyle} rowspan="2" style="width:10%;">Kode TP</th>
            <th ${thStyle} rowspan="2">Materi Pokok & Indikator KBC</th>
            <th ${thStyle} rowspan="2" style="width:5%;">JP</th>
            <th ${thStyle} colspan="5">Juli</th>
            <th ${thStyle} colspan="5">Agustus</th>
            <th ${thStyle} colspan="5">September</th>
            <th ${thStyle} colspan="5">Oktober</th>
            <th ${thStyle} colspan="5">November</th>
            <th ${thStyle} colspan="5">Desember</th>
          </tr>
          <tr>
            <th style="padding:4px; background:#244b7a; color:#fff; font-size:7.5pt; text-align:center;">1</th>
            <th style="padding:4px; background:#244b7a; color:#fff; font-size:7.5pt; text-align:center;">2</th>
            <th style="padding:4px; background:#244b7a; color:#fff; font-size:7.5pt; text-align:center;">3</th>
            <th style="padding:4px; background:#244b7a; color:#fff; font-size:7.5pt; text-align:center;">4</th>
            <th style="padding:4px; background:#244b7a; color:#fff; font-size:7.5pt; text-align:center;">5</th>
            <th style="padding:4px; background:#244b7a; color:#fff; font-size:7.5pt; text-align:center;">1</th>
            <th style="padding:4px; background:#244b7a; color:#fff; font-size:7.5pt; text-align:center;">2</th>
            <th style="padding:4px; background:#244b7a; color:#fff; font-size:7.5pt; text-align:center;">3</th>
            <th style="padding:4px; background:#244b7a; color:#fff; font-size:7.5pt; text-align:center;">4</th>
            <th style="padding:4px; background:#244b7a; color:#fff; font-size:7.5pt; text-align:center;">5</th>
            <th style="padding:4px; background:#244b7a; color:#fff; font-size:7.5pt; text-align:center;">1</th>
            <th style="padding:4px; background:#244b7a; color:#fff; font-size:7.5pt; text-align:center;">2</th>
            <th style="padding:4px; background:#244b7a; color:#fff; font-size:7.5pt; text-align:center;">3</th>
            <th style="padding:4px; background:#244b7a; color:#fff; font-size:7.5pt; text-align:center;">4</th>
            <th style="padding:4px; background:#244b7a; color:#fff; font-size:7.5pt; text-align:center;">5</th>
            <th style="padding:4px; background:#244b7a; color:#fff; font-size:7.5pt; text-align:center;">1</th>
            <th style="padding:4px; background:#244b7a; color:#fff; font-size:7.5pt; text-align:center;">2</th>
            <th style="padding:4px; background:#244b7a; color:#fff; font-size:7.5pt; text-align:center;">3</th>
            <th style="padding:4px; background:#244b7a; color:#fff; font-size:7.5pt; text-align:center;">4</th>
            <th style="padding:4px; background:#244b7a; color:#fff; font-size:7.5pt; text-align:center;">5</th>
            <th style="padding:4px; background:#244b7a; color:#fff; font-size:7.5pt; text-align:center;">1</th>
            <th style="padding:4px; background:#244b7a; color:#fff; font-size:7.5pt; text-align:center;">2</th>
            <th style="padding:4px; background:#244b7a; color:#fff; font-size:7.5pt; text-align:center;">3</th>
            <th style="padding:4px; background:#244b7a; color:#fff; font-size:7.5pt; text-align:center;">4</th>
            <th style="padding:4px; background:#244b7a; color:#fff; font-size:7.5pt; text-align:center;">5</th>
            <th style="padding:4px; background:#244b7a; color:#fff; font-size:7.5pt; text-align:center;">1</th>
            <th style="padding:4px; background:#244b7a; color:#fff; font-size:7.5pt; text-align:center;">2</th>
            <th style="padding:4px; background:#244b7a; color:#fff; font-size:7.5pt; text-align:center;">3</th>
            <th style="padding:4px; background:#244b7a; color:#fff; font-size:7.5pt; text-align:center;">4</th>
            <th style="padding:4px; background:#244b7a; color:#fff; font-size:7.5pt; text-align:center;">5</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td ${tdCenter}>1</td><td ${tdCenter}>${singkatanMapel}-E-01</td>
            <td ${tdStyle}>Tauhid & Asmaul Husna Kasih Sayang</td><td ${tdCenter}>8</td>
            <td style="background:#94a3b8; text-align:center;">L</td><td style="background:#94a3b8; text-align:center;">M</td>
            <td style="background:#3b82f6; color:#fff; text-align:center;">2</td><td style="background:#3b82f6; color:#fff; text-align:center;">2</td>
            <td></td><td style="background:#3b82f6; color:#fff; text-align:center;">2</td><td style="background:#3b82f6; color:#fff; text-align:center;">2</td>
            <td colspan="23"></td>
          </tr>
          <tr>
            <td ${tdCenter}>2</td><td ${tdCenter}>${singkatanMapel}-E-02</td>
            <td ${tdStyle}>Harmoni Alam Semesta & Dalil Naqli</td><td ${tdCenter}>8</td>
            <td colspan="7"></td>
            <td style="background:#3b82f6; color:#fff; text-align:center;">2</td><td style="background:#3b82f6; color:#fff; text-align:center;">2</td>
            <td></td><td style="background:#3b82f6; color:#fff; text-align:center;">2</td><td style="background:#3b82f6; color:#fff; text-align:center;">2</td>
            <td colspan="18"></td>
          </tr>
          <tr>
            <td ${tdCenter}>3</td><td ${tdCenter}>${singkatanMapel}-E-03</td>
            <td ${tdStyle}>Adab Berbakti & Sopan Santun (Ta'addub)</td><td ${tdCenter}>8</td>
            <td colspan="12"></td>
            <td style="background:#f59e0b; color:#fff; text-align:center;">PTS</td><td style="background:#3b82f6; color:#fff; text-align:center;">2</td>
            <td></td><td style="background:#3b82f6; color:#fff; text-align:center;">2</td><td style="background:#3b82f6; color:#fff; text-align:center;">2</td>
            <td style="background:#3b82f6; color:#fff; text-align:center;">2</td><td colspan="12"></td>
          </tr>
          <tr>
            <td ${tdCenter}>4</td><td ${tdCenter}>${singkatanMapel}-E-04</td>
            <td ${tdStyle}>Mencegah Akhlak Mazmumah & Etika Digital</td><td ${tdCenter}>10</td>
            <td colspan="18"></td>
            <td style="background:#3b82f6; color:#fff; text-align:center;">2</td><td style="background:#3b82f6; color:#fff; text-align:center;">2</td>
            <td style="background:#3b82f6; color:#fff; text-align:center;">2</td><td style="background:#3b82f6; color:#fff; text-align:center;">2</td>
            <td style="background:#3b82f6; color:#fff; text-align:center;">2</td>
            <td style="background:#ef4444; color:#fff; text-align:center;">PAS</td><td style="background:#ef4444; color:#fff; text-align:center;">PAS</td>
            <td style="background:#94a3b8; text-align:center;">R</td><td style="background:#94a3b8; text-align:center;">L</td><td></td>
          </tr>
        </tbody>
      </table>

      ${ttdHtml}
    `;
  }

  if (docType === "kktp") {
    return `
      ${kopHtml}
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #1a3a5c; font-size: 15pt; text-transform: uppercase;">KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP)</h2>
        <h3 style="margin: 4px 0 0 0; color: #475569; font-size: 12pt; font-weight: normal;">Kurikulum Berbasis Cinta (KBC) | Tahun Pelajaran ${year}</h3>
      </div>

      <h3 style="color:#1a3a5c; border-bottom:2px solid #1a3a5c; padding-bottom:4px; margin-top:20px;">A. DESKRIPSI INTERVAL KRITERIA KETERCAPAIAN</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:9.5pt;">
        <thead>
          <tr>
            <th ${thStyle} style="width:12%;">Level</th>
            <th ${thStyle} style="width:12%;">Rentang Nilai</th>
            <th ${thStyle} style="width:12%;">Predikat</th>
            <th ${thStyle}>Deskripsi Kategori Capaian</th>
            <th ${thStyle} style="width:30%;">Tindak Lanjut Pembelajaran</th>
          </tr>
        </thead>
        <tbody>
          <tr><td ${tdCenter}>Level 1</td><td ${tdCenter}>0 - 55</td><td ${tdCenter}>Mulai Berkembang</td><td ${tdStyle}>Belum mencapai ketuntasan minimum konsep esensial dan nilai karakter.</td><td ${tdStyle}>Bimbingan khusus dan pendampingan intensif berlandaskan kasih sayang.</td></tr>
          <tr style="background:#f0fdf4;"><td ${tdCenter}><strong>Level 2 ✓</strong></td><td ${tdCenter}><strong>56 - 70</strong></td><td ${tdCenter}><strong>Layak (KKTP)</strong></td><td ${tdStyle}>Mencapai kriteria ketuntasan minimal tujuan pembelajaran.</td><td ${tdStyle}>Diberikan latihan penguatan mandiri dan apresiasi positif.</td></tr>
          <tr><td ${tdCenter}>Level 3</td><td ${tdCenter}>71 - 85</td><td ${tdCenter}>Cakap</td><td ${tdStyle}>Menguasai kompetensi dan mampu mengaplikasikan nilai secara mandiri.</td><td ${tdStyle}>Diberikan kesempatan tutor sebaya bagi rekan sekelas.</td></tr>
          <tr><td ${tdCenter}>Level 4</td><td ${tdCenter}>86 - 100</td><td ${tdCenter}>Mahir / Istimewa</td><td ${tdStyle}>Sangat menguasai, kritis, inovatif, dan menjadi teladan (Qudwah).</td><td ${tdStyle}>Diberikan proyek pengayaan dan tantangan pemecahan masalah lanjutan.</td></tr>
        </tbody>
      </table>

      <h3 style="color:#1a3a5c; border-bottom:2px solid #1a3a5c; padding-bottom:4px; margin-top:20px;">B. RUBRIK KKTP PER TUJUAN PEMBELAJARAN</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:9pt;">
        <thead>
          <tr>
            <th ${thStyle} style="width:4%;">No</th>
            <th ${thStyle} style="width:12%;">Kode TP</th>
            <th ${thStyle} style="width:20%;">Tujuan Pembelajaran</th>
            <th ${thStyle} style="width:16%;">Mulai Berkembang (1)</th>
            <th ${thStyle} style="width:16%;">Layak / KKTP (2)</th>
            <th ${thStyle} style="width:16%;">Cakap (3)</th>
            <th ${thStyle} style="width:16%;">Mahir / Qudwah (4)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td ${tdCenter}>1</td><td ${tdCenter}>${singkatanMapel}-E-01</td>
            <td ${tdStyle}>Menganalisis konsep Tauhid & Asmaul Husna kasih sayang</td>
            <td ${tdStyle}>Baru mampu menyebutkan nama-nama Asmaul Husna dengan bimbingan.</td>
            <td ${tdStyle}>Mampu menjelaskan arti Tauhid dan Asmaul Husna secara umum.</td>
            <td ${tdStyle}>Mampu menganalisis hikmah Tauhid dan mengaitkan dengan perilaku sehari-hari.</td>
            <td ${tdStyle}>Sangat mahir menganalisis, berargumentasi dalil aqli, dan menjadi teladan kasih sayang (Qudwah).</td>
          </tr>
          <tr>
            <td ${tdCenter}>2</td><td ${tdCenter}>${singkatanMapel}-E-03</td>
            <td ${tdStyle}>Menerapkan adab berbakti dan santun kepada orang tua/guru</td>
            <td ${tdStyle}>Belum terbiasa menunjukkan sikap sopan santun secara konsisten.</td>
            <td ${tdStyle}>Menunjukkan sikap santun ketika berada dalam pengawasan guru/orang tua.</td>
            <td ${tdStyle}>Konsisten bersikap santun dan hormat atas kesadaran diri sendiri.</td>
            <td ${tdStyle}>Menginspirasi rekan lain dalam kesantunan (Ta'addub) dan kepedulian tulus.</td>
          </tr>
        </tbody>
      </table>

      ${ttdHtml}
    `;
  }

  if (docType === "modul_ajar") {
    return `
      ${kopHtml}
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #1a3a5c; font-size: 15pt; text-transform: uppercase;">MODUL AJAR DEEP LEARNING (KBC)</h2>
        <h3 style="margin: 4px 0 0 0; color: #475569; font-size: 12pt; font-weight: normal;">Pendekatan Mindful, Meaningful, Joyful Learning | Kurikulum Berbasis Cinta</h3>
      </div>

      <h3 style="color:#1a3a5c; border-bottom:2px solid #1a3a5c; padding-bottom:4px; margin-top:20px;">A. INFORMASI UMUM</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:10pt;">
        <tr><td ${tdStyle} style="width:25%; font-weight:bold; background:#f8fafc;">Nama Madrasah</td><td ${tdStyle}>${schoolName}</td></tr>
        <tr><td ${tdStyle} style="font-weight:bold; background:#f8fafc;">Nama Penyusun</td><td ${tdStyle}>${teacher} (NIP: ${nipTeacher})</td></tr>
        <tr><td ${tdStyle} style="font-weight:bold; background:#f8fafc;">Tahun Pelajaran</td><td ${tdStyle}>${year}</td></tr>
        <tr><td ${tdStyle} style="font-weight:bold; background:#f8fafc;">Fase / Kelas / Jenjang</td><td ${tdStyle}>${level}</td></tr>
        <tr><td ${tdStyle} style="font-weight:bold; background:#f8fafc;">Mata Pelajaran</td><td ${tdStyle}>${subject} (${singkatanMapel})</td></tr>
        <tr><td ${tdStyle} style="font-weight:bold; background:#f8fafc;">Tujuan Pembelajaran</td><td ${tdStyle}><strong>${kodeTp}:</strong> ${rumusanTp}</td></tr>
        <tr><td ${tdStyle} style="font-weight:bold; background:#f8fafc;">Alokasi Waktu</td><td ${tdStyle}>${jumlahPertemuan} Pertemuan x ${jpPerPertemuan} JP (${Number(jpPerPertemuan) * 45} Menit/Pertemuan)</td></tr>
        <tr><td ${tdStyle} style="font-weight:bold; background:#f8fafc;">Model Pembelajaran</td><td ${tdStyle}>${learningModel} (Sintak: ${sintakModel})</td></tr>
        <tr><td ${tdStyle} style="font-weight:bold; background:#f8fafc;">Integrasi Nilai KBC & PPRA</td><td ${tdStyle}>Panca Cinta Kemenag & Nilai PPRA (Ta'addub, Qudwah, Syūrā, Tathawwur wa Ibtikār)</td></tr>
      </table>

      <h3 style="color:#1a3a5c; border-bottom:2px solid #1a3a5c; padding-bottom:4px; margin-top:20px;">B. KOMPONEN INTI & SKENARIO DEEP LEARNING</h3>
      <div style="background:#f8fafc; border-left:4px solid #1a3a5c; padding:12px; margin-bottom:16px;">
        <p style="margin:0 0 6px 0;"><strong>Pemahaman Bermakna:</strong> Tauhid bukan sekadar dogma abstrak, melainkan sumber mata air kasih sayang Ilahi yang mengalirkan keteladanan (Qudwah), keadilan, dan dorongan menjaga harmoni alam sekitar kita.</p>
        <p style="margin:0;"><strong>Pertanyaan Pemantik:</strong> Bagaimana cara kita membuktikan rasa cinta kepada Sang Pencipta dalam tindakan nyata di madrasah dan pelestarian alam ${topikLokal}?</p>
      </div>

      <h4 style="color:#1a3a5c; margin-top:16px; margin-bottom:8px;">SKENARIO PEMBELAJARAN PERTEMUAN 1: Eksplorasi Konsep & Nilai Kasih Sayang (${Number(jpPerPertemuan) * 45} Menit)</h4>
      
      <p><strong>1. Pendahuluan (15 Menit) — Mindful Learning:</strong></p>
      <ul>
        <li>Guru menyapa dengan salam hangat, doa khusyuk, dan memeriksa kesiapan fisik serta batin peserta didik (PC: Cinta Allah | PPRA: Ta'addub).</li>
        <li>Guru memutar audio/video singkat keindahan alam Kerinci sebagai apersepsi mensyukuri nikmat Ilahi.</li>
        <li>Guru menyampaikan tujuan pembelajaran dan mengaitkannya dengan pentingnya menjadi pribadi teladan (Qudwah).</li>
      </ul>

      <p><strong>2. Kegiatan Inti (${Number(jpPerPertemuan) * 45 - 30} Menit) — Meaningful & Joyful Deep Learning:</strong></p>
      <ul>
        <li><strong>Fase Memahami (Concept):</strong> Guru memberikan stimulasi studi kasus nyata mengenai keteladanan sosial dan fenomena alam. Peserta didik membaca lembar materi esensial secara kritis.</li>
        <li><strong>Fase Mengaplikasi (Practice):</strong> Peserta didik membentuk kelompok diskusi (Syūrā) untuk menganalisis penerapan nilai kasih sayang dan merumuskan solusi studi kasus pada LKPD.</li>
        <li><strong>Fase Merefleksi (Reflection):</strong> Masing-masing kelompok mempresentasikan gagasan dengan santun. Guru memfasilitasi umpan balik konstruktif antar-kelompok (Musāwah & Tasāmuh).</li>
      </ul>

      <p><strong>3. Penutup (15 Menit):</strong></p>
      <ul>
        <li>Guru bersama peserta didik menyimpulkan pesan esensial pembelajaran.</li>
        <li>Peserta didik menuliskan 1 kalimat refleksi harian: "Apa wujud cinta kasih yang akan saya lakukan hari ini?".</li>
        <li>Doa penutup dan pesan kasih sayang guru kepada seluruh siswa.</li>
      </ul>

      <h3 style="color:#1a3a5c; border-bottom:2px solid #1a3a5c; padding-bottom:4px; margin-top:20px;">C. ASESMEN DAN TINDAK LANJUT</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:9.5pt;">
        <thead>
          <tr><th ${thStyle}>Bentuk Asesmen</th><th ${thStyle}>Teknik</th><th ${thStyle}>Instrumen</th><th ${thStyle}>Tujuan</th></tr>
        </thead>
        <tbody>
          <tr><td ${tdStyle}>Asesmen Diagnostik</td><td ${tdStyle}>Tanya Jawab & Angket Emosional</td><td ${tdStyle}>Lembar Diagnostik Awal</td><td ${tdStyle}>Mengetahui kesiapan dan minat belajar siswa.</td></tr>
          <tr><td ${tdStyle}>Asesmen Formatif</td><td ${tdStyle}>Observasi Diskusi & LKPD</td><td ${tdStyle}>Rubrik Kinerja & Penilaian Sahabat</td><td ${tdStyle}>Memantau perkembangan pemahaman dan sikap kolaboratif.</td></tr>
          <tr><td ${tdStyle}>Asesmen Sumatif</td><td ${tdStyle}>Tes Tulis HOTS & Portofolio Karya</td><td ${tdStyle}>Soal Analisis & Rubrik Produk</td><td ${tdStyle}>Mengukur ketuntasan akhir tujuan pembelajaran.</td></tr>
        </tbody>
      </table>

      ${ttdHtml}
    `;
  }

  if (docType === "lkpd") {
    return `
      ${kopHtml}
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #1a3a5c; font-size: 15pt; text-transform: uppercase;">LEMBAR KERJA PESERTA DIDIK (LKPD)</h2>
        <h3 style="margin: 4px 0 0 0; color: #475569; font-size: 12pt; font-weight: normal;">Kurikulum Berbasis Cinta (KBC) — Deep Learning</h3>
      </div>

      <table style="width:100%; border-collapse:collapse; margin-bottom:16px; font-size:9.5pt;">
        <tr><td ${tdStyle} style="width:20%; font-weight:bold; background:#f8fafc;">Kelompok</td><td ${tdStyle} style="width:30%;">Kelompok: ................................</td><td ${tdStyle} style="width:20%; font-weight:bold; background:#f8fafc;">Kelas / Hari / Tgl</td><td ${tdStyle}>${level} / ............................</td></tr>
        <tr><td ${tdStyle} style="font-weight:bold; background:#f8fafc;">Anggota Kelompok</td><td colspan="3" ${tdStyle}>1. ........................................ 2. ........................................ 3. ........................................ 4. ........................................</td></tr>
        <tr><td ${tdStyle} style="font-weight:bold; background:#f8fafc;">Topik / TP</td><td colspan="3" ${tdStyle}><strong>${kodeTp}:</strong> ${rumusanTp}</td></tr>
      </table>

      <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:10px; margin-bottom:16px; font-size:9.5pt;">
        <strong>Petunjuk Pengerjaan:</strong>
        <ol style="margin:4px 0 0 20px; padding:0;">
          <li>Awali dengan membaca basmalah dan doa bersama kelompokmu.</li>
          <li>Diskusikan setiap instruksi dengan penuh rasa saling menghargai (Syūrā & Tasāmuh).</li>
          <li>Tuliskan jawaban hasil pemikiran bersama secara jelas, rapi, dan bertanggung jawab.</li>
        </ol>
      </div>

      <h4 style="color:#1a3a5c; margin-top:16px;">AKTIVITAS 1: Telaah Konsep & Studi Kasus Lingkungan</h4>
      <p style="font-size:9.5pt;">Cermatilah kasus berikut: <em>"Dalam kehidupan sehari-hari di sekitar lingkungan Kerinci (${topikLokal}), sering kali kita menyaksikan interaksi antarwarga dan pelestarian alam yang memerlukan nilai kasih sayang dan keteladanan nyata."</em></p>
      <p style="font-size:9.5pt;"><strong>Pertanyaan Diskusi:</strong></p>
      <ol style="font-size:9.5pt; line-height:1.6;">
        <li>Jelaskan bagaimana konsep Tauhid dan Asmaul Husna mendasari rasa kepedulian terhadap sesama dan alam sekitar!
          <div style="border:1px dashed #94a3b8; height:70px; margin:6px 0; background:#fff; border-radius:4px; padding:6px; font-size:8pt; color:#94a3b8;">Kolom Jawaban Analisis:</div>
        </li>
        <li>Tuliskan 3 bentuk aksi konkret keteladanan (Qudwah) yang dapat diterapkan siswa madrasah dalam merawat persaudaraan dan kebersihan kelas!
          <div style="border:1px dashed #94a3b8; height:70px; margin:6px 0; background:#fff; border-radius:4px; padding:6px; font-size:8pt; color:#94a3b8;">Kolom Jawaban Rencana Aksi:</div>
        </li>
      </ol>

      <h4 style="color:#1a3a5c; margin-top:16px;">LEMBAR PENILAIAN SAHABAT (SYŪRĀ)</h4>
      <table style="width:100%; border-collapse:collapse; margin-bottom:16px; font-size:9pt;">
        <thead>
          <tr><th ${thStyle} style="width:5%;">No</th><th ${thStyle}>Aspek Sikap Sahabat</th><th ${thStyle} style="width:15%;">Sangat Baik</th><th ${thStyle} style="width:15%;">Baik</th><th ${thStyle} style="width:15%;">Perlu Bimbingan</th></tr>
        </thead>
        <tbody>
          <tr><td ${tdCenter}>1</td><td ${tdStyle}>Mendengarkan pendapat teman dengan santun (Ta'addub)</td><td ${tdCenter}>[  ]</td><td ${tdCenter}>[  ]</td><td ${tdCenter}>[  ]</td></tr>
          <tr><td ${tdCenter}>2</td><td ${tdStyle}>Aktif memberikan solusi positif dalam kelompok (Syūrā)</td><td ${tdCenter}>[  ]</td><td ${tdCenter}>[  ]</td><td ${tdCenter}>[  ]</td></tr>
          <tr><td ${tdCenter}>3</td><td ${tdStyle}>Menghargai hasil kesepakatan bersama secara adil (I'tidāl)</td><td ${tdCenter}>[  ]</td><td ${tdCenter}>[  ]</td><td ${tdCenter}>[  ]</td></tr>
        </tbody>
      </table>

      ${ttdHtml}
    `;
  }

  if (docType === "rubrik") {
    return `
      ${kopHtml}
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #1a3a5c; font-size: 15pt; text-transform: uppercase;">RUBRIK ASESMEN FORMATIF & SUMATIF</h2>
        <h3 style="margin: 4px 0 0 0; color: #475569; font-size: 12pt; font-weight: normal;">Kurikulum Berbasis Cinta (KBC) & Profil Pelajar Rahmatan lil 'Alamin</h3>
      </div>

      <h3 style="color:#1a3a5c; border-bottom:2px solid #1a3a5c; padding-bottom:4px; margin-top:20px;">A. RUBRIK PENILAIAN PROSES FORMATIF (4 LEVEL KINERJA)</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:9pt;">
        <thead>
          <tr>
            <th ${thStyle} style="width:5%;">No</th>
            <th ${thStyle} style="width:20%;">Aspek Penilaian</th>
            <th ${thStyle} style="width:18%;">Mulai Berkembang (1)</th>
            <th ${thStyle} style="width:18%;">Layak / BSH (2)</th>
            <th ${thStyle} style="width:18%;">Cakap (3)</th>
            <th ${thStyle} style="width:21%;">Mahir / Qudwah (4)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td ${tdCenter}>1</td>
            <td ${tdStyle}><strong>Penguasaan Konsep & Penalaran</strong></td>
            <td ${tdStyle}>Menunjukkan pemahaman awal dan memerlukan pendampingan guru.</td>
            <td ${tdStyle}>Menjelaskan konsep esensial secara benar sesuai materi.</td>
            <td ${tdStyle}>Menganalisis hubungan antar-konsep secara mandiri dan sistematis.</td>
            <td ${tdStyle}>Menghubungkan konsep secara mendalam dengan dalil serta kearifan lokal.</td>
          </tr>
          <tr>
            <td ${tdCenter}>2</td>
            <td ${tdStyle}><strong>Kolaborasi & Musyawarah (Syūrā)</strong></td>
            <td ${tdStyle}>Kurang aktif dan menunggu instruksi dari anggota tim.</td>
            <td ${tdStyle}>Ikut berpartisipasi menyelesaikan tugas bagiannya dalam kelompok.</td>
            <td ${tdStyle}>Aktif memfasilitasi diskusi dan menghargai masukan sesama.</td>
            <td ${tdStyle}>Menjadi teladan perekat tim (Qudwah), santun, dan solutif.</td>
          </tr>
          <tr>
            <td ${tdCenter}>3</td>
            <td ${tdStyle}><strong>Adab & Kesantunan (Ta'addub)</strong></td>
            <td ${tdStyle}>Kadang kurang memperhatikan etika komunikasi dalam forum.</td>
            <td ${tdStyle}>Menjaga kesantunan saat berbicara di depan guru dan teman.</td>
            <td ${tdStyle}>Konsisten bertutur kata santun dan menghormati perbedaan.</td>
            <td ${tdStyle}>Menampilkan akhlak terpuji yang menginspirasi seluruh lingkungan kelas.</td>
          </tr>
        </tbody>
      </table>

      <h3 style="color:#1a3a5c; border-bottom:2px solid #1a3a5c; padding-bottom:4px; margin-top:20px;">B. KOMPOSISI ASESMEN SUMATIF</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:9.5pt;">
        <thead>
          <tr><th ${thStyle} style="width:10%;">No</th><th ${thStyle}>Komponen Penilaian Sumatif</th><th ${thStyle} style="width:25%;">Bentuk Tugas</th><th ${thStyle} style="width:15%;">Bobot Nilai</th></tr>
        </thead>
        <tbody>
          <tr><td ${tdCenter}>1</td><td ${tdStyle}>Tes Sumatif Lingkup Materi (HOTS)</td><td ${tdStyle}>Tes Tertulis Soal Analisis & Kasus</td><td ${tdCenter}>40%</td></tr>
          <tr><td ${tdCenter}>2</td><td ${tdStyle}>Penilaian Kinerja / LKPD Kelompok</td><td ${tdStyle}>Laporan Diskusi & Presentasi Tim</td><td ${tdCenter}>30%</td></tr>
          <tr><td ${tdCenter}>3</td><td ${tdStyle}>Portofolio Aksi Nyata & Refleksi Karakter</td><td ${tdStyle}>Produk Karya Kreatif & Jurnal PPRA</td><td ${tdCenter}>30%</td></tr>
        </tbody>
        <tfoot>
          <tr style="background:#f1f5f9; font-weight:bold;">
            <td colspan="3" style="padding:8px; text-align:right; border:1px solid #cbd5e1;">TOTAL BOBOT PENILAIAN:</td>
            <td ${tdCenter}>100%</td>
          </tr>
        </tfoot>
      </table>

      ${ttdHtml}
    `;
  }

  // Default fallback for any other KBC document request
  return `
    ${kopHtml}
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="margin: 0; color: #1a3a5c; font-size: 15pt; text-transform: uppercase;">DOKUMEN ADMINISTRASI GURU KBC</h2>
      <h3 style="margin: 4px 0 0 0; color: #475569; font-size: 12pt; font-weight: normal;">Kurikulum Berbasis Cinta | ${subject} | ${level}</h3>
    </div>
    <p>Dokumen Kurikulum Berbasis Cinta berhasil disusun secara lengkap untuk ${schoolName}.</p>
    ${ttdHtml}
  `;
}

export function generateMerdekaDocumentFallback(docType: string, formData: any): string {
  const {
    school = "SMA Negeri 1 Jambi",
    subject = "Bahasa Indonesia",
    singkatanMapel = "BI",
    level = "Fase E / Kelas X",
    year = "2026/2027",
    totalJp = "108 JP / Tahun",
    jpPerMinggu = "3 JP/Minggu",
    teacher = "Budi Santoso, S.Pd., Gr.",
    nipTeacher = "19900101 201903 1 001",
    cityDate = "Jambi, 14 Juli 2026",
    principal = "Dr. Ahmad Fauzi, M.Pd.",
    nipPrincipal = "19720514 200003 1 002"
  } = formData || {};

  const cleanTotalJpNum = parseInt(totalJp) || 108;
  const thStyle = `style="background-color:#1a3a5c; color:#ffffff; font-weight:bold; text-align:center; padding:8px; border:1px solid #cbd5e1;"`;
  const tdStyle = `style="padding:8px; border:1px solid #cbd5e1; vertical-align:top;"`;
  const tdCenter = `style="padding:8px; border:1px solid #cbd5e1; text-align:center; vertical-align:top;"`;

  const kopHtml = `
    <div style="text-align: center; border-bottom: 3px double #1a3a5c; padding-bottom: 12px; margin-bottom: 20px; font-family: 'Segoe UI', Arial, sans-serif;">
      <h4 style="margin: 0; font-size: 13pt; text-transform: uppercase; color: #334155;">PEMERINTAH DAERAH DINAS PENDIDIKAN</h4>
      <h2 style="margin: 4px 0; font-size: 16pt; font-weight: bold; text-transform: uppercase; color: #1a3a5c;">${school}</h2>
      <p style="margin: 2px 0 0 0; font-size: 9pt; color: #64748b;">Jalan Pendidikan No. 12, Telp/Faks: (0741) 55432</p>
    </div>
  `;

  const ttdHtml = `
    <table style="width:100%; border:none; margin-top:35px; page-break-inside:avoid; font-family: 'Segoe UI', Arial, sans-serif; font-size: 10pt;">
      <tr>
        <td style="border:none; text-align:center; width:50%; vertical-align:top;">
          <p style="margin:0;">Mengetahui,<br>Kepala Sekolah</p>
          <br><br><br><br>
          <p style="margin:0; font-weight:bold; text-decoration:underline;">${principal}</p>
          <p style="margin:0; font-size:9pt; color:#475569;">NIP. ${nipPrincipal}</p>
        </td>
        <td style="border:none; text-align:center; width:50%; vertical-align:top;">
          <p style="margin:0;">${cityDate}<br>Guru Mata Pelajaran</p>
          <br><br><br><br>
          <p style="margin:0; font-weight:bold; text-decoration:underline;">${teacher}</p>
          <p style="margin:0; font-size:9pt; color:#475569;">NIP. ${nipTeacher}</p>
        </td>
      </tr>
    </table>
  `;

  if (docType === "analisis_cp") {
    return `
      ${kopHtml}
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #1a3a5c; font-size: 15pt; text-transform: uppercase;">ANALISIS CAPAIAN PEMBELAJARAN (CP)</h2>
        <h3 style="margin: 4px 0 0 0; color: #475569; font-size: 12pt; font-weight: normal;">Kurikulum Merdeka | Tahun Pelajaran ${year}</h3>
      </div>
      <h3 style="color:#1a3a5c; border-bottom:2px solid #1a3a5c; padding-bottom:4px;">A. IDENTITAS MATA PELAJARAN</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:10pt;">
        <tr><td ${tdStyle} style="width:25%; font-weight:bold; background:#f8fafc;">Satuan Pendidikan</td><td ${tdStyle}>${school}</td></tr>
        <tr><td ${tdStyle} style="font-weight:bold; background:#f8fafc;">Mata Pelajaran</td><td ${tdStyle}>${subject} (${singkatanMapel})</td></tr>
        <tr><td ${tdStyle} style="font-weight:bold; background:#f8fafc;">Fase / Kelas</td><td ${tdStyle}>${level}</td></tr>
        <tr><td ${tdStyle} style="font-weight:bold; background:#f8fafc;">Alokasi Waktu Total</td><td ${tdStyle}>${totalJp} (${jpPerMinggu})</td></tr>
      </table>
      <h3 style="color:#1a3a5c; border-bottom:2px solid #1a3a5c; padding-bottom:4px;">B. CAPAIAN PEMBELAJARAN ELEMEN</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:9.5pt;">
        <thead>
          <tr><th ${thStyle} style="width:5%;">No</th><th ${thStyle} style="width:20%;">Elemen CP</th><th ${thStyle}>Deskripsi Capaian Pembelajaran</th><th ${thStyle} style="width:30%;">Kompetensi & Materi Esensial</th></tr>
        </thead>
        <tbody>
          <tr><td ${tdCenter}>1</td><td ${tdStyle}><strong>Menyimak & Memahami</strong></td><td ${tdStyle}>Peserta didik mampu mengevaluasi dan mengkreasi informasi berupa gagasan dari teks lisan dan visual secara kritis.</td><td ${tdStyle}>Analisis Gagasan, Fakta vs Opini, Evaluasi Akurasi Informasi</td></tr>
          <tr><td ${tdCenter}>2</td><td ${tdStyle}><strong>Membaca & Memirsa</strong></td><td ${tdStyle}>Peserta didik mampu memahami dan mengevaluasi makna tersurat dan tersirat dari berbagai teks informasional.</td><td ${tdStyle}>Struktur Teks, Ide Pokok, Makna Kontekstual, Inferensi Kritis</td></tr>
          <tr><td ${tdCenter}>3</td><td ${tdStyle}><strong>Berbicara & Presentasi</strong></td><td ${tdStyle}>Peserta didik mampu menyajikan gagasan dan solusi perumusan masalah secara logis dan runtut.</td><td ${tdStyle}>Teknik Retorika, Argumentasi Ilmiah, Diskusi Terbuka</td></tr>
          <tr><td ${tdCenter}>4</td><td ${tdStyle}><strong>Menulis & Berkreasi</strong></td><td ${tdStyle}>Peserta didik mampu menulis gagasan tertulis secara sistematis, kreatif, dan berkaidah baku.</td><td ${tdStyle}>Teks Eksposisi, Laporan Hasil Observasi, Teks Prosedur</td></tr>
        </tbody>
      </table>
      ${ttdHtml}
    `;
  }

  if (docType === "tp") {
    return `
      ${kopHtml}
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #1a3a5c; font-size: 15pt; text-transform: uppercase;">TUJUAN PEMBELAJARAN (TP)</h2>
        <h3 style="margin: 4px 0 0 0; color: #475569; font-size: 12pt; font-weight: normal;">Kurikulum Merdeka | ${subject} | ${level}</h3>
      </div>
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:9.5pt;">
        <thead>
          <tr><th ${thStyle} style="width:5%;">No</th><th ${thStyle} style="width:15%;">Kode TP</th><th ${thStyle} style="width:18%;">Elemen</th><th ${thStyle}>Rumusan Tujuan Pembelajaran</th><th ${thStyle} style="width:10%;">Alokasi JP</th></tr>
        </thead>
        <tbody>
          <tr><td ${tdCenter}>1</td><td ${tdCenter}>${singkatanMapel}.E.01</td><td ${tdStyle}>Menyimak</td><td ${tdStyle}>Peserta didik mampu menganalisis ide pokok dan ide penjelas dari teks monolog/dialog lisan secara kritis.</td><td ${tdCenter}>12 JP</td></tr>
          <tr><td ${tdCenter}>2</td><td ${tdCenter}>${singkatanMapel}.E.02</td><td ${tdStyle}>Membaca & Memirsa</td><td ${tdStyle}>Peserta didik mampu mengevaluasi akurasi informasi dan bias sudut pandang dari teks laporan hasil observasi.</td><td ${tdCenter}>16 JP</td></tr>
          <tr><td ${tdCenter}>3</td><td ${tdCenter}>${singkatanMapel}.E.03</td><td ${tdStyle}>Membaca & Memirsa</td><td ${tdStyle}>Peserta didik mampu menginterpretasikan makna kata serapan dan istilah teknis ilmiah dalam artikel populer.</td><td ${tdCenter}>12 JP</td></tr>
          <tr><td ${tdCenter}>4</td><td ${tdCenter}>${singkatanMapel}.E.04</td><td ${tdStyle}>Berbicara</td><td ${tdStyle}>Peserta didik mampu mempresentasikan hasil analisis teks eksposisi secara runtut, logis, dan percaya diri.</td><td ${tdCenter}>16 JP</td></tr>
          <tr><td ${tdCenter}>5</td><td ${tdCenter}>${singkatanMapel}.E.05</td><td ${tdStyle}>Menulis</td><td ${tdStyle}>Peserta didik mampu menyusun draf teks laporan hasil observasi berbasis data empiris lapangan.</td><td ${tdCenter}>18 JP</td></tr>
          <tr><td ${tdCenter}>6</td><td ${tdCenter}>${singkatanMapel}.E.06</td><td ${tdStyle}>Menulis</td><td ${tdStyle}>Peserta didik mampu menyunting dan mempublikasikan karya tulis ilmiah sederhana di media sekolah.</td><td ${tdCenter}>18 JP</td></tr>
          <tr><td ${tdCenter}>7</td><td ${tdCenter}>${singkatanMapel}.E.07</td><td ${tdStyle}>Integratif</td><td ${tdStyle}>Peserta didik mampu merancang portofolio gelar karya literasi dan berpikir kritis komparatif.</td><td ${tdCenter}>16 JP</td></tr>
        </tbody>
        <tfoot>
          <tr style="background:#f1f5f9; font-weight:bold;">
            <td colspan="4" style="padding:8px; text-align:right; border:1px solid #cbd5e1;">TOTAL ALOKASI JP SATU TAHUN:</td>
            <td ${tdCenter}>${cleanTotalJpNum} JP</td>
          </tr>
        </tfoot>
      </table>
      ${ttdHtml}
    `;
  }

  // Default fallback for ATP, Prota, Prosem, KKTP
  return `
    ${kopHtml}
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="margin: 0; color: #1a3a5c; font-size: 15pt; text-transform: uppercase;">PERANGKAT ADMINISTRASI KURIKULUM MERDEKA</h2>
      <h3 style="margin: 4px 0 0 0; color: #475569; font-size: 12pt; font-weight: normal;">${subject} | ${level} | Tahun Pelajaran ${year}</h3>
    </div>
    <h3 style="color:#1a3a5c; border-bottom:2px solid #1a3a5c; padding-bottom:4px;">A. MATRIKS PROGRAM PEMBELAJARAN</h3>
    <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:9.5pt;">
      <thead>
        <tr><th ${thStyle} style="width:5%;">No</th><th ${thStyle} style="width:15%;">Kode Dokumen</th><th ${thStyle}>Tujuan Pembelajaran & Ruang Lingkup Materi</th><th ${thStyle} style="width:12%;">Alokasi JP</th><th ${thStyle} style="width:12%;">Keterangan</th></tr>
      </thead>
      <tbody>
        <tr><td ${tdCenter}>1</td><td ${tdCenter}>${singkatanMapel}-TP-01</td><td ${tdStyle}>Memahami Konsep Dasar dan Struktur Esensial Materi</td><td ${tdCenter}>24 JP</td><td ${tdCenter}>Semester 1</td></tr>
        <tr><td ${tdCenter}>2</td><td ${tdCenter}>${singkatanMapel}-TP-02</td><td ${tdStyle}>Analisis Kritis dan Penerapan Terstruktur</td><td ${tdCenter}>28 JP</td><td ${tdCenter}>Semester 1</td></tr>
        <tr><td ${tdCenter}>3</td><td ${tdCenter}>${singkatanMapel}-TP-03</td><td ${tdStyle}>Eksperimen, Unjuk Kerja, dan Kolaborasi Kelompok</td><td ${tdCenter}>28 JP</td><td ${tdCenter}>Semester 2</td></tr>
        <tr><td ${tdCenter}>4</td><td ${tdCenter}>${singkatanMapel}-TP-04</td><td ${tdStyle}>Refleksi, Portofolio Karya, dan Asesmen Akhir Fase</td><td ${tdCenter}>28 JP</td><td ${tdCenter}>Semester 2</td></tr>
      </tbody>
      <tfoot>
        <tr style="background:#f1f5f9; font-weight:bold;">
          <td colspan="3" style="padding:8px; text-align:right; border:1px solid #cbd5e1;">TOTAL ALOKASI:</td>
          <td ${tdCenter}>${cleanTotalJpNum} JP</td>
          <td ${tdCenter}>100% Tuntas</td>
        </tr>
      </tfoot>
    </table>
    ${ttdHtml}
  `;
}

export function generateModulAjarFallback(formData: any): string {
  const {
    namaGuru = "Guru Pengampu",
    namaSekolah = "SMP Negeri",
    tahunAjaran = "2026/2027",
    jenjang = "SMP",
    fase = "Fase D (Kelas 7-9)",
    kelas = "VII",
    waktu = "2 x 45 JP",
    mataPelajaran = "Informatika",
    topik = "Berpikir Komputasional dan Algoritma Dasar",
    subTopik = "Pengenalan Flowchart dan Pseudocode",
    jumlahPertemuan = "2",
    model = "Problem Based Learning (PBL)",
    tujuan = "Peserta didik mampu memahami konsep logika algoritma, menyusun flowchart terstruktur, serta memecahkan masalah komputasional sederhana."
  } = formData || {};

  const countPertemuan = Math.max(1, Math.min(5, parseInt(jumlahPertemuan) || 2));

  let pertemuanSectionsHtml = "";
  for (let i = 1; i <= countPertemuan; i++) {
    pertemuanSectionsHtml += `
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px; margin-bottom:20px;">
        <h3 style="margin:0 0 10px 0; color:#1a3a5c;">Pertemuan ${i}: Eksplorasi & Aplikasi Praktis ${topik} (Durasi: ${waktu})</h3>
        
        <h4 style="margin:8px 0 4px 0; color:#334155;">1. Kegiatan Pendahuluan (15 Menit) — Mindful Learning</h4>
        <ul style="margin:4px 0 8px 20px; padding:0; line-height:1.6;">
          <li><strong>Aktivitas Guru:</strong> Guru membuka kelas dengan salam ramah, memeriksa kehadiran, dan memandu olah napas kesadaran penuh (Mindfulness) sebelum belajar. <em>"Selamat pagi anak-anak hebat, mari kita siapkan pikiran jernih untuk mengeksplorasi ilmu baru hari ini."</em></li>
          <li><strong>Aktivitas Peserta Didik:</strong> Peserta didik menjawab salam, memusatkan fokus, dan menyimak apersepsi video/studi kasus menarik yang ditayangkan guru.</li>
          <li><strong>Apersepsi & Motivasi:</strong> Guru menyampaikan pertanyaan pemantik kontekstual mengenai penerapan ${topik} dalam kehidupan sehari-hari.</li>
        </ul>

        <h4 style="margin:8px 0 4px 0; color:#334155;">2. Kegiatan Inti (60 Menit) — Meaningful & Joyful Deep Learning (${model})</h4>
        <ul style="margin:4px 0 8px 20px; padding:0; line-height:1.6;">
          <li><strong>Fase 1 - Orientasi Masalah:</strong> Guru membagikan lembar kerja kasus nyata mengenai ${topik}. Peserta didik mengamati dan merumuskan pokok persoalan secara aktif.</li>
          <li><strong>Fase 2 - Organisasi Belajar:</strong> Peserta didik membentuk kelompok heterogen beranggotakan 4 orang, membagi peran (ketua, pencatat data, presenter, verifikator).</li>
          <li><strong>Fase 3 - Penyelidikan Terbimbing:</strong> Guru berkeliling memberikan scaffolding bagi kelompok yang membutuhkan bimbingan, mendorong nalar kritis (HOTS), dan memfasilitasi kerja tim.</li>
          <li><strong>Fase 4 - Pengembangan & Penyajian Hasil:</strong> Setiap kelompok menyusun peta konsep/solusi di LKPD dan mempresentasikannya di depan kelas dengan percaya diri.</li>
          <li><strong>Fase 5 - Evaluasi & Refleksi Bersama:</strong> Guru dan peserta didik memberikan apresiasi tepuk tangan meriah serta menyimpulkan konsep ilmiah yang benar.</li>
        </ul>

        <h4 style="margin:8px 0 4px 0; color:#334155;">3. Kegiatan Penutup (15 Menit)</h4>
        <ul style="margin:4px 0 8px 20px; padding:0; line-height:1.6;">
          <li><strong>Aktivitas Guru & Siswa:</strong> Melakukan refleksi pembelajaran 3-2-1 (3 hal dipelajari, 2 hal menarik, 1 pertanyaan yang masih ingin dieksplorasi).</li>
          <li><strong>Tindak Lanjut:</strong> Guru memberikan arahan persiapan materi pada pertemuan berikutnya dan menutup dengan doa bersama.</li>
        </ul>
      </div>
    `;
  }

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1e293b;">
      <div style="text-align: center; border-bottom: 3px double #1a3a5c; padding-bottom: 12px; margin-bottom: 24px;">
        <h1 style="margin: 0; font-size: 17pt; color: #1a3a5c; text-transform: uppercase;">MODUL AJAR DEEP LEARNING (RENCANA PEMBELAJARAN MENDALAM)</h1>
        <h3 style="margin: 4px 0 0 0; font-size: 12pt; color: #475569; font-weight: normal;">Kurikulum Merdeka | Tahun Ajaran ${tahunAjaran}</h3>
      </div>

      <h2 style="color:#1a3a5c; border-bottom:2px solid #1a3a5c; padding-bottom:4px;">A. INFORMASI UMUM</h2>
      <table style="width:100%; border-collapse:collapse; margin-bottom:24px; font-size:10pt;">
        <tr><td style="padding:8px; border:1px solid #cbd5e1; width:28%; font-weight:bold; background:#f8fafc;">Nama Satuan Pendidikan</td><td style="padding:8px; border:1px solid #cbd5e1;">${namaSekolah}</td></tr>
        <tr><td style="padding:8px; border:1px solid #cbd5e1; font-weight:bold; background:#f8fafc;">Nama Guru Penyusun</td><td style="padding:8px; border:1px solid #cbd5e1;">${namaGuru}</td></tr>
        <tr><td style="padding:8px; border:1px solid #cbd5e1; font-weight:bold; background:#f8fafc;">Tahun Ajaran / Semester</td><td style="padding:8px; border:1px solid #cbd5e1;">${tahunAjaran} / Ganjil - Genap</td></tr>
        <tr><td style="padding:8px; border:1px solid #cbd5e1; font-weight:bold; background:#f8fafc;">Jenjang / Fase / Kelas</td><td style="padding:8px; border:1px solid #cbd5e1;">${jenjang} / ${fase} / Kelas ${kelas}</td></tr>
        <tr><td style="padding:8px; border:1px solid #cbd5e1; font-weight:bold; background:#f8fafc;">Mata Pelajaran</td><td style="padding:8px; border:1px solid #cbd5e1;">${mataPelajaran}</td></tr>
        <tr><td style="padding:8px; border:1px solid #cbd5e1; font-weight:bold; background:#f8fafc;">Topik & Sub-Topik</td><td style="padding:8px; border:1px solid #cbd5e1;"><strong>${topik}</strong> ${subTopik ? `(${subTopik})` : ''}</td></tr>
        <tr><td style="padding:8px; border:1px solid #cbd5e1; font-weight:bold; background:#f8fafc;">Alokasi Waktu Total</td><td style="padding:8px; border:1px solid #cbd5e1;">${waktu} (${countPertemuan} Pertemuan)</td></tr>
        <tr><td style="padding:8px; border:1px solid #cbd5e1; font-weight:bold; background:#f8fafc;">Model Pembelajaran</td><td style="padding:8px; border:1px solid #cbd5e1;">${model} (Deep Learning Approach)</td></tr>
      </table>

      <h2 style="color:#1a3a5c; border-bottom:2px solid #1a3a5c; padding-bottom:4px;">B. TUJUAN PEMBELAJARAN</h2>
      <p style="margin-bottom:20px; font-size:10pt;">${tujuan}</p>

      <h2 style="color:#1a3a5c; border-bottom:2px solid #1a3a5c; padding-bottom:4px;">C. KERANGKA DESAIN PEMBELAJARAN MENDALAM (DEEP LEARNING)</h2>
      <table style="width:100%; border-collapse:collapse; margin-bottom:24px; font-size:9.5pt;">
        <thead>
          <tr><th style="padding:8px; border:1px solid #cbd5e1; background:#1a3a5c; color:#fff; width:30%;">Dimensi Pedagogis</th><th style="padding:8px; border:1px solid #cbd5e1; background:#1a3a5c; color:#fff;">Penerapan Strategis di Kelas</th></tr>
        </thead>
        <tbody>
          <tr><td style="padding:8px; border:1px solid #cbd5e1; font-weight:bold;">Praktik Pedagogis</td><td style="padding:8px; border:1px solid #cbd5e1;">Pendekatan 3 Pilar: <strong>Memahami (Mindful)</strong>, <strong>Mengaplikasi (Meaningful)</strong>, dan <strong>Merefleksi (Joyful)</strong>.</td></tr>
          <tr><td style="padding:8px; border:1px solid #cbd5e1; font-weight:bold;">Kemitraan Belajar</td><td style="padding:8px; border:1px solid #cbd5e1;">Kolaborasi kelompok sebaya (Peer Tutoring) dan interaksi dialogis apresiatif guru-murid.</td></tr>
          <tr><td style="padding:8px; border:1px solid #cbd5e1; font-weight:bold;">Lingkungan Belajar</td><td style="padding:8px; border:1px solid #cbd5e1;">Suasana kelas psikologis aman, bebas perundungan, dan menumbuhkan rasa ingin tahu tinggi.</td></tr>
          <tr><td style="padding:8px; border:1px solid #cbd5e1; font-weight:bold;">Pemanfaatan Digital</td><td style="padding:8px; border:1px solid #cbd5e1;">Integrasi simulasi interaktif, media visual edukasi, dan asesmen kuis digital.</td></tr>
        </tbody>
      </table>

      <h2 style="color:#1a3a5c; border-bottom:2px solid #1a3a5c; padding-bottom:4px;">D. SKENARIO PENGALAMAN BELAJAR PERTEMUAN</h2>
      <p style="font-style:italic; font-size:9pt; color:#64748b; margin-bottom:14px;">(Disusun terstruktur tanpa tabel dengan rincian langkah konkret guru dan peserta didik)</p>
      ${pertemuanSectionsHtml}

      <h2 style="color:#1a3a5c; border-bottom:2px solid #1a3a5c; padding-bottom:4px;">E. LEMBAR KERJA PESERTA DIDIK (LKPD) SIAP PAKAI</h2>
      <div style="border:1px solid #cbd5e1; border-radius:8px; padding:16px; margin-bottom:24px; background:#fff;">
        <h4 style="margin:0 0 8px 0; text-align:center; color:#1a3a5c;">LEMBAR KERJA PESERTA DIDIK (LKPD)</h4>
        <p style="margin:0; font-size:9pt; text-align:center;">Mata Pelajaran: ${mataPelajaran} | Kelas: ${kelas} | Topik: ${topik}</p>
        <hr style="margin:10px 0; border:0; border-top:1px dashed #cbd5e1;">
        <p style="font-size:9pt;"><strong>Nama Kelompok:</strong> ..................................................... <strong>Anggota:</strong> 1. .................... 2. .................... 3. ....................</p>
        <p style="font-size:9.5pt; font-weight:bold; margin-top:12px;">Studi Kasus & Instruksi Analisis:</p>
        <ol style="font-size:9.5pt; line-height:1.6; margin-left:20px;">
          <li>Uraikan konsep dasar mengenai <strong>${topik}</strong> menurut hasil diskusi kelompokmu!</li>
          <li>Identifikasi 2 contoh permasalahan nyata di sekitarmu yang dapat diselesaikan dengan konsep ini!</li>
          <li>Susunlah bagan alur/diagram solusi langkah demi langkah secara sistematis pada ruang kosong di bawah!</li>
        </ol>
        <div style="height:120px; border:1px solid #cbd5e1; border-radius:4px; margin-top:10px; background:#f8fafc; padding:8px; color:#94a3b8; font-size:8.5pt;">
          [ Area Pengerjaan & Bagan Solusi Kelompok ]
        </div>
      </div>

      <h2 style="color:#1a3a5c; border-bottom:2px solid #1a3a5c; padding-bottom:4px;">F. ASESMEN & RUBRIK EVALUASI</h2>
      <table style="width:100%; border-collapse:collapse; margin-bottom:24px; font-size:9pt;">
        <thead>
          <tr>
            <th style="padding:8px; border:1px solid #cbd5e1; background:#1a3a5c; color:#fff; width:20%;">Aspek</th>
            <th style="padding:8px; border:1px solid #cbd5e1; background:#1a3a5c; color:#fff;">Belum Berkembang (1)</th>
            <th style="padding:8px; border:1px solid #cbd5e1; background:#1a3a5c; color:#fff;">Layak / Standar (2)</th>
            <th style="padding:8px; border:1px solid #cbd5e1; background:#1a3a5c; color:#fff;">Mahir / Sangat Baik (3)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:8px; border:1px solid #cbd5e1; font-weight:bold;">Pengetahuan Konsep</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">Perlu bantuan guru memahami istilah inti.</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">Mampu menjelaskan definisi dan aturan dasar.</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">Mampu menganalisis kasus kompleks & solutif.</td>
          </tr>
          <tr>
            <td style="padding:8px; border:1px solid #cbd5e1; font-weight:bold;">Keterampilan Kerja</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">Bagan kerja belum tersusun runtut.</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">Bagan kerja lengkap dan logis.</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">Bagan kerja sangat rapi, efisien, dan inovatif.</td>
          </tr>
          <tr>
            <td style="padding:8px; border:1px solid #cbd5e1; font-weight:bold;">Sikap Kolaboratif</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">Pasif dalam diskusi kelompok.</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">Aktif memberikan pendapat dan mendengarkan.</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">Memimpin tim dengan santun dan apresiatif.</td>
          </tr>
        </tbody>
      </table>

      <div style="text-align: center; margin-top: 30px; font-size: 9pt; color: #64748b;">
        Dokumen Modul Ajar Deep Learning Kurikulum Merdeka &copy; ${namaSekolah} - Disusun oleh ${namaGuru}
      </div>
    </div>
  `;
}

export function generateChatAssistantFallback(message: string, context: any): string {
  const q = (message || "").toLowerCase();
  const guru = context?.guru ? `Bapak/Ibu ${context.guru}` : "Bapak/Ibu Guru";

  if (q.includes("hots") || q.includes("soal")) {
    return `Halo ${guru}! Berikut 5 contoh soal tipe HOTS (Higher Order Thinking Skills) pilihan ganda lengkap dengan kunci jawaban dan pembahasannya:

1. **Soal 1 (C4 - Analisis):**
   *Stimulus:* Sebuah ekosistem sawah mengalami penurunan populasi ular secara drastis akibat perburuan liar. Dampak ekologis langsung yang paling mungkin terjadi adalah...
   A. Populasi elang meningkat pesat
   B. Populasi tikus meningkat drastis sehingga merusak panen padi
   C. Populasi padi bertambah subur
   D. Populasi katak langsung punah
   *Kunci Jawaban:* **B**
   *Pembahasan:* Ular merupakan predator alami tikus. Hilangnya predator puncak sekunder mengakibatkan lonjakan populasi hama tikus.

2. **Soal 2 (C5 - Evaluasi):**
   *Stimulus:* Dua kelompok siswa merancang program hemat energi madrasah. Kelompok A memilih mematikan seluruh AC, sedangkan Kelompok B memilih mengganti lampu pijar ke LED sensor gerak dan membersihkan ventilasi. Manakah strategi yang lebih berkelanjutan?
   A. Kelompok A karena langsung memangkas daya terbesar
   B. Kelompok B karena mempertahankan kenyamanan belajar sekaligus menghemat daya jangka panjang
   C. Keduanya sama-sama tidak efektif
   D. Kelompok A karena tidak memerlukan biaya modal awal
   *Kunci Jawaban:* **B**
   *Pembahasan:* Efisiensi energi berkelanjutan harus menyeimbangkan penghematan daya dengan ergonomi ruang belajar.

3. **Soal 3 (C6 - Kreasi Solusi):**
   *Stimulus:* Di era digital, informasi hoaks sering menyebar cepat di grup media sosial. Langkah paling bijak seorang pelajar sebelum membagikan ulang berita adalah...
   A. Langsung menyebarkan jika judulnya menarik
   B. Melakukan uji silang sumber kredibel (Fact Checking) dan memverifikasi keabsahan data
   C. Mengubah kata-katanya agar terlihat lebih menarik
   D. Membagikan hanya ke teman dekat
   *Kunci Jawaban:* **B**
   *Pembahasan:* Keterampilan literasi digital menuntut verifikasi data dan nalar kritis sebelum diseminasi informasi.

4. **Soal 4 (C4 - Pola & Logika):**
   *Kunci Jawaban:* Analisis perbandingan data grafik kinerja dan kesimpulan logis.
5. **Soal 5 (C5 - Pemecahan Masalah Kontekstual):**
   *Kunci Jawaban:* Penerapan metode ilmiah dalam mengatasi pencemaran air lingkungan sekitar.

Semoga membantu persiapan asesmen formatif/sumatif kelas Bapak/Ibu! Ada yang ingin dimodifikasi?`;
  }

  if (q.includes("wa") || q.includes("whatsapp") || q.includes("orang tua") || q.includes("wali murid")) {
    return `Halo ${guru}! Berikut rekomendasi draft pesan WhatsApp santun, profesional, dan empatik untuk orang tua murid:

---
**Pilihan 1: Pesan Pemantauan Kehadiran / Kedisiplinan**
*Assalamu’alaikum Warahmatullahi Wabarakatuh / Selamat Pagi Bapak/Ibu Wali dari Ananda [Nama Siswa],*

Semoga Bapak/Ibu sekeluarga senantiasa sehat wal'afiat.

Perkenankan saya, [Nama Guru], selaku wali kelas/guru pengampu ananda di [Nama Sekolah]. Kami ingin menginformasikan bahwa dalam beberapa hari terakhir ananda belum dapat hadir di kelas / tampak kurang bersemangat.

Apakah ananda dalam keadaan sehat di rumah? Kami siap berdiskusi bersama Bapak/Ibu sekiranya ada hal yang dapat kami dukung agar ananda dapat kembali belajar dengan ceria dan optimal di sekolah.

Terima kasih banyak atas perhatian dan kerja sama yang baik dari Bapak/Ibu.

*Wassalamu’alaikum Warahmatullahi Wabarakatuh.*
---

**Pilihan 2: Apresiasi Perkembangan Positif Siswa**
*Assalamu’alaikum Warahmatullahi Wabarakatuh Bapak/Ibu Wali dari [Nama Siswa],*
Kami ingin mengabarkan bahwa minggu ini Ananda [Nama Siswa] menunjukkan kemajuan yang luar biasa dalam keaktifan belajar dan kerja sama kelompok di kelas. Terima kasih banyak atas bimbingan penuh kasih sayang Bapak/Ibu di rumah. Terus kita dukung ananda bersama-sama nggih.*`;
  }

  if (q.includes("rapor") || q.includes("catatan wali") || q.includes("evaluasi")) {
    return `Halo ${guru}! Berikut contoh kalimat catatan wali kelas untuk rapor yang membangun dan memotivasi siswa:

1. **Untuk Siswa Berprestasi / Aktif:**
   *"Selamat atas pencapaian luar biasa ananda di semester ini. Daya nalar kritis, sopan santun (Ta'addub), dan jiwa kepemimpinanmu sangat membanggakan. Pertahankan semangat belajar dan teruslah menjadi inspirasi kebaikan bagi sesama."*

2. **Untuk Siswa yang Berkembang Baik & Perlu Dorongan Percaya Diri:**
   *"Ananda memiliki potensi besar dan daya serap materi yang sangat baik. Tingkatkan lagi rasa percaya diri saat mengemukakan pendapat di depan umum. Bapak/Ibu guru yakin ananda mampu meraih prestasi yang lebih gemilang."*

3. **Untuk Siswa yang Membutuhkan Peningkatan Kedisiplinan / Fokus:**
   *"Ananda adalah anak yang cerdas dan berhati baik. Dengan meningkatkan manajemen waktu dan fokus saat KBM, ananda pasti dapat menguasai setiap pelajaran dengan jauh lebih mudah dan menyenangkan. Semangat selalu!"*`;
  }

  if (q.includes("diferensiasi") || q.includes("metode") || q.includes("kreatif")) {
    return `Halo ${guru}! Berikut 3 ide aktivitas pembelajaran berdiferensiasi yang interaktif dan menyenangkan untuk diterapkan di kelas:

1. **Stasiun Belajar Berdiferensiasi (Learning Stations):**
   Bagi kelas menjadi 3 zona minat/modalitas:
   - *Zona Visual/Membaca:* Mengkaji infografik atau diagram konsep.
   - *Zona Auditori/Video:* Menyimak podcast/video animasi penjelasan kasus.
   - *Zona Kinestetik/Eksperimen:* Menyusun kartu alur logika / manipulatif alat peraga.
   Siswa berotasi atau memilih stasiun sesuai kesiapan belajarnya.

2. **Papan Pilihan Menu Tugas (Tic-Tac-Toe Menu Board):**
   Sediakan matriks 9 pilihan bentuk produk tugas (membuat poster, menulis cerpen, membuat video rekaman singkat, podcast mini, peta konsep). Siswa bebas memilih 3 opsi sejajar sesuai minatnya.

3. **Tutor Sebaya Jigsaw Interaktif:**
   Bagi materi menjadi beberapa sub-topik. Setiap kelompok ahli mendalami satu sub-topik lalu kembali ke kelompok asal untuk mengajarkan rekan-rekannya secara gotong royong.`;
  }

  // Generic contextual assistant reply
  return `Halo ${guru}! Saya EdAdmin AI Assistant siap mendampingi seluruh kebutuhan administrasi dan inovasi pembelajaran Bapak/Ibu di ${context?.sekolah || "sekolah/madrasah"}.

Terkait: *"${message}"*

Berikut rekomendasi solusi terstruktur:
1. **Analisis Kebutuhan:** Pastikan tujuan pembelajaran terumuskan dengan indikator terukur (prinsip ABCD dan KKO Taksonomi Bloom / Kurikulum Merdeka).
2. **Implementasi Kelas:** Gunakan pendekatan pembelajaran bermakna (Meaningful Learning) dengan mengaitkan materi ke fenomena nyata di sekitar peserta didik.
3. **Penguatan Karakter:** Integrasikan nilai keteladanan (Qudwah), kemandirian, dan adab sopan santun dalam setiap interaksi belajar.

Silakan beri tahu saya jika Bapak/Ibu membutuhkan draf RPP/Modul, contoh soal HOTS, atau templat dokumen administrasi lainnya!`;
}
