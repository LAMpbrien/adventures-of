"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BookViewer } from "@/components/book/BookViewer";
import { createClient } from "@/lib/supabase/client";
import type { Book, BookPage } from "@/types";

const LOCKED_PAGES: number[] = [];

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId as string;

  const [book, setBook] = useState<Book | null>(null);
  const [pages, setPages] = useState<BookPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBook() {
      const supabase = createClient();

      const { data: bookData, error: bookError } = await supabase
        .from("books")
        .select("*")
        .eq("id", bookId)
        .single();

      if (bookError) {
        setError(`Book not found: ${bookError.message}`);
        setLoading(false);
        return;
      }

      const { data: pagesData, error: pagesError } = await supabase
        .from("book_pages")
        .select("*")
        .eq("book_id", bookId)
        .order("page_number");

      if (pagesError) {
        setError(`Failed to load pages: ${pagesError.message}`);
        setLoading(false);
        return;
      }

      setBook(bookData as Book);
      setPages(pagesData as BookPage[]);
      setLoading(false);

      // If already paid/complete, redirect to full viewer
      if (bookData.status === "complete") {
        router.push(`/book/${bookId}`);
      }
    }

    loadBook();
  }, [bookId, router]);

  const handleUnlock = async () => {
    try {
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: bookId }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || `Checkout failed (${response.status})`);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(
        err instanceof Error ? err.message : "Checkout failed unexpectedly"
      );
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-amber-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">📖</div>
          <p className="text-amber-200 text-lg">Loading your story...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="fixed inset-0 z-50 bg-amber-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg">
            {error || "Something went wrong"}
          </p>
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

  return (
    <BookViewer
      pages={pages}
      lockedPages={LOCKED_PAGES}
      onUnlock={book.status === "preview_ready" ? handleUnlock : undefined}
      onClose={() => router.push("/dashboard")}
    />
  );
}
