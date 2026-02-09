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

interface GalleryRow {
  id: string;
  title: string;
  description: string | null;
  event_id: string | null;
  program_kerja_id: string | null;
  created_at: string;
  event_title: string | null;
  program_kerja_title: string | null;
  image_id: string | null;
  image_url: string | null;
  image_public_id: string | null;
  image_caption: string | null;
}

// GET /api/galleries - List galleries with images
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    
    // Build WHERE clause
    const conditions: string[] = [];
    const args: (string | number)[] = [];

    if (search) {
      conditions.push("(g.title LIKE ? OR e.title LIKE ? OR pk.title LIKE ?)");
      args.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Fetch joined data
    const result = await db.execute({
      sql: `
        SELECT 
          g.id, g.title, g.description, g.event_id, g.program_kerja_id, g.created_at,
          e.title as event_title,
          pk.title as program_kerja_title,
          gi.id as image_id, gi.image_url, gi.public_id as image_public_id, gi.caption as image_caption
        FROM galleries g
        LEFT JOIN events e ON g.event_id = e.id
        LEFT JOIN program_kerja pk ON g.program_kerja_id = pk.id
        LEFT JOIN gallery_images gi ON g.id = gi.gallery_id
        ${whereClause}
        ORDER BY g.created_at DESC
      `,
      args
    });

    const rows = result.rows as unknown as GalleryRow[];
    
    // Group by gallery
    const galleriesMap = new Map<string, any>();

    rows.forEach(row => {
      if (!galleriesMap.has(row.id)) {
        galleriesMap.set(row.id, {
          id: row.id,
          title: row.title,
          description: row.description,
          event_id: row.event_id,
          program_kerja_id: row.program_kerja_id,
          created_at: row.created_at,
          linked_to: row.event_title || row.program_kerja_title || "Unknown",
          type: row.event_id ? "Event" : row.program_kerja_id ? "Program Kerja" : "Unknown",
          images: []
        });
      }

      if (row.image_id) {
        galleriesMap.get(row.id).images.push({
          id: row.image_id,
          url: row.image_url,
          public_id: row.image_public_id,
          caption: row.image_caption
        });
      }
    });

    return NextResponse.json(Array.from(galleriesMap.values()));

  } catch (error) {
    console.error("Error fetching galleries:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data galeri" },
      { status: 500 }
    );
  }
}

// POST /api/galleries - Create new gallery
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const event_id = formData.get("event_id") as string | null;
    const program_kerja_id = formData.get("program_kerja_id") as string | null;
    const imageFiles = formData.getAll("images") as File[];

    // Validation
    if (!title) {
      return NextResponse.json({ error: "Judul galeri wajib diisi" }, { status: 400 });
    }

    if (!event_id && !program_kerja_id) {
      return NextResponse.json({ error: "Harus memilih Event atau Program Kerja" }, { status: 400 });
    }

    if (imageFiles.length > 3) {
      return NextResponse.json({ error: "Maksimal 3 foto per galeri" }, { status: 400 });
    }

    const id = nanoid();

    // Insert Gallery
    await db.execute({
      sql: `INSERT INTO galleries (id, title, description, event_id, program_kerja_id) VALUES (?, ?, ?, ?, ?)`,
      args: [id, title.trim(), description || null, event_id || null, program_kerja_id || null]
    });

    // Upload images to Cloudinary and insert into gallery_images
    for (const file of imageFiles) {
      if (file && file.size > 0) {
        // Validate size (max 1MB)
        if (file.size > 1024 * 1024) {
          continue; // Skip oversized files
        }

        // Convert to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(base64, {
          folder: "hmpsinf/galleries",
          transformation: [
            { width: 1280, height: 720, crop: "fill", gravity: "auto" }, // 16:9 ratio
          ],
        });

        await db.execute({
          sql: `INSERT INTO gallery_images (id, gallery_id, image_url, public_id, caption) VALUES (?, ?, ?, ?, ?)`,
          args: [nanoid(), id, uploadResult.secure_url, uploadResult.public_id, null]
        });
      }
    }

    return NextResponse.json({ id, message: "Galeri berhasil dibuat" }, { status: 201 });

  } catch (error) {
    console.error("Error creating gallery:", error);
    return NextResponse.json(
      { error: "Gagal membuat galeri" },
      { status: 500 }
    );
  }
}
