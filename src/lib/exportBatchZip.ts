import JSZip from "jszip";
import { PerangkatDoc } from "../types";

/**
 * Export multiple documents as a single ZIP file
 */
export async function exportDocumentsAsZip(
  docs: PerangkatDoc[],
  filename: string = "Perangkat_KBC_Export.zip"
): Promise<void> {
  if (docs.length === 0) {
    throw new Error("Tidak ada dokumen untuk diunduh");
  }

  const zip = new JSZip();

  // Create folders for organization
  const adminFolder = zip.folder("1_Administrasi");
  const modulFolder = zip.folder("2_Modul_Ajar");

  for (const doc of docs) {
    const docTitle = sanitizeFilename(doc.docTitle);
    const content = generateDocumentHTML(doc);
    
    // Categorize documents
    const isModulDoc = 
      doc.docType === "modul_ajar_umum" ||
      doc.docType.startsWith("modul_ajar_meeting_") ||
      doc.docType === "lkpd" ||
      doc.docType === "rubrik";

    const targetFolder = isModulDoc ? modulFolder : adminFolder;
    
    if (targetFolder) {
      targetFolder.file(`${docTitle}.html`, content);
    }
  }

  // Generate ZIP blob
  const blob = await zip.generateAsync({ type: "blob" });

  // Trigger download
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Sanitize filename for safe file system usage
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 100);
}

/**
 * Generate HTML content for a document
 */
function generateDocumentHTML(doc: PerangkatDoc): string {
  // Basic HTML wrapper for the document
  // This would need renderer integration for proper formatting
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${doc.docTitle}</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      margin: 2cm;
      color: #000;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 1em 0;
    }
    th, td { 
      border: 1px solid #333; 
      padding: 8px; 
      text-align: left;
    }
    th { 
      background: #1a3a5c; 
      color: white; 
      font-weight: bold;
    }
    h1, h2, h3 { color: #1a3a5c; }
  </style>
</head>
<body>
  <h1>${doc.docTitle}</h1>
  <p><strong>Sekolah:</strong> ${doc.schoolName}</p>
  <p><strong>Mata Pelajaran:</strong> ${doc.subject}</p>
  <p><strong>Dibuat:</strong> ${new Date(doc.createdAt).toLocaleString('id-ID')}</p>
  <hr>
  <pre>${JSON.stringify(doc.data, null, 2)}</pre>
</body>
</html>
  `.trim();
}

/**
 * Export all 9 main document types
 */
export async function exportAll9Documents(
  allDocs: PerangkatDoc[]
): Promise<void> {
  const mainTypes = [
    "analisis_cp",
    "tp",
    "atp",
    "prota",
    "prosem",
    "kktp",
    "modul_ajar_umum",
    "lkpd",
    "rubrik"
  ];

  // Get latest document for each type
  const docsToExport: PerangkatDoc[] = [];
  for (const type of mainTypes) {
    const latestDoc = allDocs
      .filter(d => d.docType === type)
      .sort((a, b) => b.createdAt - a.createdAt)[0];
    
    if (latestDoc) {
      docsToExport.push(latestDoc);
    }
  }

  // Also include all meeting docs for the latest modul_ajar
  const modulMeetings = allDocs.filter(d => 
    d.docType.startsWith("modul_ajar_meeting_")
  );
  docsToExport.push(...modulMeetings);

  const timestamp = new Date().toISOString().slice(0, 10);
  await exportDocumentsAsZip(
    docsToExport,
    `Perangkat_KBC_Lengkap_${timestamp}.zip`
  );
}
