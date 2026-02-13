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

interface EventRow {
  id: string;
  title: string;
  slug: string; // Add slug
  thumbnail_url: string | null;
  thumbnail_public_id: string | null;
  event_date: string;
  event_end_date: string | null;
  event_time: string | null;
  event_end_time: string | null;
  timeline: string | null;
  location: string;
  description: string | null;
  kontak: string | null;
  link_url: string | null;
  link_text: string | null;
  is_open: number;
  created_at: string;
  updated_at: string;
}

// GET /api/events/[id] - Ambil event berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await db.execute({
      sql: `SELECT * FROM events WHERE id = ?`,
      args: [id],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Event tidak ditemukan" },
        { status: 404 }
      );
    }

    const row = result.rows[0] as unknown as EventRow;
    const event = {
      id: row.id,
      title: row.title,
      slug: row.slug,
      thumbnail_url: row.thumbnail_url,
      thumbnail_public_id: row.thumbnail_public_id,
      event_date: row.event_date,
      event_end_date: row.event_end_date,
      event_time: row.event_time,
      event_end_time: row.event_end_time, // BARU
      timeline: row.timeline,
      location: row.location,
      description: row.description,
      kontak: row.kontak,
      link_url: row.link_url,
      link_text: row.link_text,
      is_open: row.is_open === 1,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };

    return NextResponse.json(event);
  } catch (error: unknown) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data event" },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id] - Update event
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

    // Cek event ada atau tidak
    const existing = await db.execute({
      sql: `SELECT * FROM events WHERE id = ?`,
      args: [id],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: "Event tidak ditemukan" },
        { status: 404 }
      );
    }

    const existingEvent = existing.rows[0] as unknown as EventRow;
    const formData = await request.formData();
    
    const title = formData.get("title") as string;
    const eventDate = formData.get("event_date") as string;
    const eventEndDate = formData.get("event_end_date") as string | null;
    const eventTime = formData.get("event_time") as string | null;
    const eventEndTime = formData.get("event_end_time") as string | null; // Added event_end_time
    const timeline = formData.get("timeline") as string | null;
    const location = formData.get("location") as string;
    const description = formData.get("description") as string | null;
    const kontak = formData.get("kontak") as string | null;
    const linkUrl = formData.get("link_url") as string | null;
    const linkText = formData.get("link_text") as string | null;
    const isOpen = formData.get("is_open") === "true" ? 1 : 0;
    const thumbnail = formData.get("thumbnail") as File | null;
    const removeThumbnail = formData.get("remove_thumbnail") === "true";

    // Validasi
    if (!title || !eventDate || !location) {
      return NextResponse.json(
        { error: "Judul, tanggal, dan lokasi wajib diisi" },
        { status: 400 }
      );
    }

    let thumbnailUrl = existingEvent.thumbnail_url;
    let thumbnailPublicId = existingEvent.thumbnail_public_id;

    // Handle thumbnail removal
    if (removeThumbnail && existingEvent.thumbnail_public_id) {
      try {
        await cloudinary.uploader.destroy(existingEvent.thumbnail_public_id);
      } catch (e) {
        console.error("Error deleting old thumbnail:", e);
      }
      thumbnailUrl = null;
      thumbnailPublicId = null;
    }

    // Upload thumbnail baru jika ada
    if (thumbnail && thumbnail.size > 0) {
      // Validasi ukuran (max 1MB)
      if (thumbnail.size > 1024 * 1024) {
        return NextResponse.json(
          { error: "Ukuran thumbnail maksimal 1MB" },
          { status: 400 }
        );
      }

      // Hapus thumbnail lama jika ada
      if (existingEvent.thumbnail_public_id) {
        try {
          await cloudinary.uploader.destroy(existingEvent.thumbnail_public_id);
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
        folder: "hmpsinf/events",
        transformation: [
          { width: 400, height: 500, crop: "fill", gravity: "auto" }, // 4:5 ratio
        ],
      });

      thumbnailUrl = uploadResult.secure_url;
      thumbnailPublicId = uploadResult.public_id;
    }

    // Cek slug jika judul berubah
    let slug = (existingEvent as any).slug;
    if (title !== existingEvent.title) {
        slug = generateSlug(title);
        // Check uniqueness
        const check = await db.execute({
             sql: "SELECT id FROM events WHERE slug = ? AND id != ?",
             args: [slug, id]
        });
        if (check.rows.length > 0) {
             slug = `${slug}-${id.slice(0, 8)}`;
        }
    }

    await db.execute({
      sql: `
        UPDATE events SET
          title = ?,
          slug = ?,
          thumbnail_url = ?,
          thumbnail_public_id = ?,
          event_date = ?,
          event_end_date = ?,
          event_time = ?,
          event_end_time = ?,
          timeline = ?,
          location = ?,
          description = ?,
          kontak = ?,
          link_url = ?,
          link_text = ?,
          is_open = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
        title.trim(),
        slug,
        thumbnailUrl,
        thumbnailPublicId,
        eventDate,
        eventEndDate?.trim() || null,
        eventTime?.trim() || null,
        eventEndTime?.trim() || null, // BARU
        timeline?.trim() || null,
        location.trim(),
        description?.trim() || null,
        kontak?.trim() || null,
        linkUrl?.trim() || null,
        linkText?.trim() || null,
        isOpen,
        id,
      ],
    });

    return NextResponse.json({ message: "Event berhasil diperbarui", slug });
  } catch (error: unknown) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui event" },
      { status: 500 }
    );
  }
}

// PATCH /api/events/[id] - Toggle status event
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
    const { is_open } = body;

    if (typeof is_open !== "boolean") {
      return NextResponse.json(
        { error: "Status tidak valid" },
        { status: 400 }
      );
    }

    const result = await db.execute({
      sql: `UPDATE events SET is_open = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      args: [is_open ? 1 : 0, id],
    });

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: "Event tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: is_open ? "Event dibuka" : "Event ditutup",
    });
  } catch (error: unknown) {
    console.error("Error toggling event status:", error);
    return NextResponse.json(
      { error: "Gagal mengubah status event" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Hapus event
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

    // Ambil data event untuk hapus thumbnail dari Cloudinary
    const existing = await db.execute({
      sql: `SELECT thumbnail_public_id FROM events WHERE id = ?`,
      args: [id],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: "Event tidak ditemukan" },
        { status: 404 }
      );
    }

    const event = existing.rows[0] as unknown as { thumbnail_public_id: string | null };

    // Hapus thumbnail dari Cloudinary
    if (event.thumbnail_public_id) {
      try {
        await cloudinary.uploader.destroy(event.thumbnail_public_id);
      } catch (e) {
        console.error("Error deleting thumbnail from Cloudinary:", e);
      }
    }

    // Hapus event dari database
    await db.execute({
      sql: `DELETE FROM events WHERE id = ?`,
      args: [id],
    });

    return NextResponse.json({ message: "Event berhasil dihapus" });
  } catch (error: unknown) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Gagal menghapus event" },
      { status: 500 }
    );
  }
}
