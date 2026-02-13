import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { generateSlug } from '@/lib/utils';

export async function GET() {
  try {
    // 1. Add slug column
    try {
      await db.execute("ALTER TABLE events ADD COLUMN slug TEXT");
      console.log("Added slug column");
    } catch (e: any) {
      if (!e.message.includes("duplicate column name")) {
        console.error("Error adding column:", e);
      } else {
        console.log("Slug column already exists");
      }
    }

    // 2. Fetch all events
    const events = await db.execute("SELECT id, title, slug FROM events");
    let updatedCount = 0;

    // 3. Update slugs
    for (const event of events.rows) {
      if (!event.slug) {
        let slug = generateSlug(event.title as string);
        
        // Ensure uniqueness (simple check against current batch, 
        // normally needs DB check but for migration this is likely fine if titles are unique enough,
        // otherwise we append id)
        
        // Let's actually check DB for collision to be safe, or just append ID if it fails?
        // Simple strategy: start with slug, if exists, append random or id.
        // For existing data, let's just use title-slug and append ID if needed?
        // Actually, let's just try to update. If we want unique, we should check.
        
        // Check if slug exists in DB (excluding current record)
         const check = await db.execute({
             sql: "SELECT id FROM events WHERE slug = ? AND id != ?",
             args: [slug, event.id]
         });

         if (check.rows.length > 0) {
             slug = `${slug}-${event.id}`;
         }

        await db.execute({
          sql: "UPDATE events SET slug = ? WHERE id = ?",
          args: [slug, event.id]
        });
        updatedCount++;
      }
    }

    // 4. Create Unique Index (if not exists)
    try {
        await db.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_events_slug ON events(slug)");
        console.log("Created unique index on slug");
    } catch (e) {
        console.error("Error creating index:", e);
    }

    return NextResponse.json({ 
      message: 'Migration completed', 
      processed: events.rows.length,
      updated: updatedCount 
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed', details: error }, { status: 500 });
  }
}
