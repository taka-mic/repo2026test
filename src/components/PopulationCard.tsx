"use client";

import { Users, TrendingUp, BarChart3, Wallet } from "lucide-react";
import type { PopulationData } from "@/types";

interface Props {
  population: PopulationData;
}

const demandColors: Record<string, { bg: string; text: string; bar: string }> = {
  非常に高い: { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500" },
  高い: { bg: "bg-green-50", text: "text-green-700", bar: "bg-green-500" },
  普通: { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-500" },
  低い: { bg: "bg-orange-50", text: "text-orange-700", bar: "bg-orange-500" },
  非常に低い: { bg: "bg-red-50", text: "text-red-700", bar: "bg-red-500" },
};

export default function PopulationCard({ population }: Props) {
  const colors = demandColors[population.demandLevel] ?? demandColors["普通"];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
          <Users className="w-4 h-4 text-emerald-600" />
        </div>
        <h2 className="font-bold text-slate-800 text-lg">人口・需要データ</h2>
        <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${colors.bg} ${colors.text}`}>
          需要{population.demandLevel}
        </span>
      </div>

      <div className="space-y-4">
        <ScoreBar
          label="人口密度スコア"
          score={population.densityScore}
          icon={<Users className="w-3.5 h-3.5" />}
          color={colors.bar}
        />
        <ScoreBar
          label="人口流入スコア"
          score={population.inflowScore}
          icon={<TrendingUp className="w-3.5 h-3.5" />}
          color={colors.bar}
        />
        <ScoreBar
          label="ウォーカビリティ"
          score={Math.round(population.walkabilityScore)}
          icon={<BarChart3 className="w-3.5 h-3.5" />}
          color={colors.bar}
        />
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
        <MetricItem
          icon={<Wallet className="w-3.5 h-3.5 text-slate-400" />}
          label="推定平均年収"
          value={`${(population.averageIncome / 10000).toFixed(0)}万円`}
        />
        <MetricItem
          icon={<TrendingUp className="w-3.5 h-3.5 text-slate-400" />}
          label="昼夜間人口比"
          value={`${population.dayNightRatio.toFixed(1)}倍`}
        />
        <MetricItem
          icon={<Users className="w-3.5 h-3.5 text-slate-400" />}
          label="生産年齢人口率"
          value={`${Math.round(population.workingAgeRatio * 100)}%`}
        />
        <MetricItem
          icon={<BarChart3 className="w-3.5 h-3.5 text-slate-400" />}
          label="近接駅数(推定)"
          value={`${population.nearbyStations}駅`}
        />
      </div>
    </div>
  );
}

function ScoreBar({ label, score, icon, color }: { label: string; score: number; icon: React.ReactNode; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          {icon}
          {label}
        </span>
        <span className="text-xs font-bold text-slate-700">{score}<span className="font-normal text-slate-400">/100</span></span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function MetricItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="flex items-center gap-1 text-xs text-slate-400">
        {icon}
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-700">{value}</span>
    </div>
  );
}
