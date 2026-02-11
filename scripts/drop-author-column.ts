import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load environment variables manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  process.exit(1);
}

const client = createClient({
  url,
  authToken,
});

async function main() {
  try {
    console.log("Dropping column 'author' from table 'news'...");
    await client.execute("ALTER TABLE news DROP COLUMN author");
    console.log("Column 'author' dropped successfully.");
  } catch (e) {
    if (String(e).includes("no such column")) {
        console.log("Column 'author' does not exist (already dropped).");
    } else {
        console.error("Error dropping column:", e);
    }
  }
}

main();
