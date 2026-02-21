import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookId } = await params;

    // Verify authentication
    const authClient = await createClient();
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    // Verify ownership via RLS — if the user doesn't own this book, it won't be found
    const { data: book, error: bookError } = await authClient
      .from("books")
      .select("id")
      .eq("id", bookId)
      .single();

    if (bookError || !book) {
      return NextResponse.json({ error: "Book not found." }, { status: 404 });
    }

    const supabase = createServiceClient();

    // Delete illustrations from storage
    const { data: files } = await supabase.storage
      .from("illustrations")
      .list(bookId);

    if (files && files.length > 0) {
      await supabase.storage
        .from("illustrations")
        .remove(files.map((f) => `${bookId}/${f.name}`));
    }

    // Delete book pages (cascade may handle this, but be explicit)
    await supabase.from("book_pages").delete().eq("book_id", bookId);

    // Delete the book
    const { error: deleteError } = await supabase
      .from("books")
      .delete()
      .eq("id", bookId);

    if (deleteError) {
      return NextResponse.json(
        { error: `Failed to delete book: ${deleteError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete book error:", error);
    return NextResponse.json(
      {
        error: `Delete failed: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 }
    );
  }
}
