import React from "react";
import { Bot, ExternalLink, Globe, Sparkles, Compass, ShieldCheck } from "lucide-react";
import { Badge, Button, Card } from "./ui";

export const GeneratorAILainnyaView: React.FC = () => {
  const targetUrl = "https://website-kerinciberbagi.blogspot.com/";

  const handleOpenLink = (url: string = targetUrl) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const externalLinks = [
    {
      title: "Portal Generator AI Kerinci Berbagi",
      description: "Akses lengkap kumpulan alat bantu Generator AI, template perangkat pembelajaran, dan media edukasi terpadu.",
      url: "https://website-kerinciberbagi.blogspot.com/",
      badge: "Rekomendasi Utama",
      icon: Globe,
      color: "bg-emerald-600"
    },
    {
      title: "Bank Prompt & Modul AI Edukasi",
      description: "Koleksi panduan prompt AI praktis untuk penyusunan modul ajar, asesmen Kurikulum Merdeka, dan media pembelajaran.",
      url: "https://website-kerinciberbagi.blogspot.com/",
      badge: "Resource Guru",
      icon: Sparkles,
      color: "bg-slate-700"
    },
    {
      title: "Media Pembelajaran Interaktif",
      description: "Pranala luar ke berbagai instrumen dan aplikasi pendukung kegiatan mengajar interaktif berbasis AI.",
      url: "https://website-kerinciberbagi.blogspot.com/",
      badge: "Aplikasi Eksternal",
      icon: Compass,
      color: "bg-amber-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-slate-700">
        <div className="max-w-3xl space-y-4">
          <Badge variant="primary" size="sm" className="w-fit items-center gap-2 uppercase tracking-wider">
            <Bot className="w-4 h-4" />
            Kumpulan AI Edukasi Eksternal
          </Badge>

          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-emerald-300">
            Generator AI Lainnya
          </h2>

          <p className="text-slate-200 text-sm md:text-base leading-relaxed">
            Semua pranala pada halaman ini akan diarahkan secara langsung ke situs web resmi eksternal di luar aplikasi (tab baru), memberikan akses cepat tanpa batasan sematan.
          </p>

          <div className="pt-2">
            <Button onClick={() => handleOpenLink(targetUrl)} variant="primary" size="lg" icon={Globe}>
              <span>Buka Portal Generator AI (Tab Baru)</span>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Info Notice Badge */}
      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-center space-x-3 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-medium">
        <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span>
          Tautan di bawah ini aman dan akan membuka portal resmi Kerinci Berbagi secara langsung di peramban Anda.
        </span>
      </div>

      {/* External Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {externalLinks.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card key={index} variant="bordered" padding="lg" className="flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <Badge variant="info" size="sm">{item.badge}</Badge>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-700/60">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-emerald-600 dark:hover:bg-emerald-600 text-white font-bold text-xs transition-all active:scale-95 shadow-xs"
                >
                  <span>Kunjungi Situs Luar</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

