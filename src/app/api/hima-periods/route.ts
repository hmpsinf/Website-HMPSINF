import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

// GET /api/hima-periods - Ambil semua periode
export async function GET() {
  try {
    const result = await db.execute(`
      SELECT 
        p.*,
        (SELECT COUNT(*) FROM hima_inti WHERE period_id = p.id) as member_count
      FROM hima_periods p
      ORDER BY p.created_at DESC
    `);

    return NextResponse.json(result.rows);
  } catch (error: unknown) {
    console.error("Error fetching periods:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data periode" },
      { status: 500 }
    );
  }
}

// POST /api/hima-periods - Buat periode baru
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, is_active } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Nama periode wajib diisi" },
        { status: 400 }
      );
    }

    const id = uuidv4();

    // Jika is_active = true, nonaktifkan semua periode lain
    if (is_active) {
      await db.execute(`UPDATE hima_periods SET is_active = 0`);
    }

    await db.execute({
      sql: `INSERT INTO hima_periods (id, name, is_active) VALUES (?, ?, ?)`,
      args: [id, name.trim(), is_active ? 1 : 0],
    });

    return NextResponse.json({
      id,
      name: name.trim(),
      is_active: is_active ? 1 : 0,
      message: "Periode berhasil dibuat",
    });
  } catch (error: unknown) {
    console.error("Error creating period:", error);
    const err = error as { message?: string };
    if (err.message?.includes("UNIQUE")) {
      return NextResponse.json(
        { error: "Nama periode sudah ada" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Gagal membuat periode" },
      { status: 500 }
    );
  }
}
