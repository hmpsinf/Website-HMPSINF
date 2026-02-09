import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { uploadImage, deleteImage } from '@/lib/cloudinary';

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

export async function POST(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();

    if (!authUser) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('photo') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'File foto harus diupload' },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Ukuran foto maksimal 1MB' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File harus berupa gambar' },
        { status: 400 }
      );
    }

    // Get current photo public_id for deletion
    const currentUser = await db.execute({
      sql: 'SELECT photo_public_id FROM users WHERE id = ?',
      args: [authUser.id],
    });

    const oldPublicId = currentUser.rows[0]?.photo_public_id as string | null;

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary
    const result = await uploadImage(base64, `user_${authUser.id}`);

    if (!result) {
      return NextResponse.json(
        { error: 'Gagal mengupload foto' },
        { status: 500 }
      );
    }

    // Delete old image only if it has a different public_id
    // (overwrite: true in upload already handles same public_id)
    if (oldPublicId && oldPublicId !== result.publicId) {
      await deleteImage(oldPublicId);
    }

    // Update database
    await db.execute({
      sql: `UPDATE users 
            SET photo_url = ?, photo_public_id = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?`,
      args: [result.url, result.publicId, authUser.id],
    });

    return NextResponse.json({
      message: 'Foto profil berhasil diperbarui',
      photoUrl: result.url,
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupload foto' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const authUser = await getCurrentUser();

    if (!authUser) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    const currentUser = await db.execute({
      sql: 'SELECT photo_public_id FROM users WHERE id = ?',
      args: [authUser.id],
    });

    const publicId = currentUser.rows[0]?.photo_public_id as string | null;

    if (publicId) {
      await deleteImage(publicId);
    }

    await db.execute({
      sql: `UPDATE users 
            SET photo_url = NULL, photo_public_id = NULL, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?`,
      args: [authUser.id],
    });

    return NextResponse.json({
      message: 'Foto profil berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete photo error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus foto' },
      { status: 500 }
    );
  }
}
