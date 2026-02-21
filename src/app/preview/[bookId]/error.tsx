"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PreviewError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">:(</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Failed to load preview
        </h1>
        <p className="text-gray-600 mb-6">
          {error.message || "Could not load the story preview. Please try again."}
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} className="bg-amber-600 hover:bg-amber-700">
            Try Again
          </Button>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
