import React from "react";
import {
  Wand2,
  HeartHandshake,
  Bot,
  Settings,
  ArrowRight,
  Sparkles,
  LayoutGrid,
  Download,
  Globe,
  History,
  BookOpen
} from "lucide-react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Card } from "./ui/Card";
import { MarkdownModal } from "./MarkdownModal";
import { PROMPT_ADMIN_MD, ALUR_GURU_MD } from "../lib/docsContent";

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  isAdmin: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  isAdmin
}) => {
  const [isDocsModalOpen, setIsDocsModalOpen] = React.useState(false);
  // Simplified color mapping: primary (emerald), accent (amber), secondary (slate)
  const menuCards = [
    {
      id: "downloadperangkat",
      title: "Download Perangkat Ajar",
      desc: "Download RPP/Modul Ajar terlengkap.",
      icon: Download,
      badge: "Download",
      variant: "primary" as const,
    },
    {
      id: "perangkat_kbc",
      title: "Perangkat Ajar KBC",
      desc: "ACP, TP, ATP, Prota, Prosem, KKTP, Modul, LKPD & Rubrik KBC.",
      icon: HeartHandshake,
      badge: "Unggulan",
      variant: "accent" as const,
    },
    {
      id: "riwayat_dokumen",
      title: "Riwayat Dokumen",
      desc: "Lihat, unduh, dan kelola dokumen yang pernah dibuat.",
      icon: History,
      badge: "Arsip",
      variant: "secondary" as const,
    },
    {
      id: "modulai",
      title: "Modul Ajar Deep Learning AI",
      desc: "Generator RPP Deep Learning Kurikulum Merdeka hingga 5 pertemuan.",
      icon: Wand2,
      badge: "Modul AI",
      variant: "primary" as const,
    },
    {
      id: "asistenai",
      title: "Asisten Chatbot Guru AI",
      desc: "Konsultan pedagogi AI, pembuat soal HOTS, & draf narasi rapor.",
      icon: Bot,
      badge: "AI Chatbot",
      variant: "primary" as const,
    },
    {
      id: "lkpdai",
      title: "Generator LKPD AI",
      desc: "Buat Lembar Kerja Peserta Didik interaktif.",
      icon: Sparkles,
      badge: "LKPD",
      variant: "primary" as const,
    },
    {
      id: "ailainnya",
      title: "Generator AI Lainnya",
      desc: "Generator Soal, Silabus, Rubrik Asesmen & Media.",
      icon: Globe,
      badge: "Multi-Tool",
      variant: "primary" as const,
    },
    {
      id: "pengaturan",
      title: "Pengaturan & Profil",
      desc: "Kelola profil guru, instansi sekolah, & kop dokumen.",
      icon: Settings,
      badge: "Profil",
      variant: "secondary" as const,
    }
  ];

  const visibleMenuCards = menuCards.filter(card => {
    if (!isAdmin && (card.id === "downloadperangkat" || card.id === "lkpdai" || card.id === "ailainnya")) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full">
      {/* Hero CTA Card */}
      <Card variant="elevated" padding="lg" className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white border-0">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="accent" size="md" className="uppercase tracking-wider">
              {isAdmin ? "PANDUAN ADMIN" : "PANDUAN GURU"}
            </Badge>
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold leading-tight">
              {isAdmin ? "Buku Pedoman Ekstraksi CP & Prompt" : "Alur Kerja Otomasi Perangkat KBC"}
            </h2>
            <p className="text-sm text-emerald-100 leading-relaxed">
              {isAdmin 
                ? "Pelajari cara menyalin, menyesuaikan, dan menyusun prompt ke ChatGPT/Gemini untuk menghasilkan Database CP Elemen yang bebas halusinasi."
                : "Pelajari prosedur 3 fase (Input, Generate, Koreksi) agar dokumen yang Anda hasilkan konsisten, akurat, dan sesuai dengan kalender akademik."}
            </p>
          </div>
          
          <Button
            variant="accent"
            size="md"
            icon={BookOpen}
            onClick={() => setIsDocsModalOpen(true)}
            className="w-full sm:w-auto"
          >
            Baca {isAdmin ? "Pedoman" : "Alur Kerja"}
          </Button>
        </div>
      </Card>

      <MarkdownModal 
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
        title={isAdmin ? "Panduan Ekstraksi CP (Admin)" : "Alur Kerja Guru (Workflow)"}
        markdownContent={isAdmin ? PROMPT_ADMIN_MD : ALUR_GURU_MD}
      />

      {/* Menu Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              Akses Cepat Menu
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {visibleMenuCards.length} Menu
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visibleMenuCards.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.id}
                variant="interactive"
                padding="md"
                onClick={() => onNavigate(item.id)}
                className="cursor-pointer active:scale-[0.99] group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      item.variant === 'accent' 
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                        : item.variant === 'primary'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <Badge variant={item.variant} size="sm" className="uppercase tracking-wide">
                      {item.badge}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform pt-2 border-t border-slate-100 dark:border-slate-700">
                    <span>Buka</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
