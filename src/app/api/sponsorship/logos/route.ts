import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { nanoid } from "nanoid";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET /api/sponsorship/logos
export async function GET() {
  try {
    const result = await db.execute({
      sql: "SELECT * FROM sponsorship_logos ORDER BY created_at DESC",
      args: []
    });

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching sponsorship logos:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data logo" },
      { status: 500 }
    );
  }
}

// POST /api/sponsorship/logos
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const caption = formData.get("caption") as string | null;

    if (!file) {
      return NextResponse.json({ error: "File gambar wajib diupload" }, { status: 400 });
    }

    // Validate size (max 1MB)
    if (file.size > 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran gambar maksimal 1MB" }, { status: 400 });
    }

    // Upload to Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const uploadResult = await cloudinary.uploader.upload(base64, {
      folder: "hmpsinf/sponsorship",
      // No strict transformation on upload to promote cleaner original logos,
      // but can be resized on delivery or via CSS
    });

    const id = nanoid();

    await db.execute({
      sql: `INSERT INTO sponsorship_logos (id, image_url, public_id, caption) VALUES (?, ?, ?, ?)`,
      args: [id, uploadResult.secure_url, uploadResult.public_id, caption || null]
    });

    return NextResponse.json({ 
        id, 
        image_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        caption,
        message: "Logo berhasil ditambahkan" 
    }, { status: 201 });

  } catch (error) {
    console.error("Error upload sponsorship logo:", error);
    return NextResponse.json(
      { error: "Gagal upload logo" },
      { status: 500 }
    );
  }
}
