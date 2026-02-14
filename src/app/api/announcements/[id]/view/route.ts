import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await db.execute({
        sql: `
          UPDATE pengumuman
          SET view_count = IFNULL(view_count, 0) + 1
          WHERE id = ? AND is_published = 1
        `,
        args: [id],
    });

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: "Pengumuman tidak ditemukan atau belum dipublikasikan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error incrementing view count:", error);
    return NextResponse.json(
      { error: "Gagal menambahkan view pengumuman" },
      { status: 500 }
    );
  }
}
