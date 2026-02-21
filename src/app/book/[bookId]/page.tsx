"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BookViewer } from "@/components/book/BookViewer";
import { createClient } from "@/lib/supabase/client";
import type { Book, BookPage } from "@/types";

export default function BookViewerPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId as string;

  const [book, setBook] = useState<Book | null>(null);
  const [pages, setPages] = useState<BookPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBook() {
      const supabase = createClient();

      const { data: bookData } = await supabase
        .from("books")
        .select("*")
        .eq("id", bookId)
        .single();

      const { data: pagesData } = await supabase
        .from("book_pages")
        .select("*")
        .eq("book_id", bookId)
        .order("page_number");

      setBook(bookData as Book);
      setPages((pagesData as BookPage[]) || []);
      setLoading(false);
    }

    loadBook();
  }, [bookId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-amber-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">📖</div>
          <p className="text-amber-200 text-lg">Loading your book...</p>
        </div>
      </div>
    );
  }

  if (!book || book.status !== "complete") {
    return (
      <div className="fixed inset-0 z-50 bg-amber-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-amber-200 text-lg">This book is not ready yet.</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 text-amber-400 hover:text-amber-300 underline"
          >
            Back to My Books
          </button>
        </div>
      </div>
    );
  }

  const actionButtons = (
    <>
      <a
        href={`/api/book/${bookId}/pdf`}
        download
        className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors"
        aria-label="Download PDF"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </a>
    </>
  );

  return (
    <BookViewer
      pages={pages}
      onClose={() => router.push("/dashboard")}
      actions={actionButtons}
    />
  );
}
