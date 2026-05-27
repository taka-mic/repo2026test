import type {
  BuildingAnalysis,
  PopulationData,
  PricingResult,
  PriceFactor,
  RoomTypePricing,
} from "@/types";

// Base rent per sqm by city type (monthly, JPY)
const BASE_RENT_PER_SQM: Record<string, number> = {
  都心: 3800,
  副都心: 2800,
  近郊: 2000,
  郊外: 1400,
  地方: 900,
};

// Population density multipliers
function getDensityMultiplier(score: number): number {
  if (score >= 90) return 1.25;
  if (score >= 75) return 1.15;
  if (score >= 60) return 1.05;
  if (score >= 40) return 1.0;
  if (score >= 25) return 0.9;
  return 0.8;
}

function getInflowMultiplier(score: number): number {
  if (score >= 85) return 1.2;
  if (score >= 70) return 1.1;
  if (score >= 50) return 1.0;
  if (score >= 30) return 0.95;
  return 0.88;
}

function getConditionMultiplier(condition: string): number {
  const map: Record<string, number> = {
    新築同様: 1.2,
    良好: 1.1,
    普通: 1.0,
    やや古い: 0.88,
    老朽化: 0.75,
  };
  return map[condition] ?? 1.0;
}

function getStructureMultiplier(structure: string): number {
  const map: Record<string, number> = {
    RC造: 1.1,
    鉄骨造: 1.05,
    木造: 0.92,
    不明: 1.0,
  };
  return map[structure] ?? 1.0;
}

function getBuildingTypeMultiplier(type: string): number {
  if (type.includes("タワー")) return 1.35;
  if (type.includes("マンション")) return 1.1;
  if (type.includes("アパート")) return 0.95;
  return 1.0;
}

export function calculatePopulationData(
  building: BuildingAnalysis
): PopulationData {
  const densityByCity: Record<string, number> = {
    都心: 92,
    副都心: 78,
    近郊: 62,
    郊外: 42,
    地方: 28,
  };

  const inflowByCity: Record<string, number> = {
    都心: 88,
    副都心: 72,
    近郊: 58,
    郊外: 40,
    地方: 25,
  };

  const baseScore = densityByCity[building.cityType] ?? 50;
  const inflowScore = inflowByCity[building.cityType] ?? 45;

  // Adjust based on area characteristics
  const hasCommercial = building.areaCharacteristics.some(
    (c) =>
      c.includes("商業") ||
      c.includes("ビジネス") ||
      c.includes("オフィス") ||
      c.includes("駅近")
  );
  const hasResidential = building.areaCharacteristics.some(
    (c) => c.includes("住宅") || c.includes("閑静")
  );

  const densityScore = Math.min(
    100,
    baseScore + (hasCommercial ? 5 : 0) - (hasResidential ? 3 : 0)
  );

  const incomeByCity: Record<string, number> = {
    都心: 5800000,
    副都心: 4800000,
    近郊: 4200000,
    郊外: 3600000,
    地方: 3000000,
  };

  const demandLevel =
    densityScore >= 85
      ? ("非常に高い" as const)
      : densityScore >= 70
        ? ("高い" as const)
        : densityScore >= 50
          ? ("普通" as const)
          : densityScore >= 35
            ? ("低い" as const)
            : ("非常に低い" as const);

  return {
    densityScore,
    inflowScore: Math.min(100, inflowScore + (hasCommercial ? 8 : 0)),
    dayNightRatio: hasCommercial ? 1.8 : 0.9,
    workingAgeRatio: 0.65,
    averageIncome: incomeByCity[building.cityType] ?? 3800000,
    demandLevel,
    nearbyStations: building.cityType === "都心" ? 3 : building.cityType === "副都心" ? 2 : 1,
    walkabilityScore: densityScore * 0.85,
  };
}

export function calculatePricing(
  building: BuildingAnalysis,
  population: PopulationData
): PricingResult {
  const basePerSqm = BASE_RENT_PER_SQM[building.cityType] ?? 1500;

  const conditionMult = getConditionMultiplier(building.condition);
  const structureMult = getStructureMultiplier(building.structure);
  const densityMult = getDensityMultiplier(population.densityScore);
  const inflowMult = getInflowMultiplier(population.inflowScore);
  const typeMult = getBuildingTypeMultiplier(building.buildingType);

  const adjustedPerSqm =
    basePerSqm *
    conditionMult *
    structureMult *
    densityMult *
    inflowMult *
    typeMult;

  // Typical unit: 25 sqm (1K/1DK average)
  const typicalArea = 25;
  const optimal = Math.round((adjustedPerSqm * typicalArea) / 1000) * 1000;

  const factors: PriceFactor[] = [
    {
      name: "人口密度",
      impact: population.densityScore >= 60 ? "positive" : "negative",
      score: population.densityScore,
      description: `人口密度スコア ${population.densityScore}/100 — 需要${population.demandLevel}`,
    },
    {
      name: "人口流入",
      impact: population.inflowScore >= 55 ? "positive" : "negative",
      score: population.inflowScore,
      description: `転入超過・流入スコア ${population.inflowScore}/100`,
    },
    {
      name: "建物状態",
      impact:
        conditionMult >= 1.05
          ? "positive"
          : conditionMult <= 0.9
            ? "negative"
            : "neutral",
      score: Math.round(conditionMult * 100),
      description: `外観・状態: ${building.condition}`,
    },
    {
      name: "建物構造",
      impact:
        structureMult >= 1.08
          ? "positive"
          : structureMult <= 0.95
            ? "negative"
            : "neutral",
      score: Math.round(structureMult * 100),
      description: `構造: ${building.structure}`,
    },
    {
      name: "エリア需要",
      impact: "positive",
      score: Math.round(densityMult * 100),
      description: `${building.cityType}エリアの需要水準`,
    },
  ];

  const areaAverage = Math.round((basePerSqm * typicalArea) / 1000) * 1000;

  return {
    minRent: Math.round((optimal * 0.9) / 1000) * 1000,
    maxRent: Math.round((optimal * 1.15) / 1000) * 1000,
    optimalRent: optimal,
    confidenceScore: Math.min(
      95,
      50 + building.locationConfidence * 0.3 + population.densityScore * 0.2
    ),
    priceFactors: factors,
    recommendation: `${building.cityType}エリアの${building.buildingType}として、周辺相場と需要水準を考慮した最適賃料です。`,
    comparison: {
      areaAverage,
      similarBuildings: Math.round((optimal * 0.97) / 1000) * 1000,
      premiumRate: Math.round(((optimal - areaAverage) / areaAverage) * 100),
    },
  };
}

export function generateRoomTypePricing(
  building: BuildingAnalysis,
  pricing: PricingResult
): RoomTypePricing[] {
  const base = pricing.optimalRent;
  const cityMultiplier =
    building.cityType === "都心"
      ? 1
      : building.cityType === "副都心"
        ? 0.78
        : building.cityType === "近郊"
          ? 0.6
          : building.cityType === "郊外"
            ? 0.45
            : 0.3;

  const baseValue = cityMultiplier === 1 ? base : base;

  const rooms: RoomTypePricing[] = [
    {
      type: "ワンルーム",
      area: "18〜22㎡",
      minRent: Math.round((base * 0.75) / 1000) * 1000,
      maxRent: Math.round((base * 0.95) / 1000) * 1000,
      optimalRent: Math.round((base * 0.85) / 1000) * 1000,
    },
    {
      type: "1K / 1DK",
      area: "22〜30㎡",
      minRent: Math.round((base * 0.9) / 1000) * 1000,
      maxRent: Math.round((base * 1.1) / 1000) * 1000,
      optimalRent: base,
    },
    {
      type: "1LDK",
      area: "35〜45㎡",
      minRent: Math.round((base * 1.3) / 1000) * 1000,
      maxRent: Math.round((base * 1.6) / 1000) * 1000,
      optimalRent: Math.round((base * 1.45) / 1000) * 1000,
    },
    {
      type: "2LDK",
      area: "50〜65㎡",
      minRent: Math.round((base * 1.8) / 1000) * 1000,
      maxRent: Math.round((base * 2.2) / 1000) * 1000,
      optimalRent: Math.round((base * 2.0) / 1000) * 1000,
    },
    {
      type: "3LDK",
      area: "65〜85㎡",
      minRent: Math.round((base * 2.4) / 1000) * 1000,
      maxRent: Math.round((base * 3.0) / 1000) * 1000,
      optimalRent: Math.round((base * 2.7) / 1000) * 1000,
    },
  ];

  return rooms;
}
