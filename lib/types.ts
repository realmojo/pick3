export type Category = "cafe" | "restaurant" | "resort";

export type Region =
  | "서울"
  | "경기"
  | "인천"
  | "강원"
  | "제주"
  | "부산"
  | "대구"
  | "대전"
  | "광주"
  | "울산"
  | "세종"
  | "충북"
  | "충남"
  | "전북"
  | "전남"
  | "경북"
  | "경남";

export const REGIONS: Region[] = [
  "서울",
  "경기",
  "인천",
  "강원",
  "제주",
  "부산",
  "대구",
  "대전",
  "광주",
  "울산",
  "세종",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
];
export interface CategoryInfo {
  id: Category;
  name: string;
  emoji: string;
  image: string;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  cafe: "카페",
  restaurant: "맛집",
  resort: "휴양지",
};

// 카테고리별 기본 이미지 (Kakao API에 이미지가 없으므로)
export const CATEGORY_IMAGES: Record<Category, string[]> = {
  cafe: [
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop",
  ],
  restaurant: [
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop",
  ],
  resort: [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop",
  ],
};

export function getCategoryImage(category: Category, index: number): string {
  const images = CATEGORY_IMAGES[category];
  return images[index % images.length];
}

// 주소에서 간단한 위치 추출 (구/동 단위)
export function getShortAddress(address: string): string {
  const parts = address.split(" ");
  if (parts.length >= 3) {
    return `${parts[0]} ${parts[1]} ${parts[2]}`;
  }
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1]}`;
  }
  return address;
}

// 카테고리별 세부 필터 옵션
export interface SubFilter {
  label: string;
  keyword: string;
}

export const SUB_FILTERS: Record<Category, SubFilter[]> = {
  cafe: [
    { label: "감성카페", keyword: "감성카페" },
    { label: "뷰카페", keyword: "뷰카페" },
    { label: "대형카페", keyword: "대형카페" },
    { label: "디저트카페", keyword: "디저트카페" },
    { label: "북카페", keyword: "북카페" },
    { label: "브런치카페", keyword: "브런치카페" },
    { label: "애견카페", keyword: "애견카페" },
    { label: "루프탑카페", keyword: "루프탑카페" },
  ],
  restaurant: [
    { label: "한식", keyword: "한식맛집" },
    { label: "양식", keyword: "양식맛집" },
    { label: "일식", keyword: "일식맛집" },
    { label: "중식", keyword: "중식맛집" },
    { label: "분식", keyword: "분식맛집" },
    { label: "고기", keyword: "고기맛집" },
    { label: "해산물", keyword: "해산물맛집" },
    { label: "채식", keyword: "채식맛집" },
    { label: "브런치", keyword: "브런치맛집" },
    { label: "파인다이닝", keyword: "파인다이닝" },
  ],
  resort: [
    { label: "산/계곡", keyword: "산 계곡 여행" },
    { label: "바다/해변", keyword: "바다 해변 여행" },
    { label: "숲/공원", keyword: "숲 공원 힐링" },
    { label: "온천/스파", keyword: "온천 스파" },
    { label: "섬여행", keyword: "섬 여행" },
    { label: "캠핑", keyword: "캠핑장" },
    { label: "트레킹", keyword: "등산 트레킹" },
    { label: "템플스테이", keyword: "템플스테이" },
  ],
};

export type SortType = "accuracy" | "distance";

// 반경 옵션 (미터)
export interface RadiusOption {
  label: string;
  value: number;
}

export const RADIUS_OPTIONS: RadiusOption[] = [
  { label: "500m", value: 500 },
  { label: "1km", value: 1000 },
  { label: "3km", value: 3000 },
  { label: "5km", value: 5000 },
  { label: "10km", value: 10000 },
  { label: "20km", value: 20000 },
];

export interface Coords {
  x: string; // longitude
  y: string; // latitude
}

export interface FilterState {
  region: Region | null;
  subFilter: string | null;
  sort: SortType;
  size: number;
  useMyLocation: boolean;
  radius: number | null; // meters, null = no radius filter
  coords: Coords | null;
  page: number;
}

// Naver Blog Search API Types
export interface NaverBlogItem {
  title: string; // HTML 태그 포함된 제목
  link: string; // 블로그 포스트 URL
  description: string; // HTML 태그 포함된 요약
  bloggername: string; // 블로거 이름
  bloggerlink: string; // 블로그 URL
  postdate: string; // YYYYMMDD 형식
}

export interface NaverBlogResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverBlogItem[];
}

// Naver Local Search API Types
export interface NaverLocalItem {
  title: string; // HTML 태그 포함된 장소명
  link: string; // 장소 관련 URL
  category: string; // 카테고리 (예: "카페,디저트>카페")
  description: string; // 설명
  telephone: string; // 전화번호
  address: string; // 지번 주소
  roadAddress: string; // 도로명 주소
  mapx: string; // x좌표 (카텍좌표)
  mapy: string; // y좌표 (카텍좌표)
}

export interface NaverLocalResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverLocalItem[];
}

// Naver Image Search API Types
export interface NaverImageItem {
  title: string; // HTML 태그 포함된 제목
  link: string; // 이미지 원본 URL
  thumbnail: string; // 썸네일 URL
  sizeheight: string; // 이미지 높이
  sizewidth: string; // 이미지 너비
}

export interface NaverImageResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverImageItem[];
}
