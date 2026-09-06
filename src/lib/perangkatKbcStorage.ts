import { saveDocument, subscribeCollection, deleteDocument, COLLECTIONS } from "./firebase";
import { PerangkatDoc } from "../types";

/**
 * Generate unique document ID with timestamp
 */
function generateDocId(docType: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${docType}_${timestamp}`;
}

/**
 * Get human-readable title for document type
 */
function getDocTitle(docType: string, formData: any): string {
  const typeMap: Record<string, string> = {
    analisis_cp: "Analisis CP",
    tp: "Tujuan Pembelajaran",
    atp: "Alur Tujuan Pembelajaran",
    prota: "Program Tahunan",
    prosem: "Program Semester",
    kktp: "KKTP",
    modul_ajar_umum: "Modul Ajar",
    lkpd: "LKPD",
    rubrik: "Rubrik Penilaian"
  };
  
  // Handle meeting docs
  if (docType.startsWith("modul_ajar_meeting_")) {
    const meetingNum = docType.split("_")[3];
    return `Modul Ajar - Pertemuan ${meetingNum}`;
  }
  
  const baseTitle = typeMap[docType] || docType;
  const subject = formData.subject || formData.mataPelajaran || "";
  
  return subject ? `${baseTitle} - ${subject}` : baseTitle;
}

/**
 * Generate unique share token for document
 */
function generateShareToken(docId: string): string {
  // Simple hash: base64 encode with timestamp salt
  const salt = Date.now().toString(36);
  const combined = `${docId}_${salt}`;
  return btoa(combined).replace(/[+/=]/g, '').slice(0, 16);
}

/**
 * Save generated document to Firestore
 */
export async function saveGeneratedDoc(
  docType: string,
  data: any,
  formData: any,
  username: string = "anonim"
): Promise<string> {
  const docId = generateDocId(docType);
  const shareToken = generateShareToken(docId);
  
  const doc: Omit<PerangkatDoc, 'id'> = {
    docType,
    docTitle: getDocTitle(docType, formData),
    data,
    formData,
    createdAt: Date.now(),
    createdBy: username,
    schoolName: formData.schoolName || formData.namaSekolah || "",
    subject: formData.subject || formData.mataPelajaran || "",
    shareToken
  };
  
  await saveDocument(COLLECTIONS.PERANGKAT_KBC, docId, doc);
  return docId;
}

/**
 * Subscribe to all documents in Perangkat KBC collection
 */
export function subscribePerangkatDocs(callback: (docs: PerangkatDoc[]) => void) {
  return subscribeCollection<PerangkatDoc>(COLLECTIONS.PERANGKAT_KBC, (docs) => {
    // Sort by createdAt descending (newest first)
    const sorted = [...docs].sort((a, b) => b.createdAt - a.createdAt);
    callback(sorted);
  });
}

/**
 * Delete a document from Firestore
 */
export async function deletePerangkatDoc(docId: string): Promise<void> {
  await deleteDocument(COLLECTIONS.PERANGKAT_KBC, docId);
}

/**
 * Get single document by share token
 */
export async function getDocByShareToken(token: string): Promise<PerangkatDoc | null> {
  // This will require a query - for now return null, implement later with full Firestore query
  // TODO: Implement Firestore query by shareToken field
  console.warn("getDocByShareToken not yet implemented - requires Firestore query");
  return null;
}
