import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import { nanoid } from "nanoid";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface GalleryImageRow {
  id: string;
  image_url: string;
  public_id: string;
}

// GET /api/galleries/[id] - Get single gallery
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const galleryResult = await db.execute({
      sql: `SELECT * FROM galleries WHERE id = ?`,
      args: [id]
    });

    if (galleryResult.rows.length === 0) {
        return NextResponse.json({ error: "Galeri tidak ditemukan" }, { status: 404 });
    }

    const gallery = galleryResult.rows[0];

    // Fetch images
    const imagesResult = await db.execute({
      sql: `SELECT * FROM gallery_images WHERE gallery_id = ?`,
      args: [id]
    });

    return NextResponse.json({
      ...gallery,
      images: imagesResult.rows
    });
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return NextResponse.json({ error: "Gagal mengambil data galeri" }, { status: 500 });
  }
}

// PUT /api/galleries/[id] - Update gallery
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const formData = await request.formData();
    
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const event_id = formData.get("event_id") as string | null;
    const program_kerja_id = formData.get("program_kerja_id") as string | null;
    const existingImagesJson = formData.get("existing_images") as string | null;
    const newImageFiles = formData.getAll("new_images") as File[];

    // Parse existing images that should be kept
    let existingImages: { id?: string; url: string; public_id?: string; caption?: string }[] = [];
    if (existingImagesJson) {
      try {
        existingImages = JSON.parse(existingImagesJson);
      } catch {
        existingImages = [];
      }
    }

    // Validate total image count
    const totalImages = existingImages.length + newImageFiles.length;
    if (totalImages > 3) {
      return NextResponse.json({ error: "Maksimal 3 foto per galeri" }, { status: 400 });
    }

    // Update gallery details
    await db.execute({
      sql: `UPDATE galleries SET title = ?, description = ?, event_id = ?, program_kerja_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      args: [title, description || null, event_id || null, program_kerja_id || null, id]
    });

    // Fetch current images from DB
    const currentImagesResult = await db.execute({
      sql: `SELECT id, public_id FROM gallery_images WHERE gallery_id = ?`,
      args: [id]
    });
    const currentImages = currentImagesResult.rows as unknown as { id: string; public_id: string }[];

    // Identify images to delete (those not in existingImages)
    const keepIds = existingImages.filter(img => img.id).map(img => img.id);
    const toDelete = currentImages.filter(img => !keepIds.includes(img.id));

    // Delete removed images from Cloudinary and DB
    for (const img of toDelete) {
      if (img.public_id) {
        try {
          await cloudinary.uploader.destroy(img.public_id);
        } catch (e) {
          console.error("Failed to delete from Cloudinary:", e);
        }
      }
      await db.execute({
        sql: `DELETE FROM gallery_images WHERE id = ?`,
        args: [img.id]
      });
    }

    // Upload and insert new images
    for (const file of newImageFiles) {
      if (file && file.size > 0 && file.size <= 1024 * 1024) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

        const uploadResult = await cloudinary.uploader.upload(base64, {
          folder: "hmpsinf/galleries",
          transformation: [
            { width: 1280, height: 720, crop: "fill", gravity: "auto" },
          ],
        });

        await db.execute({
          sql: `INSERT INTO gallery_images (id, gallery_id, image_url, public_id, caption) VALUES (?, ?, ?, ?, ?)`,
          args: [nanoid(), id, uploadResult.secure_url, uploadResult.public_id, null]
        });
      }
    }

    return NextResponse.json({ message: "Galeri berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating gallery:", error);
    return NextResponse.json({ error: "Gagal memperbarui galeri" }, { status: 500 });
  }
}

// DELETE /api/galleries/[id] - Delete gallery
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Fetch images to delete from Cloudinary
    const imagesResult = await db.execute({
      sql: `SELECT public_id FROM gallery_images WHERE gallery_id = ?`,
      args: [id]
    });
    const images = imagesResult.rows as unknown as { public_id: string }[];

    for (const img of images) {
      if (img.public_id) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    // Delete gallery (cascade will delete images from DB, but we already cleaned up Cloudinary)
    await db.execute({
      sql: `DELETE FROM galleries WHERE id = ?`,
      args: [id]
    });

    return NextResponse.json({ message: "Galeri berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting gallery:", error);
    return NextResponse.json({ error: "Gagal menghapus galeri" }, { status: 500 });
  }
}
