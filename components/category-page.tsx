"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  SlidersHorizontal,
  Heart,
  Home,
  Compass,
  Heart as HeartIcon,
  User,
  MapPin,
  Loader2,
  Phone,
  X,
  Navigation,
  ChevronDown,
} from "lucide-react";
import { categories } from "@/lib/data";
import {
  KakaoPlace,
  Category,
  getCategoryImage,
  extractTags,
  CATEGORY_LABELS,
  SUB_FILTERS,
  Region,
  FilterState,
  RADIUS_OPTIONS,
} from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FilterSheet } from "./filter-sheet";

const CATEGORY_SUBTITLES: Record<Category, string> = {
  cafe: "엄선된 최고의 카페를 추천합니다.",
  restaurant: "엄선된 최고의 미식 경험을 제안합니다.",
  resort: "엄선된 최고의 힐링 장소를 소개합니다.",
};

function formatDistance(meters: string): string {
  const m = Number(meters);
  if (!m) return "";
  if (m < 1000) return `${m}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

interface CategoryPageProps {
  categoryId: Category;
  initialRegion?: string;
}

export function CategoryPage({
  categoryId,
  initialRegion,
}: CategoryPageProps) {
  const [places, setPlaces] = useState<KakaoPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [isEnd, setIsEnd] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    region: (initialRegion as Region) || null,
    subFilter: null,
    sort: "accuracy",
    size: 3,
    useMyLocation: false,
    radius: null,
    coords: null,
    page: 1,
  });

  const category = categories.find((c) => c.id === categoryId);

  const buildParams = useCallback(
    (page: number) => {
      const params = new URLSearchParams({
        size: String(filters.size),
        sort: filters.sort,
        page: String(page),
      });
      if (filters.region) params.set("region", filters.region);
      if (filters.subFilter) params.set("sub", filters.subFilter);

      // GPS 좌표
      if (filters.useMyLocation && filters.coords) {
        params.set("x", filters.coords.x);
        params.set("y", filters.coords.y);
        if (filters.radius) params.set("radius", String(filters.radius));
        // 내 주변 모드: 키워드 없이 카테고리 코드만으로 검색
        if (!filters.subFilter && !filters.region) {
          params.set("mode", "nearby");
        }
      }

      return params;
    },
    [filters]
  );

  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    try {
      const params = buildParams(1);
      const res = await fetch(
        `/api/places/category/${categoryId}?${params.toString()}`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPlaces(data.documents || []);
      setTotalCount(data.meta?.total_count || 0);
      setIsEnd(data.meta?.is_end ?? true);
    } catch (err) {
      console.error("Category fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [categoryId, buildParams]);

  const loadMore = async () => {
    const nextPage = filters.page + 1;
    setLoadingMore(true);
    try {
      const params = buildParams(nextPage);
      const res = await fetch(
        `/api/places/category/${categoryId}?${params.toString()}`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPlaces((prev) => [...prev, ...(data.documents || [])]);
      setIsEnd(data.meta?.is_end ?? true);
      setFilters((f) => ({ ...f, page: nextPage }));
    } catch (err) {
      console.error("Load more error:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const resetFilters = () => {
    setFilters({
      region: null,
      subFilter: null,
      sort: "accuracy",
      size: 3,
      useMyLocation: false,
      radius: null,
      coords: null,
      page: 1,
    });
  };

  const removeFilter = (key: keyof FilterState) => {
    if (key === "sort") {
      setFilters((f) => ({ ...f, sort: "accuracy", page: 1 }));
    } else if (key === "size") {
      setFilters((f) => ({ ...f, size: 3, page: 1 }));
    } else if (key === "useMyLocation") {
      setFilters((f) => ({
        ...f,
        useMyLocation: false,
        coords: null,
        radius: null,
        sort: "accuracy",
        page: 1,
      }));
    } else if (key === "radius") {
      setFilters((f) => ({ ...f, radius: null, page: 1 }));
    } else {
      setFilters((f) => ({ ...f, [key]: null, page: 1 }));
    }
  };

  // 서브필터 라벨
  const currentSubLabel = filters.subFilter
    ? SUB_FILTERS[categoryId].find((sf) => sf.keyword === filters.subFilter)
        ?.label
    : null;

  // 반경 라벨
  const radiusLabel = filters.radius
    ? RADIUS_OPTIONS.find((r) => r.value === filters.radius)?.label
    : null;

  // 활성 필터 칩
  const activeChips: { key: keyof FilterState; label: string }[] = [];
  if (filters.useMyLocation)
    activeChips.push({ key: "useMyLocation", label: "내 주변" });
  if (filters.radius && radiusLabel)
    activeChips.push({ key: "radius", label: `반경 ${radiusLabel}` });
  if (filters.region)
    activeChips.push({ key: "region", label: filters.region });
  if (currentSubLabel)
    activeChips.push({ key: "subFilter", label: currentSubLabel });
  if (filters.sort !== "accuracy")
    activeChips.push({ key: "sort", label: "거리순" });
  if (filters.size !== 3)
    activeChips.push({ key: "size", label: `${filters.size}개` });

  if (!category) {
    return <div>Category not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-bold">{category.name} 추천</h1>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 relative"
              onClick={() => setFilterOpen(true)}
            >
              <SlidersHorizontal className="h-5 w-5" />
              {activeChips.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {activeChips.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Sub-Filter Chips */}
      <div className="bg-white border-b">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() =>
                setFilters((f) => ({ ...f, subFilter: null, page: 1 }))
              }
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm transition-colors ${
                filters.subFilter === null
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-orange-50"
              }`}
            >
              전체
            </button>
            {SUB_FILTERS[categoryId].map((sf) => (
              <button
                key={sf.keyword}
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    subFilter: sf.keyword,
                    page: 1,
                  }))
                }
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm transition-colors ${
                  filters.subFilter === sf.keyword
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-orange-50"
                }`}
              >
                {sf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filter Tags */}
      {activeChips.length > 0 && (
        <div className="max-w-md mx-auto px-4 pt-4">
          <div className="flex flex-wrap gap-2">
            {activeChips.map((chip) => (
              <Badge
                key={chip.key}
                variant="outline"
                className="bg-orange-50 text-orange-700 border-orange-200 px-3 py-1 gap-1.5 cursor-pointer hover:bg-orange-100"
                onClick={() => removeFilter(chip.key)}
              >
                {chip.key === "useMyLocation" && (
                  <Navigation className="h-3 w-3" />
                )}
                {chip.label}
                <X className="h-3 w-3" />
              </Badge>
            ))}
            {activeChips.length > 1 && (
              <button
                onClick={resetFilters}
                className="text-xs text-gray-400 hover:text-orange-600 px-2 py-1"
              >
                전체 초기화
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-md mx-auto px-4 pt-6">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {filters.useMyLocation
                ? "내 주변 "
                : filters.region
                  ? `${filters.region} `
                  : ""}
              {currentSubLabel || CATEGORY_LABELS[categoryId]}
              {!filters.useMyLocation && ` TOP ${filters.size}`}
            </h2>
            <p className="text-sm text-gray-600">
              {filters.useMyLocation && radiusLabel
                ? `반경 ${radiusLabel} 이내 검색 결과`
                : CATEGORY_SUBTITLES[categoryId]}
            </p>
          </div>
          {!loading && (
            <span className="text-xs text-gray-400 flex-shrink-0">
              {totalCount.toLocaleString()}건
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-2">
              조건에 맞는 장소를 찾지 못했어요.
            </p>
            <p className="text-sm text-gray-400">필터를 변경해보세요.</p>
            <Button
              variant="outline"
              className="mt-4 rounded-full border-orange-300 text-orange-600"
              onClick={resetFilters}
            >
              필터 초기화
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {places.map((place, index) => {
              const tags = extractTags(place.category_name);
              const dist = formatDistance(place.distance);
              return (
                <Card
                  key={`${place.id}-${index}`}
                  className="overflow-hidden border-0 shadow-lg"
                >
                  <div className="relative h-56">
                    <img
                      src={getCategoryImage(categoryId, index)}
                      alt={place.place_name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <div className="bg-orange-500 text-white font-bold text-lg px-4 py-2 rounded-2xl">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                    </div>
                    {dist && (
                      <div className="absolute top-4 right-14 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
                        <span className="text-xs font-semibold text-orange-600">
                          {dist}
                        </span>
                      </div>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white"
                    >
                      <Heart className="h-5 w-5 text-gray-700" />
                    </Button>
                  </div>
                  <CardContent className="p-5">
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {dist && (
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                            {dist}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {place.place_name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                        {place.category_name}
                      </p>
                      <div className="flex items-center gap-1.5 text-gray-500 mb-2">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm">
                          {place.road_address_name || place.address_name}
                        </span>
                      </div>
                      {place.phone && (
                        <div className="flex items-center gap-1.5 text-gray-500 mb-4">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm">{place.phone}</span>
                        </div>
                      )}
                    </div>
                    <a
                      href={place.place_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold">
                        상세보기
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              );
            })}

            {/* 더보기 버튼 */}
            {!isEnd && (
              <div className="pt-2 pb-4">
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl border-orange-300 text-orange-600 hover:bg-orange-50 font-semibold"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  )}
                  더보기
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-md mx-auto px-4">
          <div className="grid grid-cols-4 gap-1">
            <Link
              href="/"
              className="flex flex-col items-center justify-center py-3 text-gray-400 hover:text-gray-700"
            >
              <Home className="h-6 w-6 mb-1" />
              <span className="text-xs">홈</span>
            </Link>
            <button className="flex flex-col items-center justify-center py-3 text-orange-600">
              <Compass className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">검색</span>
            </button>
            <button className="flex flex-col items-center justify-center py-3 text-gray-400 hover:text-gray-700">
              <HeartIcon className="h-6 w-6 mb-1" />
              <span className="text-xs">찜</span>
            </button>
            <button className="flex flex-col items-center justify-center py-3 text-gray-400 hover:text-gray-700">
              <User className="h-6 w-6 mb-1" />
              <span className="text-xs">마이</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bottom Sheet */}
      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        category={categoryId}
        filters={filters}
        onApply={handleApplyFilters}
      />
    </div>
  );
}
