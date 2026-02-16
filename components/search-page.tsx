'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Search, MapPin, Phone, Loader2, Home, Compass, Heart, User } from 'lucide-react';
import { NaverLocalItem, getShortAddress } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function placeId(place: NaverLocalItem): string {
  return `${place.mapx}_${place.mapy}`;
}

interface SearchPageProps {
  query: string;
}

export function SearchPage({ query: initialQuery }: SearchPageProps) {
  const [query, setQuery] = useState(initialQuery);
  const [places, setPlaces] = useState<NaverLocalItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  async function handleSearch(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/places/search?q=${encodeURIComponent(q)}&size=15`);
      if (!res.ok) throw new Error('Failed to search');
      const data = await res.json();
      setPlaces(data.items || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto p-4">
          <form onSubmit={onSubmit} className="flex items-center gap-3">
            <Link href="/">
              <Button type="button" variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="장소를 검색하세요"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-4 h-12 rounded-2xl border-gray-200 bg-orange-50/50 focus:bg-white"
              />
            </div>
            <Button type="submit" size="icon" className="h-10 w-10 rounded-2xl bg-orange-500 hover:bg-orange-600 flex-shrink-0">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-md mx-auto px-4 pt-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : searched && places.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            검색 결과가 없습니다.
          </div>
        ) : (
          <>
            {searched && (
              <p className="text-sm text-gray-500 mb-4">
                &quot;{initialQuery || query}&quot; 검색 결과 {places.length}건
              </p>
            )}
            <div className="space-y-4">
              {places.map((place) => {
                const title = stripHtml(place.title);
                const categoryTags = place.category
                  .split('>')
                  .map((t) => t.trim())
                  .filter(Boolean);
                return (
                  <Link
                    key={placeId(place)}
                    href={{
                      pathname: `/category/restaurant/${placeId(place)}`,
                      query: {
                        title,
                        category: place.category,
                        telephone: place.telephone,
                        address: place.address,
                        roadAddress: place.roadAddress,
                        link: place.link,
                        mapx: place.mapx,
                        mapy: place.mapy,
                      },
                    }}
                  >
                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow mb-4">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {categoryTags.slice(-2).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="text-sm">
                            {place.roadAddress || place.address}
                          </span>
                        </div>
                        {place.telephone && (
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="text-sm">{place.telephone}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-md mx-auto px-4">
          <div className="grid grid-cols-4 gap-1">
            <Link href="/" className="flex flex-col items-center justify-center py-3 text-gray-400 hover:text-gray-700">
              <Home className="h-6 w-6 mb-1" />
              <span className="text-xs">홈</span>
            </Link>
            <button className="flex flex-col items-center justify-center py-3 text-orange-600">
              <Compass className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">검색</span>
            </button>
            <button className="flex flex-col items-center justify-center py-3 text-gray-400 hover:text-gray-700">
              <Heart className="h-6 w-6 mb-1" />
              <span className="text-xs">찜</span>
            </button>
            <button className="flex flex-col items-center justify-center py-3 text-gray-400 hover:text-gray-700">
              <User className="h-6 w-6 mb-1" />
              <span className="text-xs">마이</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
