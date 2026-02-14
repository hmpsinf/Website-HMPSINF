import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET /api/sponsorship/settings
export async function GET() {
  try {
    const result = await db.execute({
      sql: "SELECT * FROM sponsorship_settings WHERE id = 'default' LIMIT 1",
      args: []
    });

    const settings = result.rows[0];

    return NextResponse.json(settings || {
      title: "Sponsorship",
      subtitle: "Our partners and supporters",
      show_section: 1
    });
  } catch (error) {
    console.error("Error fetching sponsorship settings:", error);
    return NextResponse.json(
      { error: "Gagal mengambil pengaturan sponsorship" },
      { status: 500 }
    );
  }
}

// POST /api/sponsorship/settings
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, subtitle, show_section } = body;

    if (!title) {
        return NextResponse.json({ error: "Judul section wajib diisi" }, { status: 400 });
    }

    // Upsert settings
    await db.execute({
      sql: `
        INSERT INTO sponsorship_settings (id, title, subtitle, show_section, updated_at)
        VALUES ('default', ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          subtitle = excluded.subtitle,
          show_section = excluded.show_section,
          updated_at = CURRENT_TIMESTAMP
      `,
      args: [title, subtitle || null, show_section ? 1 : 0]
    });

    return NextResponse.json({ message: "Pengaturan berhasil disimpan" });
  } catch (error) {
    console.error("Error updating sponsorship settings:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan pengaturan" },
      { status: 500 }
    );
  }
}
