import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

// Label jabatan dalam bahasa Indonesia
export const POSITION_LABELS: Record<string, string> = {
  penasehat: "Penasehat",
  pembina: "Pembina",
  ketua_umum: "Ketua Umum",
  sekretaris_umum: "Sekretaris Umum",
  wakil_ketua: "Wakil Ketua",
  bendahara_umum: "Bendahara Umum",
};

export const POSITION_ORDER = [
  "penasehat",
  "pembina",
  "ketua_umum",
  "sekretaris_umum",
  "wakil_ketua",
  "bendahara_umum",
];

// GET /api/hima-inti - Ambil semua anggota inti
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const periodId = searchParams.get("period_id");

    let query = `
      SELECT h.*, p.name as period_name, p.is_active as period_is_active
      FROM hima_inti h
      JOIN hima_periods p ON h.period_id = p.id
    `;
    const args: (string | number)[] = [];

    if (periodId) {
      query += ` WHERE h.period_id = ?`;
      args.push(periodId);
    } else {
      // Default: ambil dari periode aktif
      query += ` WHERE p.is_active = 1`;
    }

    query += ` ORDER BY h.created_at ASC`;

    const result = await db.execute({ sql: query, args });

    // Map dengan label jabatan
    const mappedRows = result.rows.map((row) => ({
      ...row,
      position_label: POSITION_LABELS[row.position as string] || row.position,
    }));

    return NextResponse.json(mappedRows);
  } catch (error: unknown) {
    console.error("Error fetching hima inti:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data HIMA Inti" },
      { status: 500 }
    );
  }
}

// POST /api/hima-inti - Tambah/Update anggota inti
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { period_id, position, name, photo_url, instagram, whatsapp } = body;

    if (!period_id || !position || !name) {
      return NextResponse.json(
        { error: "Periode, jabatan, dan nama wajib diisi" },
        { status: 400 }
      );
    }

    if (!POSITION_ORDER.includes(position)) {
      return NextResponse.json(
        { error: "Jabatan tidak valid" },
        { status: 400 }
      );
    }

    // Cek apakah sudah ada anggota dengan jabatan yang sama di periode ini
    const existing = await db.execute({
      sql: `SELECT id FROM hima_inti WHERE period_id = ? AND position = ?`,
      args: [period_id, position],
    });

    if (existing.rows.length > 0) {
      // Update existing
      await db.execute({
        sql: `
          UPDATE hima_inti 
          SET name = ?, photo_url = ?, instagram = ?, whatsapp = ?, updated_at = CURRENT_TIMESTAMP
          WHERE period_id = ? AND position = ?
        `,
        args: [
          name.trim(),
          photo_url || null,
          instagram?.trim() || null,
          whatsapp?.trim() || null,
          period_id,
          position,
        ],
      });

      return NextResponse.json({
        id: existing.rows[0].id,
        message: "Data berhasil diperbarui",
      });
    } else {
      // Insert new
      const id = uuidv4();
      await db.execute({
        sql: `
          INSERT INTO hima_inti (id, period_id, position, name, photo_url, instagram, whatsapp)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          id,
          period_id,
          position,
          name.trim(),
          photo_url || null,
          instagram?.trim() || null,
          whatsapp?.trim() || null,
        ],
      });

      return NextResponse.json({ id, message: "Data berhasil ditambahkan" });
    }
  } catch (error: unknown) {
    console.error("Error creating hima inti:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data HIMA Inti" },
      { status: 500 }
    );
  }
}
