// Script to seed initial admin user
// Run with: npx tsx scripts/seed-admin.ts

import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^([^#][^=]*)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      process.env[key] = value;
    }
  });
  console.log("✅ Loaded environment from .env.local\n");
}

async function seedAdmin() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL || "",
    authToken: process.env.TURSO_AUTH_TOKEN || "",
  });

  const email = "admin@hmpsinf.org";
  const password = "admin123";
  const name = "Administrator";

  // Check if admin already exists
  const existing = await db.execute({
    sql: "SELECT id FROM users WHERE email = ?",
    args: [email],
  });

  if (existing.rows.length > 0) {
    console.log("Admin user already exists");
    return;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Insert admin user
  await db.execute({
    sql: `INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)`,
    args: [email, passwordHash, name],
  });

  console.log("Admin user created successfully!");
  console.log("Email:", email);
  console.log("Password:", password);
  console.log("\n⚠️  Please change the password after first login!");
}

seedAdmin().catch(console.error);
