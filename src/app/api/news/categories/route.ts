import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// GET all categories
export async function GET() {
  try {
    const result = await db.execute({
      sql: `
        SELECT 
          c.*,
          COUNT(n.id) as news_count
        FROM news_categories c
        LEFT JOIN news n ON n.category_id = c.id
        GROUP BY c.id
        ORDER BY c.name ASC
      `,
      args: [],
    });
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST create category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const slug = generateSlug(name);

    // Check if slug already exists
    const existing = await db.execute({
      sql: "SELECT id FROM news_categories WHERE slug = ?",
      args: [slug],
    });

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 400 }
      );
    }

    await db.execute({
      sql: `
        INSERT INTO news_categories (id, name, slug, description)
        VALUES (?, ?, ?, ?)
      `,
      args: [id, name.trim(), slug, description?.trim() || null],
    });

    return NextResponse.json({
      id,
      name: name.trim(),
      slug,
      description: description?.trim() || null,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
