"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { NaverImageItem } from "@/lib/types";

interface ImageGalleryProps {
  images: NaverImageItem[];
  totalCount: number;
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

export function ImageGallery({ images, totalCount }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openImage = (index: number) => {
    setSelectedIndex(index);
  };

  const closeViewer = () => {
    setSelectedIndex(null);
  };

  const showNext = () => {
    if (selectedIndex !== null && selectedIndex < images.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const showPrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") closeViewer();
    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();
  };

  return (
    <>
      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-bold text-gray-900">사진</h3>
          <span className="text-sm text-gray-500">
            ({totalCount.toLocaleString()}장)
          </span>
        </div>

        <div className="space-y-2">
          {/* First Image - Hero */}
          {images.length > 0 && (
            <button
              onClick={() => openImage(0)}
              className="w-full aspect-video rounded-2xl overflow-hidden hover:opacity-95 transition-opacity relative group"
            >
              <img
                src={images[0].link}
                alt={stripHtml(images[0].title)}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </button>
          )}

          {/* Remaining Images - Grid */}
          {images.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {images.slice(1, 4).map((image, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => openImage(idx + 1)}
                  className="block aspect-square rounded-xl overflow-hidden hover:opacity-90 transition-opacity relative"
                >
                  <img
                    src={image.thumbnail}
                    alt={stripHtml(image.title)}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Show +More on the last item if there are more images */}
                  {idx === 2 && totalCount > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        +{totalCount - 4}
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Viewer Modal */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={closeViewer}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close Button */}
          <button
            onClick={closeViewer}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium">
            {selectedIndex + 1} / {images.length}
          </div>

          {/* Previous Button */}
          {selectedIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                showPrev();
              }}
              className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}

          {/* Next Button */}
          {selectedIndex < images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                showNext();
              }}
              className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[selectedIndex].link}
              alt={stripHtml(images[selectedIndex].title)}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>

          {/* Image Title */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-2xl w-full px-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
              <p className="text-white text-sm">
                {stripHtml(images[selectedIndex].title)}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
