import { TpType, AtpType } from "./kbcSchemas";

export const normalizeTpData = (rawTpJson: TpType, formData: any): TpType => {
  if (!rawTpJson || !rawTpJson.daftarTp || !Array.isArray(rawTpJson.daftarTp)) {
    return rawTpJson;
  }

  const prefix = formData.singkatanMapel || "MAPEL";
  const level = formData.level || "Fase";
  const totalJpInput = formData.totalJp || 0;

  // Hitung total JP yang diberikan AI
  let currentTotalJp = 0;
  rawTpJson.daftarTp.forEach(tp => {
    currentTotalJp += (tp.alokasiJp || 0);
  });

  // Jika currentTotalJp 0, fallback supaya tidak dibagi nol
  if (currentTotalJp === 0) {
    currentTotalJp = 1;
    rawTpJson.daftarTp.forEach(tp => tp.alokasiJp = 1);
  }

  let accumulatedNormalizedJp = 0;
  
  const normalizedDaftarTp = rawTpJson.daftarTp.map((tp, index) => {
    // Determinisik Kode TP
    const cleanElemen = tp.elemen.substring(0, 3).toUpperCase(); 
    const generatedKode = `${prefix}-${level}-${cleanElemen}-${(index + 1).toString().padStart(3, '0')}`;
    
    // Normalisasi Alokasi JP proporsional terhadap totalJp dari Form
    let normalizedJp = 0;
    if (totalJpInput > 0) {
      if (index === rawTpJson.daftarTp.length - 1) {
        // Elemen terakhir mengambil sisa pembulatan
        normalizedJp = totalJpInput - accumulatedNormalizedJp;
      } else {
        normalizedJp = Math.round((tp.alokasiJp / currentTotalJp) * totalJpInput);
        accumulatedNormalizedJp += normalizedJp;
      }
    } else {
      normalizedJp = tp.alokasiJp; // Fallback jika tidak ada totalJp
    }

    return {
      ...tp,
      kodeTp: generatedKode,
      alokasiJp: normalizedJp
    };
  });

  return { ...rawTpJson, daftarTp: normalizedDaftarTp };
};

export const normalizeAtpData = (rawAtpJson: AtpType, formData: any, tpData: TpType | null): AtpType => {
  if (!rawAtpJson || !rawAtpJson.alur || !Array.isArray(rawAtpJson.alur)) {
    return rawAtpJson;
  }
  
  const totalJpInput = formData.totalJp || 0;
  const targetJpPerSemester = Math.ceil(totalJpInput / 2); // Asumsi 2 semester berimbang

  let accumulatedJp = 0;

  const normalizedAlur = rawAtpJson.alur.map((atp, index) => {
    // Sinkronisasi data dari tpData jika ada
    let realJp = atp.alokasiJp || 0;
    let finalKodeTp = atp.kodeTp;
    
    // Coba temukan TP ini di tpData berdasarkan rumusanTp atau urutan
    if (tpData && tpData.daftarTp) {
      const matchTp = tpData.daftarTp.find(t => t.rumusanTp.includes(atp.rumusanTp.substring(0, 20))) 
        || tpData.daftarTp[index];
      
      if (matchTp) {
        realJp = matchTp.alokasiJp;
        finalKodeTp = matchTp.kodeTp;
      }
    }

    accumulatedJp += realJp;
    
    // Deterministic Semester Placement
    let semester = 1;
    if (accumulatedJp > targetJpPerSemester) {
      semester = 2;
    }

    return {
      ...atp,
      kodeTp: finalKodeTp,
      alokasiJp: realJp,
      semester: semester
    };
  });

  return { ...rawAtpJson, alur: normalizedAlur };
};
