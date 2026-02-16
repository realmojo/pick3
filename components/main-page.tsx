"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  RefreshCw,
  Heart,
  Home,
  Compass,
  Heart as HeartIcon,
  User,
  MapPin,
  Loader2,
} from "lucide-react";
import { categories } from "@/lib/data";
import {
  NaverLocalItem,
  Category,
  getCategoryImage,
  getShortAddress,
  CATEGORY_LABELS,
  Region,
  REGIONS,
} from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function placeId(place: NaverLocalItem): string {
  return `${place.mapx}_${place.mapy}`;
}

type PlaceWithImage = NaverLocalItem & { thumbnail?: string | null };

export function MainPage() {
  const [featuredPlace, setFeaturedPlace] = useState<{
    place: PlaceWithImage;
    category: Category;
  } | null>(null);
  const [trendingPlaces, setTrendingPlaces] = useState<
    { place: PlaceWithImage; category: Category }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  const fetchFeatured = useCallback(async () => {
    try {
      const url = selectedRegion
        ? `/api/naver/featured?region=${encodeURIComponent(selectedRegion)}`
        : "/api/naver/featured";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setFeaturedPlace(data);
    } catch (err) {
      console.error("Featured fetch error:", err);
    }
  }, [selectedRegion]);

  const fetchTrending = useCallback(async () => {
    try {
      const allCategories: Category[] = ["cafe", "restaurant", "resort"];
      const results: { place: NaverLocalItem; category: Category }[] = [];

      for (const cat of allCategories) {
        const url = `/api/places/category/${cat}?size=1${selectedRegion ? `&region=${encodeURIComponent(selectedRegion)}` : ""}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.items?.length > 0) {
            results.push({ place: data.items[0], category: cat });
          }
        }
      }
      setTrendingPlaces(results);
    } catch (err) {
      console.error("Trending fetch error:", err);
    }
  }, [selectedRegion]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([fetchFeatured(), fetchTrending()]);
      setLoading(false);
    }
    init();
  }, [fetchFeatured, fetchTrending]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFeatured();
    setRefreshing(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-20">
      {/* Header with Search */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto p-4">
          <form onSubmit={handleSearch} className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="어디로 떠날까요?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-12 rounded-2xl border-gray-200 bg-orange-50/50 focus:bg-white"
              />
            </div>
            <Button
              type="submit"
              size="icon"
              className="h-12 w-12 rounded-2xl bg-orange-500 hover:bg-orange-600"
            >
              <Search className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-md mx-auto px-4 pt-8 pb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">이번 주말,</h1>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-3">
          어디로 떠날까요?
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          당신을 위한 완벽한 주말 계획
        </p>

        {/* Region Selection */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <Button
            variant={selectedRegion === null ? "default" : "outline"}
            className={`rounded-full whitespace-nowrap ${selectedRegion === null ? "bg-orange-500 hover:bg-orange-600" : "border-gray-300 text-gray-500 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"}`}
            onClick={() => setSelectedRegion(null)}
          >
            전체
          </Button>
          {REGIONS.map((region) => (
            <Button
              key={region}
              variant={selectedRegion === region ? "default" : "outline"}
              className={`rounded-full whitespace-nowrap ${selectedRegion === region ? "bg-orange-500 hover:bg-orange-600" : "border-gray-300 text-gray-500 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"}`}
              onClick={() => setSelectedRegion(region)}
            >
              {region}
            </Button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-md mx-auto px-4 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">카테고리별 탐색</h3>
          <span className="text-sm text-orange-600 font-medium cursor-pointer">
            전체보기
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}${selectedRegion ? `?region=${encodeURIComponent(selectedRegion)}` : ""}`}
            >
              <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all cursor-pointer group">
                <CardContent className="p-0">
                  <div className="h-32 relative overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <span className="text-3xl z-10">{category.emoji}</span>
                      <span className="text-base font-bold text-white z-10">
                        {category.name}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Today's Random Pick */}
      <div className="max-w-md mx-auto px-4 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900">
              Today&apos;s Random Pick
            </h3>
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-0">
              FEATURED
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 text-orange-600 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {loading ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </CardContent>
          </Card>
        ) : featuredPlace ? (
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="relative h-48">
              <img
                src={featuredPlace.place.thumbnail || getCategoryImage(featuredPlace.category, 0)}
                alt={stripHtml(featuredPlace.place.title)}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = getCategoryImage(featuredPlace.category, 0);
                }}
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-900">
                  {getShortAddress(featuredPlace.place.address)}
                </span>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white"
              >
                <Heart className="h-5 w-5 text-gray-700" />
              </Button>
            </div>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className="text-orange-600 border-orange-200 bg-orange-50"
                >
                  {CATEGORY_LABELS[featuredPlace.category]}
                </Badge>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                {stripHtml(featuredPlace.place.title)}
              </h4>
              <p className="text-gray-600 text-sm mb-1">
                {featuredPlace.place.category}
              </p>
              {featuredPlace.place.roadAddress && (
                <p className="text-gray-500 text-sm mb-1">
                  {featuredPlace.place.roadAddress}
                </p>
              )}
              {featuredPlace.place.telephone && (
                <p className="text-gray-500 text-sm mb-4">
                  {featuredPlace.place.telephone}
                </p>
              )}
              <Link
                href={{
                  pathname: `/category/${featuredPlace.category}/${placeId(featuredPlace.place)}`,
                  query: {
                    title: stripHtml(featuredPlace.place.title),
                    category: featuredPlace.place.category,
                    telephone: featuredPlace.place.telephone,
                    address: featuredPlace.place.address,
                    roadAddress: featuredPlace.place.roadAddress,
                    link: featuredPlace.place.link,
                    mapx: featuredPlace.place.mapx,
                    mapy: featuredPlace.place.mapy,
                    ...(featuredPlace.place.thumbnail ? { thumbnail: featuredPlace.place.thumbnail } : {}),
                  },
                }}
                className="block w-full"
              >
                <Button className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold">
                  자세히 보기
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center text-gray-500">
              {selectedRegion ? `${selectedRegion} 주변에` : ""} 추천할 만한
              장소를 찾지 못했어요. 😢
            </CardContent>
          </Card>
        )}
      </div>

      {/* Trending Places */}
      <div className="max-w-md mx-auto px-4 mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {selectedRegion || "전국"} 인기급상승 장소
        </h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {trendingPlaces.map((item, idx) => (
              <Link
                key={placeId(item.place)}
                href={{
                  pathname: `/category/${item.category}/${placeId(item.place)}`,
                  query: {
                    title: stripHtml(item.place.title),
                    category: item.place.category,
                    telephone: item.place.telephone,
                    address: item.place.address,
                    roadAddress: item.place.roadAddress,
                    link: item.place.link,
                    mapx: item.place.mapx,
                    mapy: item.place.mapy,
                    ...(item.place.thumbnail ? { thumbnail: item.place.thumbnail } : {}),
                  },
                }}
                className="flex-shrink-0 w-40"
              >
                <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
                  <div className="relative h-28">
                    <img
                      src={item.place.thumbnail || getCategoryImage(item.category, idx + 1)}
                      alt={stripHtml(item.place.title)}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = getCategoryImage(item.category, idx + 1);
                      }}
                    />
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-semibold text-sm mb-1 truncate">
                      {stripHtml(item.place.title)}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      {getShortAddress(item.place.address)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-md mx-auto px-4">
          <div className="grid grid-cols-4 gap-1">
            <button className="flex flex-col items-center justify-center py-3 text-orange-600">
              <Home className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">홈</span>
            </button>
            <button className="flex flex-col items-center justify-center py-3 text-gray-400 hover:text-gray-700">
              <Compass className="h-6 w-6 mb-1" />
              <span className="text-xs">탐색</span>
            </button>
            <button className="flex flex-col items-center justify-center py-3 text-gray-400 hover:text-gray-700">
              <HeartIcon className="h-6 w-6 mb-1" />
              <span className="text-xs">위시리스트</span>
            </button>
            <button className="flex flex-col items-center justify-center py-3 text-gray-400 hover:text-gray-700">
              <User className="h-6 w-6 mb-1" />
              <span className="text-xs">마이페이지</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
