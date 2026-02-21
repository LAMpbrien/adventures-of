import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 to-white py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Every child deserves to be{" "}
          <span className="text-amber-600">the hero</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
          Upload a few photos, tell us what your child loves, and we&apos;ll
          create a fully illustrated storybook starring them. Powered by AI,
          made with love.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/create">
            <Button size="lg" className="text-lg px-8 py-6 bg-amber-600 hover:bg-amber-700">
              Create Your Story
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Only $15 per personalized storybook
        </p>
      </div>
    </section>
  );
}
