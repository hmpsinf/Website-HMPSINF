import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// POST increment view count (public endpoint)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Only increment for open events
    const result = await db.execute({
      sql: `
        UPDATE events 
        SET view_count = view_count + 1 
        WHERE id = ?
      `,
      args: [id],
    });

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: "Event not found" },
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
