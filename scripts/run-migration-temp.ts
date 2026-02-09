import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { migrateEvents } from "./migrate-events";

console.log("Starting migration...");
console.log("Database URL:", process.env.TURSO_DATABASE_URL ? "Set" : "Not set");
migrateEvents()
  .then(() => {
    console.log("Migration completed successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
