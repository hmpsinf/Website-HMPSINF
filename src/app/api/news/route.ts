import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import db from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// GET all news with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const offset = (page - 1) * limit;

    let whereClause = "1=1";
    const args: (string | number)[] = [];

    if (category) {
      whereClause += " AND n.category_id = ?";
      args.push(category);
    }

    if (status === "published") {
      whereClause += " AND n.is_published = 1";
    } else if (status === "draft") {
      whereClause += " AND n.is_published = 0";
    }

    if (search) {
      whereClause += " AND (n.title LIKE ? OR n.excerpt LIKE ?)";
      args.push(`%${search}%`, `%${search}%`);
    }

    // Get total count
    const countResult = await db.execute({
      sql: `SELECT COUNT(*) as total FROM news n WHERE ${whereClause}`,
      args,
    });
    const total = countResult.rows[0]?.total as number;

    // Get stats (unfiltered)
    const statsResult = await db.execute({
      sql: `SELECT 
              COUNT(*) as total,
              SUM(CASE WHEN is_published = 1 THEN 1 ELSE 0 END) as published_count,
              SUM(CASE WHEN is_published = 0 THEN 1 ELSE 0 END) as draft_count
            FROM news`,
      args: [],
    });
    const stats = {
      total: Number(statsResult.rows[0]?.total || 0),
      published: Number(statsResult.rows[0]?.published_count || 0),
      draft: Number(statsResult.rows[0]?.draft_count || 0),
    };

    // Get news with category name
    const result = await db.execute({
      sql: `
        SELECT 
          n.*,
          c.name as category_name,
          c.slug as category_slug,
          (SELECT COUNT(*) FROM news_comments WHERE news_id = n.id AND is_approved = 1) as comment_count
        FROM news n
        LEFT JOIN news_categories c ON n.category_id = c.id
        WHERE ${whereClause}
        ORDER BY n.created_at DESC
        LIMIT ? OFFSET ?
      `,
      args: [...args, limit, offset],
    });

    // Map boolean values
    const news = result.rows.map((row: Record<string, unknown>) => ({
      ...row,
      is_published: row.is_published === 1,
    }));

    return NextResponse.json({
      news,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}

// POST create news (FormData with image upload)
export async function POST(request: NextRequest) {
  try {
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

    try {
      fs.appendFileSync('debug-news.log', `[${new Date().toISOString()}] Create News - Title: ${title}, Author: ${author_name}\n`);
    } catch (e) {
      console.error('Failed to write to debug log', e);
    }
    const thumbnail = formData.get("thumbnail") as File | null;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const id = uuidv4();
    let slug = generateSlug(title);

    // Ensure unique slug
    let slugExists = true;
    let slugCounter = 0;
    while (slugExists) {
      const existing = await db.execute({
        sql: "SELECT id FROM news WHERE slug = ?",
        args: [slugCounter > 0 ? `${slug}-${slugCounter}` : slug],
      });
      if (existing.rows.length === 0) {
        slugExists = false;
        if (slugCounter > 0) {
          slug = `${slug}-${slugCounter}`;
        }
      } else {
        slugCounter++;
      }
    }

    // Upload thumbnail to Cloudinary
    let thumbnailUrl: string | null = null;
    let thumbnailPublicId: string | null = null;

    if (thumbnail && thumbnail.size > 0) {
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
    }

    const now = new Date().toISOString();
    const publishedAt = is_published ? now : null;

    await db.execute({
      sql: `
        INSERT INTO news (
          id, title, slug, thumbnail_url, thumbnail_public_id,
          excerpt, content, category_id, is_published,
          meta_title, meta_description, meta_keywords, author_name, published_at,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        id,
        title.trim(),
        slug,
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
        now,
      ],
    });

    return NextResponse.json({ id, slug, title: title.trim() });
  } catch (error) {
    console.error("Error creating news:", error);
    return NextResponse.json(
      { error: "Failed to create news" },
      { status: 500 }
    );
  }
}
