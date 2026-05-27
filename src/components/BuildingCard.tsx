"use client";

import { Building2, MapPin, Calendar, Layers, CheckCircle2 } from "lucide-react";
import type { BuildingAnalysis } from "@/types";

interface Props {
  building: BuildingAnalysis;
}

const cityTypeBadgeColor: Record<string, string> = {
  都心: "bg-violet-100 text-violet-700",
  副都心: "bg-indigo-100 text-indigo-700",
  近郊: "bg-blue-100 text-blue-700",
  郊外: "bg-teal-100 text-teal-700",
  地方: "bg-slate-100 text-slate-700",
};

export default function BuildingCard({ building }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
          <Building2 className="w-4 h-4 text-indigo-600" />
        </div>
        <h2 className="font-bold text-slate-800 text-lg">建物分析</h2>
        <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${cityTypeBadgeColor[building.cityType] ?? "bg-slate-100 text-slate-700"}`}>
          {building.cityType}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <InfoItem icon={<Building2 className="w-3.5 h-3.5" />} label="建物種別" value={building.buildingType} />
        <InfoItem icon={<Layers className="w-3.5 h-3.5" />} label="構造" value={building.structure} />
        <InfoItem icon={<Calendar className="w-3.5 h-3.5" />} label="築年数" value={building.estimatedAge} />
        <InfoItem icon={<CheckCircle2 className="w-3.5 h-3.5" />} label="状態" value={building.condition} />
        <InfoItem icon={<Layers className="w-3.5 h-3.5" />} label="階数" value={building.floors} />
        <InfoItem icon={<MapPin className="w-3.5 h-3.5" />} label="推定地域" value={building.prefecture} />
      </div>

      {building.areaCharacteristics.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">エリア特徴</p>
          <div className="flex flex-wrap gap-1.5">
            {building.areaCharacteristics.map((c, i) => (
              <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">分析信頼度</span>
          <span className="text-xs font-bold text-indigo-600">{building.locationConfidence}%</span>
        </div>
        <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all duration-700"
            style={{ width: `${building.locationConfidence}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
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
