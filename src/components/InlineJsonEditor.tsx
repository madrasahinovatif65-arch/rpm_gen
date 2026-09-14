import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Save, X, AlertCircle } from 'lucide-react';

interface InlineJsonEditorProps {
  initialJson: any;
  onSave: (newJson: any) => void;
  onCancel: () => void;
}

export const InlineJsonEditor: React.FC<InlineJsonEditorProps> = ({ initialJson, onSave, onCancel }) => {
  const [jsonStr, setJsonStr] = useState(() => JSON.stringify(initialJson, null, 2));
  const [error, setError] = useState('');

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonStr);
      onSave(parsed);
    } catch (e: any) {
      setError("Format JSON tidak valid: " + e.message);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 p-4 rounded-xl shadow-inner border border-slate-700 w-full font-mono text-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-emerald-400">Inline JSON Editor (Edit Draft Mode)</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" icon={X} onClick={onCancel} className="border-slate-600 hover:bg-slate-800 text-slate-300">Batal</Button>
          <Button variant="primary" size="sm" icon={Save} onClick={handleSave}>Simpan & Render</Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-3 rounded-lg mb-3 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="text-xs leading-tight">{error}</span>
        </div>
      )}
      
      <p className="text-[11px] text-slate-500 mb-2 font-sans italic leading-tight">
        * Peringatan: Hanya ubah nilai teks yang berada di dalam tanda kutip ganda ("..."). Mengubah struktur tanda koma (,) atau kurung kurawal akan menyebabkan error validasi JSON.
      </p>
      
      <textarea
        className="flex-1 w-full bg-slate-950 border border-slate-700 rounded-lg p-4 font-mono text-[13px] text-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none min-h-[500px]"
        value={jsonStr}
        onChange={(e) => {
          setJsonStr(e.target.value);
          if (error) setError('');
        }}
        spellCheck={false}
      />
    </div>
  );
};
