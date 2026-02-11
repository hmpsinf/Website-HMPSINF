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
    const type = formData.get('type') as string; // 'logo' | 'logo_dark' | 'favicon' | 'hero_bg' | 'hero_side_image' | 'landing_video_bg_image'

    if (!file) {
      return NextResponse.json(
        { error: 'File tidak ditemukan' },
        { status: 400 }
      );
    }

    if (!['logo', 'logo_dark', 'favicon', 'hero_bg', 'hero_side_image', 'landing_video_bg_image'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipe tidak valid' },
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

    // Validate file size (1MB for logos/favicon, 2MB for side_image, 5MB for hero_bg/video_bg)
    let maxSize = 1 * 1024 * 1024; // Default 1MB
    if (type === 'hero_bg' || type === 'landing_video_bg_image') maxSize = 5 * 1024 * 1024;
    else if (type === 'hero_side_image') maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      const maxMb = maxSize / (1024 * 1024);
      return NextResponse.json(
        { error: `Ukuran file maksimal ${maxMb}MB` },
        { status: 400 }
      );
    }

    // Key mapping for each type
    const keyMap: Record<string, { url: string; publicId: string }> = {
      logo: { url: 'logo_url', publicId: 'logo_public_id' },
      logo_dark: { url: 'logo_dark_url', publicId: 'logo_dark_public_id' },
      favicon: { url: 'favicon_url', publicId: 'favicon_public_id' },
      hero_bg: { url: 'hero_bg_image', publicId: 'hero_bg_public_id' },
      hero_side_image: { url: 'hero_side_image', publicId: 'hero_side_image_public_id' },
      landing_video_bg_image: { url: 'landing_video_bg_image', publicId: 'landing_video_bg_image_public_id' },
    };
    const urlKey = keyMap[type].url;
    const publicIdKey = keyMap[type].publicId;
    
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

    // Upsert database
    await db.execute({
      sql: `INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
      args: [urlKey, uploadResult.url],
    });
    await db.execute({
      sql: `INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
      args: [publicIdKey, uploadResult.publicId],
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
    const type = searchParams.get('type'); // 'logo' | 'logo_dark' | 'favicon' | 'hero_bg' | 'hero_side_image' | 'landing_video_bg_image'

    if (!type || !['logo', 'logo_dark', 'favicon', 'hero_bg', 'hero_side_image', 'landing_video_bg_image'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipe tidak valid' },
        { status: 400 }
      );
    }

    const keyMap: Record<string, { url: string; publicId: string }> = {
      logo: { url: 'logo_url', publicId: 'logo_public_id' },
      logo_dark: { url: 'logo_dark_url', publicId: 'logo_dark_public_id' },
      favicon: { url: 'favicon_url', publicId: 'favicon_public_id' },
      hero_bg: { url: 'hero_bg_image', publicId: 'hero_bg_public_id' },
      hero_side_image: { url: 'hero_side_image', publicId: 'hero_side_image_public_id' },
      landing_video_bg_image: { url: 'landing_video_bg_image', publicId: 'landing_video_bg_image_public_id' },
    };
    const urlKey = keyMap[type].url;
    const publicIdKey = keyMap[type].publicId;

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
      sql: `INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES (?, NULL, CURRENT_TIMESTAMP)`,
      args: [urlKey],
    });
    await db.execute({
      sql: `INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES (?, NULL, CURRENT_TIMESTAMP)`,
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
