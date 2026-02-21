"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { Book, BookPage, Child } from "@/types";
import { THEMES } from "@/types";

interface BookWithDetails extends Book {
  children: Child;
  book_pages: BookPage[];
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  generating: { label: "Generating", variant: "secondary" },
  preview_ready: { label: "Preview Ready", variant: "outline" },
  paid: { label: "Processing", variant: "secondary" },
  complete: { label: "Complete", variant: "default" },
  failed: { label: "Failed", variant: "outline" },
};

export default function DashboardPage() {
  const router = useRouter();
  const [books, setBooks] = useState<BookWithDetails[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (bookId: string) => {
    if (!confirm("Are you sure you want to delete this book? This cannot be undone.")) return;
    setDeletingId(bookId);
    try {
      const res = await fetch(`/api/book/${bookId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete book.");
        return;
      }
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
    } catch {
      alert("Failed to delete book.");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();

        const [booksResult, childrenResult] = await Promise.all([
          supabase
            .from("books")
            .select("*, children(*), book_pages(*)")
            .order("created_at", { ascending: false }),
          supabase
            .from("children")
            .select("*")
            .order("created_at", { ascending: false }),
        ]);

        if (booksResult.error) {
          throw new Error(`Failed to load books: ${booksResult.error.message}`);
        }
        if (childrenResult.error) {
          throw new Error(`Failed to load children: ${childrenResult.error.message}`);
        }

        setBooks((booksResult.data as unknown as BookWithDetails[]) || []);
        setChildren((childrenResult.data as Child[]) || []);
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError(err instanceof Error ? err.message : "Failed to load your data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading your books...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">:(</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Failed to load dashboard
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12">
      <div className="mx-auto max-w-3xl px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Storybooks</h1>
          <Link href="/create">
            <Button className="bg-amber-600 hover:bg-amber-700">
              Create New Story
            </Button>
          </Link>
        </div>

        {/* Saved Children */}
        {children.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              My Children
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {children.map((child) => (
                <Card key={child.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      {child.photo_urls[0] ? (
                        <img
                          src={child.photo_urls[0]}
                          alt={child.name}
                          className="w-10 h-10 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold shrink-0">
                          {child.name[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {child.name}
                        </p>
                        <p className="text-xs text-gray-500">Age {child.age}</p>
                      </div>
                    </div>
                    <Link href={`/create?child_id=${child.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2 text-xs"
                      >
                        New Story
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {books.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📚</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No stories yet
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first personalized storybook!
            </p>
            <Link href="/create">
              <Button className="bg-amber-600 hover:bg-amber-700">
                Get Started
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {books.map((book) => {
              const theme = THEMES.find((t) => t.id === book.theme);
              const coverPage = book.book_pages?.find(
                (p) => p.page_number === 1
              );
              const statusInfo = STATUS_LABELS[book.status] || STATUS_LABELS.generating;
              const href =
                book.status === "complete"
                  ? `/book/${book.id}`
                  : `/preview/${book.id}`;

              return (
                <Card key={book.id} className="hover:shadow-md transition-shadow relative group">
                  <CardContent className="p-4">
                    <Link href={href} className="block">
                      <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-gray-100">
                        {coverPage?.image_url ? (
                          <img
                            src={coverPage.image_url}
                            alt="Book cover"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">
                            {theme?.emoji || "📖"}
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        {book.children?.name}&apos;s {theme?.name || "Adventure"}
                      </h3>
                      <div className="mt-2">
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </Link>
                    <button
                      onClick={() => handleDelete(book.id)}
                      disabled={deletingId === book.id}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      aria-label="Delete book"
                    >
                      {deletingId === book.id ? (
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      )}
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
