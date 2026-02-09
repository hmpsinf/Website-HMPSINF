import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { uploadLogo, deleteImage } from '@/lib/cloudinary';

// POST - Upload logo to Cloudinary
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string; // 'logo' or 'logo_dark' or 'favicon'

    if (!file) {
      return NextResponse.json(
        { error: 'File tidak ditemukan' },
        { status: 400 }
      );
    }

    if (!['logo', 'logo_dark', 'favicon'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipe logo tidak valid' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format file tidak didukung. Gunakan JPG, PNG, GIF, WebP, atau SVG.' },
        { status: 400 }
      );
    }

    // Validate file size (max 1MB for logos)
    const maxSize = 1 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Ukuran file maksimal 1MB' },
        { status: 400 }
      );
    }

    // Get current public_id to delete old image
    const urlKey = type === 'logo' ? 'logo_url' : type === 'logo_dark' ? 'logo_dark_url' : 'favicon_url';
    const publicIdKey = type === 'logo' ? 'logo_public_id' : type === 'logo_dark' ? 'logo_dark_public_id' : 'favicon_public_id';
    
    const currentResult = await db.execute({
      sql: 'SELECT value FROM site_settings WHERE key = ?',
      args: [publicIdKey],
    });
    const oldPublicId = currentResult.rows[0]?.value as string | null;

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary with specific public_id
    const cloudinaryPublicId = `hmpsinf/${type}`;
    const uploadResult = await uploadLogo(base64, cloudinaryPublicId);

    if (!uploadResult) {
      return NextResponse.json(
        { error: 'Gagal mengupload logo ke Cloudinary' },
        { status: 500 }
      );
    }

    // Delete old image if different public_id
    if (oldPublicId && oldPublicId !== cloudinaryPublicId) {
      try {
        await deleteImage(oldPublicId);
      } catch (e) {
        console.error('Failed to delete old logo:', e);
      }
    }

    // Update database
    await db.execute({
      sql: 'UPDATE site_settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
      args: [uploadResult.url, urlKey],
    });
    await db.execute({
      sql: 'UPDATE site_settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
      args: [uploadResult.publicId, publicIdKey],
    });

    return NextResponse.json({
      message: 'Logo berhasil diupload',
      url: uploadResult.url,
      public_id: uploadResult.publicId,
    });
  } catch (error) {
    console.error('Upload logo error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupload logo' },
      { status: 500 }
    );
  }
}

// DELETE - Hapus logo dari Cloudinary
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'logo' or 'logo_dark' or 'favicon'

    if (!type || !['logo', 'logo_dark', 'favicon'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipe logo tidak valid' },
        { status: 400 }
      );
    }

    const urlKey = type === 'logo' ? 'logo_url' : type === 'logo_dark' ? 'logo_dark_url' : 'favicon_url';
    const publicIdKey = type === 'logo' ? 'logo_public_id' : type === 'logo_dark' ? 'logo_dark_public_id' : 'favicon_public_id';

    // Get current public_id
    const result = await db.execute({
      sql: 'SELECT value FROM site_settings WHERE key = ?',
      args: [publicIdKey],
    });
    const publicId = result.rows[0]?.value as string | null;

    if (publicId) {
      try {
        await deleteImage(publicId);
      } catch (e) {
        console.error('Failed to delete logo from Cloudinary:', e);
      }
    }

    // Clear values in database
    await db.execute({
      sql: 'UPDATE site_settings SET value = NULL, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
      args: [urlKey],
    });
    await db.execute({
      sql: 'UPDATE site_settings SET value = NULL, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
      args: [publicIdKey],
    });

    return NextResponse.json({
      message: 'Logo berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete logo error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus logo' },
      { status: 500 }
    );
  }
}
