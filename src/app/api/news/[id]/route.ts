import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET single news
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.execute({
      sql: `
        SELECT 
          n.*,
          c.name as category_name,
          c.slug as category_slug
        FROM news n
        LEFT JOIN news_categories c ON n.category_id = c.id
        WHERE n.id = ?
      `,
      args: [id],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "News not found" },
        { status: 404 }
      );
    }

    const news = {
      ...result.rows[0],
      is_published: (result.rows[0] as Record<string, unknown>).is_published === 1,
    };

    return NextResponse.json(news);
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}

// PUT update news (FormData with image upload)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const excerpt = formData.get("excerpt") as string | null;
    const content = formData.get("content") as string | null;
    const category_id = formData.get("category_id") as string | null;
    const is_published = formData.get("is_published") === "true";
    const meta_title = formData.get("meta_title") as string | null;
    const meta_description = formData.get("meta_description") as string | null;
    const meta_keywords = formData.get("meta_keywords") as string | null;
    const author_name = formData.get("author_name") as string | null;
    const thumbnail = formData.get("thumbnail") as File | null;
    const remove_thumbnail = formData.get("remove_thumbnail") === "true";

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Get current news for old thumbnail and slug comparison
    const current = await db.execute({
      sql: "SELECT title, slug, thumbnail_url, thumbnail_public_id, is_published, published_at FROM news WHERE id = ?",
      args: [id],
    });

    if (current.rows.length === 0) {
      return NextResponse.json(
        { error: "News not found" },
        { status: 404 }
      );
    }

    const row = current.rows[0] as Record<string, unknown>;
    const oldTitle = row.title as string;
    const oldSlug = row.slug as string;
    const oldPublicId = row.thumbnail_public_id as string | null;
    const oldThumbnailUrl = row.thumbnail_url as string | null;
    const wasPublished = row.is_published as number;
    const oldPublishedAt = row.published_at as string | null;

    // Regenerate slug if title changed
    let newSlug = oldSlug;
    if (title.trim() !== oldTitle) {
      newSlug = generateSlug(title);
      // Ensure unique slug (exclude current article)
      let slugExists = true;
      let slugCounter = 0;
      while (slugExists) {
        const candidateSlug = slugCounter > 0 ? `${newSlug}-${slugCounter}` : newSlug;
        const existing = await db.execute({
          sql: "SELECT id FROM news WHERE slug = ? AND id != ?",
          args: [candidateSlug, id],
        });
        if (existing.rows.length === 0) {
          slugExists = false;
          if (slugCounter > 0) {
            newSlug = `${newSlug}-${slugCounter}`;
          }
        } else {
          slugCounter++;
        }
      }
    }

    let thumbnailUrl = oldThumbnailUrl;
    let thumbnailPublicId = oldPublicId;

    // Handle thumbnail upload
    if (thumbnail && thumbnail.size > 0) {
      // Delete old thumbnail first
      if (oldPublicId) {
        try {
          await cloudinary.uploader.destroy(oldPublicId);
        } catch (e) {
          console.error("Failed to delete old thumbnail:", e);
        }
      }

      // Upload new thumbnail
      const bytes = await thumbnail.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString("base64");
      const dataURI = `data:${thumbnail.type};base64,${base64}`;

      const uploadResult = await cloudinary.uploader.upload(dataURI, {
        folder: "hminf/news",
        transformation: [
          { width: 1280, height: 720, crop: "fill", gravity: "auto" },
          { quality: "auto", fetch_format: "auto" }
        ]
      });

      thumbnailUrl = uploadResult.secure_url;
      thumbnailPublicId = uploadResult.public_id;
    } else if (remove_thumbnail && oldPublicId) {
      // Remove thumbnail
      try {
        await cloudinary.uploader.destroy(oldPublicId);
      } catch (e) {
        console.error("Failed to delete thumbnail:", e);
      }
      thumbnailUrl = null;
      thumbnailPublicId = null;
    }

    const now = new Date().toISOString();
    
    // Set published_at if publishing for the first time
    let publishedAt = oldPublishedAt;
    if (is_published && !wasPublished) {
      publishedAt = now;
    }

    await db.execute({
      sql: `
        UPDATE news SET
          title = ?, slug = ?, thumbnail_url = ?, thumbnail_public_id = ?,
          excerpt = ?, content = ?, category_id = ?,
          is_published = ?, meta_title = ?, meta_description = ?, meta_keywords = ?, author_name = ?,
          published_at = ?, updated_at = ?
        WHERE id = ?
      `,
      args: [
        title.trim(),
        newSlug,
        thumbnailUrl,
        thumbnailPublicId,
        excerpt?.trim() || null,
        content || null,
        category_id || null,
        is_published ? 1 : 0,
        meta_title?.trim() || null,
        meta_description?.trim() || null,
        meta_keywords?.trim() || null,
        author_name?.trim() || null,
        publishedAt,
        now,
        id,
      ],
    });

    return NextResponse.json({ success: true, slug: newSlug });
  } catch (error) {
    console.error("Error updating news:", error);
    return NextResponse.json(
      { error: "Failed to update news" },
      { status: 500 }
    );
  }
}

// PATCH - Toggle publish status only
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { is_published } = body;

    if (typeof is_published !== "boolean") {
      return NextResponse.json(
        { error: "is_published must be a boolean" },
        { status: 400 }
      );
    }

    // Get current status
    const current = await db.execute({
      sql: "SELECT is_published, published_at FROM news WHERE id = ?",
      args: [id],
    });

    if (current.rows.length === 0) {
      return NextResponse.json(
        { error: "News not found" },
        { status: 404 }
      );
    }

    const row = current.rows[0] as Record<string, unknown>;
    const wasPublished = row.is_published as number;
    const oldPublishedAt = row.published_at as string | null;

    const now = new Date().toISOString();
    
    // Set published_at if publishing for the first time
    let publishedAt = oldPublishedAt;
    if (is_published && !wasPublished) {
      publishedAt = now;
    }

    await db.execute({
      sql: "UPDATE news SET is_published = ?, published_at = ?, updated_at = ? WHERE id = ?",
      args: [is_published ? 1 : 0, publishedAt, now, id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error toggling news status:", error);
    return NextResponse.json(
      { error: "Failed to toggle status" },
      { status: 500 }
    );
  }
}

// DELETE news
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get thumbnail to delete from Cloudinary
    const current = await db.execute({
      sql: "SELECT thumbnail_public_id FROM news WHERE id = ?",
      args: [id],
    });

    if (current.rows.length > 0) {
      const publicId = (current.rows[0] as Record<string, unknown>).thumbnail_public_id as string | null;
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (e) {
          console.error("Failed to delete thumbnail:", e);
        }
      }
    }

    // Delete comments first
    await db.execute({
      sql: "DELETE FROM news_comments WHERE news_id = ?",
      args: [id],
    });

    // Delete news
    await db.execute({
      sql: "DELETE FROM news WHERE id = ?",
      args: [id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting news:", error);
    return NextResponse.json(
      { error: "Failed to delete news" },
      { status: 500 }
    );
  }
}
