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

import { generateSlug } from "@/lib/utils";

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
  view_count: number;
}

// GET /api/events - Ambil daftar event dengan pagination, search, dan filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || ""; // open, closed, atau kosong untuk semua
    const offset = (page - 1) * limit;

    // Build WHERE clause
    const conditions: string[] = [];
    const args: (string | number)[] = [];

    if (search) {
      conditions.push("(title LIKE ? OR location LIKE ? OR description LIKE ?)");
      args.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status === "open") {
      conditions.push("is_open = 1");
    } else if (status === "closed") {
      conditions.push("is_open = 0");
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Get total count
    const countResult = await db.execute({
      sql: `SELECT COUNT(*) as total FROM events ${whereClause}`,
      args,
    });
    const total = Number(countResult.rows[0]?.total || 0);

    // Get stats
    const statsResult = await db.execute({
      sql: `SELECT 
              COUNT(*) as total,
              SUM(CASE WHEN is_open = 1 THEN 1 ELSE 0 END) as open_count,
              SUM(CASE WHEN is_open = 0 THEN 1 ELSE 0 END) as closed_count
            FROM events`,
      args: [],
    });
    const stats = {
      total: Number(statsResult.rows[0]?.total || 0),
      open: Number(statsResult.rows[0]?.open_count || 0),
      closed: Number(statsResult.rows[0]?.closed_count || 0),
    };

    // Get events
    const result = await db.execute({
      sql: `SELECT * FROM events ${whereClause} ORDER BY event_date DESC, created_at DESC LIMIT ? OFFSET ?`,
      args: [...args, limit, offset],
    });

    const events = (result.rows as unknown as EventRow[]).map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      thumbnail_url: row.thumbnail_url,
      thumbnail_public_id: row.thumbnail_public_id,
      event_date: row.event_date,
      event_end_date: row.event_end_date,
      event_time: row.event_time,
      event_end_time: row.event_end_time,
      timeline: row.timeline,
      location: row.location,
      description: row.description,
      kontak: row.kontak,
      link_url: row.link_url,
      link_text: row.link_text,
      is_open: row.is_open === 1,
      view_count: Number(row.view_count || 0),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    return NextResponse.json({
      events,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data event" },
      { status: 500 }
    );
  }
}

// POST /api/events - Tambah event baru
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    // if (!user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const eventDate = formData.get("event_date") as string;
    const eventEndDate = formData.get("event_end_date") as string | null;
    const eventTime = formData.get("event_time") as string | null;
    const eventEndTime = formData.get("event_end_time") as string | null;
    const timeline = formData.get("timeline") as string | null;
    const location = formData.get("location") as string;
    const description = formData.get("description") as string | null;
    const kontak = formData.get("kontak") as string | null;
    const linkUrl = formData.get("link_url") as string | null;
    const linkText = formData.get("link_text") as string | null;
    const isOpen = formData.get("is_open") === "true" ? 1 : 0;
    const thumbnail = formData.get("thumbnail") as File | null;

    // Validasi
    if (!title || !eventDate || !location) {
      return NextResponse.json(
        { error: "Judul, tanggal, dan lokasi wajib diisi" },
        { status: 400 }
      );
    }

    let thumbnailUrl: string | null = null;
    let thumbnailPublicId: string | null = null;

    // Upload thumbnail jika ada
    if (thumbnail && thumbnail.size > 0) {
      // Validasi ukuran (max 1MB)
      if (thumbnail.size > 1024 * 1024) {
        return NextResponse.json(
          { error: "Ukuran thumbnail maksimal 1MB" },
          { status: 400 }
        );
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

    const id = uuidv4();
    
    // Generate slug
    let slug = generateSlug(title);
    
    // Check slug uniqueness
    const check = await db.execute({
       sql: "SELECT id FROM events WHERE slug = ?",
       args: [slug]
    });
    if (check.rows.length > 0) {
         slug = `${slug}-${id.slice(0, 8)}`; // Append part of UUID if duplicate
    }

    await db.execute({
      sql: `
        INSERT INTO events (
          id, title, slug, thumbnail_url, thumbnail_public_id, 
          event_date, event_end_date, event_time, event_end_time, timeline, location, 
          description, kontak, link_url, link_text, is_open
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        id,
        title.trim(),
        slug,
        thumbnailUrl,
        thumbnailPublicId,
        eventDate,
        eventEndDate?.trim() || null,
        eventTime?.trim() || null,
        eventEndTime?.trim() || null,
        timeline?.trim() || null,
        location.trim(),
        description?.trim() || null,
        kontak?.trim() || null,
        linkUrl?.trim() || null,
        linkText?.trim() || null,
        isOpen,
      ],
    });

    return NextResponse.json({ id, slug, message: "Event berhasil ditambahkan" });
  } catch (error: unknown) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Gagal membuat event" },
      { status: 500 }
    );
  }
}
