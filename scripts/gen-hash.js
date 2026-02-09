const bcrypt = require('bcryptjs');
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const password = 'admin123';
  const hash = bcrypt.hashSync(password, 10);
  
  console.log('Generated hash:', hash);
  console.log('Verify works:', bcrypt.compareSync(password, hash));
  
  // Output for manual use
  console.log('\n--- Copy this SQL to update manually ---');
  console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = 'admin@hmpsinf.org';`);
}

main();
