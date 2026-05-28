import Anthropic from "@anthropic-ai/sdk";
import type { BuildingAnalysis } from "@/types";

const client = new Anthropic();

export async function analyzeBuildingImage(
  base64Image: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif",
  locationContext: string | null = null
): Promise<BuildingAnalysis> {
  const locationHint = locationContext
    ? `\n\n【GPS情報あり】この写真は以下の場所で撮影されました: ${locationContext}\nこの位置情報を参考に、prefecture・cityType・areaCharacteristicsを正確に入力してください。`
    : "";

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system: `あなたは日本の不動産の専門家です。建物の写真を分析して、建物の特徴と立地情報をJSON形式で返してください。
写真に建物名（マンション名・アパート名）や住所が写っている場合は正確に読み取ってください。看板・表札・エントランスの文字・郵便受けなどに注目してください。${locationHint}
必ず以下のJSON形式のみで回答してください（説明文なし）:
{
  "buildingName": "建物名（読み取れた場合は正確な名称、不明の場合は「不明」）",
  "address": "住所（読み取れた場合は番地まで、部分的に分かる場合はその範囲で、不明の場合は「不明」）",
  "buildingType": "マンション/アパート/一戸建て/ビルなど",
  "estimatedAge": "築年数の推定（例: 築10〜20年）",
  "condition": "外観の状態（新築同様/良好/普通/やや古い/老朽化）",
  "floors": "階数の推定（例: 5〜10階建て）",
  "structure": "構造の推定（RC造/鉄骨造/木造/不明）",
  "nearbyLandmarks": ["周辺の特徴的な施設や環境（配列で複数）"],
  "neighborhoodType": "周辺環境の特徴",
  "areaCharacteristics": ["エリアの特徴（配列で複数）"],
  "locationConfidence": 0〜100の推定信頼度,
  "prefecture": "推定都道府県（不明の場合は「不明」）",
  "cityType": "都心/副都心/近郊/郊外/地方 のいずれか"
}`,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Image,
            },
          },
          {
            type: "text",
            text: "この建物の写真を分析して、指定のJSON形式で建物情報と立地情報を返してください。",
          },
        ],
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in response");

  return JSON.parse(jsonMatch[0]) as BuildingAnalysis;
}

export async function generatePricingInsight(
  buildingAnalysis: BuildingAnalysis,
  populationMetrics: object
): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    system:
      "あなたは日本の不動産市場の専門家です。建物分析と人口データに基づいて、賃料設定の戦略的アドバイスを日本語で提供してください。200〜300文字程度で簡潔にまとめてください。",
    messages: [
      {
        role: "user",
        content: `以下のデータに基づいて最適賃料の根拠と賃貸戦略のアドバイスをください：
建物分析: ${JSON.stringify(buildingAnalysis, null, 2)}
人口・需要データ: ${JSON.stringify(populationMetrics, null, 2)}`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  return content.text;
}
