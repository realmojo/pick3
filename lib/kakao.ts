import { Category } from "./types";

const KAKAO_KEYWORD_URL =
  "https://dapi.kakao.com/v2/local/search/keyword.json";
const KAKAO_CATEGORY_URL =
  "https://dapi.kakao.com/v2/local/search/category.json";

// 카테고리별 Kakao 카테고리 그룹 코드 및 검색 키워드
export const CATEGORY_CONFIG: Record<
  Category,
  { code: string; keywords: string[] }
> = {
  cafe: {
    code: "CE7",
    keywords: ["인기카페", "감성카페", "뷰카페"],
  },
  restaurant: {
    code: "FD6",
    keywords: ["맛집", "인기맛집", "추천맛집"],
  },
  resort: {
    code: "AT4",
    keywords: ["휴양지", "관광명소", "힐링여행"],
  },
};

export interface KakaoPlace {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  category_group_name: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  place_url: string;
  distance: string;
}

export interface KakaoSearchResponse {
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
  documents: KakaoPlace[];
}

interface LocationParams {
  x?: string;
  y?: string;
  radius?: number;
}

function getApiKey(): string {
  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey || apiKey === "your_kakao_rest_api_key_here") {
    throw new Error("KAKAO_REST_API_KEY is not configured");
  }
  return apiKey;
}

async function kakaoFetch(url: string): Promise<KakaoSearchResponse> {
  const response = await fetch(url, {
    headers: { Authorization: `KakaoAK ${getApiKey()}` },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Kakao API error response: ${errorBody}`);
    throw new Error(`Kakao API error: ${response.status} - ${errorBody}`);
  }

  return response.json();
}

// 키워드 + 카테고리 코드 기반 검색
export async function searchPlacesByCategory(
  category: Category,
  page: number = 1,
  size: number = 3,
  region?: string,
  subKeyword?: string,
  sort: string = "accuracy",
  location?: LocationParams,
): Promise<KakaoSearchResponse> {
  const config = CATEGORY_CONFIG[category];

  let baseKeyword: string;
  if (subKeyword) {
    baseKeyword = subKeyword;
  } else {
    baseKeyword =
      config.keywords[Math.floor(Math.random() * config.keywords.length)];
  }

  const keyword = region ? `${region} ${baseKeyword}` : baseKeyword;

  const params = new URLSearchParams({
    query: keyword,
    category_group_code: config.code,
    page: String(page),
    size: String(size),
    sort,
  });

  // GPS 좌표 + 반경 필터
  if (location?.x && location?.y) {
    params.set("x", location.x);
    params.set("y", location.y);
    if (location.radius) {
      params.set("radius", String(location.radius));
    }
  }

  return kakaoFetch(`${KAKAO_KEYWORD_URL}?${params}`);
}

// 카테고리 코드만으로 주변 장소 검색 (좌표 필수)
export async function searchPlacesByCategoryCode(
  category: Category,
  x: string,
  y: string,
  radius: number = 3000,
  page: number = 1,
  size: number = 15,
  sort: string = "distance",
): Promise<KakaoSearchResponse> {
  const config = CATEGORY_CONFIG[category];

  const params = new URLSearchParams({
    category_group_code: config.code,
    x,
    y,
    radius: String(radius),
    page: String(page),
    size: String(size),
    sort,
  });

  return kakaoFetch(`${KAKAO_CATEGORY_URL}?${params}`);
}

// 키워드 검색 (자유 검색)
export async function searchPlacesByKeyword(
  keyword: string,
  page: number = 1,
  size: number = 15,
  sort: string = "accuracy",
  location?: LocationParams,
): Promise<KakaoSearchResponse> {
  const params = new URLSearchParams({
    query: keyword,
    page: String(page),
    size: String(size),
    sort,
  });

  if (location?.x && location?.y) {
    params.set("x", location.x);
    params.set("y", location.y);
    if (location.radius) {
      params.set("radius", String(location.radius));
    }
  }

  return kakaoFetch(`${KAKAO_KEYWORD_URL}?${params}`);
}
