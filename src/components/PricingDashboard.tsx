"use client";

import { JapaneseYen, TrendingUp, TrendingDown, Minus, Target, BarChart3 } from "lucide-react";
import type { PricingResult, RoomTypePricing } from "@/types";

interface Props {
  pricing: PricingResult;
  roomTypes: RoomTypePricing[];
  summary: string;
}

const impactIcons = {
  positive: <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />,
  negative: <TrendingDown className="w-3.5 h-3.5 text-red-400" />,
  neutral: <Minus className="w-3.5 h-3.5 text-slate-400" />,
};

const impactColors = {
  positive: "text-emerald-600",
  negative: "text-red-500",
  neutral: "text-slate-500",
};

export default function PricingDashboard({ pricing, roomTypes, summary }: Props) {
  return (
    <div className="space-y-4">
      {/* Optimal Rent Hero */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-indigo-200" />
          <span className="font-semibold text-indigo-100 text-xs">AI推奨 最適賃料（1K/1DK基準）</span>
        </div>
        <div className="text-center mb-4">
          <div className="text-4xl sm:text-5xl font-black mb-0.5">
            ¥{pricing.optimalRent.toLocaleString()}
          </div>
          <div className="text-indigo-200 text-sm">/月</div>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-xs text-indigo-200 mb-0.5">下限</div>
            <div className="font-bold text-sm sm:text-base">¥{pricing.minRent.toLocaleString()}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-xs text-indigo-200 mb-0.5">上限</div>
            <div className="font-bold text-sm sm:text-base">¥{pricing.maxRent.toLocaleString()}</div>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
          <span className="text-xs text-indigo-200">分析信頼度</span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{ width: `${pricing.confidenceScore}%` }}
              />
            </div>
            <span className="text-xs font-bold">{Math.round(pricing.confidenceScore)}%</span>
          </div>
        </div>
      </div>

      {/* Market Comparison */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-slate-400" />
          <h3 className="font-bold text-slate-700 text-sm">市場比較</h3>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs text-slate-400 mb-1">エリア平均</div>
            <div className="text-sm font-bold text-slate-700">¥{pricing.comparison.areaAverage.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">類似物件</div>
            <div className="text-sm font-bold text-slate-700">¥{pricing.comparison.similarBuildings.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">プレミアム率</div>
            <div className={`text-sm font-bold ${pricing.comparison.premiumRate >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {pricing.comparison.premiumRate >= 0 ? "+" : ""}{pricing.comparison.premiumRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Price Factors */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <h3 className="font-bold text-slate-700 text-sm mb-3">価格決定要因</h3>
        <div className="space-y-3">
          {pricing.priceFactors.map((factor, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="mt-0.5 flex-shrink-0">{impactIcons[factor.impact]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-semibold text-slate-700">{factor.name}</span>
                  <span className={`text-xs font-bold ${impactColors[factor.impact]}`}>
                    {factor.score}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-snug">{factor.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Room Type Pricing */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <JapaneseYen className="w-4 h-4 text-slate-400" />
          <h3 className="font-bold text-slate-700 text-sm">間取り別 推奨賃料</h3>
        </div>
        <div className="space-y-1">
          {roomTypes.map((room, i) => (
            <div key={i} className="flex items-center py-2.5 border-b border-slate-50 last:border-0">
              <div className="w-20 flex-shrink-0">
                <span className="text-xs font-bold text-slate-700">{room.type}</span>
                <div className="text-xs text-slate-400">{room.area}</div>
              </div>
              <div className="flex-1 mx-3 hidden sm:block">
                <div className="h-1.5 bg-indigo-100 rounded-full" />
              </div>
              <div className="text-right flex-shrink-0 ml-auto">
                <div className="text-sm font-bold text-indigo-600">¥{room.optimalRent.toLocaleString()}</div>
                <div className="text-xs text-slate-400">
                  {room.minRent.toLocaleString()}〜{room.maxRent.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <h3 className="font-bold text-slate-700 text-sm">賃料戦略アドバイス</h3>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{summary}</p>
      </div>
    </div>
  );
}
