import { generatePerangkatAjarKBCAPI } from "./geminiClient";
import { normalizeTpData, normalizeAtpData } from "./dataNormalizers";
import { notifySimpanError, notifySimpanSuccess } from "./swal";

export type JobStatus = "idle" | "running" | "success" | "failed";

export interface AIJob {
  id: string; // e.g., 'analisis_cp', 'tp', 'modul_ajar_meeting_1'
  docType: string;
  status: JobStatus;
  progressMessage: string;
  data?: any;
  error?: string;
  lastUpdated: number;
  firestoreDocId?: string;
  savedToFirestore?: boolean;
}

// In-memory queue state (can be hooked up to React state later)
let jobQueue: string[] = [];
let isProcessingQueue = false;

// Hydrate jobsRecord from localStorage on startup
const loadInitialJobsRecord = (): Record<string, AIJob> => {
  if (typeof window === "undefined") return {};
  const initial: Record<string, AIJob> = {};
  const mainTypes = [
    "analisis_cp", "tp", "atp", "prota", "prosem", "kktp", 
    "modul_ajar_umum", "lkpd", "rubrik"
  ];

  try {
    mainTypes.forEach(type => {
      const dataStr = localStorage.getItem(`kbc_cache_${type}`);
      if (dataStr) {
        initial[type] = {
          id: type,
          docType: type,
          status: "success",
          progressMessage: "Dimuat dari riwayat lokal",
          data: JSON.parse(dataStr),
          lastUpdated: Date.now()
        };
      }
    });

    // Load up to 50 possible meetings
    for (let i = 1; i <= 50; i++) {
      const meetingKey = `modul_ajar_meeting_${i}`;
      const dataStr = localStorage.getItem(`kbc_cache_${meetingKey}`);
      if (dataStr) {
        initial[meetingKey] = {
          id: meetingKey,
          docType: meetingKey,
          status: "success",
          progressMessage: "Dimuat dari riwayat lokal",
          data: JSON.parse(dataStr),
          lastUpdated: Date.now()
        };
      }
    }
  } catch (e) {
    console.warn("Failed to load initial cache", e);
  }

  return initial;
};

let jobsRecord: Record<string, AIJob> = loadInitialJobsRecord();

type QueueListener = (jobs: Record<string, AIJob>) => void;
let listeners: QueueListener[] = [];

export const subscribeToJobs = (listener: QueueListener) => {
  listeners.push(listener);
  listener({ ...jobsRecord });
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
};

const notifyListeners = () => {
  listeners.forEach(l => l({ ...jobsRecord }));
};

const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(`kbc_cache_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save cache", e);
  }
};

export const loadFromLocalStorage = (key: string) => {
  try {
    const data = localStorage.getItem(`kbc_cache_${key}`);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const enqueueJob = (id: string, docType: string, formData: any) => {
  if (jobsRecord[id]?.status === "running") return; // Already running

  jobsRecord[id] = {
    id,
    docType,
    status: "idle",
    progressMessage: "Menunggu antrean...",
    lastUpdated: Date.now()
  };
  jobQueue.push(id);
  notifyListeners();
  
  // Start processing if not already
  if (!isProcessingQueue) {
    processQueue(formData);
  }
};

const processQueue = async (formData: any) => {
  if (jobQueue.length === 0) {
    isProcessingQueue = false;
    return;
  }

  isProcessingQueue = true;
  const jobId = jobQueue.shift()!;
  const job = jobsRecord[jobId];

  if (!job) {
    processQueue(formData);
    return;
  }

  // Check cache first
  const cachedData = loadFromLocalStorage(jobId);
  if (cachedData) {
    jobsRecord[jobId] = {
      ...job,
      status: "success",
      progressMessage: "Dimuat dari cache",
      data: cachedData,
      lastUpdated: Date.now()
    };
    notifyListeners();
    processQueue(formData);
    return;
  }

  jobsRecord[jobId] = {
    ...job,
    status: "running",
    progressMessage: `Memproses ${job.docType}...`,
    lastUpdated: Date.now()
  };
  notifyListeners();

  try {
    // Dynamic Cascading Context Injection (Single Source of Truth)
    const dynamicFormData = { ...formData };
    
    if (["atp", "prota", "prosem", "kktp"].includes(job.docType)) {
       const tpJob = jobsRecord["tp"];
       if (tpJob && tpJob.status === "success" && tpJob.data) {
         dynamicFormData.tpContext = tpJob.data;
       }
    }
    
    if (["prota", "prosem"].includes(job.docType)) {
       const atpJob = jobsRecord["atp"];
       if (atpJob && atpJob.status === "success" && atpJob.data) {
         dynamicFormData.atpContext = atpJob.data;
       }
    }

    const res = await generatePerangkatAjarKBCAPI(job.docType, dynamicFormData);
    if (res.status === "success" && res.data) {
      let finalData = res.data;
      
      // Post-Processing Normalization
      if (job.docType === "tp") {
        finalData = normalizeTpData(finalData, dynamicFormData);
      } else if (job.docType === "atp") {
        finalData = normalizeAtpData(finalData, dynamicFormData, dynamicFormData.tpContext || null);
      }

      jobsRecord[jobId] = {
        ...jobsRecord[jobId],
        status: "success",
        progressMessage: "Menyimpan ke database...",
        data: finalData,
        lastUpdated: Date.now()
      };
      saveToLocalStorage(jobId, finalData);
      notifyListeners();
      
      // Auto-save to Firestore
      try {
        const { saveGeneratedDoc } = await import("./perangkatKbcStorage");
        const userStr = localStorage.getItem('edadmin_user');
        const user = userStr ? JSON.parse(userStr) : {};
        const username = user.username || user.nama || 'anonim';
        
        const firestoreDocId = await saveGeneratedDoc(
          jobId,
          finalData,
          dynamicFormData,
          username
        );
        
        jobsRecord[jobId].firestoreDocId = firestoreDocId;
        jobsRecord[jobId].savedToFirestore = true;
        jobsRecord[jobId].progressMessage = "✓ Tersimpan";
      } catch (saveErr: any) {
        console.warn("Failed to save to Firestore:", saveErr);
        jobsRecord[jobId].progressMessage = "⚠ Selesai (lokal)";
      }
    } else {
      throw new Error(res.message || "Gagal mendapatkan data valid.");
    }
  } catch (error: any) {
    jobsRecord[jobId] = {
      ...jobsRecord[jobId],
      status: "failed",
      progressMessage: "Gagal memproses",
      error: error.message,
      lastUpdated: Date.now()
    };
    notifySimpanError(`Gagal memproses ${job.docType}: ${error.message}`);
  }

  notifyListeners();
  
  // Wait a little bit before processing the next one to be safe from rate limit
  setTimeout(() => {
    processQueue(formData);
  }, 1000);
};

export const clearCache = (id?: string) => {
  if (id) {
    localStorage.removeItem(`kbc_cache_${id}`);
    if (jobsRecord[id]) {
      jobsRecord[id].status = "idle";
      jobsRecord[id].data = undefined;
      notifyListeners();
    }
  } else {
    // Clear all kbc cache
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("kbc_cache_")) {
        localStorage.removeItem(key);
      }
    });
    jobsRecord = {};
    notifyListeners();
  }
};
