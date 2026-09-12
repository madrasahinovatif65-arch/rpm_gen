import React, { useState, useEffect } from "react";
import { renderToString } from "react-dom/server";
import { 
  History, 
  Eye, 
  Download, 
  Trash2, 
  Share2, 
  Calendar,
  School,
  BookOpen,
  Check,
  Filter,
  Package,
  X,
  Printer
} from "lucide-react";
import { PerangkatDoc } from "../types";
import { subscribePerangkatDocs, deletePerangkatDoc } from "../lib/perangkatKbcStorage";
import { notifySimpanSuccess, notifySimpanError, notifyUnduhSuccess } from "../lib/swal";
import { exportAll9Documents } from "../lib/exportBatchZip";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Card } from "./ui/Card";
import { AcpRenderer, TpRenderer, AtpRenderer, ProtaRenderer, ProsemRenderer, KktpRenderer } from './renderers/AdministrasiRenderers';
import { ModulAjarRenderer, LkpdRenderer, RubrikRenderer } from './renderers/ModulRenderers';

interface RiwayatDokumenViewProps {
  onViewDocument?: (doc: PerangkatDoc) => void;
}

export const RiwayatDokumenView: React.FC<RiwayatDokumenViewProps> = ({ onViewDocument }) => {
  const [docs, setDocs] = useState<PerangkatDoc[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<PerangkatDoc | null>(null);

  useEffect(() => {
    const unsubscribe = subscribePerangkatDocs((updatedDocs) => {
      setDocs(updatedDocs);
    });
    return () => unsubscribe();
  }, []);

  const renderPreviewDocument = (doc: PerangkatDoc) => {
    const context = doc.formData || {};
    // Mapel and other things might need to be destructured if not fully structured in formData
    const normalizedContext = {
      curriculum: { ...context },
      school: { ...context },
      module: { ...context },
      cp: { ...context }
    };
    
    switch (doc.docType) {
      case 'analisis_cp': return <AcpRenderer data={doc.data} context={normalizedContext} />;
      case 'tp': return <TpRenderer data={doc.data} context={normalizedContext} />;
      case 'atp': return <AtpRenderer data={doc.data} context={normalizedContext} />;
      case 'prota': return <ProtaRenderer data={doc.data} context={normalizedContext} />;
      case 'prosem': return <ProsemRenderer data={doc.data} context={normalizedContext} />;
      case 'kktp': return <KktpRenderer data={doc.data} context={normalizedContext} />;
      case 'modul_ajar': 
      case 'modul_ajar_umum':
        return <ModulAjarRenderer umum={doc.data} meetings={[]} context={normalizedContext} />;
      case 'lkpd': return <LkpdRenderer data={doc.data} context={normalizedContext} />;
      case 'rubrik': return <RubrikRenderer data={doc.data} context={normalizedContext} />;
      default:
        if (doc.docType.startsWith('modul_ajar_meeting_')) {
           return <ModulAjarRenderer umum={{} as any} meetings={[doc.data]} context={normalizedContext} />;
        }
        return <pre className="text-xs bg-slate-100 p-4 rounded">{JSON.stringify(doc.data, null, 2)}</pre>;
    }
  };

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
    const htmlToPrint = renderToString(renderPreviewDocument(doc));
    
    // Tentukan orientasi berdasarkan jenis dokumen
    const isLandscape = doc.docType === "atp" || doc.docType === "prosem" || doc.docType === "kktp" || doc.docType === "rubrik";
    
    // Ukuran F4: 8.5in x 13in. Margin Narrow: 0.5in
    const size = isLandscape ? "13in 8.5in" : "8.5in 13in";
    const margin = "0.5in 0.5in 0.5in 0.5in";

    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${doc.docTitle}</title>
        <style>
          @page WordSection1 {
            size: ${size};
            margin: ${margin};
            mso-header-margin: 0.5in;
            mso-footer-margin: 0.5in;
            mso-paper-source: 0;
          }
          div.WordSection1 { page: WordSection1; }
          body { font-family: Arial, sans-serif; color: #000; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #333; padding: 6px; font-size: 10pt; }
          th { background-color: #eee; }
        </style>
      </head>
      <body>
        <div class="WordSection1">
          ${htmlToPrint}
        </div>
      </body>
      </html>
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <Card variant="elevated" padding="lg" className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white border-0">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <Badge variant="accent" size="md" className="uppercase tracking-wider">
              <History className="w-4 h-4" />
              <span>Riwayat</span>
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold">
              Arsip Perangkat KBC
            </h2>
            <p className="text-emerald-100 text-sm leading-relaxed">
              Lihat, unduh, bagikan, atau hapus dokumen KBC yang pernah dihasilkan.
            </p>
          </div>

          <Button
            variant="accent"
            size="md"
            icon={Package}
            onClick={handleExportAll}
            disabled={docs.length === 0}
            className="shrink-0"
          >
            Unduh Semua (ZIP)
          </Button>
        </div>
      </Card>

      {/* Filters */}
      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Filter Dokumen</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Jenis Dokumen</option>
            {Object.entries(docTypeMap).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Mata Pelajaran</option>
            {uniqueSubjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Document List */}
      <div className="space-y-3">
        {filteredDocs.length === 0 ? (
          <Card variant="bordered" padding="lg" className="text-center">
            <History className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-lg mb-2">
              Belum Ada Dokumen
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Dokumen yang Anda generate akan muncul di sini
            </p>
          </Card>
        ) : (
          filteredDocs.map((doc, index) => (
            <Card key={doc.id} variant="bordered" padding="md" className="hover:shadow-md transition">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-lg p-2 shrink-0">
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
                          <Badge variant="primary" size="sm">
                            {doc.subject}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Eye}
                    onClick={() => {
                      if (onViewDocument) {
                        onViewDocument(doc);
                      } else {
                        setPreviewDoc(doc);
                      }
                    }}
                    title="Lihat Dokumen"
                  >
                    <span className="hidden sm:inline">Lihat</span>
                  </Button>
                  
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Download}
                    onClick={() => handleDownloadWord(doc)}
                    title="Unduh Word"
                  >
                    <span className="hidden sm:inline">Word</span>
                  </Button>

                  {doc.shareToken && (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={copiedToken === doc.shareToken ? Check : Share2}
                      onClick={() => handleCopyShareLink(doc)}
                      title="Salin Link Berbagi"
                    >
                      <span className="hidden sm:inline">Share</span>
                    </Button>
                  )}

                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDelete(doc.id)}
                    title="Hapus"
                  >
                    <span className="hidden sm:inline">Hapus</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-lg text-emerald-700 dark:text-emerald-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">
                    {previewDoc.docTitle}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Pratinjau Dokumen KBC
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  icon={Download}
                  onClick={() => handleDownloadWord(previewDoc)}
                >
                  Word
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={X}
                  onClick={() => setPreviewDoc(null)}
                >
                  Tutup
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-100 dark:bg-slate-900">
              <div className="bg-white dark:bg-white text-black p-6 md:p-10 rounded-xl shadow-sm border border-slate-200 mx-auto max-w-4xl print-area">
                {renderPreviewDocument(previewDoc)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
