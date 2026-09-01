export interface SemesterMonth {
  name: string;
  weeks: {
    m1: string;
    m2: string;
    m3: string;
    m4: string;
    m5: string;
  };
}

export const generateProsemCalendar = (
  startYear: number, 
  semester: 1 | 2
): SemesterMonth[] => {
  // A simplified deterministic calendar for educational purposes.
  // Ganjil: Jul - Dec
  // Genap: Jan - Jun
  const months = semester === 1 
    ? [
        { name: `Juli ${startYear}`, days: 31 },
        { name: `Agustus ${startYear}`, days: 31 },
        { name: `September ${startYear}`, days: 30 },
        { name: `Oktober ${startYear}`, days: 31 },
        { name: `November ${startYear}`, days: 30 },
        { name: `Desember ${startYear}`, days: 31 },
      ]
    : [
        { name: `Januari ${startYear + 1}`, days: 31 },
        { name: `Februari ${startYear + 1}`, days: startYear % 4 === 3 ? 29 : 28 },
        { name: `Maret ${startYear + 1}`, days: 31 },
        { name: `April ${startYear + 1}`, days: 30 },
        { name: `Mei ${startYear + 1}`, days: 31 },
        { name: `Juni ${startYear + 1}`, days: 30 },
      ];

  return months.map(m => {
    return {
      name: m.name,
      // Default to "E" (Efektif) and handle M5 logically based on length of month
      weeks: {
        m1: "E",
        m2: "E",
        m3: "E",
        m4: "E",
        m5: m.days > 28 ? "E" : "L" // L for Libur / Non-existent week
      }
    }
  });
};
