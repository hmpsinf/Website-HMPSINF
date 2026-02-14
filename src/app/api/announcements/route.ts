import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import { v4 as uuidv4 } from "uuid";
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

// GET /api/announcements - Fetch announcements with pagination
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const offset = (page - 1) * limit;

    let whereClause = "1=1";
    const args: (string | number)[] = [];

    if (search) {
      whereClause += " AND (title LIKE ? OR content LIKE ? OR author LIKE ?)";
      args.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status === "published") {
      whereClause += " AND is_published = 1";
    } else if (status === "draft") {
      whereClause += " AND is_published = 0";
    }

    // Get total count
    const countResult = await db.execute({
      sql: `SELECT COUNT(*) as total FROM pengumuman WHERE ${whereClause}`,
      args,
    });
    const total = Number(countResult.rows[0]?.total || 0);

    // Get stats
    const statsResult = await db.execute({
      sql: `
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN is_published = 1 THEN 1 ELSE 0 END) as published,
          SUM(CASE WHEN is_published = 0 THEN 1 ELSE 0 END) as draft
        FROM pengumuman
      `,
      args: [],
    });
    const statsRow = statsResult.rows[0];
    const stats = {
      total: Number(statsRow?.total || 0),
      published: Number(statsRow?.published || 0),
      draft: Number(statsRow?.draft || 0),
    };

    // Get data
    const result = await db.execute({
      sql: `
        SELECT * FROM pengumuman
        WHERE ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `,
      args: [...args, limit, offset],
    });

    const announcements = result.rows.map((row) => {
      const r = row as unknown as AnnouncementRow;
      return {
        id: r.id,
        title: r.title,
        slug: r.slug,
        thumbnail_url: r.thumbnail_url,
        thumbnail_public_id: r.thumbnail_public_id,
        content: r.content,
        author: r.author,
        is_published: r.is_published === 1,
        published_at: r.published_at,
        view_count: r.view_count,
        created_at: r.created_at,
        updated_at: r.updated_at,
      };
    });

    return NextResponse.json({
      data: announcements,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      stats,
    });
  } catch (error: unknown) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pengumuman" },
      { status: 500 }
    );
  }
}

// POST /api/announcements - Create announcement
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string | null;
    const isPublished = formData.get("is_published") === "true" ? 1 : 0;
    const publishedAt = formData.get("published_at") as string | null;
    const thumbnail = formData.get("thumbnail") as File | null;

    // Validasi
    if (!title) {
      return NextResponse.json(
        { error: "Judul pengumuman wajib diisi" },
        { status: 400 }
      );
    }

    // Generate ID and slug
    const id = uuidv4();
    let slug = generateSlug(title);

    // Check slug uniqueness
    const slugCheck = await db.execute({
      sql: "SELECT id FROM pengumuman WHERE slug = ?",
      args: [slug],
    });
    if (slugCheck.rows.length > 0) {
      slug = `${slug}-${id.slice(0, 8)}`;
    }

    // Author from logged-in user
    const author = user.name || "Admin";

    let thumbnailUrl: string | null = null;
    let thumbnailPublicId: string | null = null;

    // Upload thumbnail if provided
    if (thumbnail && thumbnail.size > 0) {
      // Validate size (max 1MB)
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
        folder: "hmpsinf/pengumuman",
        transformation: [
          { width: 400, height: 500, crop: "fill", gravity: "auto" }, // 4:5 ratio
        ],
      });

      thumbnailUrl = uploadResult.secure_url;
      thumbnailPublicId = uploadResult.public_id;
    }

    const now = new Date().toISOString();

    await db.execute({
      sql: `
        INSERT INTO pengumuman (id, title, slug, thumbnail_url, thumbnail_public_id, content, author, is_published, published_at, view_count, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
      `,
      args: [
        id,
        title.trim(),
        slug,
        thumbnailUrl,
        thumbnailPublicId,
        content?.trim() || null,
        author,
        isPublished,
        isPublished ? (publishedAt || now) : null,
        now,
        now,
      ],
    });

    return NextResponse.json({
      id,
      slug,
      title: title.trim(),
      message: "Pengumuman berhasil ditambahkan",
    });
  } catch (error: unknown) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Gagal menambahkan pengumuman" },
      { status: 500 }
    );
  }
}
