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
import { Pengaturan } from "../types";

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
  PENGATURAN: "pengaturan",
  KBC_STATE: "kbc_state",
  PERANGKAT_KBC: "perangkat_kbc",
  KALDIK: "kaldik"
};

// ============================================================
// Per-User Path Helpers
// ============================================================

/**
 * Ambil userId yang sedang aktif dari localStorage.
 * Mengembalikan null jika belum ada sesi / belum login.
 */
export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('edadmin_user_id');
}

/**
 * Cek apakah yang login adalah Admin (akun lokal madrasahinovatif).
 */
export function isAdminUser(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const userJson = localStorage.getItem('edadmin_user');
    if (!userJson) return false;
    const user = JSON.parse(userJson);
    return user.provider === 'local' || user.username === 'madrasahinovatif';
  } catch { return false; }
}

/**
 * Path Firestore untuk Pengaturan:
 * - Admin → `pengaturan/config` (global)
 * - Guru SIAKAD → `users/{uid}/pengaturan/config`
 */
function getPengaturanDocRef() {
  if (isAdminUser()) {
    return doc(firestore, COLLECTIONS.PENGATURAN, 'config');
  }
  const uid = getCurrentUserId();
  if (uid) {
    return doc(firestore, 'users', uid, COLLECTIONS.PENGATURAN, 'config');
  }
  // Fallback ke global jika userId belum ada
  return doc(firestore, COLLECTIONS.PENGATURAN, 'config');
}

/**
 * Path Firestore untuk Kaldik (Selalu Global/Admin)
 * Menyimpan kalender akademik madrasah
 */
export function getKaldikDocRef(tahunAjaran: string) {
  const safeTahun = tahunAjaran.replace(/\//g, '-'); // e.g. "2024-2025"
  return doc(firestore, COLLECTIONS.KALDIK, safeTahun);
}

export async function getKaldik(tahunAjaran: string): Promise<any> {
  const { getDoc } = await import("firebase/firestore");
  const docSnap = await getDoc(getKaldikDocRef(tahunAjaran));
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
}

export async function saveKaldik(tahunAjaran: string, data: any): Promise<void> {
  const { setDoc } = await import("firebase/firestore");
  await setDoc(getKaldikDocRef(tahunAjaran), data, { merge: true });
}

/**
 * Path Firestore untuk KBC State:
 * - Admin → `kbc_state/main` (global)
 * - Guru SIAKAD → `users/{uid}/kbc_state/main`
 */
function getKbcStateDocRef() {
  if (isAdminUser()) {
    return doc(firestore, COLLECTIONS.KBC_STATE, 'main');
  }
  const uid = getCurrentUserId();
  if (uid) {
    return doc(firestore, 'users', uid, COLLECTIONS.KBC_STATE, 'main');
  }
  return doc(firestore, COLLECTIONS.KBC_STATE, 'main');
}

/**
 * Prefix collection path untuk Perangkat KBC:
 * - Admin → `perangkat_kbc`
 * - Guru SIAKAD → `users/{uid}/perangkat_kbc`
 */
export function getPerangkatCollectionRef() {
  if (isAdminUser()) {
    return collection(firestore, COLLECTIONS.PERANGKAT_KBC);
  }
  const uid = getCurrentUserId();
  if (uid) {
    return collection(firestore, 'users', uid, COLLECTIONS.PERANGKAT_KBC);
  }
  return collection(firestore, COLLECTIONS.PERANGKAT_KBC);
}

export function getPerangkatDocRef(docId: string) {
  if (isAdminUser()) {
    return doc(firestore, COLLECTIONS.PERANGKAT_KBC, docId);
  }
  const uid = getCurrentUserId();
  if (uid) {
    return doc(firestore, 'users', uid, COLLECTIONS.PERANGKAT_KBC, docId);
  }
  return doc(firestore, COLLECTIONS.PERANGKAT_KBC, docId);
}

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

// Generic Realtime Subscription — otomatis pakai path per-user untuk PERANGKAT_KBC
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

  // Gunakan path per-user jika collection adalah perangkat_kbc
  const colRef = collectionName === COLLECTIONS.PERANGKAT_KBC
    ? getPerangkatCollectionRef()
    : collection(firestore, collectionName);

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

// Single Document Save/Update — otomatis pakai path per-user untuk PERANGKAT_KBC
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
    // Gunakan path per-user jika collection adalah perangkat_kbc
    const docRef = collectionName === COLLECTIONS.PERANGKAT_KBC
      ? getPerangkatDocRef(id)
      : doc(firestore, collectionName, id);
    await setDoc(docRef, { ...data, updatedAt: Date.now() }, { merge: true });
  } catch (err: any) {
    console.error(`Error saving document in ${collectionName}:`, err);
    throw err;
  }
}

// Single Document Delete — otomatis pakai path per-user untuk PERANGKAT_KBC
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
    const docRef = collectionName === COLLECTIONS.PERANGKAT_KBC
      ? getPerangkatDocRef(id)
      : doc(firestore, collectionName, id);
    await deleteDoc(docRef);
  } catch (err: any) {
    console.error(`Error deleting document in ${collectionName}:`, err);
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
      // Gunakan path per-user untuk PERANGKAT_KBC, sama seperti saveDocument
      const docRef = collectionName === COLLECTIONS.PERANGKAT_KBC
        ? getPerangkatDocRef(item.id)
        : doc(firestore, collectionName, item.id);
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

// Pengaturan special helper — path per-user untuk guru SIAKAD, global untuk Admin
export async function savePengaturan(config: Pengaturan) {
  if (isIsolatedRemix()) {
    if (typeof window !== "undefined") {
      localStorage.setItem("edadmin_remix_db_pengaturan", JSON.stringify(config));
      window.dispatchEvent(new CustomEvent("edadmin_remix_db_update_pengaturan", { detail: config }));
    }
    return;
  }

  try {
    const docRef = getPengaturanDocRef();
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
        try { callback(JSON.parse(cached)); } catch (e) {
          console.warn("Could not parse isolated local pengaturan cache:", e);
        }
      }
      const handleUpdate = (e: any) => { if (e.detail) callback(e.detail); };
      window.addEventListener("edadmin_remix_db_update_pengaturan", handleUpdate);
      return () => window.removeEventListener("edadmin_remix_db_update_pengaturan", handleUpdate);
    }
    return () => {};
  }

  const userDocRef = getPengaturanDocRef();
  const adminDocRef = doc(firestore, COLLECTIONS.PENGATURAN, 'config');

  return onSnapshot(
    userDocRef,
    async (docSnap) => {
      if (docSnap.exists()) {
        // Dokumen user sudah ada — pakai langsung
        const data = docSnap.data() as Pengaturan;
        callback(data);
        if (typeof window !== "undefined") {
          localStorage.setItem("edadmin_pengaturan_isolated", JSON.stringify(data));
        }
      } else if (!isAdminUser()) {
        // Dokumen user belum ada — seed dari admin config sebagai referensi awal
        try {
          const adminSnap = await getDocs(collection(firestore, COLLECTIONS.PENGATURAN));
          let adminConfig: Partial<Pengaturan> = {};
          adminSnap.forEach(d => { if (d.id === 'config') adminConfig = d.data() as Pengaturan; });
          if (Object.keys(adminConfig).length > 0) {
            // Jangan timpa data pribadi guru (Nama, NIP, Role) yang sudah diset saat SSO
            const personalData: Partial<Pengaturan> = {};
            const cachedStr = localStorage.getItem("edadmin_pengaturan_isolated");
            if (cachedStr) {
              try {
                const cached = JSON.parse(cachedStr) as Pengaturan;
                if (cached.Nama_Guru) personalData.Nama_Guru = cached.Nama_Guru;
                if (cached.NIP_Guru) personalData.NIP_Guru = cached.NIP_Guru;
                if (cached.siakadRole) personalData.siakadRole = cached.siakadRole;
                if (cached.siakadMapel) personalData.siakadMapel = cached.siakadMapel;
                if (cached.siakadUserId) personalData.siakadUserId = cached.siakadUserId;
                if (cached.authProvider) personalData.authProvider = cached.authProvider;
              } catch { /* ignore */ }
            }
            const seededConfig = { ...adminConfig, ...personalData };
            callback(seededConfig as Pengaturan);
            // Simpan seed ke dokumen user agar tidak perlu seed lagi
            await setDoc(userDocRef, { ...seededConfig, updatedAt: Date.now() }, { merge: true });
          }
        } catch (err) {
          console.warn('⚠️ Gagal seed pengaturan dari admin config:', err);
        }
      }
    },
    (error) => {
      console.warn("Firestore pengaturan subscription notice:", error?.message || error);
    }
  );
}

// KBC State special helper — path per-user untuk guru SIAKAD, global untuk Admin
export async function saveKbcState(state: any) {
  if (isIsolatedRemix()) {
    if (typeof window !== "undefined") {
      localStorage.setItem("edadmin_remix_db_kbc_state", JSON.stringify(state));
      window.dispatchEvent(new CustomEvent("edadmin_remix_db_update_kbc_state", { detail: state }));
    }
    return;
  }

  try {
    const docRef = getKbcStateDocRef();
    await setDoc(docRef, { ...state, updatedAt: Date.now() }, { merge: true });
    if (typeof window !== "undefined") {
      localStorage.setItem("edadmin_kbc_state_isolated", JSON.stringify(state));
    }
  } catch (err: any) {
    console.error("Error saving kbc state:", err);
    throw err;
  }
}

export function subscribeKbcState(callback: (state: any) => void) {
  if (isIsolatedRemix()) {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("edadmin_remix_db_kbc_state") || localStorage.getItem("edadmin_kbc_state_isolated");
      if (cached) {
        try { callback(JSON.parse(cached)); } catch (e) {
          console.warn("Could not parse isolated local kbc state cache:", e);
        }
      }
      const handleUpdate = (e: any) => { if (e.detail) callback(e.detail); };
      window.addEventListener("edadmin_remix_db_update_kbc_state", handleUpdate);
      return () => window.removeEventListener("edadmin_remix_db_update_kbc_state", handleUpdate);
    }
    return () => {};
  }

  const docRef = getKbcStateDocRef();
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback(data);
        if (typeof window !== "undefined") {
          localStorage.setItem("edadmin_kbc_state_isolated", JSON.stringify(data));
        }
      }
    },
    (error) => {
      console.warn("Firestore kbc state subscription notice:", error?.message || error);
    }
  );
}

// Clear / Wipe — hanya menghapus data di path admin (global), TIDAK menyentuh data guru SIAKAD
export async function clearAllDatabaseCollections() {
  localStorage.setItem("edadmin_database_cleared", "true");

  // Hanya hapus collection global milik admin
  const collectionsToClear: string[] = [COLLECTIONS.PERANGKAT_KBC];

  // 1. Purge local storage remix fallback
  collectionsToClear.forEach((colName) => { setRemixStorage(colName, []); });

  if (isIsolatedRemix()) return;

  // 2. Set isDatabaseCleared flag di config admin
  try {
    const configDocRef = doc(firestore, COLLECTIONS.PENGATURAN, 'config');
    await setDoc(configDocRef, { isDatabaseCleared: true, updatedAt: Date.now() }, { merge: true });
  } catch (err) {
    console.warn('Could not set isDatabaseCleared flag:', err);
  }

  // 3. Hanya hapus dokumen di collection global (bukan users/{uid}/...)
  for (const colName of collectionsToClear) {
    try {
      const colRef = collection(firestore, colName);
      const snapshot = await getDocs(colRef);
      if (!snapshot.empty) {
        const docs = snapshot.docs;
        for (let i = 0; i < docs.length; i += 200) {
          const chunk = docs.slice(i, i + 200);
          try {
            const batch = writeBatch(firestore);
            chunk.forEach((docSnap) => { batch.delete(docSnap.ref); });
            await batch.commit();
          } catch (batchErr) {
            for (const docSnap of chunk) {
              try { await deleteDoc(docSnap.ref); } catch { /* ignore */ }
            }
          }
        }
      }
    } catch (err: any) {
      console.warn(`Notice while clearing collection ${colName}:`, err);
    }
  }
}
