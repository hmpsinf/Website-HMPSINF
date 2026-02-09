import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  process.exit(1);
}

const db = createClient({ url, authToken });

async function checkSchema() {
  try {
    console.log("Checking events table schema...");
    const result = await db.execute("PRAGMA table_info(events)");
    
    console.log("Columns found:");
    const columns = result.rows.map(row => row.name);
    console.log(columns.join(", "));
    
    const missedColumns = [];
    if (!columns.includes("event_end_date")) missedColumns.push("event_end_date");
    if (!columns.includes("kontak")) missedColumns.push("kontak");
    
    if (missedColumns.length > 0) {
      console.log(`\nMISSING COLUMNS: ${missedColumns.join(", ")}`);
    } else {
      console.log("\nAll required columns present.");
    }
  } catch (error) {
    console.error("Error checking schema:", error);
  }
}

checkSchema();
