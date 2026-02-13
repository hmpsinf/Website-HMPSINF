import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { nanoid } from "nanoid";

interface ProgramKerjaRow {
  id: string;
  title: string;
  description: string | null;
  owner_type: string;
  division_id: string | null;
  period_id: string;
  document_id: string | null;
  status: string;
  priority: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  division_name?: string | null;
  division_color?: string | null;
  period_name?: string | null;
  document_title?: string | null;
  document_file_url?: string | null;
  location?: string | null;
}

// GET /api/program-kerja - List all program kerja with filters
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ownerType = searchParams.get("owner_type") || "";
    const divisionId = searchParams.get("division_id") || "";
    const periodId = searchParams.get("period_id") || "";
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    // Build WHERE clause
    const conditions: string[] = [];
    const args: (string | number)[] = [];

    if (ownerType) {
      conditions.push("pk.owner_type = ?");
      args.push(ownerType);
    }

    if (divisionId) {
      conditions.push("pk.division_id = ?");
      args.push(divisionId);
    }

    if (periodId) {
      conditions.push("pk.period_id = ?");
      args.push(periodId);
    }

    if (status) {
      conditions.push("pk.status = ?");
      args.push(status);
    }

    if (search) {
      conditions.push("(pk.title LIKE ? OR pk.description LIKE ?)");
      args.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Get stats
    const statsResult = await db.execute({
      sql: `SELECT 
              COUNT(*) as total,
              SUM(CASE WHEN status = 'direncanakan' THEN 1 ELSE 0 END) as direncanakan,
              SUM(CASE WHEN status = 'berjalan' THEN 1 ELSE 0 END) as berjalan,
              SUM(CASE WHEN status = 'selesai' THEN 1 ELSE 0 END) as selesai,
              SUM(CASE WHEN status = 'dibatalkan' THEN 1 ELSE 0 END) as dibatalkan
            FROM program_kerja pk ${whereClause}`,
      args,
    });

    const stats = {
      total: Number(statsResult.rows[0]?.total || 0),
      direncanakan: Number(statsResult.rows[0]?.direncanakan || 0),
      berjalan: Number(statsResult.rows[0]?.berjalan || 0),
      selesai: Number(statsResult.rows[0]?.selesai || 0),
      dibatalkan: Number(statsResult.rows[0]?.dibatalkan || 0),
    };

    // Get program kerja with JOINs
    const result = await db.execute({
      sql: `SELECT 
              pk.*,
              d.name as division_name,
              d.color as division_color,
              hp.name as period_name,
              doc.name as document_title,
              doc.file_url as document_file_url,
              pk.location
            FROM program_kerja pk
            LEFT JOIN divisions d ON pk.division_id = d.id
            LEFT JOIN hima_periods hp ON pk.period_id = hp.id
            LEFT JOIN documents doc ON pk.document_id = doc.id
            ${whereClause}
            ORDER BY 
              CASE pk.status 
                WHEN 'berjalan' THEN 1 
                WHEN 'direncanakan' THEN 2 
                WHEN 'selesai' THEN 3 
                WHEN 'dibatalkan' THEN 4 
              END,
              CASE pk.priority 
                WHEN 'tinggi' THEN 1 
                WHEN 'sedang' THEN 2 
                WHEN 'rendah' THEN 3 
              END,
              pk.created_at DESC`,
      args,
    });

    const programs = (result.rows as unknown as ProgramKerjaRow[]).map((row) => ({
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
      location: row.location,
    }));

    // Get divisions for filter dropdown
    const divisionsResult = await db.execute(`SELECT id, name, color FROM divisions ORDER BY name`);
    const divisions = divisionsResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      color: row.color,
    }));

    // Get active period
    const periodResult = await db.execute(`SELECT id, name FROM hima_periods WHERE is_active = 1 LIMIT 1`);
    const activePeriod = periodResult.rows[0] ? {
      id: periodResult.rows[0].id,
      name: periodResult.rows[0].name,
    } : null;

    // Get all periods for filter dropdown
    const periodsResult = await db.execute(`SELECT id, name, is_active FROM hima_periods ORDER BY name DESC`);
    const periods = periodsResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      is_active: row.is_active === 1,
    }));

    return NextResponse.json({
      programs,
      stats,
      divisions,
      periods,
      activePeriod,
    });
  } catch (error) {
    console.error("Error fetching program kerja:", error);
    return NextResponse.json(
      { error: "Failed to fetch program kerja" },
      { status: 500 }
    );
  }
}

// POST /api/program-kerja - Create new program kerja
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      owner_type,
      division_id,
      period_id,
      document_id,
      status = "direncanakan",
      priority = "sedang",
      start_date,
      end_date,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Judul program kerja wajib diisi" },
        { status: 400 }
      );
    }

    if (!owner_type || !["hima", "division"].includes(owner_type)) {
      return NextResponse.json(
        { error: "Jenis pemilik harus hima atau division" },
        { status: 400 }
      );
    }

    if (owner_type === "division" && !division_id) {
      return NextResponse.json(
        { error: "Divisi wajib dipilih untuk program kerja divisi" },
        { status: 400 }
      );
    }

    if (!period_id) {
      return NextResponse.json(
        { error: "Periode kepengurusan wajib dipilih" },
        { status: 400 }
      );
    }

    const id = nanoid();
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO program_kerja (
              id, title, description, owner_type, division_id, period_id,
              document_id, status, priority, start_date, end_date, location,
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
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
        body.location || null,
        now,
        now,
      ],
    });

    return NextResponse.json(
      { id, message: "Program kerja berhasil dibuat" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating program kerja:", error);
    return NextResponse.json(
      { error: "Gagal membuat program kerja" },
      { status: 500 }
    );
  }
}
