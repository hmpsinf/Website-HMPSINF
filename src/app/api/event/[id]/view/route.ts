import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Increment view count
    const result = await db.execute({
      sql: `UPDATE events SET view_count = IFNULL(view_count, 0) + 1 WHERE id = ?`,
      args: [id],
    });

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: "Event tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "View recorded" });
  } catch (error: unknown) {
    console.error("Error updating view count:", error);
    return NextResponse.json(
      { error: "Gagal mencatat view" },
      { status: 500 }
    );
  }
}
