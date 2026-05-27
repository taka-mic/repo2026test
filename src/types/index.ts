export interface BuildingAnalysis {
  buildingType: string;
  estimatedAge: string;
  condition: string;
  floors: string;
  structure: string;
  nearbyLandmarks: string[];
  neighborhoodType: string;
  areaCharacteristics: string[];
  locationConfidence: number;
  prefecture: string;
  cityType: "都心" | "副都心" | "近郊" | "郊外" | "地方";
}

export interface PopulationData {
  densityScore: number;
  inflowScore: number;
  dayNightRatio: number;
  workingAgeRatio: number;
  averageIncome: number;
  demandLevel: "非常に高い" | "高い" | "普通" | "低い" | "非常に低い";
  nearbyStations: number;
  walkabilityScore: number;
}

export interface PricingResult {
  minRent: number;
  maxRent: number;
  optimalRent: number;
  confidenceScore: number;
  priceFactors: PriceFactor[];
  recommendation: string;
  comparison: RentComparison;
}

export interface PriceFactor {
  name: string;
  impact: "positive" | "negative" | "neutral";
  score: number;
  description: string;
}

export interface RentComparison {
  areaAverage: number;
  similarBuildings: number;
  premiumRate: number;
}

export interface AnalysisResponse {
  building: BuildingAnalysis;
  population: PopulationData;
  pricing: PricingResult;
  summary: string;
  roomTypes: RoomTypePricing[];
}

export interface RoomTypePricing {
  type: string;
  area: string;
  minRent: number;
  maxRent: number;
  optimalRent: number;
}
