import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  "8 fully illustrated pages",
  "Your child as the hero",
  "AI-generated illustrations featuring their likeness",
  "Personalized story based on their interests",
  "Instant PDF download",
  "3 adventure themes to choose from",
];

export function Pricing() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Simple Pricing
        </h2>
        <Card className="border-2 border-amber-200">
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-sm font-medium text-amber-600 uppercase tracking-wide mb-2">
              Personalized Storybook
            </p>
            <div className="flex items-baseline justify-center gap-1 mb-6">
              <span className="text-5xl font-bold text-gray-900">$15</span>
              <span className="text-gray-500">/ book</span>
            </div>
            <ul className="text-left space-y-3 mb-8">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">&#10003;</span>
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/create">
              <Button size="lg" className="w-full bg-amber-600 hover:bg-amber-700 active:bg-amber-800">
                Create Your Story
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
