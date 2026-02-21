import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const raw = searchParams.get("redirect") || "/dashboard";

  // Prevent open redirect: only allow relative paths
  const redirect = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(redirect, origin));
    }
  }

  // Handle magic link token_hash flow (e.g. when opened in a different browser/email app)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "email" | "magiclink",
    });
    if (!error) {
      return NextResponse.redirect(new URL(redirect, origin));
    }
  }

  // Auth failed — redirect to login with an error
  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set("error", "auth_failed");
  loginUrl.searchParams.set("redirect", redirect);
  return NextResponse.redirect(loginUrl);
}
