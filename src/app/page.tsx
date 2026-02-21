import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";

export default function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <Pricing />
      <footer className="py-8 text-center text-sm text-gray-400 border-t">
        <p>&copy; {new Date().getFullYear()} Adventures Of. All rights reserved.</p>
      </footer>
    </main>
  );
}
