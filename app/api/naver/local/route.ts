import { NextResponse } from "next/server";
import { NaverLocalResponse } from "@/lib/types";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const display = searchParams.get("display") || "5";
  const start = searchParams.get("start") || "1";
  const sort = searchParams.get("sort") || "random"; // random, comment, date

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Naver API credentials not configured" },
      { status: 500 },
    );
  }

  try {
    const url = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=${display}&start=${start}&sort=${sort}`;

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
    return NextResponse.json(data);
  } catch (error) {
    console.error("Naver Local API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch local places" },
      { status: 500 },
    );
  }
}
