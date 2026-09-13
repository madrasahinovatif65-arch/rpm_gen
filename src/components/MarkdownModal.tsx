import React, { useState } from "react";
import { X, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  markdownContent: string;
}

export const MarkdownModal: React.FC<MarkdownModalProps> = ({
  isOpen,
  onClose,
  title,
  markdownContent
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50 dark:bg-slate-900/50">
          <div className="prose prose-slate dark:prose-invert prose-emerald max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                code({node, inline, className, children, ...props}: any) {
                  const match = /language-(\w+)/.exec(className || '')
                  const isBlock = !inline && match;
                  
                  if (isBlock) {
                    return <CodeBlock className={className} {...props}>{children}</CodeBlock>;
                  }
                  
                  return <code className={className} {...props}>{children}</code>;
                }
              }}
            >
              {markdownContent}
            </ReactMarkdown>
          </div>
        </div>

      </div>
    </div>
  );
};

const CodeBlock = ({ children, className, ...props }: any) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden mt-4 mb-6">
      <div className="absolute right-3 top-3 z-10">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg shadow-sm transition-all duration-200 border border-slate-600/50 backdrop-blur-md"
          title="Salin Teks"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">Tersalin</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span className="text-xs font-medium">Salin</span>
            </>
          )}
        </button>
      </div>
      <code className={`${className} block p-4 bg-slate-800 text-slate-100 overflow-x-auto`} {...props}>
        {children}
      </code>
    </div>
  );
};
