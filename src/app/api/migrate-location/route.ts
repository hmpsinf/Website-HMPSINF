import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    await db.execute(`
      ALTER TABLE program_kerja ADD COLUMN location TEXT;
    `);
    
    return NextResponse.json({ message: 'Migration successful: Added location column to program_kerja' });
  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json({ error: 'Migration failed', details: error }, { status: 500 });
  }
}
