import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { generateIllustration } from "@/lib/fal";
import type { BookPage, Child, ImageQuality } from "@/types";
import { z } from "zod";

export const maxDuration = 300; // 5 minutes for image generation

const GenerateImagesSchema = z.object({
  book_id: z.string().uuid(),
  mode: z.enum(["preview", "full"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = GenerateImagesSchema.safeParse(body);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return NextResponse.json(
        { error: `Invalid request data: ${issues}` },
        { status: 400 }
      );
    }
    const { book_id, mode } = parsed.data;

    // Verify authentication
    const authClient = await createClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated. Please log in and try again." },
        { status: 401 }
      );
    }

    // Verify ownership: book's child must belong to this user
    const { data: ownedBook, error: ownershipError } = await authClient
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

    const supabase = createServiceClient();

    // Fetch book and child details
    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("*, children(*)")
      .eq("id", book_id)
      .single();

    if (bookError || !book) {
      console.error("Book fetch error:", bookError);
      return NextResponse.json(
        { error: "Book not found. It may have been deleted." },
        { status: 404 }
      );
    }

    const child = book.children as unknown as Child;
    const quality = (book.image_quality as ImageQuality) ?? "standard";

    // Fetch pages to generate images for
    const { data: pages, error: pagesError } = await supabase
      .from("book_pages")
      .select("*")
      .eq("book_id", book_id)
      .order("page_number");

    if (pagesError || !pages) {
      console.error("Pages fetch error:", pagesError);
      return NextResponse.json(
        { error: "Story pages not found. Try regenerating the story." },
        { status: 404 }
      );
    }

    // Filter pages based on mode
    const targetPages =
      mode === "preview"
        ? pages.filter((p: BookPage) => p.is_preview)
        : pages.filter((p: BookPage) => !p.is_preview);

    // Generate illustrations for each target page
    const primaryPhotoUrl = child.photo_urls[0];
    const failedPages: number[] = [];

    for (const page of targetPages as BookPage[]) {
      try {
        const imageUrl = await generateIllustration({
          photoUrl: primaryPhotoUrl,
          childName: child.name,
          childAge: child.age,
          sceneDescription: page.image_prompt,
          quality,
        });

        // Download image and upload to Supabase Storage
        const imageResponse = await fetch(imageUrl);
        const imageBlob = await imageResponse.blob();
        const fileName = `${book_id}/page-${page.page_number}.png`;

        const { error: uploadError } = await supabase.storage
          .from("illustrations")
          .upload(fileName, imageBlob, {
            contentType: "image/png",
            upsert: true,
          });

        if (uploadError) {
          console.error(`Upload error for page ${page.page_number}:`, uploadError);
          failedPages.push(page.page_number);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("illustrations").getPublicUrl(fileName);

        // Update page with image URL
        await supabase
          .from("book_pages")
          .update({ image_url: publicUrl })
          .eq("id", page.id);
      } catch (err) {
        console.error(`Image generation error for page ${page.page_number}:`, err);
        failedPages.push(page.page_number);
      }
    }

    // If all pages failed, mark book as failed and return error
    if (failedPages.length === targetPages.length && targetPages.length > 0) {
      await supabase
        .from("books")
        .update({ status: "failed" })
        .eq("id", book_id);

      return NextResponse.json(
        { error: `Image generation failed for all pages (${failedPages.join(", ")}). The illustration service may be temporarily unavailable.` },
        { status: 502 }
      );
    }

    // Update book status
    const newStatus = mode === "preview" ? "preview_ready" : "complete";
    await supabase
      .from("books")
      .update({
        status: newStatus,
        ...(newStatus === "complete" ? { completed_at: new Date().toISOString() } : {}),
      })
      .eq("id", book_id);

    return NextResponse.json({
      success: true,
      status: newStatus,
      ...(failedPages.length > 0 ? { warning: `Some illustrations failed to generate (pages ${failedPages.join(", ")}).` } : {}),
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: `Image generation failed: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
