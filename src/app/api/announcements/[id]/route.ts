import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import { generateSlug } from "@/lib/utils";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface AnnouncementRow {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  thumbnail_public_id: string | null;
  content: string | null;
  author: string;
  is_published: number;
  published_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

// GET /api/announcements/[id] - Fetch single announcement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await db.execute({
      sql: `SELECT * FROM pengumuman WHERE id = ?`,
      args: [id],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Pengumuman tidak ditemukan" },
        { status: 404 }
      );
    }

    const row = result.rows[0] as unknown as AnnouncementRow;
    const announcement = {
      id: row.id,
      title: row.title,
      slug: row.slug,
      thumbnail_url: row.thumbnail_url,
      thumbnail_public_id: row.thumbnail_public_id,
      content: row.content,
      author: row.author,
      is_published: row.is_published === 1,
      published_at: row.published_at,
      view_count: row.view_count,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };

    return NextResponse.json(announcement);
  } catch (error: unknown) {
    console.error("Error fetching announcement:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pengumuman" },
      { status: 500 }
    );
  }
}

// PUT /api/announcements/[id] - Update announcement
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check existing
    const existing = await db.execute({
      sql: `SELECT * FROM pengumuman WHERE id = ?`,
      args: [id],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: "Pengumuman tidak ditemukan" },
        { status: 404 }
      );
    }

    const existingAnnouncement = existing.rows[0] as unknown as AnnouncementRow;
    const formData = await request.formData();

    const title = formData.get("title") as string;
    const content = formData.get("content") as string | null;
    const isPublished = formData.get("is_published") === "true" ? 1 : 0;
    const publishedAt = formData.get("published_at") as string | null;
    const thumbnail = formData.get("thumbnail") as File | null;
    const removeThumbnail = formData.get("remove_thumbnail") === "true";

    // Validasi
    if (!title) {
      return NextResponse.json(
        { error: "Judul pengumuman wajib diisi" },
        { status: 400 }
      );
    }

    let thumbnailUrl = existingAnnouncement.thumbnail_url;
    let thumbnailPublicId = existingAnnouncement.thumbnail_public_id;

    // Handle thumbnail removal
    if (removeThumbnail && existingAnnouncement.thumbnail_public_id) {
      try {
        await cloudinary.uploader.destroy(existingAnnouncement.thumbnail_public_id);
      } catch (e) {
        console.error("Error deleting old thumbnail:", e);
      }
      thumbnailUrl = null;
      thumbnailPublicId = null;
    }

    // Upload new thumbnail if provided
    if (thumbnail && thumbnail.size > 0) {
      // Validate size (max 1MB)
      if (thumbnail.size > 1024 * 1024) {
        return NextResponse.json(
          { error: "Ukuran thumbnail maksimal 1MB" },
          { status: 400 }
        );
      }

      // Delete old thumbnail if exists
      if (existingAnnouncement.thumbnail_public_id) {
        try {
          await cloudinary.uploader.destroy(existingAnnouncement.thumbnail_public_id);
        } catch (e) {
          console.error("Error deleting old thumbnail:", e);
        }
      }

      // Convert to base64
      const bytes = await thumbnail.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = `data:${thumbnail.type};base64,${buffer.toString("base64")}`;

      // Upload to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(base64, {
        folder: "hmpsinf/pengumuman",
        transformation: [
          { width: 400, height: 500, crop: "fill", gravity: "auto" }, // 4:5 ratio
        ],
      });

      thumbnailUrl = uploadResult.secure_url;
      thumbnailPublicId = uploadResult.public_id;
    }

    // Regenerate slug if title changed
    let slug = existingAnnouncement.slug;
    if (title !== existingAnnouncement.title) {
      slug = generateSlug(title);
      // Check uniqueness
      const check = await db.execute({
        sql: "SELECT id FROM pengumuman WHERE slug = ? AND id != ?",
        args: [slug, id],
      });
      if (check.rows.length > 0) {
        slug = `${slug}-${id.slice(0, 8)}`;
      }
    }

    await db.execute({
      sql: `
        UPDATE pengumuman SET
          title = ?,
          slug = ?,
          thumbnail_url = ?,
          thumbnail_public_id = ?,
          content = ?,
          is_published = ?,
          published_at = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
        title.trim(),
        slug,
        thumbnailUrl,
        thumbnailPublicId,
        content?.trim() || null,
        isPublished,
        isPublished ? (publishedAt || existingAnnouncement.published_at || new Date().toISOString()) : null,
        id,
      ],
    });

    return NextResponse.json({ message: "Pengumuman berhasil diperbarui", slug });
  } catch (error: unknown) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui pengumuman" },
      { status: 500 }
    );
  }
}

// PATCH /api/announcements/[id] - Toggle publish status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { is_published } = body;

    if (typeof is_published !== "boolean") {
      return NextResponse.json(
        { error: "Status tidak valid" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const result = await db.execute({
      sql: `UPDATE pengumuman SET is_published = ?, published_at = CASE WHEN ? = 1 AND published_at IS NULL THEN ? ELSE published_at END, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      args: [is_published ? 1 : 0, is_published ? 1 : 0, now, id],
    });

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: "Pengumuman tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: is_published ? "Pengumuman dipublikasikan" : "Pengumuman disimpan sebagai draft",
    });
  } catch (error: unknown) {
    console.error("Error toggling announcement status:", error);
    return NextResponse.json(
      { error: "Gagal mengubah status pengumuman" },
      { status: 500 }
    );
  }
}

// DELETE /api/announcements/[id] - Delete announcement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch existing to get thumbnail info
    const existing = await db.execute({
      sql: `SELECT thumbnail_public_id FROM pengumuman WHERE id = ?`,
      args: [id],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: "Pengumuman tidak ditemukan" },
        { status: 404 }
      );
    }

    const announcement = existing.rows[0] as unknown as { thumbnail_public_id: string | null };

    // Delete thumbnail from Cloudinary
    if (announcement.thumbnail_public_id) {
      try {
        await cloudinary.uploader.destroy(announcement.thumbnail_public_id);
      } catch (e) {
        console.error("Error deleting thumbnail from Cloudinary:", e);
      }
    }

    // Delete from database
    await db.execute({
      sql: `DELETE FROM pengumuman WHERE id = ?`,
      args: [id],
    });

    return NextResponse.json({ message: "Pengumuman berhasil dihapus" });
  } catch (error: unknown) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { error: "Gagal menghapus pengumuman" },
      { status: 500 }
    );
  }
}
