import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET /api/divisions/[id] - Get single division with members
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

    // Get division details
    const divisionResult = await db.execute({
      sql: "SELECT * FROM divisions WHERE id = ?",
      args: [id],
    });

    if (divisionResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Division not found" },
        { status: 404 }
      );
    }

    const division = divisionResult.rows[0];

    // Get members
    const membersResult = await db.execute({
      sql: `SELECT * FROM division_members 
            WHERE division_id = ? 
            ORDER BY 
              CASE 
                WHEN position = 'Kadiv' THEN 1
                WHEN position = 'Wakil Kadiv' THEN 2
                WHEN position = 'Sekretaris' THEN 3
                WHEN position = 'Bendahara' THEN 4
                WHEN position = 'Anggota' THEN 6
                ELSE 5
              END,
              created_at ASC`,
      args: [id],
    });

    const members = membersResult.rows.map((row) => ({
      id: row.id,
      member_name: row.member_name,
      position: row.position,
      photo_url: row.photo_url || null,
      instagram: row.instagram || null,
      whatsapp: row.whatsapp || null,
      created_at: row.created_at,
    }));

    return NextResponse.json({
      ...division,
      members,
    });
  } catch (error) {
    console.error("Error fetching division:", error);
    return NextResponse.json(
      { error: "Failed to fetch division" },
      { status: 500 }
    );
  }
}

// PUT /api/divisions/[id] - Update division
export async function PUT(
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
    const body = await request.json();
    const { name, description, color } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Division name is required" },
        { status: 400 }
      );
    }

    // Check if division exists
    const existing = await db.execute({
      sql: "SELECT id FROM divisions WHERE id = ?",
      args: [id],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: "Division not found" },
        { status: 404 }
      );
    }

    await db.execute({
      sql: `UPDATE divisions 
            SET name = ?, description = ?, color = ?, updated_at = datetime('now')
            WHERE id = ?`,
      args: [name.trim(), description || null, color || "#3B82F6", id],
    });

    return NextResponse.json({ id, name, description, color });
  } catch (error: any) {
    console.error("Error updating division:", error);

    if (error.message?.includes("UNIQUE")) {
      return NextResponse.json(
        { error: "Division with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update division" },
      { status: 500 }
    );
  }
}

// DELETE /api/divisions/[id] - Delete division
export async function DELETE(
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

    // Check if division exists
    const existing = await db.execute({
      sql: "SELECT id FROM divisions WHERE id = ?",
      args: [id],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: "Division not found" },
        { status: 404 }
      );
    }

    // Delete division (members will be cascade deleted)
    await db.execute({
      sql: "DELETE FROM divisions WHERE id = ?",
      args: [id],
    });

    return NextResponse.json({ message: "Division deleted successfully" });
  } catch (error) {
    console.error("Error deleting division:", error);
    return NextResponse.json(
      { error: "Failed to delete division" },
      { status: 500 }
    );
  }
}
