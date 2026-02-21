"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/client";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const bookId = searchParams.get("book_id");
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    if (!sessionId && !bookId) return;

    const supabase = createClient();

    // Poll for book completion
    const interval = setInterval(async () => {
      let query = supabase.from("books").select("id, status");

      if (bookId) {
        query = query.eq("id", bookId);
      } else {
        query = query.eq("stripe_session_id", sessionId!);
      }

      const { data: books } = await query.single();

      if (books?.status === "complete") {
        setProgress(100);
        clearInterval(interval);
        setTimeout(() => router.push(`/book/${books.id}`), 500);
      } else {
        setProgress((prev) => Math.min(prev + 5, 90));
      }
    }, 3000);

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 1, 85));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [sessionId, bookId, router]);

  return (
    <div className="text-center max-w-md">
      <div className="text-6xl mb-6">🎉</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Generating Your Book!
      </h1>
      <p className="text-gray-600 mb-8">
        We&apos;re generating the rest of your storybook illustrations. This
        takes about a minute.
      </p>
      <div className="w-full max-w-sm mx-auto mb-4">
        <Progress value={progress} className="h-2" />
      </div>
      <p className="text-sm text-gray-400">
        Creating your complete storybook...
      </p>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-6">
      <Suspense
        fallback={
          <div className="text-center">
            <div className="text-4xl animate-bounce mb-4">📖</div>
            <p className="text-gray-600">Loading...</p>
          </div>
        }
      >
        <CheckoutSuccessContent />
      </Suspense>
    </div>
  );
}
