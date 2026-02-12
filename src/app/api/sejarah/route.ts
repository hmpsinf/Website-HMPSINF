import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

// Ensure table exists
async function ensureTable() {
  await db.execute({
    sql: `
      CREATE TABLE IF NOT EXISTS sejarah (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL DEFAULT 'Sejarah',
        content TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `,
    args: [],
  });
}

// GET /api/sejarah - Ambil data sejarah
export async function GET() {
  try {
    await ensureTable();

    const result = await db.execute({
      sql: "SELECT id, title, content, created_at, updated_at FROM sejarah ORDER BY created_at DESC LIMIT 1",
      args: [],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ data: null });
    }

    const row = result.rows[0];
    return NextResponse.json({
      data: {
        id: row.id as string,
        title: row.title as string,
        content: row.content as string | null,
        created_at: row.created_at as string,
        updated_at: row.updated_at as string,
      },
    });
  } catch (error) {
    console.error("Error fetching sejarah:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data sejarah" },
      { status: 500 }
    );
  }
}

// POST /api/sejarah - Create or update sejarah
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureTable();

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string | null;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Judul wajib diisi" },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db.execute({
      sql: "SELECT id FROM sejarah ORDER BY created_at DESC LIMIT 1",
      args: [],
    });

    if (existing.rows.length > 0) {
      // Update existing
      await db.execute({
        sql: `UPDATE sejarah SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        args: [
          title.trim(),
          content?.trim() || null,
          existing.rows[0].id as string,
        ],
      });

      return NextResponse.json({
        message: "Sejarah berhasil diperbarui",
        id: existing.rows[0].id as string,
      });
    } else {
      // Create new
      const id = uuidv4();
      await db.execute({
        sql: `INSERT INTO sejarah (id, title, content) VALUES (?, ?, ?)`,
        args: [id, title.trim(), content?.trim() || null],
      });

      return NextResponse.json({
        message: "Sejarah berhasil dibuat",
        id,
      });
    }
  } catch (error) {
    console.error("Error saving sejarah:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan sejarah" },
      { status: 500 }
    );
  }
}

// DELETE /api/sejarah - Hapus sejarah
export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureTable();

    // Get existing record
    const existing = await db.execute({
      sql: "SELECT id FROM sejarah ORDER BY created_at DESC LIMIT 1",
      args: [],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    await db.execute({
      sql: "DELETE FROM sejarah WHERE id = ?",
      args: [existing.rows[0].id as string],
    });

    return NextResponse.json({ message: "Sejarah berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting sejarah:", error);
    return NextResponse.json(
      { error: "Gagal menghapus sejarah" },
      { status: 500 }
    );
  }
}
