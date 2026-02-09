import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// GET single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.execute({
      sql: "SELECT * FROM news_categories WHERE id = ?",
      args: [id],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// PUT update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const slug = generateSlug(name);

    // Check if slug already exists for other category
    const existing = await db.execute({
      sql: "SELECT id FROM news_categories WHERE slug = ? AND id != ?",
      args: [slug, id],
    });

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 400 }
      );
    }

    await db.execute({
      sql: `
        UPDATE news_categories 
        SET name = ?, slug = ?, description = ?
        WHERE id = ?
      `,
      args: [name.trim(), slug, description?.trim() || null, id],
    });

    return NextResponse.json({
      id,
      name: name.trim(),
      slug,
      description: description?.trim() || null,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if category has news
    const newsCount = await db.execute({
      sql: "SELECT COUNT(*) as count FROM news WHERE category_id = ?",
      args: [id],
    });

    const count = newsCount.rows[0]?.count as number;
    if (count > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${count} news articles` },
        { status: 400 }
      );
    }

    await db.execute({
      sql: "DELETE FROM news_categories WHERE id = ?",
      args: [id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
