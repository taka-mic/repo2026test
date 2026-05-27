"use client";

import { useCallback, useState } from "react";
import { Upload, ImageIcon, X } from "lucide-react";

interface Props {
  onImageSelect: (file: File, preview: string) => void;
  disabled?: boolean;
}

export default function ImageUpload({ onImageSelect, disabled }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const processFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPreview(dataUrl);
        onImageSelect(file, dataUrl);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) processFile(file);
    },
    [processFile]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const clearImage = () => {
    setPreview(null);
  };

  if (preview) {
    return (
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-50">
        <img
          src={preview}
          alt="アップロードした建物"
          className="w-full h-72 object-cover"
        />
        {!disabled && (
          <button
            onClick={clearImage}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg hover:bg-white transition-colors"
          >
            <X className="w-4 h-4 text-slate-700" />
          </button>
        )}
        {disabled && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center">
            <div className="flex items-center gap-3 bg-white rounded-full px-5 py-2.5 shadow-lg">
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-slate-700">AI解析中...</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`
        relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer
        ${dragOver
          ? "border-indigo-400 bg-indigo-50/50 scale-[1.01]"
          : "border-slate-300 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/30"
        }
      `}
    >
      <label className="flex flex-col items-center justify-center h-64 cursor-pointer px-6">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleFileInput}
          disabled={disabled}
        />
        <div className={`
          w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors
          ${dragOver ? "bg-indigo-100" : "bg-white shadow-sm border border-slate-200"}
        `}>
          {dragOver ? (
            <Upload className="w-7 h-7 text-indigo-500" />
          ) : (
            <ImageIcon className="w-7 h-7 text-slate-400" />
          )}
        </div>
        <p className="text-base font-semibold text-slate-700 mb-1">
          建物の写真をアップロード
        </p>
        <p className="text-sm text-slate-500 text-center">
          ドラッグ＆ドロップ、またはクリックして選択
        </p>
        <p className="text-xs text-slate-400 mt-2">JPEG · PNG · WebP · 最大5MB</p>
      </label>
    </div>
  );
}
