
import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  process.exit(1);
}

const db = createClient({ url, authToken });

async function checkTables() {
  try {
    const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='galleries'");
    if (result.rows.length > 0) {
      console.log("Table 'galleries' exists.");
    } else {
        console.log("Table 'galleries' DOES NOT exist.");
    }
    
    const resultImages = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='gallery_images'");
     if (resultImages.rows.length > 0) {
      console.log("Table 'gallery_images' exists.");
    } else {
        console.log("Table 'gallery_images' DOES NOT exist.");
    }

  } catch (error) {
    console.error("Error checking tables:", error);
  }
}

checkTables();
