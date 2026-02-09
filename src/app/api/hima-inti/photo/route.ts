import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { uploadHimaIntiPhoto, deleteImage } from "@/lib/cloudinary";
import { v4 as uuidv4 } from "uuid";

// POST /api/hima-inti/photo - Upload foto anggota HIMA Inti (rasio 3:2)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const memberId = formData.get("member_id") as string;

    if (!file) {
      return NextResponse.json(
        { error: "File tidak ditemukan" },
        { status: 400 }
      );
    }

    // Validasi tipe file
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP." },
        { status: 400 }
      );
    }

    // Validasi ukuran file (maks 1MB)
    const maxSize = 1 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 1MB" },
        { status: 400 }
      );
    }

    // Convert file ke base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload ke Cloudinary dengan public_id unik
    const publicId = memberId || uuidv4();
    const uploadResult = await uploadHimaIntiPhoto(base64, publicId);

    if (!uploadResult) {
      return NextResponse.json(
        { error: "Gagal mengupload foto ke Cloudinary" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Foto berhasil diupload",
      url: uploadResult.url,
      public_id: uploadResult.publicId,
    });
  } catch (error) {
    console.error("Upload foto HIMA Inti error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengupload foto" },
      { status: 500 }
    );
  }
}

// DELETE /api/hima-inti/photo - Hapus foto dari Cloudinary
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get("public_id");

    if (!publicId) {
      return NextResponse.json(
        { error: "Public ID tidak ditemukan" },
        { status: 400 }
      );
    }

    const deleted = await deleteImage(publicId);

    if (!deleted) {
      return NextResponse.json(
        { error: "Gagal menghapus foto dari Cloudinary" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Foto berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete foto HIMA Inti error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus foto" },
      { status: 500 }
    );
  }
}
