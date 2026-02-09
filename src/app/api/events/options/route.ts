import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await db.execute(`
      SELECT id, title
      FROM events
      ORDER BY created_at DESC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching event options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event options' },
      { status: 500 }
    );
  }
}
