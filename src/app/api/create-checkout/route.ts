import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { z } from "zod";

const CheckoutSchema = z.object({
  book_id: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return NextResponse.json(
        { error: `Invalid request data: ${issues}` },
        { status: 400 }
      );
    }
    const { book_id } = parsed.data;

    // Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated. Please log in and try again." },
        { status: 401 }
      );
    }

    // Verify ownership: book's child must belong to this user (RLS enforces this)
    const { data: ownedBook, error: ownershipError } = await supabase
      .from("books")
      .select("id")
      .eq("id", book_id)
      .single();

    if (ownershipError || !ownedBook) {
      return NextResponse.json(
        { error: "Book not found." },
        { status: 403 }
      );
    }

    // If Stripe is not configured, bypass payment
    if (!process.env.STRIPE_SECRET_KEY) {
      const serviceClient = createServiceClient();

      const { error: updateError } = await serviceClient
        .from("books")
        .update({ status: "paid" })
        .eq("id", book_id);

      if (updateError) {
        console.error("Book status update error:", updateError);
        return NextResponse.json(
          { error: `Failed to update book status: ${updateError.message}` },
          { status: 500 }
        );
      }

      // Trigger full image generation
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      fetch(`${appUrl}/api/generate-images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id, mode: "full" }),
      }).catch((err) =>
        console.error("Failed to trigger full image generation:", err)
      );

      return NextResponse.json({
        url: `/checkout/success?book_id=${book_id}`,
      });
    }

    const customerEmail = user.email || undefined;

    let session;
    try {
      session = await createCheckoutSession(book_id, customerEmail);
    } catch (err) {
      console.error("Stripe session error:", err);
      return NextResponse.json(
        { error: `Stripe checkout failed: ${err instanceof Error ? err.message : String(err)}` },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: `Checkout failed: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
