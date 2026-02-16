import { NextResponse } from "next/server";
import { NaverLocalResponse, NaverImageResponse, Category } from "@/lib/types";

export const runtime = "edge";

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  cafe: ["감성카페", "뷰카페", "대형카페", "디저트카페", "브런치카페"],
  restaurant: ["한식맛집", "양식맛집", "일식맛집", "고기맛집", "해산물맛집"],
  resort: ["힐링여행지", "관광명소", "자연휴양림", "온천스파", "해변여행"],
};

const CATEGORIES: Category[] = ["cafe", "restaurant", "resort"];

async function fetchPlaceImage(
  placeName: string,
  clientId: string,
  clientSecret: string,
): Promise<string | null> {
  try {
    const query = placeName.replace(/<[^>]*>/g, "");
    const url = `https://openapi.naver.com/v1/search/image?query=${encodeURIComponent(query)}&display=1&sort=sim`;
    const res = await fetch(url, {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
    });
    if (!res.ok) return null;
    const data: NaverImageResponse = await res.json();
    return data.items?.[0]?.link || null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") || "";

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Naver API credentials not configured" },
      { status: 500 },
    );
  }

  try {
    const randomCategory =
      CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const keywords = CATEGORY_KEYWORDS[randomCategory];
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];

    const query = region ? `${region} ${randomKeyword}` : randomKeyword;
    const randomStart = Math.floor(Math.random() * 5) + 1;

    const url = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=5&start=${randomStart}&sort=random`;

    const response = await fetch(url, {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
    });

    if (!response.ok) {
      throw new Error(`Naver API error: ${response.status}`);
    }

    const data: NaverLocalResponse = await response.json();

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: "No places found" }, { status: 404 });
    }

    const randomPlace =
      data.items[Math.floor(Math.random() * data.items.length)];

    // 대표 이미지 가져오기
    const thumbnail = await fetchPlaceImage(
      randomPlace.title,
      clientId,
      clientSecret,
    );

    return NextResponse.json({
      place: { ...randomPlace, thumbnail },
      category: randomCategory,
    });
  } catch (error) {
    console.error("Naver Featured API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured place" },
      { status: 500 },
    );
  }
}
