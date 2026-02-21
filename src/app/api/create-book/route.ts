import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { z } from "zod";

const CreateBookSchema = z.object({
  child_id: z.string().uuid().optional(),
  child_details: z.object({
    name: z.string().min(1).max(100),
    age: z.number().int().min(1).max(18),
    interests: z.array(z.string().max(100)).min(1).max(20),
    favorite_things: z.string().max(500).nullable(),
    fears_to_avoid: z.string().max(500).nullable(),
    reading_level: z.enum(["beginner", "intermediate", "advanced"]),
    photo_urls: z.array(z.string().url()).min(1),
  }).optional(),
  theme: z.string().min(1),
  region: z.enum(["global", "au", "nz"]),
  image_quality: z.enum(["fast", "standard"]).default("standard"),
}).refine(
  (data) => data.child_id || data.child_details,
  { message: "Either child_id or child_details is required." }
);

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const parsed = CreateBookSchema.safeParse(rawBody);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return NextResponse.json(
        { error: `Invalid request data: ${issues}` },
        { status: 400 }
      );
    }
    const body = parsed.data;

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

    const serviceClient = createServiceClient();
    let childId: string;

    if (body.child_id) {
      // Verify the user owns this child
      const { data: child, error: childError } = await serviceClient
        .from("children")
        .select("id")
        .eq("id", body.child_id)
        .eq("user_id", user.id)
        .single();

      if (childError || !child) {
        return NextResponse.json(
          { error: "Child profile not found." },
          { status: 404 }
        );
      }

      childId = child.id;
    } else if (body.child_details) {
      // Create new child
      const { data: child, error: childError } = await serviceClient
        .from("children")
        .insert({
          user_id: user.id,
          name: body.child_details.name,
          age: body.child_details.age,
          interests: body.child_details.interests,
          favorite_things: body.child_details.favorite_things,
          fears_to_avoid: body.child_details.fears_to_avoid,
          reading_level: body.child_details.reading_level,
          photo_urls: body.child_details.photo_urls,
        })
        .select()
        .single();

      if (childError) {
        console.error("Child creation error:", childError);
        return NextResponse.json(
          { error: `Failed to save child profile: ${childError.message}` },
          { status: 500 }
        );
      }

      childId = child.id;
    } else {
      // Zod refine ensures this is unreachable, but satisfy TypeScript
      return NextResponse.json(
        { error: "Either child_id or child_details is required." },
        { status: 400 }
      );
    }

    // Create book record
    const { data: book, error: bookError } = await serviceClient
      .from("books")
      .insert({
        child_id: childId,
        theme: body.theme,
        image_quality: body.image_quality,
        status: "generating",
      })
      .select()
      .single();

    if (bookError) {
      console.error("Book creation error:", bookError);
      return NextResponse.json(
        { error: `Failed to create book: ${bookError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      book_id: book.id,
      child_id: childId,
    });
  } catch (error) {
    console.error("Create book error:", error);
    return NextResponse.json(
      { error: `Create book failed: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
