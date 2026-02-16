import { NextResponse } from "next/server";
import {
  searchPlacesByCategory,
  searchPlacesByCategoryCode,
} from "@/lib/kakao";
import { Category } from "@/lib/types";

const VALID_CATEGORIES: Category[] = ["cafe", "restaurant", "resort"];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const { categoryId } = await params;

  if (!VALID_CATEGORIES.includes(categoryId as Category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 1;
  const size = Number(searchParams.get("size")) || 3;
  const region = searchParams.get("region") || undefined;
  const sub = searchParams.get("sub") || undefined;
  const sort = searchParams.get("sort") || "accuracy";
  const x = searchParams.get("x") || undefined;
  const y = searchParams.get("y") || undefined;
  const radius = searchParams.get("radius")
    ? Number(searchParams.get("radius"))
    : undefined;
  const mode = searchParams.get("mode"); // "nearby" = 카테고리 직접 검색

  try {
    // 내 주변 모드: 좌표 기반 카테고리 직접 검색 (키워드 없이)
    if (mode === "nearby" && x && y) {
      const data = await searchPlacesByCategoryCode(
        categoryId as Category,
        x,
        y,
        radius || 3000,
        page,
        size,
        sort,
      );
      return NextResponse.json(data);
    }

    // 일반 키워드 기반 검색
    const location =
      x && y ? { x, y, radius } : undefined;

    const data = await searchPlacesByCategory(
      categoryId as Category,
      page,
      size,
      region,
      sub,
      sort,
      location,
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Kakao API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch places" },
      { status: 500 },
    );
  }
}
