import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

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

// POST submit a new comment (public, 1 email per article)
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
      return NextResponse.json({ success: true, message: "Komentar berhasil dikirim" });
    }

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Nama wajib diisi" },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: "Email wajib diisi" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    if (!comment || !comment.trim()) {
      return NextResponse.json(
        { error: "Komentar wajib diisi" },
        { status: 400 }
      );
    }

    if (comment.trim().length < 10) {
      return NextResponse.json(
        { error: "Komentar minimal 10 karakter" },
        { status: 400 }
      );
    }

    if (comment.trim().length > 1000) {
      return NextResponse.json(
        { error: "Komentar maksimal 1000 karakter" },
        { status: 400 }
      );
    }

    // Check if news exists
    const newsCheck = await db.execute({
      sql: "SELECT id FROM news WHERE id = ? AND is_published = 1",
      args: [newsId],
    });

    if (newsCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Artikel tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if this email has already commented on this article
    const sanitizedEmail = sanitizeHTML(email).substring(0, 255).toLowerCase();
    const existingComment = await db.execute({
      sql: "SELECT id FROM news_comments WHERE news_id = ? AND LOWER(email) = ?",
      args: [newsId, sanitizedEmail],
    });

    if (existingComment.rows.length > 0) {
      return NextResponse.json(
        { error: "Email ini sudah pernah berkomentar di artikel ini" },
        { status: 409 }
      );
    }

    // Sanitize and save comment (auto-approved)
    const id = uuidv4();
    const sanitizedName = sanitizeHTML(name).substring(0, 100);
    const sanitizedComment = sanitizeHTML(comment).substring(0, 1000);
    const clientIP = getClientIP(request);

    await db.execute({
      sql: `
        INSERT INTO news_comments (id, news_id, name, email, comment, ip_address, is_approved)
        VALUES (?, ?, ?, ?, ?, ?, 1)
      `,
      args: [id, newsId, sanitizedName, sanitizedEmail, sanitizedComment, clientIP],
    });

    return NextResponse.json({
      success: true,
      message: "Komentar berhasil dikirim",
    });
  } catch (error) {
    console.error("Error submitting comment:", error);
    return NextResponse.json(
      { error: "Gagal mengirim komentar" },
      { status: 500 }
    );
  }
}
