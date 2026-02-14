import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    // Check if this session has already viewed this announcement
    // For simplicity, we'll just trust the client's session storage check
    // In a production app, we might want a separate table `announcement_views` to prevent spam
    // But for now, we just increment the counter

    await db.execute({
        sql: `UPDATE pengumuman SET view_count = view_count + 1 WHERE id = ?`,
        args: [id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error incrementing view count:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
