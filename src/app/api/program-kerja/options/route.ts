import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await db.execute(`
      SELECT id, title
      FROM program_kerja
      ORDER BY created_at DESC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching program kerja options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program kerja options' },
      { status: 500 }
    );
  }
}
