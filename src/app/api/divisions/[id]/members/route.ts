import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { nanoid } from "nanoid";
import { checkOfficerConflict, isOfficerPosition, MEMBER_POSITION } from "@/lib/positions";

// GET /api/divisions/[id]/members - List division members
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const { id } = params;

    const result = await db.execute({
      sql: `SELECT * FROM division_members 
            WHERE division_id = ? 
            ORDER BY 
              CASE 
                WHEN position = 'Dosen Pendamping' THEN 0
                WHEN position = 'Ketua Divisi Kampus B' THEN 1
                WHEN position = 'Ketua Divisi Kampus C' THEN 2
                WHEN position = 'Sekretaris' THEN 3
                WHEN position = 'Bendahara' THEN 4
                WHEN position = 'Anggota' THEN 6
                ELSE 5
              END,
              created_at ASC`,
      args: [id],
    });

    const members = result.rows.map((row) => ({
      id: row.id,
      member_name: row.member_name,
      position: row.position,
      photo_url: row.photo_url || null,
      instagram: row.instagram || null,
      whatsapp: row.whatsapp || null,
      created_at: row.created_at,
    }));

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

// POST /api/divisions/[id]/members - Add member to division
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const { id: division_id } = params;
    const body = await request.json();
    const { member_name, position, photo_url, instagram, whatsapp } = body;

    if (!member_name || !member_name.trim()) {
      return NextResponse.json(
        { error: "Member name is required" },
        { status: 400 }
      );
    }

    if (!position || !position.trim()) {
      return NextResponse.json(
        { error: "Position is required" },
        { status: 400 }
      );
    }

    // Check if assigning officer position
    if (isOfficerPosition(position)) {
      const conflict = await checkOfficerConflict(db, member_name, division_id);
      
      if (conflict.hasConflict) {
        return NextResponse.json(
          {
            error: `${member_name} sudah menjabat sebagai ${conflict.position} di ${conflict.divisionName}. Seseorang hanya bisa menjabat di satu divisi.`,
          },
          { status: 409 }
        );
      }
    }

    const id = nanoid();

    await db.execute({
      sql: `INSERT INTO division_members (id, division_id, member_name, position, photo_url, instagram, whatsapp, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [id, division_id, member_name.trim(), position.trim(), photo_url || null, instagram?.trim() || null, whatsapp?.trim() || null],
    });

    return NextResponse.json(
      {
        id,
        division_id,
        member_name: member_name.trim(),
        position: position.trim(),
        instagram: instagram?.trim() || null,
        whatsapp: whatsapp?.trim() || null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding member:", error);
    return NextResponse.json(
      { error: "Failed to add member" },
      { status: 500 }
    );
  }
}
