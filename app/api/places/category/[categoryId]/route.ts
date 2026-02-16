import { NextResponse } from "next/server";
import { Category, NaverLocalResponse, NaverImageResponse } from "@/lib/types";

export const runtime = "edge";

const VALID_CATEGORIES: Category[] = ["cafe", "restaurant", "resort"];

const CATEGORY_KEYWORDS: Record<Category, string> = {
  cafe: "카페",
  restaurant: "맛집",
  resort: "관광명소",
};

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const { categoryId } = await params;

  if (!VALID_CATEGORIES.includes(categoryId as Category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Naver API credentials not configured" },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 1;
  const size = Number(searchParams.get("size")) || 3;
  const region = searchParams.get("region") || "";
  const sub = searchParams.get("sub") || "";
  const sort = searchParams.get("sort") || "random";

  try {
    const baseKeyword = sub || CATEGORY_KEYWORDS[categoryId as Category];
    const query = region ? `${region} ${baseKeyword}` : baseKeyword;
    const start = (page - 1) * size + 1;

    const url = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=${size}&start=${start}&sort=${sort}`;

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
    const items = data.items || [];

    // 각 장소별 대표 이미지를 병렬로 가져오기
    const itemsWithImages = await Promise.all(
      items.map(async (item) => {
        const thumbnail = await fetchPlaceImage(
          item.title,
          clientId,
          clientSecret,
        );
        return { ...item, thumbnail };
      }),
    );

    return NextResponse.json({
      items: itemsWithImages,
      total: data.total,
      start: data.start,
      display: data.display,
      isEnd: data.start + data.display > data.total,
    });
  } catch (error) {
    console.error("Naver API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch places" },
      { status: 500 },
    );
  }
}
