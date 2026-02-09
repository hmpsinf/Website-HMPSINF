import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/hima-periods/[id] - Ambil detail periode
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const result = await db.execute({
      sql: `SELECT * FROM hima_periods WHERE id = ?`,
      args: [id],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Periode tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: unknown) {
    console.error("Error fetching period:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data periode" },
      { status: 500 }
    );
  }
}

// PUT /api/hima-periods/[id] - Update periode
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, is_active } = body;

    // Jika is_active = true, nonaktifkan semua periode lain
    if (is_active) {
      await db.execute(`UPDATE hima_periods SET is_active = 0`);
    }

    await db.execute({
      sql: `
        UPDATE hima_periods 
        SET name = COALESCE(?, name),
            is_active = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [name?.trim() || null, is_active ? 1 : 0, id],
    });

    return NextResponse.json({ message: "Periode berhasil diperbarui" });
  } catch (error: unknown) {
    console.error("Error updating period:", error);
    const err = error as { message?: string };
    if (err.message?.includes("UNIQUE")) {
      return NextResponse.json(
        { error: "Nama periode sudah ada" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Gagal memperbarui periode" },
      { status: 500 }
    );
  }
}

// DELETE /api/hima-periods/[id] - Hapus periode
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Cek apakah periode ini aktif
    const check = await db.execute({
      sql: `SELECT is_active FROM hima_periods WHERE id = ?`,
      args: [id],
    });

    if (check.rows.length === 0) {
      return NextResponse.json(
        { error: "Periode tidak ditemukan" },
        { status: 404 }
      );
    }

    if (check.rows[0].is_active) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus periode yang sedang aktif" },
        { status: 400 }
      );
    }

    await db.execute({
      sql: `DELETE FROM hima_periods WHERE id = ?`,
      args: [id],
    });

    return NextResponse.json({ message: "Periode berhasil dihapus" });
  } catch (error: unknown) {
    console.error("Error deleting period:", error);
    return NextResponse.json(
      { error: "Gagal menghapus periode" },
      { status: 500 }
    );
  }
}
