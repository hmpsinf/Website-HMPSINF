import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// In-memory set to track unique views per session
const viewedSessions = new Map<string, Set<string>>();

// Cleanup old entries periodically (every 1000 entries, remove oldest)
function cleanupSessions() {
  if (viewedSessions.size > 5000) {
    const keys = Array.from(viewedSessions.keys());
    for (let i = 0; i < 1000; i++) {
      viewedSessions.delete(keys[i]);
    }
  }
}

// POST increment view count (public endpoint, session-based dedup)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const sessionId = body.sessionId as string | undefined;

    // If no sessionId provided, still increment (backward compat)
    if (sessionId) {
      const articleSessions = viewedSessions.get(id) || new Set();
      if (articleSessions.has(sessionId)) {
        // Already counted this session
        return NextResponse.json({ success: true, already_counted: true });
      }
      articleSessions.add(sessionId);
      viewedSessions.set(id, articleSessions);
      cleanupSessions();
    }

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
