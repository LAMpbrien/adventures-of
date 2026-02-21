"use client";

import type { BookPage as BookPageType } from "@/types";

interface BookPageProps {
  page: BookPageType;
  locked?: boolean;
}

export function BookPage({ page, locked }: BookPageProps) {
  return (
    <div className="flex flex-col w-full h-full bg-amber-950">
      {/* Illustration — contained within the top area, never cropped */}
      <div className="flex-1 relative min-h-0">
        {page.image_url ? (
          <>
            <img
              src={page.image_url}
              alt={`Page ${page.page_number}`}
              className={`w-full h-full object-contain ${locked ? "blur-lg scale-105" : ""}`}
            />
            {/* Locked overlay */}
            {locked && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                <div className="text-center text-white">
                  <div className="text-6xl mb-3">🔒</div>
                  <p className="text-xl font-semibold">
                    Page {page.page_number}
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-amber-50">
            <div className="text-center">
              <div className="text-6xl mb-3 animate-bounce">🎨</div>
              <p className="text-amber-700 text-lg font-medium">
                Illustration generating...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Story text — below the image */}
      <div className="shrink-0 px-4 py-3 pb-14">
        <div className="mx-auto max-w-2xl">
          {!locked ? (
            <div className="bg-amber-50/90 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-lg border border-amber-200/50">
              <p className="text-lg md:text-xl text-amber-950 leading-relaxed text-center font-serif">
                {page.text}
              </p>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4">
              <p className="text-lg text-white/50 italic text-center">
                Unlock to read this page
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
