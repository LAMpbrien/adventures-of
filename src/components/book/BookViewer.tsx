"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BookPage } from "@/components/book/BookPage";
import type { BookPage as BookPageType } from "@/types";

interface BookViewerProps {
  pages: BookPageType[];
  lockedPages?: number[];
  onUnlock?: () => void;
  onClose?: () => void;
  actions?: React.ReactNode;
}

const SWIPE_THRESHOLD = 50;

export function BookViewer({
  pages,
  lockedPages = [],
  onUnlock,
  onClose,
  actions,
}: BookViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartX = useRef(0);
  const sortedPages = [...pages].sort((a, b) => a.page_number - b.page_number);
  const page = sortedPages[currentPage];

  const goNext = useCallback(() => {
    if (currentPage >= sortedPages.length - 1 || isTransitioning) return;
    setDirection("left");
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage((p) => Math.min(p + 1, sortedPages.length - 1));
      setDirection("right");
      setTimeout(() => {
        setDirection(null);
        setIsTransitioning(false);
      }, 50);
    }, 200);
  }, [currentPage, sortedPages.length, isTransitioning]);

  const goPrev = useCallback(() => {
    if (currentPage <= 0 || isTransitioning) return;
    setDirection("right");
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage((p) => Math.max(p - 1, 0));
      setDirection("left");
      setTimeout(() => {
        setDirection(null);
        setIsTransitioning(false);
      }, 50);
    }, 200);
  }, [currentPage, isTransitioning]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, onClose]);

  if (!page) return null;

  const isLocked = lockedPages.includes(page.page_number);

  const transitionClass =
    direction === "left"
      ? "translate-x-[-8%] opacity-0"
      : direction === "right"
      ? "translate-x-[8%] opacity-0"
      : "translate-x-0 opacity-100";

  return (
    <div className="fixed inset-0 z-50 bg-amber-950 flex flex-col">
      {/* Top bar — close button + actions */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4">
        {onClose && (
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors"
            aria-label="Close book"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        {actions && (
          <div className="flex items-center gap-2">{actions}</div>
        )}
      </div>

      {/* Book page area */}
      <div
        className="flex-1 relative overflow-hidden"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const delta = touchStartX.current - e.changedTouches[0].clientX;
          if (Math.abs(delta) > SWIPE_THRESHOLD) {
            if (delta > 0) goNext();
            else goPrev();
          }
        }}
      >
        {/* Page with transition */}
        <div
          className={`absolute inset-0 transition-all duration-200 ease-in-out ${transitionClass}`}
        >
          <BookPage page={page} locked={isLocked} />
        </div>

        {/* Left navigation */}
        {currentPage > 0 && (
          <button
            onClick={goPrev}
            className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 active:scale-95 transition-all cursor-pointer"
            aria-label="Previous page"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        {/* Right navigation */}
        {currentPage < sortedPages.length - 1 && (
          <button
            onClick={goNext}
            className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 active:scale-95 transition-all cursor-pointer"
            aria-label="Next page"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>

      {/* Bottom bar — page indicators + unlock CTA */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-4 pt-2 flex flex-col items-center gap-3">
        {/* Unlock CTA for locked pages */}
        {isLocked && onUnlock && (
          <button
            onClick={onUnlock}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full shadow-lg transition-colors"
          >
            Unlock Full Story
          </button>
        )}

        {/* Page dots */}
        <div className="flex items-center gap-2">
          {sortedPages.map((_, i) => (
            <button
              key={i}
              className={`rounded-full transition-all ${
                i === currentPage
                  ? "w-3 h-3 bg-white shadow-md"
                  : lockedPages.includes(sortedPages[i].page_number)
                  ? "w-2 h-2 bg-white/30"
                  : "w-2 h-2 bg-white/60"
              }`}
              onClick={() => {
                if (!isTransitioning) {
                  setCurrentPage(i);
                }
              }}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>

        {/* Page counter */}
        <p className="text-xs text-white/50">
          {currentPage + 1} of {sortedPages.length}
        </p>
      </div>
    </div>
  );
}
