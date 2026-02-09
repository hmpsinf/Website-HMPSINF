import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET /api/program-kerja/[id] - Get single program kerja
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const result = await db.execute({
      sql: `SELECT 
              pk.*,
              d.name as division_name,
              d.color as division_color,
              hp.name as period_name,
              doc.title as document_title,
              doc.file_url as document_file_url
            FROM program_kerja pk
            LEFT JOIN divisions d ON pk.division_id = d.id
            LEFT JOIN hima_periods hp ON pk.period_id = hp.id
            LEFT JOIN documents doc ON pk.document_id = doc.id
            WHERE pk.id = ?`,
      args: [id],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Program kerja tidak ditemukan" },
        { status: 404 }
      );
    }

    const row = result.rows[0];
    const program = {
      id: row.id,
      title: row.title,
      description: row.description,
      owner_type: row.owner_type,
      division_id: row.division_id,
      division_name: row.division_name,
      division_color: row.division_color,
      period_id: row.period_id,
      period_name: row.period_name,
      document_id: row.document_id,
      document_title: row.document_title,
      document_file_url: row.document_file_url,
      status: row.status,
      priority: row.priority,
      start_date: row.start_date,
      end_date: row.end_date,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };

    return NextResponse.json(program);
  } catch (error) {
    console.error("Error fetching program kerja:", error);
    return NextResponse.json(
      { error: "Gagal mengambil program kerja" },
      { status: 500 }
    );
  }
}

// PUT /api/program-kerja/[id] - Update program kerja
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      owner_type,
      division_id,
      period_id,
      document_id,
      status,
      priority,
      start_date,
      end_date,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Judul program kerja wajib diisi" },
        { status: 400 }
      );
    }

    if (owner_type === "division" && !division_id) {
      return NextResponse.json(
        { error: "Divisi wajib dipilih untuk program kerja divisi" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    await db.execute({
      sql: `UPDATE program_kerja SET
              title = ?,
              description = ?,
              owner_type = ?,
              division_id = ?,
              period_id = ?,
              document_id = ?,
              status = ?,
              priority = ?,
              start_date = ?,
              end_date = ?,
              updated_at = ?
            WHERE id = ?`,
      args: [
        title.trim(),
        description || null,
        owner_type,
        owner_type === "hima" ? null : division_id,
        period_id,
        document_id || null,
        status,
        priority,
        start_date || null,
        end_date || null,
        now,
        id,
      ],
    });

    return NextResponse.json({ message: "Program kerja berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating program kerja:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui program kerja" },
      { status: 500 }
    );
  }
}

// PATCH /api/program-kerja/[id] - Update status only
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["direncanakan", "berjalan", "selesai", "dibatalkan"].includes(status)) {
      return NextResponse.json(
        { error: "Status tidak valid" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    await db.execute({
      sql: `UPDATE program_kerja SET status = ?, updated_at = ? WHERE id = ?`,
      args: [status, now, id],
    });

    return NextResponse.json({ message: "Status berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating program kerja status:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui status" },
      { status: 500 }
    );
  }
}

// DELETE /api/program-kerja/[id] - Delete program kerja
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await db.execute({
      sql: `DELETE FROM program_kerja WHERE id = ?`,
      args: [id],
    });

    return NextResponse.json({ message: "Program kerja berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting program kerja:", error);
    return NextResponse.json(
      { error: "Gagal menghapus program kerja" },
      { status: 500 }
    );
  }
}
