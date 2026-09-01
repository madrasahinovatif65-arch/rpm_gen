import { useState, useEffect } from 'react';
import { saveKbcState, subscribeKbcState } from '../lib/firebase';

export interface KbcState {
  school: {
    kemenagOffice: string;
    schoolName: string;
    teacher: string;
    nipTeacher: string;
    principal: string;
    nipPrincipal: string;
    cityDate: string;
  };
  curriculum: {
    subject: string;
    singkatanMapel: string;
    level: string;
    year: string;
    totalJp: number;
    jpPerMinggu: number;
    learningModel: string;
  };
  cp: {
    rasional: string;
    elemen: string;
  };
  module: {
    tpId: string | null;
    kodeTp: string;
    rumusanTp: string;
    elemenCp: string;
    learningModel: string;
    sintakModel: string | string[];
    jumlahPertemuan: number;
    jpPerPertemuan: number;
    minutesPerJp: number;
    topikLokal: string;
  };
}

export const defaultKbcState: KbcState = {
  school: {
    kemenagOffice: "KANTOR KEMENTERIAN AGAMA",
    schoolName: "Madrasah Inovatif",
    teacher: "Guru Pengampu",
    nipTeacher: "-",
    principal: "Kepala Madrasah",
    nipPrincipal: "-",
    cityDate: "Jakarta, 14 Juli 2026",
  },
  curriculum: {
    subject: "Akidah Akhlak",
    singkatanMapel: "AA",
    level: "Fase E / Kelas X",
    year: "2026/2027",
    totalJp: 72,
    jpPerMinggu: 2,
    learningModel: "Discovery Learning",
  },
  cp: {
    rasional: "",
    elemen: "",
  },
  module: {
    tpId: null,
    kodeTp: "TP.AA.ELE.10.01",
    rumusanTp: "Peserta didik mampu menganalisis konsep tauhid dan Asmaul Husna secara mendalam, serta menginternalisasi nilai kasih sayang Allah Swt. dalam kehidupan sehari-hari dan kearifan lokal Kerinci.",
    elemenCp: "Akidah",
    learningModel: "Discovery Learning",
    sintakModel: "1. Stimulasi/Pemberian Rangsangan, 2. Identifikasi Masalah, 3. Pengumpulan Data, 4. Pengolahan Data, 5. Pembuktian, 6. Penarikan Kesimpulan",
    jumlahPertemuan: 3,
    jpPerPertemuan: 2,
    minutesPerJp: 45,
    topikLokal: "Pelestarian Lingkungan Hutan TNKS & Budaya Adat Mudik Kerinci (Panca Cinta & PPRA)",
  }
};

let globalState: KbcState = defaultKbcState;
let listeners: Array<(state: KbcState) => void> = [];

// Initialize subscription to Firebase
let isSubscribed = false;

function initFirebaseSubscription() {
  if (isSubscribed) return;
  isSubscribed = true;
  
  subscribeKbcState((data) => {
    if (data) {
      // Merge with default state to ensure all fields exist
      globalState = {
        school: { ...defaultKbcState.school, ...(data.school || {}) },
        curriculum: { ...defaultKbcState.curriculum, ...(data.curriculum || {}) },
        cp: { ...defaultKbcState.cp, ...(data.cp || {}) },
        module: { ...defaultKbcState.module, ...(data.module || {}) }
      };
      notifyListeners();
    }
  });
}

function notifyListeners() {
  for (const listener of listeners) {
    listener(globalState);
  }
}

// Custom hook to use global KBC State
export function useKbcState() {
  const [state, setState] = useState<KbcState>(globalState);

  useEffect(() => {
    initFirebaseSubscription();
    
    const listener = (newState: KbcState) => {
      setState({ ...newState });
    };
    
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  const updateState = (updater: (prev: KbcState) => KbcState) => {
    const newState = updater(globalState);
    globalState = newState;
    notifyListeners();
    
    // Debounce save to firebase to prevent too many writes
    debouncedSave(newState);
  };

  return [state, updateState] as const;
}

// Simple debounce for saving
let saveTimeout: any = null;
function debouncedSave(state: KbcState) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveKbcState(state).catch(console.error);
  }, 1000);
}

// Context Filtering for Module View
export function buildModuleContext(state: KbcState) {
  // In Phase 2 this will map tpId to actual TP text from canonical list.
  // For now, it just passes the raw values so we can migrate UI first.
  return {
    ...state.module,
    schoolName: state.school.schoolName,
    kemenagOffice: state.school.kemenagOffice,
    subject: state.curriculum.subject,
    level: state.curriculum.level,
    year: state.curriculum.year,
    teacher: state.school.teacher,
    principal: state.school.principal,
    // (Other fields will be mapped from master TP data in phase 2)
  };
}
