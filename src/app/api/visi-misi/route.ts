import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

// Ensure table exists
async function ensureTable() {
  await db.execute({
    sql: `
      CREATE TABLE IF NOT EXISTS visi_misi (
        id TEXT PRIMARY KEY,
        visi TEXT,
        misi TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `,
    args: [],
  });
}

// GET /api/visi-misi - Ambil data visi misi
export async function GET() {
  try {
    await ensureTable();

    const result = await db.execute({
      sql: "SELECT id, visi, misi, created_at, updated_at FROM visi_misi ORDER BY created_at DESC LIMIT 1",
      args: [],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ data: null });
    }

    const row = result.rows[0];
    return NextResponse.json({
      data: {
        id: row.id as string,
        visi: row.visi as string | null,
        misi: row.misi as string | null,
        created_at: row.created_at as string,
        updated_at: row.updated_at as string,
      },
    });
  } catch (error) {
    console.error("Error fetching visi misi:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data visi misi" },
      { status: 500 }
    );
  }
}

// POST /api/visi-misi - Create or update visi misi
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureTable();

    const formData = await request.formData();
    const visi = formData.get("visi") as string | null;
    const misi = formData.get("misi") as string | null;

    if (!visi?.trim() && !misi?.trim()) {
      return NextResponse.json(
        { error: "Visi atau Misi wajib diisi" },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db.execute({
      sql: "SELECT id FROM visi_misi ORDER BY created_at DESC LIMIT 1",
      args: [],
    });

    if (existing.rows.length > 0) {
      // Update existing
      await db.execute({
        sql: `UPDATE visi_misi SET visi = ?, misi = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        args: [
          visi?.trim() || null,
          misi?.trim() || null,
          existing.rows[0].id as string,
        ],
      });

      return NextResponse.json({
        message: "Visi & Misi berhasil diperbarui",
        id: existing.rows[0].id as string,
      });
    } else {
      // Create new
      const id = uuidv4();
      await db.execute({
        sql: `INSERT INTO visi_misi (id, visi, misi) VALUES (?, ?, ?)`,
        args: [id, visi?.trim() || null, misi?.trim() || null],
      });

      return NextResponse.json({
        message: "Visi & Misi berhasil dibuat",
        id,
      });
    }
  } catch (error) {
    console.error("Error saving visi misi:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan visi misi" },
      { status: 500 }
    );
  }
}

// DELETE /api/visi-misi - Hapus visi misi
export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureTable();

    // Get existing record
    const existing = await db.execute({
      sql: "SELECT id FROM visi_misi ORDER BY created_at DESC LIMIT 1",
      args: [],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    await db.execute({
      sql: "DELETE FROM visi_misi WHERE id = ?",
      args: [existing.rows[0].id as string],
    });

    return NextResponse.json({ message: "Visi & Misi berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting visi misi:", error);
    return NextResponse.json(
      { error: "Gagal menghapus visi misi" },
      { status: 500 }
    );
  }
}
