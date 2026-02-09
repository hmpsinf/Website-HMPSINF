const bcrypt = require('bcryptjs');
const fs = require('fs');

const hash = fs.readFileSync('hash_output.txt', 'utf8').trim();
console.log('Hash from file:', hash);
console.log('Verify admin123:', bcrypt.compareSync('admin123', hash));
