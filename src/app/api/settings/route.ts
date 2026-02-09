import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET - Ambil semua settings (public, no auth required)
export async function GET() {
  try {
    const result = await db.execute({
      sql: 'SELECT key, value FROM site_settings',
      args: [],
    });

    // Convert array of {key, value} to object
    const settings: Record<string, string | null> = {};
    for (const row of result.rows) {
      settings[row.key as string] = row.value as string | null;
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil pengaturan' },
      { status: 500 }
    );
  }
}

// PUT - Update settings (protected, admin only)
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Format data tidak valid' },
        { status: 400 }
      );
    }

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      await db.execute({
        sql: 'UPDATE site_settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
        args: [value as string | null, key],
      });
    }

    return NextResponse.json({
      message: 'Pengaturan berhasil diperbarui',
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui pengaturan' },
      { status: 500 }
    );
  }
}
