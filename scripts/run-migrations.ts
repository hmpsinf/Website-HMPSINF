import { migrateDivisions } from "./migrate-divisions";
import fs from "fs";
import path from "path";

// Load environment variables from .env.local manually
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, ""); // Remove quotes
      process.env[key] = value;
    }
  });
  console.log("✅ Loaded environment from .env.local");
}

// Run migration when executed directly
if (require.main === module) {
  console.log("Running migration...");
  migrateDivisions()
    .then(() => {
      console.log("✅ Migration completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Migration failed:", error);
      process.exit(1);
    });
}
