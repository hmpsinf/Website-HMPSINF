import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// POST increment view count (public endpoint)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Only increment for published news
    const result = await db.execute({
      sql: `
        UPDATE news 
        SET view_count = view_count + 1 
        WHERE id = ? AND is_published = 1
      `,
      args: [id],
    });

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: "News not found or not published" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error incrementing view count:", error);
    return NextResponse.json(
      { error: "Failed to increment view count" },
      { status: 500 }
    );
  }
}
