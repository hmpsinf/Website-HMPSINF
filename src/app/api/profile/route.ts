import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const authUser = await getCurrentUser();

    if (!authUser) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    const result = await db.execute({
      sql: 'SELECT id, email, name, phone, bio, photo_url FROM users WHERE id = ?',
      args: [authUser.id],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        bio: user.bio,
        photoUrl: user.photo_url,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data profil' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();

    if (!authUser) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    const { name, phone, bio } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nama harus diisi' },
        { status: 400 }
      );
    }

    await db.execute({
      sql: `UPDATE users 
            SET name = ?, phone = ?, bio = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?`,
      args: [name.trim(), phone || null, bio || null, authUser.id],
    });

    return NextResponse.json({
      message: 'Profil berhasil diperbarui',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui profil' },
      { status: 500 }
    );
  }
}
