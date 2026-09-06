import React, { useState, useEffect } from "react";
import { 
  History, 
  Eye, 
  Download, 
  Trash2, 
  Share2, 
  Calendar,
  School,
  BookOpen,
  Copy,
  Check,
  Filter,
  Package
} from "lucide-react";
import { PerangkatDoc } from "../types";
import { subscribePerangkatDocs, deletePerangkatDoc } from "../lib/perangkatKbcStorage";
import { notifySimpanSuccess, notifySimpanError, notifyUnduhSuccess } from "../lib/swal";
import { exportAll9Documents } from "../lib/exportBatchZip";

interface RiwayatDokumenViewProps {
  onViewDocument?: (doc: PerangkatDoc) => void;
}

export const RiwayatDokumenView: React.FC<RiwayatDokumenViewProps> = ({ onViewDocument }) => {
  const [docs, setDocs] = useState<PerangkatDoc[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribePerangkatDocs((updatedDocs) => {
      setDocs(updatedDocs);
    });
    return () => unsubscribe();
  }, []);

  const filteredDocs = docs.filter(doc => {
    if (filterType !== "all" && !doc.docType.includes(filterType)) return false;
    if (filterSubject !== "all" && doc.subject !== filterSubject) return false;
    return true;
  });

  const uniqueSubjects = Array.from(new Set(docs.map(d => d.subject))).filter(Boolean);

  const docTypeMap: Record<string, string> = {
    analisis_cp: "Analisis CP",
    tp: "Tujuan Pembelajaran",
    atp: "Alur TP",
    prota: "Program Tahunan",
    prosem: "Program Semester",
    kktp: "KKTP",
    modul_ajar: "Modul Ajar",
    lkpd: "LKPD",
    rubrik: "Rubrik"
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Yakin ingin menghapus dokumen ini?")) return;
    
    try {
      await deletePerangkatDoc(docId);
      notifySimpanSuccess("Dokumen berhasil dihapus");
    } catch (err) {
      notifySimpanError("Gagal menghapus dokumen");
    }
  };

  const handleDownloadWord = (doc: PerangkatDoc) => {
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${doc.docTitle}</title></head><body>
      <h1>${doc.docTitle}</h1>
      <p><strong>Sekolah:</strong> ${doc.schoolName}</p>
      <p><strong>Mata Pelajaran:</strong> ${doc.subject}</p>
      <pre>${JSON.stringify(doc.data, null, 2)}</pre>
      </body></html>
    `;
    const blob = new Blob([content], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${doc.docTitle}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notifyUnduhSuccess(`File ${doc.docTitle}.doc berhasil diunduh`);
  };

  const handleCopyShareLink = (doc: PerangkatDoc) => {
    if (!doc.shareToken) return;
    const shareUrl = `${window.location.origin}/share/${doc.shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedToken(doc.shareToken);
    setTimeout(() => setCopiedToken(null), 2000);
    notifySimpanSuccess("Link berbagi telah disalin!");
  };

  const handleExportAll = async () => {
    try {
      await exportAll9Documents(docs);
      notifyUnduhSuccess("Ekspor ZIP berhasil!");
    } catch (err: any) {
      notifySimpanError(`Gagal ekspor: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-950 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-indigo-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-indigo-400 text-slate-950 font-black px-3 py-1 rounded-full text-xs uppercase tracking-wider shadow-xs">
              <History className="w-4 h-4" />
              <span>Riwayat Dokumen</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-indigo-300">
              Arsip Perangkat KBC
            </h2>
            <p className="text-slate-200 text-xs md:text-sm leading-relaxed">
              Lihat, unduh, bagikan, atau hapus dokumen KBC yang pernah dihasilkan.
            </p>
          </div>

          <button
            onClick={handleExportAll}
            disabled={docs.length === 0}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition flex items-center space-x-2 disabled:opacity-40"
          >
            <Package className="w-5 h-5" />
            <span>Unduh Semua (ZIP)</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Filter className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">Filter Dokumen</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold text-sm"
          >
            <option value="all">Semua Jenis Dokumen</option>
            {Object.entries(docTypeMap).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold text-sm"
          >
            <option value="all">Semua Mata Pelajaran</option>
            {uniqueSubjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Document List */}
      <div className="space-y-3">
        {filteredDocs.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <History className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-lg mb-2">
              Belum Ada Dokumen
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Dokumen yang Anda generate akan muncul di sini
            </p>
          </div>
        ) : (
          filteredDocs.map((doc, index) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition p-4"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg p-2 shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                        {index + 1}. {doc.docTitle}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400 mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(doc.createdAt).toLocaleString('id-ID')}
                        </div>
                        <div className="flex items-center gap-1">
                          <School className="w-3 h-3" />
                          {doc.schoolName}
                        </div>
                        {doc.subject && (
                          <div className="inline-flex bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md font-semibold">
                            {doc.subject}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onViewDocument && (
                    <button
                      onClick={() => onViewDocument(doc)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-2 rounded-lg text-xs transition flex items-center gap-1.5"
                      title="Lihat Dokumen"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Lihat</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDownloadWord(doc)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-lg text-xs transition flex items-center gap-1.5"
                    title="Unduh Word"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Word</span>
                  </button>

                  {doc.shareToken && (
                    <button
                      onClick={() => handleCopyShareLink(doc)}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-2 rounded-lg text-xs transition flex items-center gap-1.5"
                      title="Salin Link Berbagi"
                    >
                      {copiedToken === doc.shareToken ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                      <span className="hidden sm:inline">Share</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-2 rounded-lg text-xs transition flex items-center gap-1.5"
                    title="Hapus Dokumen"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
