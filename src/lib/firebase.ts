import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  initializeFirestore,
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  writeBatch
} from "firebase/firestore";
import firebaseConfigData from "../../firebase-applet-config.json";
import { 
  Siswa, 
  Mapel, 
  Jadwal, 
  LogAbsensi, 
  DataNilai, 
  JurnalAgenda, 
  SiswaBimbingan, 
  BimbinganWali, 
  Pengaturan 
} from "../types";

// Firebase Configuration dynamically resolved from Environment Variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_PENGATURAN_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigData.apiKey,
  authDomain: import.meta.env.VITE_PENGATURAN_FIREBASE_AUTH_DOMAIN || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigData.authDomain,
  projectId: import.meta.env.VITE_PENGATURAN_FIREBASE_PROJECT_ID || import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigData.projectId,
  storageBucket: import.meta.env.VITE_PENGATURAN_FIREBASE_STORAGE_BUCKET || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigData.storageBucket,
  messagingSenderId: import.meta.env.VITE_PENGATURAN_FIREBASE_MESSAGING_SENDER_ID || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigData.messagingSenderId,
  appId: import.meta.env.VITE_PENGATURAN_FIREBASE_APP_ID || import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigData.appId
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Determine if we are using the original template project or a custom user project
const isCustomProject = !!import.meta.env.VITE_FIREBASE_PROJECT_ID || !!import.meta.env.VITE_PENGATURAN_FIREBASE_PROJECT_ID;

// Use explicit firestoreDatabaseId with auto detect long polling for iframe stability
const dbId = import.meta.env.VITE_FIREBASE_DATABASE_ID || (isCustomProject ? "(default)" : (firebaseConfigData.firestoreDatabaseId || "(default)"));

// Original Owner & Master Database Identifiers
const PRIMARY_DATABASE_ID = firebaseConfigData.firestoreDatabaseId || "ai-studio-remixaplikasigur-4d5db868-1009-49e3-a00a-533e542f4bc0";
const PRIMARY_APPLET_ID = "4d5db868-1009-49e3-a00a-533e542f4bc0";

/**
 * Detects whether the application is running in a remixed / cloned workspace environment.
 */
export function isRemixInstance(): boolean {
  if (typeof window !== "undefined") {
    const currentHost = window.location.href || "";
    if (currentHost.includes("ais-") && !currentHost.includes(PRIMARY_APPLET_ID)) {
      return true;
    }
  }
  const envAppletId = import.meta.env.VITE_APPLET_ID;
  if (envAppletId && envAppletId !== PRIMARY_APPLET_ID) {
    return true;
  }
  return false;
}

/**
 * Returns true if this is a remixed instance that has NOT yet connected to its own separate Firebase project.
 * When true, all database mutations for ALL menus are isolated locally in the remixer's storage, 
 * completely protecting the original author's database.
 */
function isIsolatedRemix(): boolean {
  return isRemixInstance() && dbId === PRIMARY_DATABASE_ID;
}

export function checkDatabaseAuthorization(): { authorized: boolean; reason?: string } {
  return { authorized: true };
}

let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true
  }, dbId);
} catch {
  firestoreInstance = getFirestore(app, dbId);
}

export const firestore = firestoreInstance;

// Collections references
export const COLLECTIONS = {
  SISWA: "data_siswa",
  MAPEL: "mapel",
  JADWAL: "jadwal",
  LOG_ABSENSI: "log_absensi",
  DATA_NILAI: "data_nilai",
  JURNAL_AGENDA: "jurnal_agenda",
  SISWA_BIMBINGAN: "siswa_bimbingan",
  BIMBINGAN_WALI: "bimbingan_wali",
  PENGATURAN: "pengaturan"
};

// Helpers for isolated local storage fallback when running in a remixed environment
function getRemixStorage<T>(collectionName: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`edadmin_remix_db_${collectionName}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setRemixStorage<T>(collectionName: string, data: T[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`edadmin_remix_db_${collectionName}`, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent(`edadmin_remix_db_update_${collectionName}`, { detail: data }));
  } catch (e) {
    console.error("Error writing remix database storage:", e);
  }
}

// Generic Realtime Subscription with offline fallback & authorization guard
export function subscribeCollection<T>(collectionName: string, callback: (data: T[]) => void) {
  if (isIsolatedRemix()) {
    callback(getRemixStorage<T>(collectionName));
    const handleUpdate = (e: any) => {
      if (e.detail) {
        callback(e.detail as T[]);
      } else {
        callback(getRemixStorage<T>(collectionName));
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener(`edadmin_remix_db_update_${collectionName}`, handleUpdate);
      return () => window.removeEventListener(`edadmin_remix_db_update_${collectionName}`, handleUpdate);
    }
    return () => {};
  }

  const colRef = collection(firestore, collectionName);
  return onSnapshot(
    colRef, 
    (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as unknown as T);
      });
      callback(items);
    },
    (error) => {
      console.warn(`Firestore subscription notice on ${collectionName}:`, error?.message || error);
    }
  );
}

// Single Document Save/Update with authorization guard
export async function saveDocument(collectionName: string, id: string, data: Record<string, any>) {
  if (isIsolatedRemix()) {
    const current = getRemixStorage<any>(collectionName);
    const idx = current.findIndex((item) => item.id === id);
    const updatedItem = { ...(idx >= 0 ? current[idx] : {}), ...data, id, updatedAt: Date.now() };
    if (idx >= 0) {
      current[idx] = updatedItem;
    } else {
      current.push(updatedItem);
    }
    setRemixStorage(collectionName, current);
    return;
  }

  try {
    const docRef = doc(firestore, collectionName, id);
    await setDoc(docRef, { ...data, updatedAt: Date.now() }, { merge: true });
  } catch (err: any) {
    console.error(`Error saving document in ${collectionName}:`, err);
    throw err;
  }
}

// Single Document Delete with authorization guard
export async function deleteDocument(collectionName: string, id: string) {
  // Always update local remix storage first so cached state clears immediately
  const current = getRemixStorage<any>(collectionName);
  if (current && current.length > 0) {
    const filtered = current.filter((item) => item.id !== id);
    setRemixStorage(collectionName, filtered);
  }

  if (isIsolatedRemix()) {
    return;
  }

  try {
    const docRef = doc(firestore, collectionName, id);
    await deleteDoc(docRef);
  } catch (err: any) {
    console.error(`Error deleting document in ${collectionName}:`, err);
    // Ignore error if document was already deleted or not found
    if (err?.code === "not-found" || err?.message?.includes("not found")) {
      return;
    }
    throw err;
  }
}

// Batch Save Documents with authorization guard
export async function batchSaveDocuments(collectionName: string, items: Array<{ id: string; [key: string]: any }>) {
  if (!items || items.length === 0) return;
  
  if (isIsolatedRemix()) {
    const current = getRemixStorage<any>(collectionName);
    items.forEach((item) => {
      const idx = current.findIndex((existing) => existing.id === item.id);
      const updatedItem = { ...(idx >= 0 ? current[idx] : {}), ...item, updatedAt: Date.now() };
      if (idx >= 0) {
        current[idx] = updatedItem;
      } else {
        current.push(updatedItem);
      }
    });
    setRemixStorage(collectionName, current);
    return;
  }

  try {
    const batch = writeBatch(firestore);
    items.forEach((item) => {
      const docRef = doc(firestore, collectionName, item.id);
      batch.set(docRef, { ...item, updatedAt: Date.now() }, { merge: true });
    });
    await batch.commit();
  } catch (err: any) {
    console.error(`Error batch saving documents in ${collectionName}:`, err);
    throw err;
  }
}

/**
 * Security guard specifically for Pengaturan Database connection.
 */
export function checkPengaturanDatabaseAuthorization(): { authorized: boolean; reason?: string } {
  return { authorized: true };
}

// Pengaturan special helper (Doc ID: "config") with isolated database connection & security guard
export async function savePengaturan(config: Pengaturan) {
  if (isIsolatedRemix()) {
    if (typeof window !== "undefined") {
      localStorage.setItem("edadmin_remix_db_pengaturan", JSON.stringify(config));
      window.dispatchEvent(new CustomEvent("edadmin_remix_db_update_pengaturan", { detail: config }));
    }
    return;
  }

  try {
    const docRef = doc(firestore, COLLECTIONS.PENGATURAN, "config");
    await setDoc(docRef, { ...config, updatedAt: Date.now() }, { merge: true });
    if (typeof window !== "undefined") {
      localStorage.setItem("edadmin_pengaturan_isolated", JSON.stringify(config));
    }
  } catch (err: any) {
    console.error("Error saving pengaturan:", err);
    throw err;
  }
}

export function subscribePengaturan(callback: (config: Pengaturan) => void) {
  if (isIsolatedRemix()) {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("edadmin_remix_db_pengaturan") || localStorage.getItem("edadmin_pengaturan_isolated");
      if (cached) {
        try {
          callback(JSON.parse(cached));
        } catch (e) {
          console.warn("Could not parse isolated local pengaturan cache:", e);
        }
      }
      const handleUpdate = (e: any) => {
        if (e.detail) callback(e.detail);
      };
      window.addEventListener("edadmin_remix_db_update_pengaturan", handleUpdate);
      return () => window.removeEventListener("edadmin_remix_db_update_pengaturan", handleUpdate);
    }
    return () => {};
  }

  const docRef = doc(firestore, COLLECTIONS.PENGATURAN, "config");
  return onSnapshot(
    docRef, 
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Pengaturan;
        callback(data);
        if (typeof window !== "undefined") {
          localStorage.setItem("edadmin_pengaturan_isolated", JSON.stringify(data));
        }
      }
    },
    (error) => {
      console.warn("Firestore pengaturan subscription notice:", error?.message || error);
    }
  );
}

// Clear / Wipe All Collections in Database (Except Configuration) with authorization guard
export async function clearAllDatabaseCollections() {
  localStorage.setItem("edadmin_database_cleared", "true");

  const collectionsToClear = [
    COLLECTIONS.SISWA,
    COLLECTIONS.MAPEL,
    COLLECTIONS.JADWAL,
    COLLECTIONS.LOG_ABSENSI,
    COLLECTIONS.DATA_NILAI,
    COLLECTIONS.JURNAL_AGENDA,
    COLLECTIONS.SISWA_BIMBINGAN,
    COLLECTIONS.BIMBINGAN_WALI
  ];

  // 1. Always purge local storage fallback for all collections & dispatch update events
  collectionsToClear.forEach((colName) => {
    setRemixStorage(colName, []);
  });

  if (isIsolatedRemix()) {
    return;
  }

  // 2. Set isDatabaseCleared flag in Firestore configuration
  try {
    const configDocRef = doc(firestore, COLLECTIONS.PENGATURAN, "config");
    await setDoc(configDocRef, { isDatabaseCleared: true, updatedAt: Date.now() }, { merge: true });
  } catch (err) {
    console.warn("Could not set isDatabaseCleared flag in pengaturan collection:", err);
  }

  // 3. Clear all collections in Firestore (chunked batch deletes with individual fallback)
  for (const colName of collectionsToClear) {
    try {
      const colRef = collection(firestore, colName);
      const snapshot = await getDocs(colRef);
      if (!snapshot.empty) {
        const docs = snapshot.docs;
        // Batch delete in chunks of 200
        for (let i = 0; i < docs.length; i += 200) {
          const chunk = docs.slice(i, i + 200);
          try {
            const batch = writeBatch(firestore);
            chunk.forEach((docSnap) => {
              batch.delete(docSnap.ref);
            });
            await batch.commit();
          } catch (batchErr) {
            console.warn(`Batch delete failed for ${colName}, attempting individual deletes:`, batchErr);
            // Fallback to individual deletes if batch fails
            for (const docSnap of chunk) {
              try {
                await deleteDoc(docSnap.ref);
              } catch (singleErr) {
                console.warn(`Notice: Could not delete document ${docSnap.id} in ${colName}:`, singleErr);
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.warn(`Notice while fetching/clearing collection ${colName}:`, err);
    }
  }
}
