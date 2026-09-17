// Simulasi parseAtomicTopics dengan teks CP yang persis sama dari user
const cpText = "Tajwid : Menerapkan hukum bacaan kalkalah, mad tabi\u2019i, izhar halqi, ikhfa\u2019 hakiki, idgam bigunnah, idgam bilagunnah, dan iqlab sebagai bekal dalam praktik membaca Al-Qur\u2019an dengan baik dan benar.Al-Qur\u2019an : Menghafal dan menulis surah-surah pendek/pilihan; menjelaskan arti dan isi kandungannya agar dapat menerapkan dalam kehidupan sehari-hari.Hadis : Menghafal dan menulis hadis tentang salat berjemaah, persaudaraan, takwa, niat, dan silaturahmi, menjelaskan arti serta isi kandungannya, agar dapat menerapkan dalam kehidupan sehari-hari.";

console.log("=== INPUT CP TEXT ===");
console.log(cpText);
console.log("");

// ---- PARSER (versi terbaru dari geminiClient.ts) ----
function parseAtomicTopics(cpText) {
  const result = [];
  
  // Step 1: Sisipkan newline - FIXED: handle Unicode apostrophe \u2018\u2019
  const normalized = cpText
    .replace(/\.([A-Z][A-Za-z'\u2018\u2019\-]*(?:\s+[A-Za-z'\u2018\u2019\-]+)?\s*:)/g, '.\n$1')
    .trim();
  
  console.log("=== AFTER NORMALIZATION (newlines injected) ===");
  console.log(normalized);
  console.log("");
  
  // Step 2: Split per baris
  const lines = normalized.split('\n').map(l => l.trim()).filter(l => l.length > 3);
  
  console.log("=== LINES DETECTED ===");
  lines.forEach((l, i) => console.log(`Line ${i+1}: ${l.substring(0, 80)}...`));
  console.log("");
  
  lines.forEach((line, lineIdx) => {
    // Cari pola "NamaElemen : konten"
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) {
      console.log(`Line ${lineIdx+1}: No colon found, skipping`);
      return;
    }
    
    const potentialElemen = line.substring(0, colonIdx).trim();
    if (potentialElemen.length < 2 || potentialElemen.length > 30) {
      console.log(`Line ${lineIdx+1}: Elemen name invalid length (${potentialElemen.length}): "${potentialElemen}", skipping`);
      return;
    }
    
    const elemenName = potentialElemen;
    let content = line.substring(colonIdx + 1).trim();
    
    console.log(`--- Processing Elemen: "${elemenName}" ---`);
    console.log(`Raw content: ${content.substring(0, 100)}...`);
    
    // Step 3: Normalisasi "dan X" → ", X"
    const beforeDan = content;
    content = content.replace(/\s+dan\s+(?=[A-Za-z'"\u2018\u2019])/g, ', ');
    if (beforeDan !== content) {
      console.log(`After "dan" normalization: ${content.substring(0, 100)}...`);
    }
    
    // Step 4: Split per koma dan titik koma
    const parts = content.split(/[,;]\s*/);
    console.log(`Split into ${parts.length} parts`);
    
    parts.forEach((part, i) => {
      let clean = part
        .replace(/\s*(sebagai bekal|agar dapat|dalam kehidupan|menjelaskan arti serta|untuk menerapkan|sehingga mampu|dalam praktik membaca|dengan baik)\b.*/i, '')
        .replace(/^[\d\.\-\u2013\u2014\s]+/, '')
        .replace(/\.$/, '')
        .trim();
      
      const filtered = clean.length < 4 || /^(murid|siswa|peserta didik|mereka|ia|dengan|benar|baik|serta|isi|dan|atau)\b/i.test(clean);
      
      console.log(`  Part ${i+1}: raw="${part.substring(0,40)}" → clean="${clean}" → ${filtered ? 'FILTERED' : 'ADDED'}`);
      
      if (!filtered) {
        result.push({ elemen: elemenName, topik: clean });
      }
    });
    console.log("");
  });
  
  return result;
}

const atomicTopics = parseAtomicTopics(cpText);

console.log("=== FINAL RESULT ===");
console.log(`Total atomic topics: ${atomicTopics.length}`);
atomicTopics.forEach((t, i) => {
  console.log(`${i+1}. [${t.elemen}] ${t.topik}`);
});
