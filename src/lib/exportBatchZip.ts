import JSZip from "jszip";

export interface ExportFile {
  filename: string;
  content: string;
  folder: "admin" | "modul";
}

/**
 * Export multiple pre-rendered HTML documents as a single ZIP file containing .doc files
 */
export async function exportDocumentsAsZip(
  files: ExportFile[],
  zipFilename: string = "Perangkat_KBC_Export.zip"
): Promise<void> {
  if (files.length === 0) {
    throw new Error("Tidak ada dokumen untuk diunduh");
  }

  const zip = new JSZip();

  // Create folders for organization
  const adminFolder = zip.folder("1_Administrasi");
  const modulFolder = zip.folder("2_Modul_Ajar");

  for (const file of files) {
    const safeName = sanitizeFilename(file.filename);
    const targetFolder = file.folder === "modul" ? modulFolder : adminFolder;
    
    if (targetFolder) {
      targetFolder.file(`${safeName}.doc`, file.content);
    }
  }

  // Generate ZIP blob
  const blob = await zip.generateAsync({ type: "blob" });

  // Trigger download
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = zipFilename;
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
