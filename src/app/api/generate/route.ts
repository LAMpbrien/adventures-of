import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { validateEnv } from "@/lib/env";
import { generateStory } from "@/lib/anthropic";
import { generateIllustration } from "@/lib/fal";
import type { BookPage, Child, ImageQuality, IllustrationStyle } from "@/types";
import { z } from "zod";

export const maxDuration = 300; // 5 minutes

const GenerateSchema = z.object({
  child_id: z.string().uuid(),
  book_id: z.string().uuid(),
  theme: z.enum([
    "space-adventure",
    "dinosaur-rescue",
    "ocean-explorer",
    "bush-adventure",
    "reef-explorer",
    "forest-guardian",
    "outback-explorer",
  ]),
  region: z.enum(["global", "au", "nz"]).default("global"),
});

export async function POST(request: NextRequest) {
  try {
    validateEnv();

    const body = await request.json();
    const parsed = GenerateSchema.safeParse(body);
    if (!parsed.success) {
      const issues = parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      return NextResponse.json(
        { error: `Invalid request data: ${issues}` },
        { status: 400 }
      );
    }
    const { child_id, book_id, theme, region } = parsed.data;

    // Verify authentication
    const authClient = await createClient();
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated. Please log in and try again." },
        { status: 401 }
      );
    }

    // Verify ownership
    const { data: ownedChild, error: ownershipError } = await authClient
      .from("children")
      .select("id")
      .eq("id", child_id)
      .eq("user_id", user.id)
      .single();

    if (ownershipError || !ownedChild) {
      return NextResponse.json(
        { error: "Child profile not found." },
        { status: 403 }
      );
    }

    const supabase = createServiceClient();

    // Fetch child details
    const { data: child, error: childError } = await supabase
      .from("children")
      .select("*")
      .eq("id", child_id)
      .single();

    if (childError || !child) {
      console.error("Child fetch error:", childError);
      return NextResponse.json(
        { error: "Child profile not found. It may have been deleted." },
        { status: 404 }
      );
    }

    // --- Step 1: Generate story ---
    await supabase
      .from("books")
      .update({ status: "generating_story" })
      .eq("id", book_id);

    let story;
    try {
      story = await generateStory(child as Child, theme, region);
    } catch (err) {
      console.error("Claude API error:", err);
      await supabase
        .from("books")
        .update({ status: "failed" })
        .eq("id", book_id);
      return NextResponse.json(
        {
          error: `Story generation failed: ${err instanceof Error ? err.message : String(err)}`,
        },
        { status: 502 }
      );
    }

    // Save character appearance
    await supabase
      .from("books")
      .update({ character_appearance: story.character_appearance })
      .eq("id", book_id);

    // Insert pages
    const pages = story.pages.map((page) => ({
      book_id,
      page_number: page.page_number,
      text: page.text,
      image_prompt: page.image_description,
      is_preview: true,
    }));

    const { error: pagesError } = await supabase
      .from("book_pages")
      .insert(pages);

    if (pagesError) {
      console.error("Pages insert error:", pagesError);
      await supabase
        .from("books")
        .update({ status: "failed" })
        .eq("id", book_id);
      return NextResponse.json(
        { error: `Failed to save story pages: ${pagesError.message}` },
        { status: 500 }
      );
    }

    // --- Step 2: Generate preview images ---
    await supabase
      .from("books")
      .update({ status: "generating_images" })
      .eq("id", book_id);

    // Fetch the book for quality/style settings
    const { data: book } = await supabase
      .from("books")
      .select("*")
      .eq("id", book_id)
      .single();

    const quality = (book?.image_quality as ImageQuality) ?? "standard";
    const illustrationStyle =
      (book?.illustration_style as IllustrationStyle) ?? "watercolor";
    const characterAppearance =
      (book?.character_appearance as string) ?? undefined;

    // Fetch inserted pages
    const { data: insertedPages } = await supabase
      .from("book_pages")
      .select("*")
      .eq("book_id", book_id)
      .eq("is_preview", true)
      .order("page_number");

    if (!insertedPages || insertedPages.length === 0) {
      await supabase
        .from("books")
        .update({ status: "failed" })
        .eq("id", book_id);
      return NextResponse.json(
        { error: "No pages found to generate images for." },
        { status: 500 }
      );
    }

    const primaryPhotoUrl = (child as Child).photo_urls[0];
    const failedPages: number[] = [];
    let chainReferenceUrl: string | null = null;

    for (const page of insertedPages as BookPage[]) {
      try {
        const isChained = !!chainReferenceUrl;
        const imageUrl = await generateIllustration({
          photoUrl: chainReferenceUrl || primaryPhotoUrl,
          childName: (child as Child).name,
          childAge: (child as Child).age,
          sceneDescription: page.image_prompt,
          quality,
          illustrationStyle,
          characterAppearance,
          isChainedReference: isChained,
        });

        if (!chainReferenceUrl) {
          chainReferenceUrl = imageUrl;
        }

        // Download and upload to Supabase Storage
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
          console.error(
            `Upload error for page ${page.page_number}:`,
            uploadError
          );
          failedPages.push(page.page_number);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("illustrations").getPublicUrl(fileName);

        await supabase
          .from("book_pages")
          .update({ image_url: publicUrl })
          .eq("id", page.id);
      } catch (err) {
        console.error(
          `Image generation error for page ${page.page_number}:`,
          err
        );
        failedPages.push(page.page_number);
      }
    }

    // Check if all failed
    if (
      failedPages.length === insertedPages.length &&
      insertedPages.length > 0
    ) {
      await supabase
        .from("books")
        .update({ status: "failed" })
        .eq("id", book_id);
      return NextResponse.json(
        {
          error: `Image generation failed for all pages. The illustration service may be temporarily unavailable.`,
        },
        { status: 502 }
      );
    }

    // Mark as preview_ready
    await supabase
      .from("books")
      .update({ status: "preview_ready" })
      .eq("id", book_id);

    return NextResponse.json({ success: true, status: "preview_ready" });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      {
        error: `Generation failed: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 }
    );
  }
}
