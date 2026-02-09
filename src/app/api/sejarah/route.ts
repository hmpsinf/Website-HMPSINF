import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Ensure table exists
async function ensureTable() {
  await db.execute({
    sql: `
      CREATE TABLE IF NOT EXISTS sejarah (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL DEFAULT 'Sejarah',
        content TEXT,
        image_url TEXT,
        image_public_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `,
    args: [],
  });
}

// GET /api/sejarah - Ambil data sejarah
export async function GET() {
  try {
    await ensureTable();

    const result = await db.execute({
      sql: "SELECT * FROM sejarah ORDER BY created_at DESC LIMIT 1",
      args: [],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ data: null });
    }

    const row = result.rows[0];
    return NextResponse.json({
      data: {
        id: row.id as string,
        title: row.title as string,
        content: row.content as string | null,
        image_url: row.image_url as string | null,
        image_public_id: row.image_public_id as string | null,
        created_at: row.created_at as string,
        updated_at: row.updated_at as string,
      },
    });
  } catch (error) {
    console.error("Error fetching sejarah:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data sejarah" },
      { status: 500 }
    );
  }
}

// POST /api/sejarah - Create or update sejarah
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureTable();

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string | null;
    const image = formData.get("image") as File | null;
    const removeImage = formData.get("remove_image") === "true";

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Judul wajib diisi" },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db.execute({
      sql: "SELECT * FROM sejarah ORDER BY created_at DESC LIMIT 1",
      args: [],
    });

    let imageUrl: string | null = null;
    let imagePublicId: string | null = null;

    if (existing.rows.length > 0) {
      imageUrl = existing.rows[0].image_url as string | null;
      imagePublicId = existing.rows[0].image_public_id as string | null;
    }

    // Handle image removal
    if (removeImage && imagePublicId) {
      try {
        await cloudinary.uploader.destroy(imagePublicId);
      } catch (e) {
        console.error("Failed to delete old image:", e);
      }
      imageUrl = null;
      imagePublicId = null;
    }

    // Handle image upload
    if (image && image.size > 0) {
      if (image.size > 1 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Ukuran gambar maksimal 1MB" },
          { status: 400 }
        );
      }

      // Delete old image if exists
      if (imagePublicId) {
        try {
          await cloudinary.uploader.destroy(imagePublicId);
        } catch (e) {
          console.error("Failed to delete old image:", e);
        }
      }

      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = `data:${image.type};base64,${buffer.toString("base64")}`;

      const uploadResult = await cloudinary.uploader.upload(base64, {
        folder: "hmpsinf/sejarah",
        transformation: [
          { width: 800, height: 500, crop: "fill", gravity: "auto" },
          { quality: "auto", fetch_format: "auto" },
        ],
      });

      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    }

    if (existing.rows.length > 0) {
      // Update existing
      await db.execute({
        sql: `UPDATE sejarah SET title = ?, content = ?, image_url = ?, image_public_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        args: [
          title.trim(),
          content?.trim() || null,
          imageUrl,
          imagePublicId,
          existing.rows[0].id as string,
        ],
      });

      return NextResponse.json({
        message: "Sejarah berhasil diperbarui",
        id: existing.rows[0].id as string,
      });
    } else {
      // Create new
      const id = uuidv4();
      await db.execute({
        sql: `INSERT INTO sejarah (id, title, content, image_url, image_public_id) VALUES (?, ?, ?, ?, ?)`,
        args: [id, title.trim(), content?.trim() || null, imageUrl, imagePublicId],
      });

      return NextResponse.json({
        message: "Sejarah berhasil dibuat",
        id,
      });
    }
  } catch (error) {
    console.error("Error saving sejarah:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan sejarah" },
      { status: 500 }
    );
  }
}

// DELETE /api/sejarah - Hapus sejarah
export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureTable();

    // Get existing record to delete image
    const existing = await db.execute({
      sql: "SELECT * FROM sejarah ORDER BY created_at DESC LIMIT 1",
      args: [],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    // Delete image from Cloudinary
    const publicId = existing.rows[0].image_public_id as string | null;
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (e) {
        console.error("Failed to delete image:", e);
      }
    }

    await db.execute({
      sql: "DELETE FROM sejarah WHERE id = ?",
      args: [existing.rows[0].id as string],
    });

    return NextResponse.json({ message: "Sejarah berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting sejarah:", error);
    return NextResponse.json(
      { error: "Gagal menghapus sejarah" },
      { status: 500 }
    );
  }
}
