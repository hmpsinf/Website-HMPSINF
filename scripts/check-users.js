
const db = require('../src/lib/db');

async function checkUsers() {
  try {
    const result = await db.execute("SELECT id, email, name FROM users");
    console.table(result.rows);
  } catch (error) {
    console.error(error);
  }
}

checkUsers();
