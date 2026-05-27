"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, Camera, ImageIcon, X } from "lucide-react";

interface Props {
  onImageSelect: (file: File, preview: string) => void;
  disabled?: boolean;
}

export default function ImageUpload({ onImageSelect, disabled }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
    // reset so the same file can be reselected
    e.target.value = "";
  };

  const clearImage = () => setPreview(null);

  if (preview) {
    return (
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-50">
        <img
          src={preview}
          alt="アップロードした建物"
          className="w-full h-64 sm:h-72 object-cover"
        />
        {!disabled && (
          <button
            onClick={clearImage}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg active:scale-95 transition-transform"
            style={{ minWidth: 44, minHeight: 44 }}
            aria-label="画像を削除"
          >
            <X className="w-4 h-4 text-slate-700" />
          </button>
        )}
        {disabled && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center">
            <div className="flex items-center gap-3 bg-white rounded-full px-5 py-3 shadow-lg">
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-slate-700">AI解析中...</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Camera / Gallery buttons for mobile */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        <button
          onClick={() => cameraInputRef.current?.click()}
          disabled={disabled}
          className="flex flex-col items-center justify-center gap-2 bg-indigo-600 text-white rounded-2xl py-5 font-semibold active:scale-95 transition-transform disabled:opacity-50"
          style={{ minHeight: 80 }}
        >
          <Camera className="w-6 h-6" />
          <span className="text-sm">カメラで撮影</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex flex-col items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl py-5 font-semibold active:scale-95 transition-transform disabled:opacity-50"
          style={{ minHeight: 80 }}
        >
          <ImageIcon className="w-6 h-6 text-slate-400" />
          <span className="text-sm">アルバムから選択</span>
        </button>
      </div>

      {/* Drag & drop area for desktop */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          hidden sm:flex flex-col items-center justify-center h-64 rounded-2xl border-2 border-dashed
          transition-all duration-200 cursor-pointer
          ${dragOver
            ? "border-indigo-400 bg-indigo-50/50 scale-[1.01]"
            : "border-slate-300 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/30"
          }
        `}
      >
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
        <p className="text-sm text-slate-500">ドラッグ＆ドロップ、またはクリック</p>
        <p className="text-xs text-slate-400 mt-2">JPEG · PNG · WebP · 最大5MB</p>
      </div>

      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFileInput}
        disabled={disabled}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handleFileInput}
        disabled={disabled}
      />
    </div>
  );
}
