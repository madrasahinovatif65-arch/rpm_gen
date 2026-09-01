export const calculateTotalJp = (jumlahPertemuan: number, jpPerPertemuan: number): number => {
  return jumlahPertemuan * jpPerPertemuan;
};

export const generateTpCode = (
  subjectCode: string,
  elementCode: string,
  level: string,
  index: number
): string => {
  // Extract number from level (e.g. "Fase E / Kelas X" -> "10")
  let levelNum = "10";
  if (level.includes("X") && !level.includes("XI") && !level.includes("XII")) levelNum = "10";
  if (level.includes("XI") && !level.includes("XII")) levelNum = "11";
  if (level.includes("XII")) levelNum = "12";
  
  const paddedIndex = index.toString().padStart(2, "0");
  const elCode = elementCode.substring(0, 3).toUpperCase();
  
  return `TP.${subjectCode.toUpperCase()}.${elCode}.${levelNum}.${paddedIndex}`;
};

export const parseJpToNumber = (jpString: string | number): number => {
  if (typeof jpString === "number") return jpString;
  const match = jpString.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};
