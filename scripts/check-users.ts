
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import db from '../src/lib/db';

async function main() {
  try {
    const result = await db.execute("SELECT id, email, name FROM users");
    console.table(result.rows);
  } catch (error) {
    console.error(error);
  }
}

main();
