import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { uploadDivisionPhoto } from "@/lib/cloudinary";
import { nanoid } from "nanoid";

// POST /api/divisions/[id]/members/photo - Upload member photo
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const { id: divisionId } = params;

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const memberId = formData.get("member_id") as string;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Generate public ID
    const publicId = `division-member-${memberId || nanoid()}`;

    // Upload to Cloudinary with 2:3 crop
    const result = await uploadDivisionPhoto(base64, publicId);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to upload photo" },
        { status: 500 }
      );
    }

    // If member_id is provided, update the database
    if (memberId) {
      await db.execute({
        sql: `UPDATE division_members 
              SET photo_url = ?, updated_at = datetime('now')
              WHERE id = ? AND division_id = ?`,
        args: [result.url, memberId, divisionId],
      });
    }

    return NextResponse.json({
      url: result.url,
      publicId: result.publicId,
    });
  } catch (error) {
    console.error("Error uploading division member photo:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}
