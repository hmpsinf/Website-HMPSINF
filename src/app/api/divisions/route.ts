import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { nanoid } from "nanoid";
import { checkOfficerConflict, isOfficerPosition } from "@/lib/positions";

// GET /api/divisions - List all divisions
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await db.execute(`
      SELECT 
        d.*,
        COUNT(dm.id) as member_count
      FROM divisions d
      LEFT JOIN division_members dm ON d.id = dm.division_id
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `);

    const divisions = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      color: row.color,
      member_count: row.member_count || 0,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    return NextResponse.json(divisions);
  } catch (error) {
    console.error("Error fetching divisions:", error);
    return NextResponse.json(
      { error: "Failed to fetch divisions" },
      { status: 500 }
    );
  }
}

// POST /api/divisions - Create new division
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, color } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Division name is required" },
        { status: 400 }
      );
    }

    const id = nanoid();

    await db.execute({
      sql: `INSERT INTO divisions (id, name, description, color, created_at, updated_at) 
            VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [id, name.trim(), description || null, color || "#3B82F6"],
    });

    return NextResponse.json({ id, name, description, color }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating division:", error);
    
    // Check for unique constraint violation
    if (error.message?.includes("UNIQUE")) {
      return NextResponse.json(
        { error: "Division with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create division" },
      { status: 500 }
    );
  }
}
