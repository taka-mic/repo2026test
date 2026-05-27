"use client";

import { useState } from "react";
import { Building2, ChevronRight, AlertCircle } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import BuildingCard from "@/components/BuildingCard";
import PopulationCard from "@/components/PopulationCard";
import PricingDashboard from "@/components/PricingDashboard";
import type { AnalysisResponse } from "@/types";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "分析に失敗しました");
        return;
      }
      setResult(data as AnalysisResponse);
    } catch {
      setError("ネットワークエラーが発生しました。もう一度お試しください。");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-sm">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-black text-slate-800 text-sm leading-none">RentAI</h1>
            <p className="text-xs text-slate-400 leading-none mt-0.5">AI賃料査定システム</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {!result ? (
          <div className="max-w-lg mx-auto">
            {/* Hero */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                Claude AI + 人口動態データ
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-3 leading-tight">
                建物写真から<br />
                <span className="text-indigo-600">最適賃料</span>を算出
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                マンション・アパートの外観写真をアップロードするだけで、
                AI画像認識と人口密度・流入データを組み合わせた
                科学的な賃料査定を行います。
              </p>
            </div>

            {/* Upload */}
            <div className="space-y-4">
              <ImageUpload onImageSelect={handleImageSelect} disabled={analyzing} />

              {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={!selectedFile || analyzing}
                className={`
                  w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-bold text-base transition-all duration-200
                  ${selectedFile && !analyzing
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }
                `}
              >
                {analyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    AIが解析中...
                  </>
                ) : (
                  <>
                    賃料査定を開始
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Features */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                { icon: "🏢", title: "建物認識", desc: "AI画像解析で建物特性を自動判定" },
                { icon: "👥", title: "人口分析", desc: "人口密度・流入データを活用" },
                { icon: "💹", title: "賃料最適化", desc: "多要素モデルで最適価格を算出" },
              ].map((f) => (
                <div key={f.title} className="bg-white rounded-xl border border-slate-200 p-3 text-center">
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <div className="text-xs font-bold text-slate-700 mb-0.5">{f.title}</div>
                  <div className="text-xs text-slate-400 leading-snug">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">査定結果</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {result.building.buildingType} · {result.building.cityType} · {result.building.prefecture}
                </p>
              </div>
              <button
                onClick={handleReset}
                className="text-sm text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
              >
                再査定する
              </button>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Building + Population */}
              <div className="space-y-4">
                <BuildingCard building={result.building} />
                <PopulationCard population={result.population} />
              </div>

              {/* Right: Pricing */}
              <div>
                <PricingDashboard
                  pricing={result.pricing}
                  roomTypes={result.roomTypes}
                  summary={result.summary}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-8 text-xs text-slate-400">
        <p>RentAI — 建物写真 × 人口データによるAI賃料査定</p>
        <p className="mt-1">※ 本システムの算出結果は参考値です。実際の賃料設定には現地調査と専門家の判断をご活用ください。</p>
      </footer>
    </div>
  );
}
