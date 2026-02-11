import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";

// Load .env.local explicitly
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  console.log("Current env:", process.env);
  process.exit(1);
}

const db = createClient({ url, authToken });

async function addAuthorColumn() {
  try {
    console.log("Connecting to database...");
    
    // Check if column exists
    try {
      await db.execute("SELECT author_name FROM news LIMIT 1");
      console.log("'author_name' column already exists in 'news' table.");
    } catch (error) {
      console.log("'author_name' column missing, adding it...");
      await db.execute("ALTER TABLE news ADD COLUMN author_name TEXT");
      console.log("Added 'author_name' column to 'news' table.");
    }
    
    console.log("Migration completed successfully.");
    
  } catch (error) {
    console.error("Error running migration:", error);
  }
}

addAuthorColumn();
