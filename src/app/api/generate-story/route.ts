import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { validateEnv } from "@/lib/env";
import { generateStory } from "@/lib/anthropic";
import type { Child, Theme, Region } from "@/types";
import { z } from "zod";

const GenerateStorySchema = z.object({
  child_id: z.string().uuid(),
  book_id: z.string().uuid(),
  theme: z.enum(["space-adventure", "dinosaur-rescue", "ocean-explorer", "bush-adventure", "reef-explorer", "forest-guardian", "outback-explorer"]),
  region: z.enum(["global", "au", "nz"]).default("global"),
});

export async function POST(request: NextRequest) {
  try {
    validateEnv();

    const body = await request.json();
    const parsed = GenerateStorySchema.safeParse(body);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return NextResponse.json(
        { error: `Invalid request data: ${issues}` },
        { status: 400 }
      );
    }
    const { child_id, book_id, theme, region } = parsed.data;

    // Verify authentication
    const authClient = await createClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated. Please log in and try again." },
        { status: 401 }
      );
    }

    // Verify ownership: child must belong to this user
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

    // Generate story with Claude
    let story;
    try {
      story = await generateStory(child as Child, theme, region);
    } catch (err) {
      console.error("Claude API error:", err);
      return NextResponse.json(
        { error: `Story generation failed: ${err instanceof Error ? err.message : String(err)}` },
        { status: 502 }
      );
    }

    // Save character appearance to the book for consistent illustration generation
    const { error: updateError } = await supabase
      .from("books")
      .update({ character_appearance: story.character_appearance })
      .eq("id", book_id);

    if (updateError) {
      console.error("Character appearance update error:", updateError);
    }

    // Insert pages into database
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
      return NextResponse.json(
        { error: `Failed to save story pages: ${pagesError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, title: story.title });
  } catch (error) {
    console.error("Story generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
