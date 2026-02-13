import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// DELETE a specific comment (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: newsId, commentId } = await params;

    // Delete the comment (must belong to this news article)
    const result = await db.execute({
      sql: "DELETE FROM news_comments WHERE id = ? AND news_id = ?",
      args: [commentId, newsId],
    });

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: "Komentar tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Gagal menghapus komentar" },
      { status: 500 }
    );
  }
}
