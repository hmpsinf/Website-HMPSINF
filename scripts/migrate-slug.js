const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

if (!process.env.TURSO_DATABASE_URL) {
  console.error("TURSO_DATABASE_URL not set in .env.local");
  process.exit(1);
}

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

async function run() {
  try {
    console.log("Starting migration...");
    
    // 1. Add slug column
    try {
      await client.execute("ALTER TABLE events ADD COLUMN slug TEXT");
      console.log("Added slug column");
    } catch (e) {
      if (e.message && e.message.includes("duplicate column name")) {
        console.log("Slug column already exists");
      } else {
        console.error("Error adding column (might exist):", e.message);
      }
    }

    // 2. Fetch all events
    const result = await client.execute("SELECT id, title, slug FROM events");
    const events = result.rows;
    console.log(`Found ${events.length} events to process.`);

    let updatedCount = 0;

    // 3. Update slugs
    for (const event of events) {
      if (!event.slug) {
        let slug = generateSlug(event.title);
        
        // Handle potential duplicates (very basic check)
        const check = await client.execute({
             sql: "SELECT id FROM events WHERE slug = ? AND id != ?",
             args: [slug, event.id]
         });

         if (check.rows.length > 0) {
             slug = `${slug}-${event.id}`;
         }

        await client.execute({
          sql: "UPDATE events SET slug = ? WHERE id = ?",
          args: [slug, event.id]
        });
        updatedCount++;
        process.stdout.write(`Updated event ${event.id}: ${slug}\n`);
      }
    }

    // 4. Create Unique Index
    try {
        await client.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_events_slug ON events(slug)");
        console.log("Created unique index on slug");
    } catch (e) {
        console.error("Error creating index:", e.message);
    }

    console.log(`Migration completed. Updated ${updatedCount} events.`);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

run();
