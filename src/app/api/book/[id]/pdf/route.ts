import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { BookPage, Child } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookId } = await params;
    const supabase = await createClient();

    // Verify auth
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch book with child and pages
    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("*, children(*)")
      .eq("id", bookId)
      .single();

    if (bookError || !book || book.status !== "complete") {
      return NextResponse.json(
        { error: "Book not found or not complete" },
        { status: 404 }
      );
    }

    const child = book.children as unknown as Child;

    const { data: pages } = await supabase
      .from("book_pages")
      .select("*")
      .eq("book_id", bookId)
      .order("page_number");

    if (!pages || pages.length === 0) {
      return NextResponse.json({ error: "No pages found" }, { status: 404 });
    }

    // Generate a simple HTML-based PDF using the browser
    // For MVP, we'll return an HTML page that can be printed/saved as PDF
    const sortedPages = (pages as BookPage[]).sort(
      (a, b) => a.page_number - b.page_number
    );

    const html = generateBookHtml(child.name, book.theme, sortedPages);

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="adventures-of-${child.name.toLowerCase().replace(/[^a-z0-9-]/g, "")}.html"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function generateBookHtml(
  childName: string,
  theme: string,
  pages: BookPage[]
): string {
  const themeNames: Record<string, string> = {
    "space-adventure": "Space Adventure",
    "dinosaur-rescue": "Dinosaur Rescue",
    "ocean-explorer": "Ocean Explorer",
  };

  const pagesHtml = pages
    .map(
      (page) => `
    <div class="page">
      ${page.image_url ? `<img src="${escapeHtml(page.image_url)}" alt="Page ${page.page_number}" />` : ""}
      <p class="text">${escapeHtml(page.text)}</p>
      <span class="page-num">${page.page_number}</span>
    </div>
  `
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Adventures Of ${escapeHtml(childName)} - ${escapeHtml(themeNames[theme] || theme)}</title>
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, serif; background: #fff; }
    .cover {
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      text-align: center;
      page-break-after: always;
    }
    .cover h1 { font-size: 3rem; color: #92400e; margin-bottom: 0.5rem; }
    .cover h2 { font-size: 1.5rem; color: #b45309; font-weight: normal; }
    .page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      page-break-after: always;
      position: relative;
    }
    .page img {
      max-width: 80%;
      max-height: 55vh;
      border-radius: 12px;
      margin-bottom: 2rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .page .text {
      font-size: 1.25rem;
      line-height: 1.8;
      max-width: 600px;
      text-align: center;
      color: #1f2937;
    }
    .page .page-num {
      position: absolute;
      bottom: 1.5rem;
      font-size: 0.875rem;
      color: #9ca3af;
    }
    .back {
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      text-align: center;
    }
    .back p { color: #92400e; font-size: 1rem; }
    @media print {
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="position:fixed;top:1rem;right:1rem;z-index:100;">
    <button onclick="window.print()" style="padding:0.75rem 1.5rem;background:#d97706;color:#fff;border:none;border-radius:8px;font-size:1rem;cursor:pointer;">
      Save as PDF
    </button>
  </div>
  <div class="cover">
    <h1>Adventures Of ${escapeHtml(childName)}</h1>
    <h2>${escapeHtml(themeNames[theme] || theme)}</h2>
  </div>
  ${pagesHtml}
  <div class="back">
    <p>Made with love by Adventures Of</p>
  </div>
</body>
</html>`;
}
