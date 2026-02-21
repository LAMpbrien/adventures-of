"use client";

import type { BookPage as BookPageType } from "@/types";

interface BookPageProps {
  page: BookPageType;
  locked?: boolean;
}

function splitText(text: string): [string, string] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const mid = Math.ceil(sentences.length / 2);
  return [
    sentences.slice(0, mid).join(" ").trim(),
    sentences.slice(mid).join(" ").trim(),
  ];
}

export function BookPage({ page, locked }: BookPageProps) {
  const [topText, bottomText] = splitText(page.text);

  return (
    <div className="relative w-full h-full">
      {/* Full-page illustration */}
      {page.image_url ? (
        <img
          key={page.image_url}
          src={page.image_url}
          alt={`Page ${page.page_number}`}
          className={`absolute inset-0 w-full h-full object-cover ${locked ? "blur-lg scale-105" : ""}`}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-amber-50">
          <div className="text-center">
            <div className="text-6xl mb-3 animate-bounce">🎨</div>
            <p className="text-amber-700 text-lg font-medium">
              Illustration generating...
            </p>
          </div>
        </div>
      )}

      {/* Locked overlay */}
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-10">
          <div className="text-center text-white">
            <div className="text-6xl mb-3">🔒</div>
            <p className="text-xl font-semibold">Page {page.page_number}</p>
          </div>
        </div>
      )}

      {/* Story text overlaid — left top, right bottom */}
      {!locked ? (
        <>
          {/* First half — top left */}
          <div className="absolute top-0 left-0 z-10 p-4 pt-14 md:pt-16 w-full sm:w-1/2 max-w-md">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-lg">
              <p className="text-base md:text-lg text-amber-950 leading-relaxed font-serif">
                {topText}
              </p>
            </div>
          </div>

          {/* Second half — bottom right */}
          {bottomText && (
            <div className="absolute bottom-0 right-0 z-10 p-4 pb-16 md:pb-14 w-full sm:w-1/2 max-w-md">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-lg">
                <p className="text-base md:text-lg text-amber-950 leading-relaxed font-serif">
                  {bottomText}
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="absolute bottom-0 right-0 z-10 p-4 pb-16 w-full sm:w-1/2 max-w-md">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-4">
            <p className="text-lg text-white/60 italic text-center">
              Unlock to read this page
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
