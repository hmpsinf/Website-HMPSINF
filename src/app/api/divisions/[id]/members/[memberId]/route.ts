import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { checkOfficerConflict, isOfficerPosition } from "@/lib/positions";

// PUT /api/divisions/[id]/members/[memberId] - Update member position
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const { id: division_id, memberId } = params;
    const body = await request.json();
    const { position, member_name, photo_url, instagram, whatsapp } = body;

    if (!position || !position.trim()) {
      return NextResponse.json(
        { error: "Position is required" },
        { status: 400 }
      );
    }

    // Get current member info
    const currentMember = await db.execute({
      sql: "SELECT member_name FROM division_members WHERE id = ?",
      args: [memberId],
    });

    if (currentMember.rows.length === 0) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const nameToCheck = member_name || currentMember.rows[0].member_name;

    // Check if new position is an officer position
    if (isOfficerPosition(position)) {
      const conflict = await checkOfficerConflict(db, nameToCheck as string, division_id);

      if (conflict.hasConflict) {
        return NextResponse.json(
          {
            error: `${nameToCheck} sudah menjabat sebagai ${conflict.position} di ${conflict.divisionName}. Seseorang hanya bisa menjabat di satu divisi.`,
          },
          { status: 409 }
        );
      }
    }

    // Update member
    await db.execute({
      sql: `UPDATE division_members 
         SET member_name = ?, position = ?, photo_url = ?, instagram = ?, whatsapp = ?, updated_at = datetime('now')
         WHERE id = ?`,
      args: [
        (member_name?.trim() || nameToCheck) as string,
        position.trim(),
        photo_url !== undefined ? (photo_url || null) : null,
        instagram?.trim() || null,
        whatsapp?.trim() || null,
        memberId
      ],
    });

    return NextResponse.json({
      id: memberId,
      member_name: member_name?.trim() || nameToCheck,
      position: position.trim(),
      instagram: instagram?.trim() || null,
      whatsapp: whatsapp?.trim() || null,
    });
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    );
  }
}

// DELETE /api/divisions/[id]/members/[memberId] - Remove member from division
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const { memberId } = params;

    // Check if member exists
    const existing = await db.execute({
      sql: "SELECT id FROM division_members WHERE id = ?",
      args: [memberId],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    await db.execute({
      sql: "DELETE FROM division_members WHERE id = ?",
      args: [memberId],
    });

    return NextResponse.json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}
