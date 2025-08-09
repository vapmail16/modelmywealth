const bcrypt = require('bcryptjs');

const storedHash = '$2b$12$FwtS755GxI6YNhV1U6OBS.p9kEZB2pLl0fo2V69Xj5LH5oMU0LB9e';
const testPassword = 'admin123';

console.log('🔍 PASSWORD DEBUG:');
console.log('Stored hash:', storedHash);
console.log('Test password:', testPassword);

const isValid = bcrypt.compareSync(testPassword, storedHash);
console.log('Password is valid:', isValid);

// Also test creating a new hash
const newHash = bcrypt.hashSync(testPassword, 12);
console.log('New hash for admin123:', newHash);
console.log('New hash is valid:', bcrypt.compareSync(testPassword, newHash)); 