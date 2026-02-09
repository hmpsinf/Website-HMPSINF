import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

// Simple in-memory rate limiter (in production, use Redis)
const commentRateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_COMMENTS_PER_HOUR = 3;

function sanitizeHTML(str: string): string {
  return str.replace(/<[^>]*>/g, "").trim();
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = commentRateLimit.get(ip);

  if (!record || now > record.resetTime) {
    commentRateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= MAX_COMMENTS_PER_HOUR) {
    return false;
  }

  record.count++;
  return true;
}

// GET approved comments for a news article
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get("admin") === "true";

    // If admin, return all comments; otherwise only approved
    const whereClause = admin ? "" : "AND is_approved = 1";

    const result = await db.execute({
      sql: `
        SELECT * FROM news_comments 
        WHERE news_id = ? ${whereClause}
        ORDER BY created_at DESC
      `,
      args: [id],
    });

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST submit a new comment (public, with rate limiting)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: newsId } = await params;
    const body = await request.json();
    const { name, email, comment, honeypot } = body;

    // Honeypot check - if this field is filled, it's a bot
    if (honeypot) {
      // Silently reject but appear successful
      return NextResponse.json({ success: true, message: "Comment submitted" });
    }

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!comment || !comment.trim()) {
      return NextResponse.json(
        { error: "Comment is required" },
        { status: 400 }
      );
    }

    if (comment.trim().length < 10) {
      return NextResponse.json(
        { error: "Comment must be at least 10 characters" },
        { status: 400 }
      );
    }

    if (comment.trim().length > 1000) {
      return NextResponse.json(
        { error: "Comment must not exceed 1000 characters" },
        { status: 400 }
      );
    }

    // Rate limit check
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: "Too many comments. Please try again later." },
        { status: 429 }
      );
    }

    // Check if news exists
    const newsCheck = await db.execute({
      sql: "SELECT id FROM news WHERE id = ? AND is_published = 1",
      args: [newsId],
    });

    if (newsCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "News article not found" },
        { status: 404 }
      );
    }

    // Sanitize and save comment
    const id = uuidv4();
    const sanitizedName = sanitizeHTML(name).substring(0, 100);
    const sanitizedComment = sanitizeHTML(comment).substring(0, 1000);
    const sanitizedEmail = email ? sanitizeHTML(email).substring(0, 255) : null;

    await db.execute({
      sql: `
        INSERT INTO news_comments (id, news_id, name, email, comment, ip_address, is_approved)
        VALUES (?, ?, ?, ?, ?, ?, 0)
      `,
      args: [id, newsId, sanitizedName, sanitizedEmail, sanitizedComment, clientIP],
    });

    return NextResponse.json({
      success: true,
      message: "Comment submitted and awaiting moderation",
    });
  } catch (error) {
    console.error("Error submitting comment:", error);
    return NextResponse.json(
      { error: "Failed to submit comment" },
      { status: 500 }
    );
  }
}
