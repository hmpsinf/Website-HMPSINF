import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// PUT approve/reject comment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params;
    const body = await request.json();
    const { is_approved } = body;

    await db.execute({
      sql: "UPDATE news_comments SET is_approved = ? WHERE id = ?",
      args: [is_approved ? 1 : 0, commentId],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 }
    );
  }
}

// DELETE comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params;

    await db.execute({
      sql: "DELETE FROM news_comments WHERE id = ?",
      args: [commentId],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
