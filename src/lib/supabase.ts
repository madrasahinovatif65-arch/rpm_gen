import { createClient } from '@supabase/supabase-js';
import { Pengaturan } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

const PRIMARY_APPLET_ID = "4d5db868-1009-49e3-a00a-533e542f4bc0";

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

// Fallback logic for remix isolated instances
function isIsolatedRemix(): boolean {
  return isRemixInstance() && (!supabaseUrl || !supabaseKey);
}

export function checkDatabaseAuthorization(): { authorized: boolean; reason?: string } {
  return { authorized: true };
}

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

  // Initial fetch
  supabase
    .from(collectionName)
    .select('*')
    .then(({ data, error }) => {
      if (!error && data) {
        callback(data as T[]);
      }
    });

  // Realtime subscription
  const channel = supabase
    .channel(`public:${collectionName}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: collectionName }, () => {
      // Re-fetch everything on change for simplicity, like onSnapshot behavior
      supabase
        .from(collectionName)
        .select('*')
        .then(({ data, error }) => {
          if (!error && data) {
            callback(data as T[]);
          }
        });
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

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

  const { error } = await supabase
    .from(collectionName)
    .upsert({ id, ...data, updatedAt: Date.now() });

  if (error) {
    console.error(`Error saving document in ${collectionName}:`, error);
    throw error;
  }
}

export async function deleteDocument(collectionName: string, id: string) {
  const current = getRemixStorage<any>(collectionName);
  if (current && current.length > 0) {
    const filtered = current.filter((item) => item.id !== id);
    setRemixStorage(collectionName, filtered);
  }

  if (isIsolatedRemix()) return;

  const { error } = await supabase
    .from(collectionName)
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting document in ${collectionName}:`, error);
    throw error;
  }
}

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

  const upsertItems = items.map(item => ({ ...item, updatedAt: Date.now() }));
  const { error } = await supabase
    .from(collectionName)
    .upsert(upsertItems);

  if (error) {
    console.error(`Error batch saving documents in ${collectionName}:`, error);
    throw error;
  }
}

export function checkPengaturanDatabaseAuthorization(): { authorized: boolean; reason?: string } {
  return { authorized: true };
}

export async function savePengaturan(config: Pengaturan) {
  if (isIsolatedRemix()) {
    if (typeof window !== "undefined") {
      localStorage.setItem("edadmin_remix_db_pengaturan", JSON.stringify(config));
      window.dispatchEvent(new CustomEvent("edadmin_remix_db_update_pengaturan", { detail: config }));
    }
    return;
  }

  const { error } = await supabase
    .from(COLLECTIONS.PENGATURAN)
    .upsert({ id: "config", ...config, updatedAt: Date.now() });

  if (error) {
    console.error("Error saving pengaturan:", error);
    throw error;
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("edadmin_pengaturan_isolated", JSON.stringify(config));
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

  // Initial fetch
  supabase
    .from(COLLECTIONS.PENGATURAN)
    .select('*')
    .eq('id', 'config')
    .single()
    .then(({ data, error }) => {
      if (!error && data) {
        callback(data as Pengaturan);
        if (typeof window !== "undefined") {
          localStorage.setItem("edadmin_pengaturan_isolated", JSON.stringify(data));
        }
      }
    });

  // Realtime subscription
  const channel = supabase
    .channel(`public:${COLLECTIONS.PENGATURAN}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: COLLECTIONS.PENGATURAN }, (payload) => {
      if (payload.new && (payload.new as any).id === 'config') {
        const data = payload.new as Pengaturan;
        callback(data);
        if (typeof window !== "undefined") {
          localStorage.setItem("edadmin_pengaturan_isolated", JSON.stringify(data));
        }
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

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

  collectionsToClear.forEach((colName) => {
    setRemixStorage(colName, []);
  });

  if (isIsolatedRemix()) return;

  try {
    await savePengaturan({ isDatabaseCleared: true } as any);
  } catch (err) {
    console.warn("Could not set isDatabaseCleared flag:", err);
  }

  for (const colName of collectionsToClear) {
    try {
      await supabase.from(colName).delete().neq('id', '');
    } catch (err: any) {
      console.warn(`Notice while clearing collection ${colName}:`, err);
    }
  }
}
