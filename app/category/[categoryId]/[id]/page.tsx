import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MapPin,
  Phone,
  ExternalLink,
  FileText,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import {
  NaverBlogResponse,
  NaverImageResponse,
  getCategoryImage,
  Category,
} from "@/lib/types";
import { ImageGallery } from "@/components/image-gallery";
import { HeroImage } from "@/components/hero-image";

// Helper to fetch Naver Blog reviews
async function fetchNaverBlogs(
  placeName: string,
  categoryId: string,
): Promise<NaverBlogResponse | null> {
  try {
    const categoryLabels: Record<string, string> = {
      cafe: "카페",
      restaurant: "맛집",
      resort: "휴양지",
    };

    const searchQuery = `${placeName} ${categoryLabels[categoryId] || ""} 후기`;
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.warn("Naver API credentials not configured");
      return null;
    }

    const url = `https://openapi.naver.com/v1/search/blog.json?query=${encodeURIComponent(searchQuery)}&display=10&sort=sim`;

    const response = await fetch(url, {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error("Naver API error:", response.status);
      return null;
    }

    const data: NaverBlogResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch Naver blogs", error);
    return null;
  }
}

// Helper to fetch Naver Image search
async function fetchNaverImages(
  placeName: string,
  categoryId: string,
): Promise<NaverImageResponse | null> {
  try {
    const categoryLabels: Record<string, string> = {
      cafe: "카페",
      restaurant: "맛집",
      resort: "휴양지",
    };

    const searchQuery = `${placeName} ${categoryLabels[categoryId] || ""}`;
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.warn("Naver API credentials not configured");
      return null;
    }

    const url = `https://openapi.naver.com/v1/search/image?query=${encodeURIComponent(searchQuery)}&display=6&sort=sim`;

    const response = await fetch(url, {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error("Naver Image API error:", response.status);
      return null;
    }

    const data: NaverImageResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch Naver images", error);
    return null;
  }
}

// Helper to strip HTML tags
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

// Helper to format date (YYYYMMDD -> YYYY.MM.DD)
function formatDate(dateStr: string): string {
  if (!dateStr || dateStr.length !== 8) return dateStr;
  return `${dateStr.slice(0, 4)}.${dateStr.slice(4, 6)}.${dateStr.slice(6, 8)}`;
}

export default async function PlaceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ categoryId: string; id: string }>;
  searchParams: Promise<{
    title?: string;
    category?: string;
    telephone?: string;
    address?: string;
    roadAddress?: string;
    link?: string;
    mapx?: string;
    mapy?: string;
    thumbnail?: string;
  }>;
}) {
  const { categoryId, id } = await params;
  const query = await searchParams;

  const placeName = query.title || "장소 정보 없음";
  const address = query.roadAddress || query.address || "";
  const fallbackImage = getCategoryImage(categoryId as Category, 0);

  // Fetch Naver blog reviews and images
  const blogData = await fetchNaverBlogs(placeName, categoryId);
  const imageData = await fetchNaverImages(placeName, categoryId);

  // Determine hero image
  let heroImage = query.thumbnail || fallbackImage;
  if (imageData?.items?.[0]?.link) {
    heroImage = imageData.items[0].link;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Image */}
      <div className="relative h-72 bg-gray-200">
        <HeroImage src={heroImage} fallback={fallbackImage} alt={placeName} />
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
        <Link
          href={`/category/${categoryId}`}
          className="absolute top-4 left-4 z-10"
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 text-white"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-5 -mt-8 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
              {placeName}
            </h1>
            {query.category && (
              <p className="text-orange-500 font-medium text-sm">
                {query.category}
              </p>
            )}
          </div>

          <div className="space-y-5">
            <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl">
              <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-900 font-medium text-sm leading-snug">
                  {address}
                </p>
                {query.address && query.address !== address && (
                  <p className="text-gray-400 text-xs mt-1">
                    (지번) {query.address}
                  </p>
                )}
              </div>
            </div>

            {query.telephone && (
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                <Phone className="h-5 w-5 text-gray-500 flex-shrink-0" />
                <a
                  href={`tel:${query.telephone}`}
                  className="text-gray-900 font-medium text-sm hover:text-orange-600 transition-colors"
                >
                  {query.telephone}
                </a>
              </div>
            )}
          </div>

          {/* Naver Image Gallery Section */}
          {imageData && imageData.items && imageData.items.length > 0 && (
            <ImageGallery
              images={imageData.items}
              totalCount={imageData.total}
            />
          )}

          {/* Naver Blog Reviews Section */}
          {blogData && blogData.items && blogData.items.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-bold text-gray-900">블로그 리뷰</h3>
                <span className="text-sm text-gray-500">
                  ({blogData.total.toLocaleString()}건)
                </span>
              </div>

              <div className="space-y-3">
                {blogData.items.map((post, idx) => (
                  <a
                    key={idx}
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-gray-50 hover:bg-orange-50 transition-all rounded-xl p-4 border border-gray-200 hover:border-orange-200"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                      {stripHtml(post.title)}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {stripHtml(post.description)}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="font-medium">{post.bloggername}</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(post.postdate)}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {blogData.items.length < blogData.total && (
                <a
                  href={`https://search.naver.com/search.naver?query=${encodeURIComponent(placeName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-4"
                >
                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-xl border-[#03C75A]/30 text-[#03C75A] hover:bg-[#03C75A]/10 hover:border-[#03C75A]/50"
                  >
                    네이버에서 더 많은 리뷰 보기 (
                    {(blogData.total - blogData.items.length).toLocaleString()}
                    건 더)
                  </Button>
                </a>
              )}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <h3 className="text-lg font-bold text-gray-900">더 알아보기</h3>
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`https://search.naver.com/search.naver?query=${encodeURIComponent(placeName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="bg-[#03C75A]/10 hover:bg-[#03C75A]/20 transition-colors rounded-xl p-4 flex flex-col items-center justify-center gap-2 border border-[#03C75A]/20 h-24">
                  <span className="text-[#03C75A] font-bold">네이버 검색</span>
                  <span className="text-xs text-gray-600">
                    블로그 리뷰 보기
                  </span>
                </div>
              </a>
              <a
                href={`https://www.instagram.com/explore/tags/${encodeURIComponent(placeName.replace(/\s+/g, ""))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="bg-[#E1306C]/10 hover:bg-[#E1306C]/20 transition-colors rounded-xl p-4 flex flex-col items-center justify-center gap-2 border border-[#E1306C]/20 h-24">
                  <span className="text-[#E1306C] font-bold">인스타그램</span>
                  <span className="text-xs text-gray-600">사진 더보기</span>
                </div>
              </a>
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(placeName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="bg-blue-50 hover:bg-blue-100 transition-colors rounded-xl p-4 flex flex-col items-center justify-center gap-2 border border-blue-100 h-24">
                  <span className="text-blue-600 font-bold">구글 검색</span>
                  <span className="text-xs text-gray-600">평점 확인하기</span>
                </div>
              </a>
              <a
                href={`https://map.naver.com/v5/search/${encodeURIComponent(placeName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="bg-[#03C75A]/5 hover:bg-[#03C75A]/15 transition-colors rounded-xl p-4 flex flex-col items-center justify-center gap-2 border border-[#03C75A]/15 h-24">
                  <span className="text-[#03C75A] font-bold">네이버 지도</span>
                  <span className="text-xs text-gray-600">길찾기</span>
                </div>
              </a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-bold text-gray-900">상세 정보</h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">ID</span>
                  <span className="font-mono text-gray-700">{id}</span>
                </div>
                {query.mapx && query.mapy && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">좌표</span>
                    <span className="font-mono text-gray-700">
                      {query.mapx}, {query.mapy}
                    </span>
                  </div>
                )}
                {query.link && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">관련 링크</span>
                    <a
                      href={query.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 hover:underline truncate max-w-[200px]"
                    >
                      바로가기
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <a
              href={`https://search.naver.com/search.naver?query=${encodeURIComponent(placeName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <Button className="w-full h-14 rounded-2xl bg-[#03C75A] hover:bg-[#02b351] text-white font-bold text-lg shadow-green-200 shadow-lg transition-all active:scale-[0.98]">
                <ExternalLink className="mr-2 h-5 w-5" />
                네이버에서 전체 정보 보기
              </Button>
            </a>
            <p className="text-center text-xs text-gray-400 mt-3">
              영업시간, 휴무일, 메뉴판 등은 네이버에서 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
