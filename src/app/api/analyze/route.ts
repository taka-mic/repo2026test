import { NextRequest, NextResponse } from "next/server";
import { analyzeBuildingImage, generatePricingInsight } from "@/lib/claude";
import {
  calculatePopulationData,
  calculatePricing,
  generateRoomTypePricing,
} from "@/lib/pricing";
import type { AnalysisResponse } from "@/types";

async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ja`,
      {
        headers: { "User-Agent": "RentAI/1.0 (rental-price-estimator)" },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (data.display_name as string) ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "画像が見つかりません" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "JPEG, PNG, WebP, GIF 形式のみ対応しています" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "ファイルサイズは5MB以下にしてください" },
        { status: 400 }
      );
    }

    const latRaw = formData.get("latitude");
    const lonRaw = formData.get("longitude");
    let gpsAddress: string | null = null;
    let locationContext: string | null = null;

    if (latRaw && lonRaw) {
      const lat = parseFloat(String(latRaw));
      const lon = parseFloat(String(lonRaw));
      if (!isNaN(lat) && !isNaN(lon)) {
        gpsAddress = await reverseGeocode(lat, lon);
        if (gpsAddress) {
          locationContext = gpsAddress;
        }
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mediaType = file.type as
      | "image/jpeg"
      | "image/png"
      | "image/webp"
      | "image/gif";

    const building = await analyzeBuildingImage(base64, mediaType, locationContext);
    if (gpsAddress) {
      building.gpsAddress = gpsAddress;
    }

    const population = calculatePopulationData(building);
    const pricing = calculatePricing(building, population);
    const roomTypes = generateRoomTypePricing(building, pricing);
    const summary = await generatePricingInsight(building, population);

    const response: AnalysisResponse = {
      building,
      population,
      pricing,
      summary,
      roomTypes,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("Analysis error:", err);
    const message =
      err instanceof Error ? err.message : "分析中にエラーが発生しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
