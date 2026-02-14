import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// PUT /api/sponsorship/logos/[id] - Update caption
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
    const body = await request.json();
    const { caption } = body;

    await db.execute({
      sql: "UPDATE sponsorship_logos SET caption = ? WHERE id = ?",
      args: [caption || null, id]
    });

    return NextResponse.json({ message: "Caption logo berhasil diperbarui" });

  } catch (error) {
    console.error("Error updating sponsorship logo:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui logo" },
      { status: 500 }
    );
  }
}

// DELETE /api/sponsorship/logos/[id] - Delete logo
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

        // Get public_id first
        const result = await db.execute({
            sql: "SELECT public_id FROM sponsorship_logos WHERE id = ?",
            args: [id]
        });

        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Logo tidak ditemukan" }, { status: 404 });
        }

        const public_id = result.rows[0].public_id as string;

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(public_id);

        // Delete from DB
        await db.execute({
            sql: "DELETE FROM sponsorship_logos WHERE id = ?",
            args: [id]
        });

        return NextResponse.json({ message: "Logo berhasil dihapus" });

    } catch (error) {
        console.error("Error deleting sponsorship logo:", error);
        return NextResponse.json(
            { error: "Gagal menghapus logo" },
            { status: 500 }
        );
    }
}
