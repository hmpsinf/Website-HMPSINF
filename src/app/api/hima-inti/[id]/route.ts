import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/hima-inti/[id] - Ambil detail anggota
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const result = await db.execute({
      sql: `
        SELECT h.*, p.name as period_name
        FROM hima_inti h
        JOIN hima_periods p ON h.period_id = p.id
        WHERE h.id = ?
      `,
      args: [id],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Data tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: unknown) {
    console.error("Error fetching hima inti:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

// PUT /api/hima-inti/[id] - Update anggota
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, photo_url, instagram, whatsapp } = body;

    await db.execute({
      sql: `
        UPDATE hima_inti 
        SET name = COALESCE(?, name),
            photo_url = ?,
            instagram = ?,
            whatsapp = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
        name?.trim() || null,
        photo_url || null,
        instagram?.trim() || null,
        whatsapp?.trim() || null,
        id,
      ],
    });

    return NextResponse.json({ message: "Data berhasil diperbarui" });
  } catch (error: unknown) {
    console.error("Error updating hima inti:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui data" },
      { status: 500 }
    );
  }
}

// DELETE /api/hima-inti/[id] - Hapus anggota
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const check = await db.execute({
      sql: `SELECT id FROM hima_inti WHERE id = ?`,
      args: [id],
    });

    if (check.rows.length === 0) {
      return NextResponse.json(
        { error: "Data tidak ditemukan" },
        { status: 404 }
      );
    }

    await db.execute({
      sql: `DELETE FROM hima_inti WHERE id = ?`,
      args: [id],
    });

    return NextResponse.json({ message: "Data berhasil dihapus" });
  } catch (error: unknown) {
    console.error("Error deleting hima inti:", error);
    return NextResponse.json(
      { error: "Gagal menghapus data" },
      { status: 500 }
    );
  }
}
