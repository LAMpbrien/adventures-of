"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | undefined>(undefined);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user ?? undefined));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? undefined);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(undefined);
    setMenuOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-amber-700">
          Adventures Of
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-3">
          {user === undefined ? (
            <div className="w-20" />
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                My Books
              </Link>
              <Link href="/create">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800">
                  Create Story
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile hamburger */}
        <div className="sm:hidden">
          {user === undefined ? (
            <div className="w-8" />
          ) : user ? (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 active:bg-gray-200"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && user && (
        <div className="sm:hidden border-t bg-white/95 backdrop-blur-sm">
          <div className="px-4 py-3 space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200"
            >
              My Books
            </Link>
            <Link
              href="/create"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-amber-700 hover:bg-amber-50 active:bg-amber-100"
            >
              Create Story
            </Link>
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 active:bg-gray-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
