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
    const result = await client.execute("PRAGMA table_info(news)");
    console.log("Columns in 'news' table:");
    console.table(result.rows);
  } catch (e) {
    console.error(e);
  }
}

main();
