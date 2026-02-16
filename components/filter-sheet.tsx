"use client";

import { X, SlidersHorizontal, MapPin, Loader2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Category,
  Region,
  REGIONS,
  SUB_FILTERS,
  SortType,
  FilterState,
  CATEGORY_LABELS,
  RADIUS_OPTIONS,
  Coords,
} from "@/lib/types";
import { useGeolocation } from "@/hooks/use-geolocation";

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  category: Category;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
}

export function FilterSheet({
  open,
  onClose,
  category,
  filters,
  onApply,
}: FilterSheetProps) {
  const subFilters = SUB_FILTERS[category];
  const geo = useGeolocation();

  const handleRegion = (region: Region | null) => {
    // 지역 선택하면 내 주변 모드 해제
    onApply({ ...filters, region, useMyLocation: false, coords: null, radius: null, page: 1 });
  };

  const handleSubFilter = (keyword: string | null) => {
    onApply({ ...filters, subFilter: keyword, page: 1 });
  };

  const handleSort = (sort: SortType) => {
    onApply({ ...filters, sort, page: 1 });
  };

  const handleSize = (size: number) => {
    onApply({ ...filters, size, page: 1 });
  };

  const handleMyLocation = () => {
    if (filters.useMyLocation) {
      // 해제
      onApply({ ...filters, useMyLocation: false, coords: null, radius: null, sort: "accuracy", page: 1 });
    } else {
      // GPS 요청
      geo.requestLocation();
    }
  };

  // GPS 좌표가 들어오면 필터에 반영
  const applyGeoCoords = (coords: Coords) => {
    onApply({
      ...filters,
      useMyLocation: true,
      coords,
      radius: filters.radius || 3000,
      region: null, // 지역 필터 해제
      sort: "distance",
      page: 1,
    });
  };

  // geo.coords가 변경되면 적용 (requestLocation 후)
  if (geo.coords && !filters.coords && filters.useMyLocation === false) {
    // 사용자가 위치를 요청한 직후
  }

  const handleRadius = (radius: number) => {
    onApply({ ...filters, radius, page: 1 });
  };

  const handleReset = () => {
    geo.clearLocation();
    onApply({
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

  const activeCount = [
    filters.region,
    filters.subFilter,
    filters.sort !== "accuracy" ? filters.sort : null,
    filters.size !== 3 ? filters.size : null,
    filters.useMyLocation ? "gps" : null,
    filters.radius ? "radius" : null,
  ].filter(Boolean).length;

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
        <div className="max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-orange-600" />
              <h2 className="text-lg font-bold">상세 필터</h2>
              {activeCount > 0 && (
                <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {activeCount}
                </span>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Filter Sections */}
          <div className="p-5 space-y-6">
            {/* My Location */}
            <section>
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                <Navigation className="h-4 w-4 inline mr-1.5 text-orange-600" />
                내 주변 검색
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (filters.useMyLocation) {
                      handleMyLocation();
                    } else {
                      geo.requestLocation();
                      // 버튼 클릭 시 GPS 요청 → 좌표 받으면 아래에서 자동 적용
                    }
                  }}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    filters.useMyLocation
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  {geo.loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  {filters.useMyLocation
                    ? "내 주변 검색 중"
                    : geo.loading
                      ? "위치 확인 중..."
                      : "현재 위치로 검색"}
                </button>

                {/* GPS 좌표 받은 직후 자동 적용 버튼 */}
                {geo.coords && !filters.useMyLocation && (
                  <button
                    onClick={() => applyGeoCoords(geo.coords!)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                  >
                    <MapPin className="h-4 w-4" />
                    위치 확인 완료 - 적용하기
                  </button>
                )}

                {geo.error && (
                  <p className="text-xs text-red-500 px-1">{geo.error}</p>
                )}

                {/* Radius - GPS 활성화 시에만 표시 */}
                {filters.useMyLocation && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">반경 설정</p>
                    <div className="flex flex-wrap gap-2">
                      {RADIUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleRadius(opt.value)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            filters.radius === opt.value
                              ? "bg-orange-500 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-orange-50"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Region - GPS 비활성화 시에만 표시 */}
            {!filters.useMyLocation && (
              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-3">지역</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleRegion(null)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      filters.region === null
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                  >
                    전체
                  </button>
                  {REGIONS.map((region) => (
                    <button
                      key={region}
                      onClick={() => handleRegion(region)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        filters.region === region
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Sub Category */}
            <section>
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                {CATEGORY_LABELS[category]} 종류
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleSubFilter(null)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    filters.subFilter === null
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  전체
                </button>
                {subFilters.map((sf) => (
                  <button
                    key={sf.keyword}
                    onClick={() => handleSubFilter(sf.keyword)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      filters.subFilter === sf.keyword
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                  >
                    {sf.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Sort */}
            <section>
              <h3 className="text-sm font-bold text-gray-900 mb-3">정렬</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSort("accuracy")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    filters.sort === "accuracy"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  정확도순
                </button>
                <button
                  onClick={() => handleSort("distance")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    filters.sort === "distance"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  거리순
                  {!filters.useMyLocation && (
                    <span className="text-[10px] ml-1 opacity-60">(GPS 필요)</span>
                  )}
                </button>
              </div>
            </section>

            {/* Size */}
            <section>
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                결과 개수
              </h3>
              <div className="flex gap-2">
                {[3, 5, 10, 15].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleSize(n)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      filters.size === n
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                  >
                    {n}개
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl border-gray-300"
              onClick={handleReset}
            >
              초기화
            </Button>
            <Button
              className="flex-[2] h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold"
              onClick={onClose}
            >
              적용하기
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
