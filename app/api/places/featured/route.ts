import { NextResponse } from "next/server";
import { searchPlacesByCategory } from "@/lib/kakao";
import { Category } from "@/lib/types";

const CATEGORIES: Category[] = ["cafe", "restaurant", "resort"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") || undefined;
  const x = searchParams.get("x") || undefined;
  const y = searchParams.get("y") || undefined;
  const radius = searchParams.get("radius")
    ? Number(searchParams.get("radius"))
    : undefined;
  const location =
    x && y ? { x, y, radius } : undefined;

  try {
    // 랜덤 카테고리에서 추천 장소 1개
    const randomCategory =
      CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const data = await searchPlacesByCategory(
      randomCategory,
      1,
      5,
      region,
      undefined,
      "accuracy",
      location,
    );

    if (data.documents.length === 0) {
      return NextResponse.json({ error: "No places found" }, { status: 404 });
    }

    // 랜덤으로 1개 선택
    const randomPlace =
      data.documents[Math.floor(Math.random() * data.documents.length)];

    return NextResponse.json({
      place: randomPlace,
      category: randomCategory,
    });
  } catch (error) {
    console.error("Kakao API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured place" },
      { status: 500 },
    );
  }
}
